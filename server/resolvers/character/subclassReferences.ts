import type { FeatureKind, Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma";
import type {
    AvailableSubclass,
    AvailableSubclassFeature,
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
    selectionLevel: number;
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
 * Builds the display label for a subclass feature source.
 */
export function buildSubclassFeatureSourceLabel(
    subclassName: string,
    className: string,
    level: number,
): string {
    return `${subclassName} ${className} ${level}`;
}

type SubclassFeatureRowLike = {
    id: string;
    name: string;
    description: string[];
    level: number | null;
};

type SubclassRowLike = {
    id: string;
    srdIndex: string | null;
    classId: string;
    classRef: {
        srdIndex: string | null;
        name: string;
    };
    name: string;
    description: string[];
    selectionLevel: number;
    features: SubclassFeatureRowLike[];
};

export function mapSubclassFeatureRow(feature: SubclassFeatureRowLike): AvailableSubclassFeature {
    return {
        id: feature.id,
        name: feature.name,
        description: feature.description.join("\n\n").trim(),
        level: feature.level ?? 0,
    };
}

export function mapSubclassRowToBase(subclassRef: SubclassRowLike) {
    return {
        id: subclassRef.id,
        value: subclassSelectionValue(subclassRef),
        classId: subclassRef.classRef.srdIndex ?? subclassRef.classId,
        className: subclassRef.classRef.name,
        name: subclassRef.name,
        selectionLevel: subclassRef.selectionLevel,
        description: subclassRef.description,
        features: subclassRef.features.map(mapSubclassFeatureRow),
    };
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
    const selectionLevel = Number(customSubclass.selectionLevel);

    if (name.length === 0 && description.length === 0) {
        return null;
    }

    if (!Number.isInteger(selectionLevel) || selectionLevel < 1 || selectionLevel > 20) {
        throw new Error('Custom subclass selection level must be an integer from 1 to 20.');
    }

    return {
        name,
        description,
        selectionLevel,
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
                        { ownerUserId: userId, archivedAt: null },
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
        orderBy: [
            { classRef: { name: "asc" } },
            { ownerUserId: { sort: "asc", nulls: "first" } },
            { name: "asc" },
        ],
    });

    return subclassRefs.map((subclassRef) => ({
        ...mapSubclassRowToBase(subclassRef),
        srdIndex: subclassRef.srdIndex,
        isCustom: subclassRef.ownerUserId != null,
    }));
}

/**
 * Loads only the submitted existing subclass references that the user may use.
 */
export async function loadVisibleSubclassReferences(
    userId: string,
    subclassSelectionValues: string[],
    options: { allowedArchivedSubclassIds?: string[] } = {},
): Promise<CharacterSubclassReference[]> {
    if (subclassSelectionValues.length === 0) {
        return [];
    }

    const allowedArchivedSubclassIds = options.allowedArchivedSubclassIds ?? [];
    const visibleOwnerFilters: Prisma.SubclassWhereInput[] = [
        { ownerUserId: null },
        { ownerUserId: userId, archivedAt: null },
    ];

    if (allowedArchivedSubclassIds.length > 0) {
        visibleOwnerFilters.push({
            ownerUserId: userId,
            archivedAt: { not: null },
            id: { in: allowedArchivedSubclassIds },
        });
    }

    return await prisma.subclass.findMany({
        where: {
            AND: [
                {
                    OR: visibleOwnerFilters,
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

type OwnedCustomSubclassRequest = {
    classRef: CharacterClassReference;
    customSubclass: SubmittedCustomSubclass;
};

function ownedCustomSubclassKey(classId: string, subclassName: string): string {
    return `${classId}:${subclassName.toLowerCase()}`;
}

/**
 * Finds, updates, and creates current-user custom subclasses in bounded batches.
 */
async function findOrCreateOwnedCustomSubclasses(
    tx: Prisma.TransactionClient,
    userId: string,
    requests: OwnedCustomSubclassRequest[],
): Promise<Map<string, CharacterSubclassReference>> {
    const uniqueRequests = new Map(
        requests.map((request) => [
            ownedCustomSubclassKey(request.classRef.id, request.customSubclass.name),
            request,
        ]),
    );

    if (uniqueRequests.size === 0) {
        return new Map();
    }

    const existingSubclasses = await tx.subclass.findMany({
        where: {
            ownerUserId: userId,
            archivedAt: null,
            OR: Array.from(uniqueRequests.values(), ({ classRef, customSubclass }) => ({
                classId: classRef.id,
                name: {
                    equals: customSubclass.name,
                    mode: "insensitive" as const,
                },
            })),
        },
    });
    const existingByKey = new Map(existingSubclasses.map((subclassRef) => [
        ownedCustomSubclassKey(subclassRef.classId, subclassRef.name),
        subclassRef,
    ]));
    const resolvedByKey = new Map<string, CharacterSubclassReference>();
    const updates: Array<{
        id: string;
        description: string;
        selectionLevel: number;
    }> = [];
    const creates: Array<{
        ownerUserId: string;
        name: string;
        description: string[];
        selectionLevel: number;
        classId: string;
    }> = [];

    for (const [key, { classRef, customSubclass }] of uniqueRequests) {
        const existingSubclass = existingByKey.get(key);

        if (!existingSubclass) {
            creates.push({
                ownerUserId: userId,
                name: customSubclass.name,
                description: [customSubclass.description],
                selectionLevel: customSubclass.selectionLevel,
                classId: classRef.id,
            });
            continue;
        }

        if (
            existingSubclass.description.join("\n\n") !== customSubclass.description
            || existingSubclass.selectionLevel !== customSubclass.selectionLevel
        ) {
            updates.push({
                id: existingSubclass.id,
                description: customSubclass.description,
                selectionLevel: customSubclass.selectionLevel,
            });
            resolvedByKey.set(key, {
                id: existingSubclass.id,
                ownerUserId: existingSubclass.ownerUserId,
                srdIndex: existingSubclass.srdIndex,
                name: existingSubclass.name,
                classId: existingSubclass.classId,
                selectionLevel: customSubclass.selectionLevel,
            });
        } else {
            resolvedByKey.set(key, existingSubclass);
        }
    }

    if (updates.length > 0) {
        const updateRows = JSON.stringify(updates.map(({ id, description, selectionLevel }) => ({
            id,
            description,
            selection_level: selectionLevel,
        })));
        await tx.$executeRaw`
            UPDATE "Subclass" AS subclass
            SET
                "description" = ARRAY[incoming.description],
                "selectionLevel" = incoming.selection_level
            FROM jsonb_to_recordset(${updateRows}::jsonb) AS incoming(
                id text,
                description text,
                selection_level integer
            )
            WHERE subclass."id" = incoming.id
              AND subclass."ownerUserId" = ${userId}
        `;
    }

    if (creates.length > 0) {
        const createdSubclasses = await tx.subclass.createManyAndReturn({ data: creates });

        for (const subclassRef of createdSubclasses) {
            resolvedByKey.set(
                ownedCustomSubclassKey(subclassRef.classId, subclassRef.name),
                subclassRef,
            );
        }
    }

    return resolvedByKey;
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
    const sourceLabel = buildSubclassFeatureSourceLabel(
        subclassRef?.name ?? resolvedClass.classRef.name,
        resolvedClass.classRef.name,
        feature.level,
    );

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
    const preparedClasses = classRows.map((classRow) => {
        const classRef = classRefsBySrdIndex.get(classRow.classId);
        if (!classRef) {
            throw new Error(`Unknown class: ${classRow.classId}`);
        }

        let subclassRef = classRow.subclassId
            ? subclassRefsBySelectionValue.get(classRow.subclassId) ?? null
            : null;

        return { classRow, classRef, subclassRef };
    });
    const customSubclassRequests = preparedClasses.flatMap(({ classRow, classRef, subclassRef }) => (
        !subclassRef && classRow.customSubclass
            ? [{ classRef, customSubclass: classRow.customSubclass }]
            : []
    ));
    const customSubclassesByKey = await findOrCreateOwnedCustomSubclasses(
        tx,
        userId,
        customSubclassRequests,
    );

    return preparedClasses.map(({ classRow, classRef, subclassRef: initialSubclassRef }) => {
        let subclassRef = initialSubclassRef;

        if (!subclassRef && classRow.customSubclass) {
            subclassRef = customSubclassesByKey.get(
                ownedCustomSubclassKey(classRef.id, classRow.customSubclass.name),
            ) ?? null;

            if (!subclassRef) {
                throw new Error(`Failed to persist custom subclass: ${classRow.customSubclass.name}`);
            }

            subclassRefsBySelectionValue.set(subclassRef.id, subclassRef);

            if (subclassRef.srdIndex) {
                subclassRefsBySelectionValue.set(subclassRef.srdIndex, subclassRef);
            }
        }

        return {
            classRow: {
                classId: classRow.classId,
                subclassId: subclassRef ? subclassSelectionValue(subclassRef) : null,
                customSubclass: classRow.customSubclass ?? null,
                level: classRow.level,
            },
            classRef,
            subclassRef,
        };
    });
}
