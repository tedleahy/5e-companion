import type { AbilityKey, SkillKey } from '@/lib/characterSheetUtils';

/** Hit die size by class, used to derive starting HP and hit dice. */
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

/** Armour proficiencies granted by each class. */
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

/** Weapon proficiencies granted by each class. */
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

/** Saving throw proficiencies granted by each class. */
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

/** Spellcasting ability by class for classes that cast spells. */
export const CLASS_SPELLCASTING_ABILITY_MAP: Record<string, AbilityKey> = {
    Artificer: 'intelligence',
    Bard: 'charisma',
    Cleric: 'wisdom',
    Druid: 'wisdom',
    Sorcerer: 'charisma',
    Warlock: 'charisma',
    Wizard: 'intelligence',
    Paladin: 'charisma',
};

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
