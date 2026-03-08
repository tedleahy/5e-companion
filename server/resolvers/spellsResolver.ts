import type { Context } from "..";
import type { QuerySpellsArgs } from "../generated/graphql";
import { requireUser } from "../lib/auth";
import { buildWhere } from "../lib/spellFilters";
import { buildSpellSelect } from "../lib/spellSelect";
import prisma from "../prisma/prisma";
import type { GraphQLResolveInfo } from "graphql";

/** Hard cap to prevent excessively large page sizes in one query. */
const MAX_SPELLS_PAGE_SIZE = 200;

/**
 * Normalises a pagination limit from GraphQL input into a safe positive integer.
 */
function normaliseLimit(limit: number | null | undefined): number | undefined {
    if (limit == null) return undefined;
    if (!Number.isInteger(limit)) return undefined;
    if (limit <= 0) return undefined;
    return Math.min(limit, MAX_SPELLS_PAGE_SIZE);
}

/**
 * Normalises a pagination offset from GraphQL input into a non-negative integer.
 */
function normaliseOffset(offset: number | null | undefined): number | undefined {
    if (offset == null) return undefined;
    if (!Number.isInteger(offset)) return undefined;
    if (offset < 0) return undefined;
    return offset;
}

export default async function spellsResolver(
    _parent: unknown,
    args: Partial<QuerySpellsArgs>,
    ctx: Context,
    info?: GraphQLResolveInfo,
) {
    requireUser(ctx);

    try {
        const where = buildWhere(args.filter);
        const select = buildSpellSelect(info);
        const limit = normaliseLimit(args.pagination?.limit);
        const offset = normaliseOffset(args.pagination?.offset);

        return await prisma.spell.findMany({
            where,
            orderBy: [
                { level: 'asc' },
                { name: 'asc' },
                { id: 'asc' },
            ],
            select,
            ...(limit != null ? { take: limit } : {}),
            ...(offset != null ? { skip: offset } : {}),
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
