import type { Context } from "../..";
import type {
    MutationUpdateDeathSavesArgs,
    MutationUpdateHitDiceArgs,
    MutationUpdateSavingThrowProficienciesArgs,
    MutationUpdateSkillProficienciesArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedStats } from "./helpers";

/**
 * Replaces death save values for an owned character.
 */
export async function updateDeathSaves(
    _parent: unknown,
    { characterId, input }: MutationUpdateDeathSavesArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { deathSaves: input },
    });
}

/**
 * Replaces remaining hit-dice values for one or more owned class pools.
 */
export async function updateHitDice(
    _parent: unknown,
    { characterId, input }: MutationUpdateHitDiceArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);
    const hitDicePools = await prisma.hitDicePool.findMany({
        where: { characterId },
        include: { classRef: true },
    });

    const poolByClassId = new Map(hitDicePools.map((hitDicePool) => [
        hitDicePool.classRef.srdIndex ?? hitDicePool.classId,
        hitDicePool,
    ]));

    for (const update of input) {
        const hitDicePool = poolByClassId.get(update.classId);
        if (!hitDicePool) {
            throw new Error(`Hit-dice pool not found for class ${update.classId}.`);
        }

        await prisma.hitDicePool.update({
            where: { id: hitDicePool.id },
            data: {
                remaining: Math.max(0, Math.min(hitDicePool.total, update.remaining)),
            },
        });
    }

    return stats;
}

/**
 * Partially updates skill proficiency fields, preserving unspecified values.
 */
export async function updateSkillProficiencies(
    _parent: unknown,
    { characterId, input }: MutationUpdateSkillProficienciesArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    const existing = stats.skillProficiencies as Record<string, string>;
    const merged = { ...existing };
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) {
            merged[key] = value;
        }
    }

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { skillProficiencies: merged },
    });
}

/**
 * Replaces saving throw proficiency list for an owned character.
 */
export async function updateSavingThrowProficiencies(
    _parent: unknown,
    { characterId, input }: MutationUpdateSavingThrowProficienciesArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { savingThrowProficiencies: input.proficiencies },
    });
}
