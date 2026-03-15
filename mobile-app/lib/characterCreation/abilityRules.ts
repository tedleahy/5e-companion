import type { AbilityKey } from '@/lib/characterSheetUtils';
import { ABILITY_KEYS } from '@/lib/characterSheetUtils';
import { CLASS_ABILITY_PRIORITY } from '@/lib/characterCreation/classRules';

/**
 * Standard 5e point buy cost table.
 * 27 total points; all scores start at 8; max 15 before racial bonuses.
 */
export const POINT_BUY_COSTS: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
};

/** Total points available for standard point buy. */
export const POINT_BUY_TOTAL = 27;

/** Minimum ability score available in point buy. */
export const POINT_BUY_MIN = 8;

/** Maximum ability score available in point buy before racial bonuses. */
export const POINT_BUY_MAX = 15;

/** Levels at which characters gain an Ability Score Increase. */
export const ASI_LEVELS = [4, 8, 12, 16, 19] as const;

/**
 * Returns the total points spent for a set of point-buy ability scores.
 */
export function pointBuySpent(scores: Record<AbilityKey, number>): number {
    return ABILITY_KEYS.reduce((sum, key) => sum + (POINT_BUY_COSTS[scores[key]] ?? 0), 0);
}

/**
 * Returns the number of ASI points available at a given level.
 * Each ASI threshold grants +2 points to distribute.
 */
export function asiPointsForLevel(level: number): number {
    return ASI_LEVELS.filter((threshold) => level >= threshold).length * 2;
}

/**
 * Returns the D&D 5e proficiency bonus for a character level.
 */
export function proficiencyBonusForLevel(level: number): number {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
}

/**
 * Rolls 4d6 and drops the lowest die.
 */
export function roll4d6DropLowest(): number {
    const dice = [1, 2, 3, 4].map(() => Math.ceil(Math.random() * 6));
    return dice.reduce((total, roll) => total + roll, 0) - Math.min(...dice);
}

/**
 * Rolls all six ability scores using the 4d6-drop-lowest method.
 */
export function rollAllAbilityScores(): Record<AbilityKey, number> {
    return {
        strength: roll4d6DropLowest(),
        dexterity: roll4d6DropLowest(),
        constitution: roll4d6DropLowest(),
        intelligence: roll4d6DropLowest(),
        wisdom: roll4d6DropLowest(),
        charisma: roll4d6DropLowest(),
    };
}

/**
 * Reorders the given ability scores by assigning the highest values to the
 * highest-priority abilities for the given class.
 */
export function suggestAbilityScores(
    currentScores: Record<AbilityKey, number>,
    className: string,
): Record<AbilityKey, number> {
    const priority = CLASS_ABILITY_PRIORITY[className];
    if (!priority) return currentScores;

    const sortedValues = Object.values(currentScores).sort((a, b) => b - a);
    const result = {} as Record<AbilityKey, number>;

    priority.forEach((ability, index) => {
        result[ability] = sortedValues[index];
    });

    return result;
}
