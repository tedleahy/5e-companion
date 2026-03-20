import type { Character as PrismaCharacter } from "@prisma/client";
import prisma from "../../prisma/prisma";

/**
 * Field resolver for Character.stats.
 */
export async function characterStats(parent: PrismaCharacter) {
    return await prisma.characterStats.findUnique({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.weapons.
 */
export async function characterWeapons(parent: PrismaCharacter) {
    return await prisma.weapon.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.inventory.
 */
export async function characterInventory(parent: PrismaCharacter) {
    return await prisma.inventoryItem.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.features.
 */
export async function characterFeatures(parent: PrismaCharacter) {
    return await prisma.characterFeature.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.spellSlots.
 */
export async function characterSpellSlots(parent: PrismaCharacter) {
    return await prisma.spellSlot.findMany({
        where: { characterId: parent.id },
        orderBy: { level: 'asc' },
    });
}

/**
 * Field resolver for Character.spellbook.
 */
export async function characterSpellbook(parent: PrismaCharacter) {
    return await prisma.characterSpell.findMany({
        where: { characterId: parent.id },
        include: { spell: true },
    });
}
