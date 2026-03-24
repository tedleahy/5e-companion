import type { Character as PrismaCharacter, Prisma } from "@prisma/client";

/**
 * Shared include shape for class-row loads that need resolved display labels.
 */
export const CHARACTER_CLASS_INCLUDE = {
    classRef: true,
    subclassRef: true,
} satisfies Prisma.CharacterClassInclude;

/**
 * Shared include shape for roster reads.
 */
export const CHARACTER_LIST_INCLUDE = {
    classes: {
        include: CHARACTER_CLASS_INCLUDE,
    },
} satisfies Prisma.CharacterInclude;

/**
 * Shared include shape for character detail reads that power the sheet view.
 */
export const CHARACTER_DETAIL_INCLUDE = {
    ...CHARACTER_LIST_INCLUDE,
    stats: true,
    weapons: true,
    inventory: true,
    features: true,
    spellSlots: true,
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
 * Character payload returned by roster list reads.
 */
export type CharacterListItem = Prisma.CharacterGetPayload<{
    include: typeof CHARACTER_LIST_INCLUDE;
}>;

/**
 * Parent shape accepted by Character field resolvers.
 */
export type CharacterFieldParent = PrismaCharacter | CharacterDetail | CharacterListItem;
