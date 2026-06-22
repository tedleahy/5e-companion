import type { Context } from "../..";
import type { Prisma } from "@prisma/client";
import type {
    CustomSubclass,
    ManagedCustomSubclassFeatureInput,
    ManagedCustomSubclassInput,
    MutationArchiveCustomSubclassArgs,
    MutationCreateCustomSubclassArgs,
    MutationUpdateCustomSubclassArgs,
    QueryCustomSubclassesArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { subclassSelectionValue } from "./subclassReferences";

const FEATURE_KIND = {
    SUBCLASS_FEATURE: "SUBCLASS_FEATURE",
} as const;

// NOTE: keep these max lengths in sync with the matching constants in
// mobile-app/components/subclasses/CustomSubclassFormSheet.tsx. No shared module
// exists yet, so the values must be mirrored by hand.
const CUSTOM_SUBCLASS_NAME_MAX_LENGTH = 100;
const CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH = 10000;
const CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH = 100;
const CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH = 10000;

const CUSTOM_SUBCLASS_FEATURE_INCLUDE = {
    where: {
        kind: FEATURE_KIND.SUBCLASS_FEATURE,
    },
    orderBy: [
        { level: "asc" as const },
        { name: "asc" as const },
    ],
};

const CUSTOM_SUBCLASS_RESPONSE_INCLUDE = {
    classRef: true as const,
    features: CUSTOM_SUBCLASS_FEATURE_INCLUDE,
};

const CUSTOM_SUBCLASS_RESPONSE_WITH_COUNT_INCLUDE = {
    ...CUSTOM_SUBCLASS_RESPONSE_INCLUDE,
    _count: {
        select: { characterClasses: true as const },
    },
};

type ManagedCustomSubclassValues = {
    classId: string;
    name: string;
    description: string;
    selectionLevel: number;
    features: ManagedCustomSubclassFeatureValues[];
    shouldReconcileFeatures: boolean;
};

type ManagedCustomSubclassFeatureValues = {
    id?: string;
    name: string;
    description: string;
    level: number;
};

type CustomSubclassFeatureRow = {
    id: string;
    name: string;
    description: string[];
    level: number | null;
};

type CustomSubclassResponseRow = {
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
    features: CustomSubclassFeatureRow[];
    _count?: {
        characterClasses: number;
    };
};

function normaliseManagedCustomSubclassInput(
    input: ManagedCustomSubclassInput,
): ManagedCustomSubclassValues {
    const name = input.name.trim();
    const description = input.description.trim();
    const classId = input.classId.trim();
    const selectionLevel = Number(input.selectionLevel ?? 3);
    const shouldReconcileFeatures = input.features != null;
    const features = normaliseManagedCustomSubclassFeatures(input.features ?? []);

    if (!name || !description || !classId) {
        throw new Error("Name, description, and class are required.");
    }

    if (name.length > CUSTOM_SUBCLASS_NAME_MAX_LENGTH) {
        throw new Error(`Name must be ${CUSTOM_SUBCLASS_NAME_MAX_LENGTH} characters or fewer.`);
    }

    if (description.length > CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH) {
        throw new Error(`Description must be ${CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH} characters or fewer.`);
    }

    if (!Number.isInteger(selectionLevel) || selectionLevel < 1 || selectionLevel > 20) {
        throw new Error('Selection level must be an integer from 1 to 20.');
    }

    return { name, description, selectionLevel, classId, features, shouldReconcileFeatures };
}

function normaliseManagedCustomSubclassFeatures(
    features: readonly ManagedCustomSubclassFeatureInput[],
): ManagedCustomSubclassFeatureValues[] {
    const duplicateKeys = new Set<string>();

    return features.map((feature, index) => {
        const id = feature.id?.trim() || undefined;
        const name = feature.name.trim();
        const description = feature.description.trim();
        const level = Number(feature.level);

        if (!name || !description) {
            throw new Error(`Feature ${index + 1} requires a name and description.`);
        }

        if (!Number.isInteger(level) || level < 1) {
            throw new Error(`Feature ${index + 1} level must be a positive integer.`);
        }

        if (name.length > CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH) {
            throw new Error(`Feature ${index + 1} name must be ${CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH} characters or fewer.`);
        }

        if (description.length > CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH) {
            throw new Error(`Feature ${index + 1} description must be ${CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH} characters or fewer.`);
        }

        const duplicateKey = `${level}:${name.toLowerCase()}`;

        if (duplicateKeys.has(duplicateKey)) {
            throw new Error(`Duplicate subclass feature "${name}" at level ${level}.`);
        }

        duplicateKeys.add(duplicateKey);

        return {
            ...(id ? { id } : {}),
            name,
            description,
            level,
        };
    });
}

function duplicateSubclassNameWhere(
    userId: string,
    classId: string,
    name: string,
    excludeSubclassId?: string,
) {
    return {
        ownerUserId: userId,
        classId,
        name: {
            equals: name,
            mode: "insensitive" as const,
        },
        archivedAt: null,
        ...(excludeSubclassId ? { id: { not: excludeSubclassId } } : {}),
    };
}

function toCustomSubclass(subclassRef: CustomSubclassResponseRow): CustomSubclass {
    return {
        id: subclassRef.id,
        value: subclassSelectionValue(subclassRef),
        classId: subclassRef.classRef.srdIndex ?? subclassRef.classId,
        className: subclassRef.classRef.name,
        name: subclassRef.name,
        selectionLevel: subclassRef.selectionLevel ?? 3,
        description: subclassRef.description,
        features: subclassRef.features.map((feature) => ({
            id: feature.id,
            name: feature.name,
            description: feature.description.join("\n\n").trim(),
            level: feature.level ?? 0,
        })),
        characterUsageCount: subclassRef._count?.characterClasses ?? 0,
    };
}

function subclassFeatureSourceLabel(subclassName: string, className: string, level: number): string {
    return `${subclassName} ${className} ${level}`;
}

async function reconcileOwnedCustomSubclassFeatures(
    tx: Prisma.TransactionClient,
    userId: string,
    subclassId: string,
    classId: string,
    className: string,
    subclassName: string,
    features: ManagedCustomSubclassFeatureValues[],
) {
    const existingFeatures = await tx.feature.findMany({
        where: {
            ownerUserId: userId,
            kind: FEATURE_KIND.SUBCLASS_FEATURE,
            subclassId,
        },
        select: { id: true },
    });
    const existingFeatureIds = new Set(existingFeatures.map((feature) => feature.id));
    const submittedIds = features
        .map((feature) => feature.id)
        .filter((id): id is string => Boolean(id));

    for (const id of submittedIds) {
        if (!existingFeatureIds.has(id)) {
            throw new Error("Custom subclass feature not found.");
        }
    }

    await tx.feature.deleteMany({
        where: {
            ownerUserId: userId,
            kind: FEATURE_KIND.SUBCLASS_FEATURE,
            subclassId,
            ...(submittedIds.length > 0 ? { id: { notIn: submittedIds } } : {}),
        },
    });

    for (const feature of features) {
        const data = {
            ownerUserId: userId,
            name: feature.name,
            description: [feature.description],
            level: feature.level,
            kind: FEATURE_KIND.SUBCLASS_FEATURE,
            sourceLabel: subclassFeatureSourceLabel(subclassName, className, feature.level),
            classId,
            subclassId,
        };

        if (feature.id) {
            await tx.feature.update({
                where: {
                    id: feature.id,
                    ownerUserId: userId,
                },
                data,
            });
        } else {
            await tx.feature.create({ data });
        }
    }
}

/**
 * Loads custom subclasses owned by the current user, optionally filtered by class SRD indices.
 */
export async function customSubclassesForUser(
    userId: string,
    classIds?: string[] | null,
): Promise<CustomSubclass[]> {
    const subclassRefs = await prisma.subclass.findMany({
        include: CUSTOM_SUBCLASS_RESPONSE_WITH_COUNT_INCLUDE,
        where: {
            ownerUserId: userId,
            archivedAt: null,
            ...(classIds && classIds.length > 0
                ? {
                      classRef: {
                          srdIndex: {
                              in: classIds,
                          },
                      },
                  }
                : {}),
        },
        orderBy: [
            { classRef: { name: "asc" } },
            { name: "asc" },
        ],
    });

    return subclassRefs.map(toCustomSubclass);
}

/**
 * Query resolver for listing the current user's custom subclasses.
 */
export async function customSubclasses(
    _parent: unknown,
    { classIds }: QueryCustomSubclassesArgs,
    ctx: Context,
): Promise<CustomSubclass[]> {
    const userId = requireUser(ctx);
    return customSubclassesForUser(userId, classIds ?? null);
}

/**
 * Mutation resolver to create a new custom subclass for the current user.
 */
export async function createCustomSubclass(
    _parent: unknown,
    { input }: MutationCreateCustomSubclassArgs,
    ctx: Context,
): Promise<CustomSubclass> {
    const userId = requireUser(ctx);
    const { name, description, selectionLevel, classId, features } = normaliseManagedCustomSubclassInput(input);

    const classRef = await prisma.class.findFirst({
        where: { srdIndex: classId },
    });

    if (!classRef) {
        throw new Error(`Unknown class: ${classId}`);
    }

    const duplicate = await prisma.subclass.findFirst({
        where: duplicateSubclassNameWhere(userId, classRef.id, name),
    });

    if (duplicate) {
        throw new Error(`You already have a custom subclass named "${name}" for ${classRef.name}.`);
    }

    const subclassRef = await prisma.$transaction(async (tx) => {
        const createdSubclass = await tx.subclass.create({
            data: {
                ownerUserId: userId,
                name,
                description: [description],
                selectionLevel,
                classId: classRef.id,
            },
        });

        await reconcileOwnedCustomSubclassFeatures(
            tx,
            userId,
            createdSubclass.id,
            classRef.id,
            classRef.name,
            name,
            features,
        );

        return await tx.subclass.findFirst({
            where: { id: createdSubclass.id },
            include: CUSTOM_SUBCLASS_RESPONSE_INCLUDE,
        });
    });

    if (!subclassRef) {
        throw new Error("Custom subclass not found.");
    }

    return toCustomSubclass(subclassRef);
}

/**
 * Mutation resolver to update an existing custom subclass.
 */
export async function updateCustomSubclass(
    _parent: unknown,
    { id, input }: MutationUpdateCustomSubclassArgs,
    ctx: Context,
): Promise<CustomSubclass> {
    const userId = requireUser(ctx);
    const {
        name,
        description,
        selectionLevel,
        classId,
        features,
        shouldReconcileFeatures,
    } = normaliseManagedCustomSubclassInput(input);

    const existingSubclass = await prisma.subclass.findFirst({
        where: {
            id,
            ownerUserId: userId,
            archivedAt: null,
        },
        include: {
            classRef: true,
            _count: {
                select: {
                    characterClasses: true,
                    features: true,
                },
            },
        },
    });

    if (!existingSubclass) {
        throw new Error("Custom subclass not found.");
    }

    const classRef = await prisma.class.findFirst({
        where: { srdIndex: classId },
    });

    if (!classRef) {
        throw new Error(`Unknown class: ${classId}`);
    }

    const classChanged = existingSubclass.classRef.srdIndex !== classRef.srdIndex;

    if (classChanged) {
        if (existingSubclass._count.characterClasses > 0) {
            throw new Error(
                `Cannot change the parent class of a subclass used by ${existingSubclass._count.characterClasses} character(s).`,
            );
        }

        if (existingSubclass._count.features > 0 && (!shouldReconcileFeatures || features.length > 0)) {
            throw new Error(
                `Cannot change the parent class of a subclass with ${existingSubclass._count.features} feature definition(s).`,
            );
        }
    }

    const duplicate = await prisma.subclass.findFirst({
        where: duplicateSubclassNameWhere(userId, classRef.id, name, id),
    });

    if (duplicate) {
        throw new Error(`You already have a custom subclass named "${name}" for ${classRef.name}.`);
    }

    const subclassRef = await prisma.$transaction(async (tx) => {
        await tx.subclass.update({
            where: { id },
            data: {
                name,
                description: [description],
                selectionLevel,
                classId: classRef.id,
            },
        });

        if (shouldReconcileFeatures) {
            await reconcileOwnedCustomSubclassFeatures(
                tx,
                userId,
                id,
                classRef.id,
                classRef.name,
                name,
                features,
            );
        }

        return await tx.subclass.findFirst({
            where: { id },
            include: CUSTOM_SUBCLASS_RESPONSE_WITH_COUNT_INCLUDE,
        });
    });

    if (!subclassRef) {
        throw new Error("Custom subclass not found.");
    }

    return toCustomSubclass(subclassRef);
}

/**
 * Mutation resolver to soft-delete (archive) a custom subclass.
 */
export async function archiveCustomSubclass(
    _parent: unknown,
    { id }: MutationArchiveCustomSubclassArgs,
    ctx: Context,
): Promise<boolean> {
    const userId = requireUser(ctx);

    const existingSubclass = await prisma.subclass.findFirst({
        where: {
            id,
            ownerUserId: userId,
            archivedAt: null,
        },
    });

    if (!existingSubclass) {
        throw new Error("Custom subclass not found.");
    }

    await prisma.subclass.update({
        where: { id },
        data: { archivedAt: new Date() },
    });

    return true;
}
