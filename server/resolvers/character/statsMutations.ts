import type { Context } from "../..";
import type {
    MutationUpdateAbilityScoresArgs,
    MutationUpdateCurrencyArgs,
    MutationUpdateDeathSavesArgs,
    MutationUpdateHitDiceArgs,
    MutationUpdateHpArgs,
    MutationUpdateSavingThrowProficienciesArgs,
    MutationUpdateSkillProficienciesArgs,
    MutationUpdateTraitsArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedStats } from "./helpers";

/**
 * Replaces the ability score object for an owned character.
 */
export async function updateAbilityScores(
    _parent: unknown,
    { characterId, input }: MutationUpdateAbilityScoresArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { abilityScores: input },
    });
}

/**
 * Replaces HP values for an owned character.
 */
export async function updateHP(
    _parent: unknown,
    { characterId, input }: MutationUpdateHpArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hp: input },
    });
}

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
 * Replaces hit dice values for an owned character.
 */
export async function updateHitDice(
    _parent: unknown,
    { characterId, input }: MutationUpdateHitDiceArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hitDice: input },
    });
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

    // Merge provided fields over existing skill proficiencies
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
 * Merges editable trait fields over existing trait metadata.
 */
export async function updateTraits(
    _parent: unknown,
    { characterId, input }: MutationUpdateTraitsArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);
    const existingTraits = stats.traits as Record<string, unknown>;

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { traits: { ...existingTraits, ...input } },
    });
}

/**
 * Replaces the currency object for an owned character.
 */
export async function updateCurrency(
    _parent: unknown,
    { characterId, input }: MutationUpdateCurrencyArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { currency: input },
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
