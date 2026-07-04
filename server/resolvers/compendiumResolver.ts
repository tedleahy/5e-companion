import type { Context } from '..';
import { requireUser } from '../lib/auth';
import prisma from '../prisma/prisma';

/** Returns lightweight Compendium totals without loading content rows. */
export default async function compendiumCounts(
    _parent: unknown,
    _args: unknown,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const [srdSubclassCount, customSubclassCount, spellCount] = await Promise.all([
        prisma.subclass.count({
            where: { ownerUserId: null },
        }),
        prisma.subclass.count({
            where: { ownerUserId: userId, archivedAt: null },
        }),
        prisma.spell.count(),
    ]);

    return {
        srdSubclassCount,
        customSubclassCount,
        spellCount,
    };
}
