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
];

/** SRD class options shown in the character creation wizard. */
export const CLASS_OPTIONS: OptionItem[] = [
    { value: 'wizard', label: 'Wizard', icon: '\u{1F4D6}', hint: 'Intelligence' },
    { value: 'fighter', label: 'Fighter', icon: '\u{1F5E1}', hint: 'Strength / Dexterity' },
    { value: 'rogue', label: 'Rogue', icon: '\u{1F977}', hint: 'Dexterity' },
    { value: 'cleric', label: 'Cleric', icon: '\u{1F64F}', hint: 'Wisdom' },
    { value: 'druid', label: 'Druid', icon: '\u{1F33F}', hint: 'Wisdom' },
    { value: 'bard', label: 'Bard', icon: '\u{1F3AD}', hint: 'Charisma' },
    { value: 'sorcerer', label: 'Sorcerer', icon: '\u{1F4AB}', hint: 'Charisma' },
    { value: 'warlock', label: 'Warlock', icon: '\u{1F4A5}', hint: 'Charisma' },
    { value: 'ranger', label: 'Ranger', icon: '\u{1F3C7}', hint: 'Dexterity' },
    { value: 'paladin', label: 'Paladin', icon: '\u{1F6E1}', hint: 'Strength' },
    { value: 'monk', label: 'Monk', icon: '\u{1F30A}', hint: 'Dexterity' },
    { value: 'barbarian', label: 'Barbarian', icon: '\u{1F4AA}', hint: 'Strength' },
];

/** Background options supported by the current SRD-backed seed data. */
export const BACKGROUND_OPTIONS: OptionItem[] = [
    { value: 'Acolyte', label: 'Acolyte', icon: '\u{1F64F}' },
];

/**
 * SRD subclass options keyed by class SRD index.
 * Each entry uses the same OptionItem shape for consistency with OptionGrid.
 */
export const SUBCLASS_OPTIONS: Record<string, OptionItem[]> = {
    barbarian: [
        { value: 'berserker', label: 'Berserker', icon: '\u{1F4AA}', hint: 'Frenzy & rage' },
    ],
    bard: [
        { value: 'lore', label: 'Lore', icon: '\u{1F4DA}', hint: 'Extra skills & secrets' },
    ],
    cleric: [
        { value: 'life', label: 'Life Domain', icon: '\u2764\uFE0F', hint: 'Healing mastery' },
    ],
    druid: [
        { value: 'land', label: 'Circle of the Land', icon: '\u{1F30D}', hint: 'Terrain magic' },
    ],
    fighter: [
        { value: 'champion', label: 'Champion', icon: '\u{1F3C6}', hint: 'Improved criticals' },
    ],
    monk: [
        { value: 'open-hand', label: 'Way of the Open Hand', icon: '\u270B', hint: 'Unarmed mastery' },
    ],
    paladin: [
        { value: 'devotion', label: 'Oath of Devotion', icon: '\u{1F64F}', hint: 'Sacred weapon & aura' },
    ],
    ranger: [
        { value: 'hunter', label: 'Hunter', icon: '\u{1F3AF}', hint: 'Prey slayer' },
    ],
    rogue: [
        { value: 'thief', label: 'Thief', icon: '\u{1F4B0}', hint: 'Quick hands & agility' },
    ],
    sorcerer: [
        { value: 'draconic', label: 'Draconic Bloodline', icon: '\u{1F409}', hint: 'Dragon ancestry' },
    ],
    warlock: [
        { value: 'fiend', label: 'Fiend', icon: '\u{1F525}', hint: 'Infernal patron' },
    ],
    wizard: [
        { value: 'evocation', label: 'School of Evocation', icon: '\u{1F525}', hint: 'Elemental blasts' },
    ],
};

/** Alignment options shown as a nine-box grid during character creation. */
export const ALIGNMENT_OPTIONS: string[][] = [
    ['Lawful Good', 'Neutral Good', 'Chaotic Good'],
    ['Lawful Neutral', 'True Neutral', 'Chaotic Neutral'],
    ['Lawful Evil', 'Neutral Evil', 'Chaotic Evil'],
];
