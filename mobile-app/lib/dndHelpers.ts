import type { AbilityKey } from '@/lib/characterSheetUtils';
import { abilityModifier, SKILL_DEFINITIONS } from '@/lib/characterSheetUtils';
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
    { value: 'Human', label: 'Human', icon: '\u{1F9D9}', hint: '+1 all stats' },
    { value: 'Dwarf', label: 'Dwarf', icon: '\u26CF', hint: '+2 CON' },
    { value: 'Halfling', label: 'Halfling', icon: '\u{1F33F}', hint: '+2 DEX' },
    { value: 'Dragonborn', label: 'Dragonborn', icon: '\u{1F409}', hint: '+2 STR, +1 CHA' },
    { value: 'Tiefling', label: 'Tiefling', icon: '\u{1F311}', hint: '+2 CHA, +1 INT' },
    { value: 'Gnome', label: 'Gnome', icon: '\u{1F344}', hint: '+2 INT' },
    { value: 'Half-Orc', label: 'Half-Orc', icon: '\u{1F313}', hint: '+2 STR, +1 CON' },
    { value: 'Half-Elf', label: 'Half-Elf', icon: '\u2728', hint: '+2 CHA, +1 any two' },
    { value: 'Aasimar', label: 'Aasimar', icon: '\u{1F31F}', hint: '+2 CHA' },
];

export const CLASS_OPTIONS: OptionItem[] = [
    { value: 'Wizard', label: 'Wizard', icon: '\u{1F4D6}', hint: 'Intelligence' },
    { value: 'Fighter', label: 'Fighter', icon: '\u2694', hint: 'Strength / DEX' },
    { value: 'Rogue', label: 'Rogue', icon: '\u{1F5E1}', hint: 'Dexterity' },
    { value: 'Cleric', label: 'Cleric', icon: '\u{1F64F}', hint: 'Wisdom' },
    { value: 'Druid', label: 'Druid', icon: '\u{1F33F}', hint: 'Wisdom' },
    { value: 'Bard', label: 'Bard', icon: '\u{1F3B5}', hint: 'Charisma' },
    { value: 'Sorcerer', label: 'Sorcerer', icon: '\u{1F4AB}', hint: 'Charisma' },
    { value: 'Warlock', label: 'Warlock', icon: '\u{1F311}', hint: 'Charisma' },
    { value: 'Ranger', label: 'Ranger', icon: '\u26A1', hint: 'Dexterity' },
    { value: 'Paladin', label: 'Paladin', icon: '\u{1F6E1}', hint: 'Strength' },
    { value: 'Monk', label: 'Monk', icon: '\u{1F30A}', hint: 'Dexterity' },
    { value: 'Barbarian', label: 'Barbarian', icon: '\u{1F525}', hint: 'Strength' },
];

export const BACKGROUND_OPTIONS: OptionItem[] = [
    { value: 'Sage', label: 'Sage', icon: '\u{1F4DA}' },
    { value: 'Soldier', label: 'Soldier', icon: '\u2694' },
    { value: 'Noble', label: 'Noble', icon: '\u{1F3F0}' },
    { value: 'Outlander', label: 'Outlander', icon: '\u{1F332}' },
    { value: 'Entertainer', label: 'Entertainer', icon: '\u{1F3AD}' },
    { value: 'Acolyte', label: 'Acolyte', icon: '\u{1F531}' },
];

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
    const hitDie = HIT_DIE_MAP[draft.class] ?? 8;
    const conMod = abilityModifier(draft.abilityScores.constitution);
    const dexMod = abilityModifier(draft.abilityScores.dexterity);
    const profBonus = proficiencyBonusForLevel(draft.level);
    const levelOneHp = Math.max(1, hitDie + conMod);
    const perLevelHpGain = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);
    const maxHp = levelOneHp + Math.max(0, draft.level - 1) * perLevelHpGain;

    const skillProficiencies: Record<string, ProficiencyLevel> = {};
    for (const skill of SKILL_DEFINITIONS) {
        skillProficiencies[skill.key] = draft.skillProficiencies.includes(skill.key)
            ? ProficiencyLevel.Proficient
            : ProficiencyLevel.None;
    }

    const hasTraits =
        draft.personalityTraits || draft.ideals || draft.bonds || draft.flaws;

    return {
        name: draft.name.trim(),
        race: draft.race,
        class: draft.class,
        level: draft.level,
        alignment: draft.alignment ?? '',
        background: draft.background,
        proficiencyBonus: profBonus,
        ac: 10 + dexMod,
        initiative: dexMod,
        speed: RACE_SPEED_MAP[draft.race] ?? 30,
        abilityScores: draft.abilityScores,
        hp: { max: maxHp, current: maxHp, temp: 0 },
        hitDice: { total: draft.level, remaining: draft.level, die: `d${hitDie}` },
        skillProficiencies: skillProficiencies as CreateCharacterInput['skillProficiencies'],
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
