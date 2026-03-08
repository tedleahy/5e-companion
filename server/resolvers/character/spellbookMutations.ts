import type { Context } from "../..";
import type {
    MutationForgetSpellArgs,
    MutationLearnSpellArgs,
    MutationPrepareSpellArgs,
    MutationToggleSpellSlotArgs,
    MutationUnprepareSpellArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter } from "./helpers";

/**
 * Adds a spell to a character spellbook if missing, else returns existing row.
 */
export async function learnSpell(
    _parent: unknown,
    { characterId, spellId }: MutationLearnSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterSpell.upsert({
        where: { characterId_spellId: { characterId, spellId } },
        create: { characterId, spellId, prepared: false },
        update: {},
        include: { spell: true },
    });
}

/**
 * Removes a spell from a character spellbook.
 */
export async function forgetSpell(
    _parent: unknown,
    { characterId, spellId }: MutationForgetSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.characterSpell.deleteMany({
        where: { characterId, spellId },
    });

    if (result.count === 0) throw new Error('Spell not in spellbook.');

    return true;
}

/**
 * Marks a spell as prepared in a character spellbook.
 */
export async function prepareSpell(
    _parent: unknown,
    { characterId, spellId }: MutationPrepareSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterSpell.update({
        where: { characterId_spellId: { characterId, spellId } },
        data: { prepared: true },
        include: { spell: true },
    });
}

/**
 * Marks a spell as unprepared in a character spellbook.
 */
export async function unprepareSpell(
    _parent: unknown,
    { characterId, spellId }: MutationUnprepareSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterSpell.update({
        where: { characterId_spellId: { characterId, spellId } },
        data: { prepared: false },
        include: { spell: true },
    });
}

/**
 * Cycles spell-slot usage for a given spell level.
 */
export async function toggleSpellSlot(
    _parent: unknown,
    { characterId, level }: MutationToggleSpellSlotArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const slot = await prisma.spellSlot.findUnique({
        where: { characterId_level: { characterId, level } },
    });
    if (!slot) throw new Error('Spell slot not found.');

    // Toggle: if all used, start recovering; otherwise use one more
    const newUsed = slot.used < slot.total ? slot.used + 1 : 0;

    return await prisma.spellSlot.update({
        where: { id: slot.id },
        data: { used: newUsed },
    });
}
