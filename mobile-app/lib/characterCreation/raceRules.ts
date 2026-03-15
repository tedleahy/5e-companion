import type { AbilityKey } from '@/lib/characterSheetUtils';

/**
 * Racial ability score bonuses from the PHB.
 * Applied on top of base scores during character creation.
 */
export const RACE_ABILITY_BONUSES: Record<string, Partial<Record<AbilityKey, number>>> = {
    Elf: { dexterity: 2, intelligence: 1 },
    Human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    Dwarf: { constitution: 2 },
    Halfling: { dexterity: 2 },
    Dragonborn: { strength: 2, charisma: 1 },
    Tiefling: { charisma: 2, intelligence: 1 },
    Gnome: { intelligence: 2 },
    'Half-Orc': { strength: 2, constitution: 1 },
    'Half-Elf': { charisma: 2 },
    Aasimar: { charisma: 2 },
};

/** Base walking speed by race. */
export const RACE_SPEED_MAP: Record<string, number> = {
    Elf: 30,
    Human: 30,
    Dwarf: 25,
    Halfling: 25,
    Dragonborn: 30,
    Tiefling: 30,
    Gnome: 25,
    'Half-Orc': 30,
    'Half-Elf': 30,
    Aasimar: 30,
};

/**
 * Applies racial ability bonuses to a set of base scores.
 */
export function applyRacialBonuses(
    baseScores: Record<AbilityKey, number>,
    race: string,
): Record<AbilityKey, number> {
    const bonuses = RACE_ABILITY_BONUSES[race];
    if (!bonuses) return baseScores;

    const result = { ...baseScores };
    for (const [ability, bonus] of Object.entries(bonuses)) {
        result[ability as AbilityKey] = (result[ability as AbilityKey] ?? 0) + (bonus ?? 0);
    }

    return result;
}
