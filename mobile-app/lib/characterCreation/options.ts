export type OptionItem = {
    value: string;
    label: string;
    icon: string;
    hint?: string;
};

/** Race options shown in the character creation wizard. */
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

/** Class options shown in the character creation wizard. */
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

/** Background options shown in the character creation wizard. */
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

/** Alignment options shown as a nine-box grid during character creation. */
export const ALIGNMENT_OPTIONS: string[][] = [
    ['Lawful Good', 'Neutral Good', 'Chaotic Good'],
    ['Lawful Neutral', 'True Neutral', 'Chaotic Neutral'],
    ['Lawful Evil', 'Neutral Evil', 'Chaotic Evil'],
];
