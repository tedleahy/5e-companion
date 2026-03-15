import type { AbilityKey, SkillKey } from '@/lib/characterSheetUtils';
import { ABILITY_KEYS, abilityModifier, SKILL_DEFINITIONS } from '@/lib/characterSheetUtils';
import type { CreateCharacterInput } from '@/types/generated_graphql_types';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import type { CharacterDraft } from '@/store/characterDraft';

export type OptionItem = {
    value: string;
    label: string;
    icon: string;
    hint?: string;
};

export const RACE_OPTIONS: OptionItem[] = [
    { value: 'Elf', label: 'Elf', icon: '\u{1F9DD}', hint: '+2 DEX, +1 INT' },
    { value: 'Human', label: 'Human', icon: '👨‍🦱', hint: '+1 all stats' },
    { value: 'Dwarf', label: 'Dwarf', icon: '\u{1F385}', hint: '+2 CON' },
    { value: 'Halfling', label: 'Halfling', icon: '\u{1F466}', hint: '+2 DEX' },
    { value: 'Dragonborn', label: 'Dragonborn', icon: '\u{1F409}', hint: '+2 STR, +1 CHA' },
    { value: 'Tiefling', label: 'Tiefling', icon: '\u{1F608}', hint: '+2 CHA, +1 INT' },
    { value: 'Gnome', label: 'Gnome', icon: '\u{1F344}', hint: '+2 INT' },
    { value: 'Half-Orc', label: 'Half-Orc', icon: '🧟‍♂️', hint: '+2 STR, +1 CON' },
    { value: 'Half-Elf', label: 'Half-Elf', icon: '\u2728', hint: '+2 CHA, +1 any two' },
    { value: 'Aasimar', label: 'Aasimar', icon: '\u{1F47C}', hint: '+2 CHA' },
];

export const CLASS_OPTIONS: OptionItem[] = [
    { value: 'Wizard', label: 'Wizard', icon: '\u{1F4D6}', hint: 'Intelligence' },
    { value: 'Fighter', label: 'Fighter', icon: '\u{1F5E1}', hint: 'Strength / Dexterity' },
    { value: 'Rogue', label: 'Rogue', icon: '\u{1F977}', hint: 'Dexterity' },
    { value: 'Cleric', label: 'Cleric', icon: '\u{1F64F}', hint: 'Wisdom' },
    { value: 'Druid', label: 'Druid', icon: '\u{1F33F}', hint: 'Wisdom' },
    { value: 'Bard', label: 'Bard', icon: '\u{1F3AD}', hint: 'Charisma' },
    { value: 'Sorcerer', label: 'Sorcerer', icon: '\u{1F4AB}', hint: 'Charisma' },
    { value: 'Warlock', label: 'Warlock', icon: '\u{1F4A5}', hint: 'Charisma' },
    { value: 'Ranger', label: 'Ranger', icon: '\u{1F3C7}', hint: 'Dexterity' },
    { value: 'Paladin', label: 'Paladin', icon: '\u{1F6E1}', hint: 'Strength' },
    { value: 'Monk', label: 'Monk', icon: '\u{1F30A}', hint: 'Dexterity' },
    { value: 'Barbarian', label: 'Barbarian', icon: '\u{1F4AA}', hint: 'Strength' },
];

export const BACKGROUND_OPTIONS: OptionItem[] = [
    { value: 'Sage', label: 'Sage', icon: '\u{1F4DA}' },
    { value: 'Soldier', label: 'Soldier', icon: '\u{1F5E1}' },
    { value: 'Noble', label: 'Noble', icon: '\u{1F3F0}' },
    { value: 'Outlander', label: 'Outlander', icon: '\u{1F332}' },
    { value: 'Entertainer', label: 'Entertainer', icon: '\u{1F3AD}' },
    { value: 'Acolyte', label: 'Acolyte', icon: '\u{1F64F}' },
];

/**
 * PHB subclass options keyed by class name.
 * Each entry uses the same OptionItem shape for consistency with OptionGrid.
 */
export const SUBCLASS_OPTIONS: Record<string, OptionItem[]> = {
    Barbarian: [
        { value: 'Path of the Berserker', label: 'Berserker', icon: '\u{1F4AA}', hint: 'Frenzy & rage' },
        { value: 'Path of the Totem Warrior', label: 'Totem Warrior', icon: '\u{1F43B}', hint: 'Spirit animals' },
    ],
    Bard: [
        { value: 'College of Lore', label: 'College of Lore', icon: '\u{1F4DA}', hint: 'Extra skills & secrets' },
        { value: 'College of Valor', label: 'College of Valor', icon: '\u{1F5E1}', hint: 'Combat inspiration' },
    ],
    Cleric: [
        { value: 'Knowledge Domain', label: 'Knowledge', icon: '\u{1F4D6}', hint: 'Learning & divination' },
        { value: 'Life Domain', label: 'Life', icon: '\u2764\uFE0F', hint: 'Healing mastery' },
        { value: 'Light Domain', label: 'Light', icon: '\u2728', hint: 'Fire & radiance' },
        { value: 'Nature Domain', label: 'Nature', icon: '\u{1F33F}', hint: 'Druidic blessings' },
        { value: 'Tempest Domain', label: 'Tempest', icon: '\u26A1', hint: 'Thunder & lightning' },
        { value: 'Trickery Domain', label: 'Trickery', icon: '\u{1F3AD}', hint: 'Deception & illusion' },
        { value: 'War Domain', label: 'War', icon: '\u{1F6E1}', hint: 'Martial prowess' },
    ],
    Druid: [
        { value: 'Circle of the Land', label: 'Circle of the Land', icon: '\u{1F30D}', hint: 'Terrain magic' },
        { value: 'Circle of the Moon', label: 'Circle of the Moon', icon: '\u{1F319}', hint: 'Wild Shape mastery' },
    ],
    Fighter: [
        { value: 'Champion', label: 'Champion', icon: '\u{1F3C6}', hint: 'Improved criticals' },
        { value: 'Battle Master', label: 'Battle Master', icon: '\u265F\uFE0F', hint: 'Combat manoeuvres' },
        { value: 'Eldritch Knight', label: 'Eldritch Knight', icon: '\u{1F4D6}', hint: 'Martial magic' },
    ],
    Monk: [
        { value: 'Way of the Open Hand', label: 'Open Hand', icon: '\u270B', hint: 'Unarmed mastery' },
        { value: 'Way of Shadow', label: 'Shadow', icon: '\u{1F311}', hint: 'Stealth & darkness' },
        { value: 'Way of the Four Elements', label: 'Four Elements', icon: '\u{1F525}', hint: 'Elemental disciplines' },
    ],
    Paladin: [
        { value: 'Oath of Devotion', label: 'Devotion', icon: '\u{1F64F}', hint: 'Sacred weapon & aura' },
        { value: 'Oath of the Ancients', label: 'Ancients', icon: '\u{1F33F}', hint: 'Nature & fey' },
        { value: 'Oath of Vengeance', label: 'Vengeance', icon: '\u{1F525}', hint: 'Relentless pursuit' },
    ],
    Ranger: [
        { value: 'Hunter', label: 'Hunter', icon: '\u{1F3AF}', hint: 'Prey slayer' },
        { value: 'Beast Master', label: 'Beast Master', icon: '\u{1F43E}', hint: 'Animal companion' },
    ],
    Rogue: [
        { value: 'Thief', label: 'Thief', icon: '\u{1F4B0}', hint: 'Quick hands & agility' },
        { value: 'Assassin', label: 'Assassin', icon: '\u{1F5E1}', hint: 'Deadly ambush' },
        { value: 'Arcane Trickster', label: 'Arcane Trickster', icon: '\u{1F4D6}', hint: 'Roguish magic' },
    ],
    Sorcerer: [
        { value: 'Draconic Bloodline', label: 'Draconic Bloodline', icon: '\u{1F409}', hint: 'Dragon ancestry' },
        { value: 'Wild Magic', label: 'Wild Magic', icon: '\u{1F300}', hint: 'Chaotic surges' },
    ],
    Warlock: [
        { value: 'The Archfey', label: 'Archfey', icon: '\u{1F9DA}', hint: 'Fey patron' },
        { value: 'The Fiend', label: 'Fiend', icon: '\u{1F525}', hint: 'Infernal patron' },
        { value: 'The Great Old One', label: 'Great Old One', icon: '\u{1F441}', hint: 'Eldritch patron' },
    ],
    Wizard: [
        { value: 'School of Abjuration', label: 'Abjuration', icon: '\u{1F6E1}', hint: 'Protective wards' },
        { value: 'School of Conjuration', label: 'Conjuration', icon: '\u{1F320}', hint: 'Summoning' },
        { value: 'School of Divination', label: 'Divination', icon: '\u{1F52E}', hint: 'Foresight' },
        { value: 'School of Enchantment', label: 'Enchantment', icon: '\u{1F4AB}', hint: 'Mind control' },
        { value: 'School of Evocation', label: 'Evocation', icon: '\u{1F525}', hint: 'Elemental blasts' },
        { value: 'School of Illusion', label: 'Illusion', icon: '\u{1F3AD}', hint: 'Trickery & deceit' },
        { value: 'School of Necromancy', label: 'Necromancy', icon: '\u{1F480}', hint: 'Death magic' },
        { value: 'School of Transmutation', label: 'Transmutation', icon: '\u{1F504}', hint: 'Transformation' },
    ],
};

export const ALIGNMENT_OPTIONS: string[][] = [
    ['Lawful Good', 'Neutral Good', 'Chaotic Good'],
    ['Lawful Neutral', 'True Neutral', 'Chaotic Neutral'],
    ['Lawful Evil', 'Neutral Evil', 'Chaotic Evil'],
];

export const HIT_DIE_MAP: Record<string, number> = {
    Barbarian: 12,
    Fighter: 10,
    Paladin: 10,
    Ranger: 10,
    Bard: 8,
    Cleric: 8,
    Druid: 8,
    Monk: 8,
    Rogue: 8,
    Warlock: 8,
    Sorcerer: 6,
    Wizard: 6,
};

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
 * Armour proficiencies granted by each class.
 */
export const CLASS_ARMOUR_PROFICIENCIES: Record<string, string[]> = {
    Barbarian: ['Light armour', 'Medium armour', 'Shields'],
    Bard: ['Light armour'],
    Cleric: ['Light armour', 'Medium armour', 'Shields'],
    Druid: ['Light armour', 'Medium armour', 'Shields (non-metal)'],
    Fighter: ['All armour', 'Shields'],
    Monk: [],
    Paladin: ['All armour', 'Shields'],
    Ranger: ['Light armour', 'Medium armour', 'Shields'],
    Rogue: ['Light armour'],
    Sorcerer: [],
    Warlock: ['Light armour'],
    Wizard: [],
};

/**
 * Weapon proficiencies granted by each class.
 */
export const CLASS_WEAPON_PROFICIENCIES: Record<string, string[]> = {
    Barbarian: ['Simple weapons', 'Martial weapons'],
    Bard: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    Cleric: ['Simple weapons'],
    Druid: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    Fighter: ['Simple weapons', 'Martial weapons'],
    Monk: ['Simple weapons', 'Shortswords'],
    Paladin: ['Simple weapons', 'Martial weapons'],
    Ranger: ['Simple weapons', 'Martial weapons'],
    Rogue: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    Sorcerer: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    Warlock: ['Simple weapons'],
    Wizard: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
};

/**
 * Background skill proficiencies — auto-selected and locked.
 */
export const BACKGROUND_SKILL_PROFICIENCIES: Record<string, SkillKey[]> = {
    Sage: ['arcana', 'history'],
    Soldier: ['athletics', 'intimidation'],
    Noble: ['history', 'persuasion'],
    Outlander: ['athletics', 'survival'],
    Entertainer: ['acrobatics', 'performance'],
    Acolyte: ['insight', 'religion'],
};

/**
 * Class skill options — the player picks N from this list.
 * `pick` is how many they may choose.
 */
export const CLASS_SKILL_OPTIONS: Record<string, { pick: number; options: SkillKey[] }> = {
    Barbarian: { pick: 2, options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    Bard: { pick: 3, options: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'] },
    Cleric: { pick: 2, options: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    Druid: { pick: 2, options: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
    Fighter: { pick: 2, options: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    Monk: { pick: 2, options: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
    Paladin: { pick: 2, options: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    Ranger: { pick: 3, options: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
    Rogue: { pick: 4, options: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'] },
    Sorcerer: { pick: 2, options: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    Warlock: { pick: 2, options: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    Wizard: { pick: 2, options: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'] },
};

/**
 * Saving throw proficiencies granted by each class.
 */
export const CLASS_SAVING_THROWS: Record<string, AbilityKey[]> = {
    Barbarian: ['strength', 'constitution'],
    Bard: ['dexterity', 'charisma'],
    Cleric: ['wisdom', 'charisma'],
    Druid: ['intelligence', 'wisdom'],
    Fighter: ['strength', 'constitution'],
    Monk: ['strength', 'dexterity'],
    Paladin: ['wisdom', 'charisma'],
    Ranger: ['strength', 'dexterity'],
    Rogue: ['dexterity', 'intelligence'],
    Sorcerer: ['constitution', 'charisma'],
    Warlock: ['wisdom', 'charisma'],
    Wizard: ['intelligence', 'wisdom'],
};

const CLASS_SPELLCASTING_ABILITY_MAP: Record<string, AbilityKey> = {
    Artificer: 'intelligence',
    Bard: 'charisma',
    Cleric: 'wisdom',
    Druid: 'wisdom',
    Sorcerer: 'charisma',
    Warlock: 'charisma',
    Wizard: 'intelligence',
    Paladin: 'charisma',
}

/**
 * Preferred ability score order per class, from highest to lowest priority.
 * Used by the "Suggested for [Class]" button to reorder rolled scores.
 */
export const CLASS_ABILITY_PRIORITY: Record<string, AbilityKey[]> = {
    Barbarian: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    Bard: ['charisma', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'strength'],
    Cleric: ['wisdom', 'constitution', 'strength', 'dexterity', 'charisma', 'intelligence'],
    Druid: ['wisdom', 'constitution', 'dexterity', 'intelligence', 'charisma', 'strength'],
    Fighter: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    Monk: ['dexterity', 'wisdom', 'constitution', 'strength', 'charisma', 'intelligence'],
    Paladin: ['strength', 'charisma', 'constitution', 'wisdom', 'dexterity', 'intelligence'],
    Ranger: ['dexterity', 'wisdom', 'constitution', 'strength', 'intelligence', 'charisma'],
    Rogue: ['dexterity', 'constitution', 'charisma', 'intelligence', 'wisdom', 'strength'],
    Sorcerer: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    Warlock: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    Wizard: ['intelligence', 'constitution', 'dexterity', 'wisdom', 'strength', 'charisma'],
};

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

/** Minimum and maximum ability score in point buy. */
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

/**
 * Returns the total points spent for a set of point-buy ability scores.
 */
export function pointBuySpent(scores: Record<AbilityKey, number>): number {
    return ABILITY_KEYS.reduce((sum, k) => sum + (POINT_BUY_COSTS[scores[k]] ?? 0), 0);
}

/** Levels at which characters gain an Ability Score Increase (+2 points). */
export const ASI_LEVELS = [4, 8, 12, 16, 19] as const;

/**
 * Returns the number of ASI points available at a given level.
 * Each ASI threshold grants +2 points to distribute.
 */
export function asiPointsForLevel(level: number): number {
    return ASI_LEVELS.filter((l) => level >= l).length * 2;
}

export function proficiencyBonusForLevel(level: number): number {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
}

export function roll4d6DropLowest(): number {
    const dice = [1, 2, 3, 4].map(() => Math.ceil(Math.random() * 6));
    return dice.reduce((a, b) => a + b, 0) - Math.min(...dice);
}

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

export function buildCreateCharacterInput(draft: CharacterDraft): CreateCharacterInput {
    const withAsi = ABILITY_KEYS.reduce((acc, key) => {
        acc[key] = draft.abilityScores[key] + (draft.asiAllocations[key] ?? 0);
        return acc;
    }, {} as Record<AbilityKey, number>);
    const finalScores = applyRacialBonuses(withAsi, draft.race);
    const hitDie = HIT_DIE_MAP[draft.class] ?? 8;
    const conMod = abilityModifier(finalScores.constitution);
    const dexMod = abilityModifier(finalScores.dexterity);
    const profBonus = proficiencyBonusForLevel(draft.level);
    const levelOneHp = Math.max(1, hitDie + conMod);
    const perLevelHpGain = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);
    const maxHp = levelOneHp + Math.max(0, draft.level - 1) * perLevelHpGain;

    const bgSkills = BACKGROUND_SKILL_PROFICIENCIES[draft.background] ?? [];
    const allProficientSkills = new Set([...draft.skillProficiencies, ...bgSkills]);
    const expertiseSet = new Set(draft.expertiseSkills);
    const skillProficiencies: Record<string, ProficiencyLevel> = {};
    for (const skill of SKILL_DEFINITIONS) {
        if (expertiseSet.has(skill.key)) {
            skillProficiencies[skill.key] = ProficiencyLevel.Expert;
        } else if (allProficientSkills.has(skill.key)) {
            skillProficiencies[skill.key] = ProficiencyLevel.Proficient;
        } else {
            skillProficiencies[skill.key] = ProficiencyLevel.None;
        }
    }

    const hasTraits =
        draft.personalityTraits || draft.ideals || draft.bonds || draft.flaws;

    const spellcastingAbility = CLASS_SPELLCASTING_ABILITY_MAP[draft.class];
    const spellcastAbilityScore = finalScores[spellcastingAbility]
    const spellAttackBonus = profBonus + abilityModifier(spellcastAbilityScore);
    const spellSaveDC = 8 + spellAttackBonus;

    return {
        name: draft.name.trim(),
        race: draft.race,
        class: draft.class,
        ...(draft.subclass ? { subclass: draft.subclass } : {}),
        level: draft.level,
        alignment: draft.alignment ?? '',
        background: draft.background,
        proficiencyBonus: profBonus,
        ac: 10 + dexMod,
        initiative: dexMod,
        speed: RACE_SPEED_MAP[draft.race] ?? 30,
        abilityScores: finalScores,
        hp: { max: maxHp, current: maxHp, temp: 0 },
        hitDice: { total: draft.level, remaining: draft.level, die: `d${hitDie}` },
        skillProficiencies: skillProficiencies as CreateCharacterInput['skillProficiencies'],
        savingThrowProficiencies: CLASS_SAVING_THROWS[draft.class] ?? [],
        spellcastingAbility,
        spellAttackBonus,
        spellSaveDC,
        ...(hasTraits
            ? {
                  traits: {
                      personality: draft.personalityTraits,
                      ideals: draft.ideals,
                      bonds: draft.bonds,
                      flaws: draft.flaws,
                  },
              }
            : {}),
    };
}
