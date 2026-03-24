import type { AbilityKey, SkillKey } from '@/lib/characterSheetUtils';

/** Hit die size by class, used to derive starting HP and hit dice. */
export const HIT_DIE_MAP: Record<string, number> = {
    barbarian: 12,
    fighter: 10,
    paladin: 10,
    ranger: 10,
    bard: 8,
    cleric: 8,
    druid: 8,
    monk: 8,
    rogue: 8,
    warlock: 8,
    sorcerer: 6,
    wizard: 6,
};

/** Armour proficiencies granted by each class. */
export const CLASS_ARMOUR_PROFICIENCIES: Record<string, string[]> = {
    barbarian: ['Light armour', 'Medium armour', 'Shields'],
    bard: ['Light armour'],
    cleric: ['Light armour', 'Medium armour', 'Shields'],
    druid: ['Light armour', 'Medium armour', 'Shields (non-metal)'],
    fighter: ['All armour', 'Shields'],
    monk: [],
    paladin: ['All armour', 'Shields'],
    ranger: ['Light armour', 'Medium armour', 'Shields'],
    rogue: ['Light armour'],
    sorcerer: [],
    warlock: ['Light armour'],
    wizard: [],
};

/** Weapon proficiencies granted by each class. */
export const CLASS_WEAPON_PROFICIENCIES: Record<string, string[]> = {
    barbarian: ['Simple weapons', 'Martial weapons'],
    bard: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    cleric: ['Simple weapons'],
    druid: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    fighter: ['Simple weapons', 'Martial weapons'],
    monk: ['Simple weapons', 'Shortswords'],
    paladin: ['Simple weapons', 'Martial weapons'],
    ranger: ['Simple weapons', 'Martial weapons'],
    rogue: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    sorcerer: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    warlock: ['Simple weapons'],
    wizard: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
};

/** Background skill proficiencies that are auto-selected and locked. */
export const BACKGROUND_SKILL_PROFICIENCIES: Record<string, SkillKey[]> = {
    Sage: ['arcana', 'history'],
    Soldier: ['athletics', 'intimidation'],
    Noble: ['history', 'persuasion'],
    Outlander: ['athletics', 'survival'],
    Entertainer: ['acrobatics', 'performance'],
    Acolyte: ['insight', 'religion'],
};

/**
 * Class skill options available during character creation.
 * `pick` is how many the player may choose from `options`.
 */
export const CLASS_SKILL_OPTIONS: Record<string, { pick: number; options: SkillKey[] }> = {
    barbarian: { pick: 2, options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    bard: { pick: 3, options: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'] },
    cleric: { pick: 2, options: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    druid: { pick: 2, options: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
    fighter: { pick: 2, options: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    monk: { pick: 2, options: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
    paladin: { pick: 2, options: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    ranger: { pick: 3, options: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
    rogue: { pick: 4, options: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'] },
    sorcerer: { pick: 2, options: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    warlock: { pick: 2, options: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    wizard: { pick: 2, options: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'] },
};

/** Saving throw proficiencies granted by each class. */
export const CLASS_SAVING_THROWS: Record<string, AbilityKey[]> = {
    barbarian: ['strength', 'constitution'],
    bard: ['dexterity', 'charisma'],
    cleric: ['wisdom', 'charisma'],
    druid: ['intelligence', 'wisdom'],
    fighter: ['strength', 'constitution'],
    monk: ['strength', 'dexterity'],
    paladin: ['wisdom', 'charisma'],
    ranger: ['strength', 'dexterity'],
    rogue: ['dexterity', 'intelligence'],
    sorcerer: ['constitution', 'charisma'],
    warlock: ['wisdom', 'charisma'],
    wizard: ['intelligence', 'wisdom'],
};

/** Spellcasting ability by class for classes that cast spells. */
export const CLASS_SPELLCASTING_ABILITY_MAP: Record<string, AbilityKey> = {
    bard: 'charisma',
    cleric: 'wisdom',
    druid: 'wisdom',
    sorcerer: 'charisma',
    warlock: 'charisma',
    wizard: 'intelligence',
    paladin: 'charisma',
};

/**
 * Preferred ability score order per class, from highest to lowest priority.
 * Used by the "Suggested for [Class]" button to reorder rolled scores.
 */
export const CLASS_ABILITY_PRIORITY: Record<string, AbilityKey[]> = {
    barbarian: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    bard: ['charisma', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'strength'],
    cleric: ['wisdom', 'constitution', 'strength', 'dexterity', 'charisma', 'intelligence'],
    druid: ['wisdom', 'constitution', 'dexterity', 'intelligence', 'charisma', 'strength'],
    fighter: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    monk: ['dexterity', 'wisdom', 'constitution', 'strength', 'charisma', 'intelligence'],
    paladin: ['strength', 'charisma', 'constitution', 'wisdom', 'dexterity', 'intelligence'],
    ranger: ['dexterity', 'wisdom', 'constitution', 'strength', 'intelligence', 'charisma'],
    rogue: ['dexterity', 'constitution', 'charisma', 'intelligence', 'wisdom', 'strength'],
    sorcerer: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    warlock: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    wizard: ['intelligence', 'constitution', 'dexterity', 'wisdom', 'strength', 'charisma'],
};

/** Subclass unlock levels keyed by class SRD index. */
export const SUBCLASS_UNLOCK_LEVEL_BY_CLASS: Record<string, number> = {
    barbarian: 3,
    bard: 3,
    cleric: 1,
    druid: 2,
    fighter: 3,
    monk: 3,
    paladin: 3,
    ranger: 3,
    rogue: 3,
    sorcerer: 1,
    warlock: 1,
    wizard: 2,
};
