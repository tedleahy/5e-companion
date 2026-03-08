import type { Context } from "../..";
import type { QueryCharacterArgs } from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";

/**
 * Query resolver for a single owned character by id.
 */
export async function character(
    _parent: unknown,
    { id }: QueryCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    return await prisma.character.findFirst({
        where: { id, ownerUserId: userId },
    });
}

/**
 * Query resolver for all characters owned by the current user.
 */
export async function currentUserCharacters(
    _parent: unknown,
    _args: unknown,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    return await prisma.character.findMany({
        where: { ownerUserId: userId },
        orderBy: { createdAt: 'asc' },
    });
}
