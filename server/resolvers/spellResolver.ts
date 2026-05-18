import type { Context } from "..";
import type { QuerySpellArgs } from "../generated/graphql";
import { requireUser } from "../lib/auth";
import prisma from "../prisma/prisma";

/**
 * Resolves a single SRD spell detail for authenticated users.
 */
export default async function spellResolver(
    _parent: unknown,
    args: Partial<QuerySpellArgs>,
    ctx: Context,
) {
    requireUser(ctx);

    try {
        return await prisma.spell.findUnique({
            where: { id: args.id },
            select: {
                id: true,
                name: true,
                level: true,
                schoolIndex: true,
                classIndexes: true,
                description: true,
                higherLevel: true,
                range: true,
                components: true,
                material: true,
                ritual: true,
                duration: true,
                concentration: true,
                castingTime: true,
                sourceBook: true,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
