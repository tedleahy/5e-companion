import type { ProficiencyLevel, SkillProficiencies } from '@/types/generated_graphql_types';

/** The six ability keys in standard D&D display order. */
export const ABILITY_KEYS = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
] as const;

export type AbilityKey = (typeof ABILITY_KEYS)[number];

export type SkillKey = Exclude<keyof SkillProficiencies, '__typename'>;

export type SkillDefinition = {
    key: SkillKey;
    label: string;
    ability: AbilityKey;
};

/** Maps each ability to its standard 3-letter abbreviation. */
export const ABILITY_ABBREVIATIONS: Record<AbilityKey, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
};

/**
 * Calculates the D&D 5e ability modifier from a raw score.
 *
 * The formula is `floor((score - 10) / 2)`. For example:
 * - Score 10 → +0
 * - Score 20 → +5
 * - Score 8  → −1
 */
export function abilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Formats a number with an explicit sign prefix.
 * Positive numbers get "+", negative numbers already have "−" (unicode minus).
 */
export function formatSignedNumber(n: number): string {
    if (n >= 0) return `+${n}`;
    return `\u2212${Math.abs(n)}`;
}

/**
 * Calculates a saving throw modifier.
 *
 * Saving throw mod = ability modifier + (proficient ? proficiency bonus : 0)
 */
export function savingThrowModifier(
    abilityScore: number,
    proficient: boolean,
    proficiencyBonus: number,
): number {
    return abilityModifier(abilityScore) + (proficient ? proficiencyBonus : 0);
}

/**
 * Calculates a skill modifier.
 *
 * Skill mod = ability modifier
 *   + (proficient or expert ? proficiency bonus : 0)
 *   + (expert ? proficiency bonus again : 0)
 *
 * In 5e, expertise means you add your proficiency bonus twice.
 */
export function skillModifier(
    abilityScore: number,
    proficiency: ProficiencyLevel,
    proficiencyBonus: number,
): number {
    const mod = abilityModifier(abilityScore);
    if (proficiency === 'expert') return mod + proficiencyBonus * 2;
    if (proficiency === 'proficient') return mod + proficiencyBonus;
    return mod;
}

/**
 * Clamps HP percentage to 0–100 range for progress bar display.
 */
export function hpPercentage(current: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
}

/**
 * Skill definitions: name, display label, and governing ability.
 * Sorted alphabetically by label (standard 5e order).
 */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
    { key: 'acrobatics', label: 'Acrobatics', ability: 'dexterity' },
    { key: 'animalHandling', label: 'Animal Handling', ability: 'wisdom' },
    { key: 'arcana', label: 'Arcana', ability: 'intelligence' },
    { key: 'athletics', label: 'Athletics', ability: 'strength' },
    { key: 'deception', label: 'Deception', ability: 'charisma' },
    { key: 'history', label: 'History', ability: 'intelligence' },
    { key: 'insight', label: 'Insight', ability: 'wisdom' },
    { key: 'intimidation', label: 'Intimidation', ability: 'charisma' },
    { key: 'investigation', label: 'Investigation', ability: 'intelligence' },
    { key: 'medicine', label: 'Medicine', ability: 'wisdom' },
    { key: 'nature', label: 'Nature', ability: 'intelligence' },
    { key: 'perception', label: 'Perception', ability: 'wisdom' },
    { key: 'performance', label: 'Performance', ability: 'charisma' },
    { key: 'persuasion', label: 'Persuasion', ability: 'charisma' },
    { key: 'religion', label: 'Religion', ability: 'intelligence' },
    { key: 'sleightOfHand', label: 'Sleight of Hand', ability: 'dexterity' },
    { key: 'stealth', label: 'Stealth', ability: 'dexterity' },
    { key: 'survival', label: 'Survival', ability: 'wisdom' },
];

export const SKILLS_BY_ABILITY: Record<AbilityKey, SkillDefinition[]> = ABILITY_KEYS.reduce(
    (acc, ability) => {
        acc[ability] = SKILL_DEFINITIONS.filter((skill) => skill.ability === ability);
        return acc;
    },
    {} as Record<AbilityKey, SkillDefinition[]>,
);

export function isAbilityKey(value: string): value is AbilityKey {
    return ABILITY_KEYS.includes(value as AbilityKey);
}
