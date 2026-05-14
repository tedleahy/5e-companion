import type { FeatureKind, Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma";
import type {
    AvailableSubclass,
    CustomSubclassInput,
    SaveCustomSubclassFeatureInput,
} from "../../generated/graphql";
import type {
    CharacterClassAllocation,
    CharacterClassReference,
    CharacterSubclassReference,
    ResolvedCharacterClass,
} from "./multiclassRules";

const FEATURE_KIND = {
    CLASS_FEATURE: "CLASS_FEATURE",
    SUBCLASS_FEATURE: "SUBCLASS_FEATURE",
    TRAIT_FEATURE: "TRAIT_FEATURE",
    BACKGROUND_FEATURE: "BACKGROUND_FEATURE",
    FEAT_FEATURE: "FEAT_FEATURE",
    CUSTOM_FEATURE: "CUSTOM_FEATURE",
} as const satisfies Record<FeatureKind, FeatureKind>;

/**
 * Submitted custom-subclass payload after whitespace normalisation.
 */
export type SubmittedCustomSubclass = {
    name: string;
    description: string;
};

/**
 * Saved custom subclass feature metadata attached to one character feature row.
 */
export type SubmittedCustomSubclassFeature = {
    classId: string;
    level: number;
};

/**
 * Class-row allocation shape extended with the optional custom-subclass payload.
 */
export type SubmittedCharacterClassAllocation = CharacterClassAllocation & {
    customSubclass?: SubmittedCustomSubclass | null;
};

/**
 * Trims one optional custom-subclass feature payload and drops it when invalid.
 */
export function normaliseCustomSubclassFeatureInput(
    customSubclassFeature: SaveCustomSubclassFeatureInput | null | undefined,
): SubmittedCustomSubclassFeature | null {
    if (!customSubclassFeature) {
        return null;
    }

    const classId = customSubclassFeature.classId.trim();
    const level = Number(customSubclassFeature.level);

    if (classId.length === 0 || !Number.isInteger(level) || level < 1) {
        return null;
    }

    return {
        classId,
        level,
    };
}

/**
 * Returns the stable client-facing selection token for one subclass row.
 */
export function subclassSelectionValue(subclassRef: Pick<CharacterSubclassReference, "id" | "srdIndex">): string {
    return subclassRef.srdIndex ?? subclassRef.id;
}

/**
 * Trims one optional custom-subclass payload and drops it when blank.
 */
export function normaliseCustomSubclassInput(
    customSubclass: CustomSubclassInput | null | undefined,
): SubmittedCustomSubclass | null {
    if (!customSubclass) {
        return null;
    }

    const name = customSubclass.name.trim();
    const description = customSubclass.description.trim();

    if (name.length === 0 && description.length === 0) {
        return null;
    }

    return {
        name,
        description,
    };
}

/**
 * Builds a lookup map that accepts either SRD indices or raw database ids.
 */
export function mapSubclassReferencesBySelectionValue(
    subclassRefs: CharacterSubclassReference[],
): Map<string, CharacterSubclassReference> {
    const subclassRefsBySelectionValue = new Map<string, CharacterSubclassReference>();

    for (const subclassRef of subclassRefs) {
        subclassRefsBySelectionValue.set(subclassRef.id, subclassRef);

        if (subclassRef.srdIndex) {
            subclassRefsBySelectionValue.set(subclassRef.srdIndex, subclassRef);
        }
    }

    return subclassRefsBySelectionValue;
}

/**
 * Loads subclasses visible to the current user, optionally filtered by class ids.
 */
export async function availableSubclassesForUser(
    userId: string,
    classIds?: string[] | null,
): Promise<AvailableSubclass[]> {
    const subclassRefs = await prisma.subclass.findMany({
        include: {
            classRef: true,
            features: {
                where: {
                    kind: FEATURE_KIND.SUBCLASS_FEATURE,
                },
                orderBy: [
                    { level: "asc" },
                    { name: "asc" },
                ],
            },
        },
        where: {
            AND: [
                {
                    OR: [
                        { ownerUserId: null },
                        { ownerUserId: userId },
                    ],
                },
                ...(classIds && classIds.length > 0
                    ? [
                          {
                              classRef: {
                                  srdIndex: {
                                      in: classIds,
                                  },
                              },
                          },
                      ]
                    : []),
            ],
        },
    });

    return subclassRefs
        .slice()
        .sort((left, right) => {
            const leftClassName = left.classRef.name;
            const rightClassName = right.classRef.name;

            if (leftClassName !== rightClassName) {
                return leftClassName.localeCompare(rightClassName);
            }

            const leftIsCustom = left.ownerUserId != null;
            const rightIsCustom = right.ownerUserId != null;
            if (leftIsCustom !== rightIsCustom) {
                return leftIsCustom ? 1 : -1;
            }

            return left.name.localeCompare(right.name);
        })
        .map((subclassRef) => ({
            id: subclassRef.id,
            value: subclassSelectionValue(subclassRef),
            srdIndex: subclassRef.srdIndex,
            classId: subclassRef.classRef.srdIndex ?? subclassRef.classId,
            className: subclassRef.classRef.name,
            name: subclassRef.name,
            description: subclassRef.description,
            isCustom: subclassRef.ownerUserId != null,
            features: subclassRef.features.map((feature) => ({
                id: feature.id,
                name: feature.name,
                description: feature.description.join("\n\n").trim(),
                level: feature.level ?? 0,
            })),
        }));
}

/**
 * Loads only the submitted existing subclass references that the user may use.
 */
export async function loadVisibleSubclassReferences(
    userId: string,
    subclassSelectionValues: string[],
): Promise<CharacterSubclassReference[]> {
    if (subclassSelectionValues.length === 0) {
        return [];
    }

    return await prisma.subclass.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { ownerUserId: null },
                        { ownerUserId: userId },
                    ],
                },
                {
                    OR: [
                        {
                            id: {
                                in: subclassSelectionValues,
                            },
                        },
                        {
                            srdIndex: {
                                in: subclassSelectionValues,
                            },
                        },
                    ],
                },
            ],
        },
    });
}

/**
 * Finds or creates one current-user custom subclass within an existing transaction.
 */
export async function findOrCreateOwnedCustomSubclass(
    tx: Prisma.TransactionClient,
    userId: string,
    classRef: CharacterClassReference,
    customSubclass: SubmittedCustomSubclass,
): Promise<CharacterSubclassReference> {
    const existingSubclass = await tx.subclass.findFirst({
        where: {
            ownerUserId: userId,
            classId: classRef.id,
            name: customSubclass.name,
        },
    });

    if (existingSubclass) {
        if (existingSubclass.description.join("\n\n") !== customSubclass.description) {
            return await tx.subclass.update({
                where: { id: existingSubclass.id },
                data: {
                    description: [customSubclass.description],
                },
            });
        }

        return existingSubclass;
    }

    return await tx.subclass.create({
        data: {
            ownerUserId: userId,
            name: customSubclass.name,
            description: [customSubclass.description],
            classId: classRef.id,
        },
    });
}

/**
 * Finds or creates one current-user custom subclass feature within an existing transaction.
 */
export async function findOrCreateOwnedCustomSubclassFeature(
    tx: Prisma.TransactionClient,
    userId: string,
    resolvedClass: ResolvedCharacterClass,
    feature: {
        name: string;
        description: string;
        level: number;
    },
): Promise<{ id: string }> {
    const subclassRef = resolvedClass.subclassRef;
    const sourceLabel = `${subclassRef?.name ?? resolvedClass.classRef.name} ${resolvedClass.classRef.name} ${feature.level}`;

    if (!subclassRef || subclassRef.ownerUserId !== userId) {
        throw new Error(`Cannot persist a custom subclass feature for class ${resolvedClass.classRow.classId}.`);
    }

    const existingFeature = await tx.feature.findFirst({
        where: {
            ownerUserId: userId,
            kind: FEATURE_KIND.SUBCLASS_FEATURE,
            subclassId: subclassRef.id,
            level: feature.level,
            name: feature.name,
        },
    });

    if (existingFeature) {
        if (
            existingFeature.classId !== resolvedClass.classRef.id
            || existingFeature.description.join("\n\n") !== feature.description
            || existingFeature.sourceLabel !== sourceLabel
        ) {
            return await tx.feature.update({
                where: { id: existingFeature.id },
                data: {
                    classId: resolvedClass.classRef.id,
                    description: [feature.description],
                    sourceLabel,
                },
            });
        }

        return existingFeature;
    }

    return await tx.feature.create({
        data: {
            ownerUserId: userId,
            name: feature.name,
            description: [feature.description],
            level: feature.level,
            kind: FEATURE_KIND.SUBCLASS_FEATURE,
            sourceLabel,
            classId: resolvedClass.classRef.id,
            subclassId: subclassRef.id,
        },
    });
}

/**
 * Resolves submitted class rows into concrete class/subclass references inside one transaction.
 */
export async function materialiseResolvedCharacterClasses(
    tx: Prisma.TransactionClient,
    userId: string,
    classRows: SubmittedCharacterClassAllocation[],
    classRefsBySrdIndex: Map<string, CharacterClassReference>,
    subclassRefsBySelectionValue: Map<string, CharacterSubclassReference>,
): Promise<ResolvedCharacterClass[]> {
    const resolvedClasses: ResolvedCharacterClass[] = [];

    for (const classRow of classRows) {
        const classRef = classRefsBySrdIndex.get(classRow.classId);
        if (!classRef) {
            throw new Error(`Unknown class: ${classRow.classId}`);
        }

        let subclassRef = classRow.subclassId
            ? subclassRefsBySelectionValue.get(classRow.subclassId) ?? null
            : null;

        if (!subclassRef && classRow.customSubclass) {
            subclassRef = await findOrCreateOwnedCustomSubclass(
                tx,
                userId,
                classRef,
                classRow.customSubclass,
            );
            subclassRefsBySelectionValue.set(subclassRef.id, subclassRef);

            if (subclassRef.srdIndex) {
                subclassRefsBySelectionValue.set(subclassRef.srdIndex, subclassRef);
            }
        }

        resolvedClasses.push({
            classRow: {
                classId: classRow.classId,
                subclassId: subclassRef ? subclassSelectionValue(subclassRef) : null,
                customSubclass: classRow.customSubclass ?? null,
                level: classRow.level,
            },
            classRef,
            subclassRef,
        });
    }

    return resolvedClasses;
}
