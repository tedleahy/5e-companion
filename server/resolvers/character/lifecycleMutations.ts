import type { Context } from "../..";
import type {
    MutationCreateCharacterArgs,
    MutationDeleteCharacterArgs,
    MutationToggleInspirationArgs,
    MutationUpdateCharacterArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import {
    DEFAULT_CURRENCY,
    DEFAULT_SKILL_PROFICIENCIES,
    DEFAULT_TRAITS,
    findOwnedCharacter,
    stripNullishFields,
} from "./helpers";

/**
 * Creates a character and nested stats row with sensible defaults.
 */
export async function createCharacter(
    _parent: unknown,
    { input }: MutationCreateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const {
        abilityScores,
        hp,
        hitDice,
        savingThrowProficiencies,
        skillProficiencies,
        traits,
        currency,
        ...characterFields
    } = input;

    return await prisma.character.create({
        data: {
            ...characterFields,
            ownerUserId: userId,
            stats: {
                create: {
                    abilityScores,
                    hp,
                    deathSaves: { successes: 0, failures: 0 },
                    hitDice,
                    savingThrowProficiencies: savingThrowProficiencies ?? [],
                    skillProficiencies: { ...DEFAULT_SKILL_PROFICIENCIES, ...skillProficiencies },
                    traits: traits ?? DEFAULT_TRAITS,
                    currency: currency ?? DEFAULT_CURRENCY,
                },
            },
        },
    });
}

/**
 * Updates character top-level fields that are provided in input.
 */
export async function updateCharacter(
    _parent: unknown,
    { id, input }: MutationUpdateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const existing = await findOwnedCharacter(id, userId);

    const data = stripNullishFields(input);

    return await prisma.character.update({
        where: { id: existing.id },
        data,
    });
}

/**
 * Deletes an owned character by id.
 */
export async function deleteCharacter(
    _parent: unknown,
    { id }: MutationDeleteCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const result = await prisma.character.deleteMany({
        where: { id, ownerUserId: userId },
    });

    if (result.count === 0) throw new Error('Character not found.');

    return true;
}

/**
 * Toggles inspiration on/off for an owned character.
 */
export async function toggleInspiration(
    _parent: unknown,
    { characterId }: MutationToggleInspirationArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const existing = await findOwnedCharacter(characterId, userId);

    return await prisma.character.update({
        where: { id: existing.id },
        data: { inspiration: !existing.inspiration },
    });
}
