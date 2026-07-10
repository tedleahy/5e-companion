import type { ProficiencyType } from '@prisma/client';
import prisma from '../../prisma/prisma';
import type { ProficiencyRef } from '../../generated/graphql';

const PROFICIENCY_TYPES = new Set<string>([
    'ARMOR',
    'WEAPON',
    'TOOL',
    'SKILL',
    'SAVING_THROW',
    'OTHER',
]);

/**
 * Loads proficiency reference rows visible to the current user (SRD plus owned custom).
 */
export async function proficienciesForUser(
    userId: string,
    type?: string | null,
): Promise<ProficiencyRef[]> {
    const normalisedType = type?.trim().toUpperCase() || null;
    if (normalisedType && !PROFICIENCY_TYPES.has(normalisedType)) {
        throw new Error(`Unknown proficiency type: ${type}`);
    }

    const rows = await prisma.proficiency.findMany({
        where: {
            OR: [{ ownerUserId: null }, { ownerUserId: userId }],
            ...(normalisedType ? { type: normalisedType as ProficiencyType } : {}),
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return rows.map((row) => ({
        value: row.srdIndex ?? row.id,
        name: row.name,
        type: row.type,
        isCustom: row.ownerUserId != null,
    }));
}
