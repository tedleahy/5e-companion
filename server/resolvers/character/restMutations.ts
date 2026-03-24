import type { Context } from "../..";
import type {
    MutationLongRestArgs,
    MutationShortRestArgs,
    MutationSpendHitDieArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter, findOwnedStats } from "./helpers";
import { recoverHitDicePools, sortClassRowsForDisplay } from "./multiclassRules";

/**
 * Spends hit dice from a specific class pool, clamping remaining dice at zero.
 */
export async function spendHitDie(
    _parent: unknown,
    { characterId, classId, amount }: MutationSpendHitDieArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);
    const hitDicePools = await prisma.hitDicePool.findMany({
        where: { characterId },
        include: { classRef: true },
    });

    const hitDicePool = hitDicePools.find(
        (candidate) => (candidate.classRef.srdIndex ?? candidate.classId) === classId,
    );
    if (!hitDicePool) {
        throw new Error(`Hit-dice pool not found for class ${classId}.`);
    }

    await prisma.hitDicePool.update({
        where: { id: hitDicePool.id },
        data: {
            remaining: Math.max(0, hitDicePool.remaining - (amount ?? 1)),
        },
    });

    return stats;
}

/**
 * Applies short-rest recovery, including pact slots and short-rest feature uses.
 */
export async function shortRest(
    _parent: unknown,
    { characterId }: MutationShortRestArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const character = await findOwnedCharacter(characterId, userId);

    await prisma.spellSlot.updateMany({
        where: {
            characterId,
            kind: 'PACT_MAGIC',
        },
        data: { used: 0 },
    });

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

    const hp = stats.hp as { current: number; max: number; temp: number };
    await prisma.characterStats.update({
        where: { id: stats.id },
        data: {
            hp: { current: hp.max, max: hp.max, temp: 0 },
            deathSaves: { successes: 0, failures: 0 },
        },
    });

    const [hitDicePools, classRows] = await Promise.all([
        prisma.hitDicePool.findMany({
            where: { characterId },
        }),
        prisma.characterClass.findMany({
            where: { characterId },
            include: { classRef: true },
        }),
    ]);

    const orderedClasses = sortClassRowsForDisplay(
        classRows.map((classRow) => ({
            classId: classRow.classId,
            className: classRow.classRef.name,
            isStartingClass: classRow.isStartingClass,
            level: classRow.level,
        })),
    );
    const totalHitDice = orderedClasses.reduce((total, classRow) => total + classRow.level, 0);
    const recovered = Math.max(1, Math.floor(totalHitDice / 2));
    const recoveredPools = recoverHitDicePools(
        hitDicePools,
        orderedClasses.map((classRow) => classRow.classId),
        recovered,
    );

    for (const recoveredPool of recoveredPools) {
        if (!recoveredPool.id) continue;

        await prisma.hitDicePool.update({
            where: { id: recoveredPool.id },
            data: { remaining: recoveredPool.remaining },
        });
    }

    await prisma.spellSlot.updateMany({
        where: { characterId },
        data: { used: 0 },
    });

    await prisma.$executeRaw`
        UPDATE "CharacterFeature"
        SET "usesRemaining" = "usesMax"
        WHERE "characterId" = ${characterId}
          AND "recharge" IN ('short', 'long')
          AND "usesMax" IS NOT NULL
    `;

    return character;
}
