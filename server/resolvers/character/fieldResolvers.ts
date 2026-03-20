import prisma from "../../prisma/prisma";
import type { CharacterDetail, CharacterFieldParent } from "./detailLoad";

/**
 * Returns true when the parent already includes the named relation.
 */
function hasLoadedRelation(
    parent: CharacterFieldParent,
    relation: 'stats' | 'weapons' | 'inventory' | 'features' | 'spellSlots' | 'spellbook',
): parent is CharacterDetail {
    return relation in parent;
}

/**
 * Field resolver for Character.stats.
 */
export async function characterStats(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['stats']> {
    if (hasLoadedRelation(parent, 'stats')) {
        return parent.stats;
    }

    return await prisma.characterStats.findUnique({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.weapons.
 */
export async function characterWeapons(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['weapons']> {
    if (hasLoadedRelation(parent, 'weapons')) {
        return parent.weapons;
    }

    return await prisma.weapon.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.inventory.
 */
export async function characterInventory(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['inventory']> {
    if (hasLoadedRelation(parent, 'inventory')) {
        return parent.inventory;
    }

    return await prisma.inventoryItem.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.features.
 */
export async function characterFeatures(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['features']> {
    if (hasLoadedRelation(parent, 'features')) {
        return parent.features;
    }

    return await prisma.characterFeature.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.spellSlots.
 */
export async function characterSpellSlots(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['spellSlots']> {
    if (hasLoadedRelation(parent, 'spellSlots')) {
        return parent.spellSlots;
    }

    return await prisma.spellSlot.findMany({
        where: { characterId: parent.id },
        orderBy: { level: 'asc' },
    });
}

/**
 * Field resolver for Character.spellbook.
 */
export async function characterSpellbook(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['spellbook']> {
    if (hasLoadedRelation(parent, 'spellbook')) {
        return parent.spellbook;
    }

    return await prisma.characterSpell.findMany({
        where: { characterId: parent.id },
        include: { spell: true },
    });
}
