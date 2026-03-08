import prisma from "../../prisma/prisma";

/**
 * Default skill proficiency map for new characters.
 */
export const DEFAULT_SKILL_PROFICIENCIES = {
    acrobatics: 'none',
    animalHandling: 'none',
    arcana: 'none',
    athletics: 'none',
    deception: 'none',
    history: 'none',
    insight: 'none',
    intimidation: 'none',
    investigation: 'none',
    medicine: 'none',
    nature: 'none',
    perception: 'none',
    performance: 'none',
    persuasion: 'none',
    religion: 'none',
    sleightOfHand: 'none',
    stealth: 'none',
    survival: 'none',
};

/**
 * Default editable personality/metadata fields for a new character.
 */
export const DEFAULT_TRAITS = {
    personality: '',
    ideals: '',
    bonds: '',
    flaws: '',
    armorProficiencies: [] as string[],
    weaponProficiencies: [] as string[],
    toolProficiencies: [] as string[],
    languages: [] as string[],
};

/**
 * Default starting currency for a new character.
 */
export const DEFAULT_CURRENCY = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

/**
 * Returns a shallow copy with null/undefined properties removed.
 */
export function stripNullishFields<T extends Record<string, unknown>>(input: T): Partial<T> {
    const data: Partial<T> = {};

    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) {
            data[key as keyof T] = value as T[keyof T];
        }
    }

    return data;
}

/**
 * Returns a character only if it belongs to the authenticated user.
 */
export async function findOwnedCharacter(characterId: string, userId: string) {
    const character = await prisma.character.findFirst({
        where: { id: characterId, ownerUserId: userId },
    });
    if (!character) throw new Error('Character not found.');
    return character;
}

/**
 * Returns character stats only if the parent character is owned by the user.
 */
export async function findOwnedStats(characterId: string, userId: string) {
    await findOwnedCharacter(characterId, userId);
    const stats = await prisma.characterStats.findUnique({
        where: { characterId },
    });
    if (!stats) throw new Error('Character stats not found.');
    return stats;
}
