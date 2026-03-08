import type { Context } from "../..";
import type {
    MutationLongRestArgs,
    MutationShortRestArgs,
    MutationSpendHitDieArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter, findOwnedStats } from "./helpers";

/**
 * Spends hit dice, clamping remaining dice at zero.
 */
export async function spendHitDie(
    _parent: unknown,
    { characterId, amount }: MutationSpendHitDieArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    const hitDice = stats.hitDice as { total: number; remaining: number; die: string };
    const newRemaining = Math.max(0, hitDice.remaining - (amount ?? 1));

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hitDice: { ...hitDice, remaining: newRemaining } },
    });
}

/**
 * Applies short-rest recovery (currently restores short-rest feature uses).
 */
export async function shortRest(
    _parent: unknown,
    { characterId }: MutationShortRestArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const character = await findOwnedCharacter(characterId, userId);

    // Prisma updateMany can't set usesRemaining = usesMax dynamically,
    // so we use a raw query to restore feature uses.
    await prisma.$executeRaw`
        UPDATE "CharacterFeature"
        SET "usesRemaining" = "usesMax"
        WHERE "characterId" = ${characterId}
          AND "recharge" = 'short'
          AND "usesMax" IS NOT NULL
    `;

    return character;
}

/**
 * Applies long-rest recovery to HP, death saves, hit dice, slots, and features.
 */
export async function longRest(
    _parent: unknown,
    { characterId }: MutationLongRestArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const character = await findOwnedCharacter(characterId, userId);
    const stats = await prisma.characterStats.findUnique({ where: { characterId } });
    if (!stats) throw new Error('Character stats not found.');

    // 1. Restore HP to max, clear temp HP.
    const hp = stats.hp as { current: number; max: number; temp: number };
    await prisma.characterStats.update({
        where: { id: stats.id },
        data: {
            hp: { current: hp.max, max: hp.max, temp: 0 },
            deathSaves: { successes: 0, failures: 0 },
        },
    });

    // 2. Restore hit dice: recover half total (minimum 1).
    const hitDice = stats.hitDice as { total: number; remaining: number; die: string };
    const recovered = Math.max(1, Math.floor(hitDice.total / 2));
    const newRemaining = Math.min(hitDice.total, hitDice.remaining + recovered);
    await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hitDice: { ...hitDice, remaining: newRemaining } },
    });

    // 3. Reset all spell slots.
    await prisma.spellSlot.updateMany({
        where: { characterId },
        data: { used: 0 },
    });

    // 4. Restore feature uses (short + long recharge).
    await prisma.$executeRaw`
        UPDATE "CharacterFeature"
        SET "usesRemaining" = "usesMax"
        WHERE "characterId" = ${characterId}
          AND "recharge" IN ('short', 'long')
          AND "usesMax" IS NOT NULL
    `;

    return character;
}
