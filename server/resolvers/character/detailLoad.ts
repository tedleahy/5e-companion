import type { Character as PrismaCharacter, Prisma } from "@prisma/client";

/**
 * Shared include shape for character detail reads that power the sheet view.
 */
export const CHARACTER_DETAIL_INCLUDE = {
    stats: true,
    weapons: true,
    inventory: true,
    features: true,
    spellSlots: {
        orderBy: { level: 'asc' },
    },
    spellbook: {
        include: {
            spell: true,
        },
    },
} satisfies Prisma.CharacterInclude;

/**
 * Character payload returned by the rich detail query boundary.
 */
export type CharacterDetail = Prisma.CharacterGetPayload<{
    include: typeof CHARACTER_DETAIL_INCLUDE;
}>;

/**
 * Parent shape accepted by Character field resolvers.
 */
export type CharacterFieldParent = PrismaCharacter | CharacterDetail;
