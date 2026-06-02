import type { Context } from "../..";
import type {
    CustomSubclass,
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

    if (!name || !description || !classId) {
        throw new Error("Name, description, and class are required.");
    }

    if (name.length > 100) {
        throw new Error("Name must be 100 characters or fewer.");
    }

    if (description.length > 5000) {
        throw new Error("Description must be 5000 characters or fewer.");
    }

    return { name, description, classId };
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
    const { name, description, classId } = normaliseManagedCustomSubclassInput(input);

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

    const subclassRef = await prisma.subclass.create({
        data: {
            ownerUserId: userId,
            name,
            description: [description],
            classId: classRef.id,
        },
        include: CUSTOM_SUBCLASS_RESPONSE_INCLUDE,
    });

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
    const { name, description, classId } = normaliseManagedCustomSubclassInput(input);

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

        if (existingSubclass._count.features > 0) {
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

    const subclassRef = await prisma.subclass.update({
        where: { id },
        data: {
            name,
            description: [description],
            classId: classRef.id,
        },
        include: CUSTOM_SUBCLASS_RESPONSE_WITH_COUNT_INCLUDE,
    });

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
