import {
    raceAbilityPills,
    raceLanguageSummary,
    raceMark,
} from '@/components/compendium/race-presentation';
import { parentMark, subraceBonusGlyph } from '@/components/compendium/subrace-presentation';

describe('raceMark', () => {
    it('uses the seeded race icon for SRD races, matched case-insensitively', () => {
        expect(raceMark({ name: 'Elf', isCustom: false })).toBe('\u{1F9DD}');
        expect(raceMark({ name: 'half-orc', isCustom: false })).toBe('🧟‍♂️');
    });

    it('falls back to initials for custom races and unknown names', () => {
        expect(raceMark({ name: 'River Folk', isCustom: true })).toBe('RF');
        expect(raceMark({ name: 'Unmapped Kin', isCustom: false })).toBe('UK');
    });
});

describe('raceAbilityPills', () => {
    it('collapses a six-way +1 spread into a single pill', () => {
        const bonuses = ['str', 'dex', 'con', 'int', 'wis', 'cha']
            .map((abilityIndex) => ({ abilityIndex, abilityName: abilityIndex, bonus: 1 }));

        expect(raceAbilityPills({ abilityBonuses: bonuses })).toEqual(['All +1']);
    });

    it('lists each bonus otherwise', () => {
        expect(raceAbilityPills({
            abilityBonuses: [
                { abilityIndex: 'str', abilityName: 'Strength', bonus: 2 },
                { abilityIndex: 'con', abilityName: 'Constitution', bonus: 1 },
            ],
        })).toEqual(['STR +2', 'CON +1']);
        expect(raceAbilityPills({ abilityBonuses: [] })).toEqual([]);
    });
});

describe('raceLanguageSummary', () => {
    it('reports fixed languages, and appends choices when a race grants them', () => {
        const languages = [{ value: 'common', name: 'Common' }];

        expect(raceLanguageSummary({ languages, languageChoiceCount: 0 }))
            .toBe('1 fixed language');
        expect(raceLanguageSummary({ languages, languageChoiceCount: 1 }))
            .toBe('1 fixed language + 1 choice');
        expect(raceLanguageSummary({ languages: [], languageChoiceCount: 2 }))
            .toBe('0 fixed languages + 2 choices');
    });
});

describe('subrace marks', () => {
    it('reuses the parent race icon, falling back to a sigil', () => {
        expect(parentMark('Elf')).toBe('\u{1F9DD}');
        expect(parentMark('Unmapped')).toBe('✦');
    });

    it('shows a single bonus, a plus for several, and a dash for none', () => {
        expect(subraceBonusGlyph([])).toBe('—');
        expect(subraceBonusGlyph([{ bonus: 1 }])).toBe('+1');
        expect(subraceBonusGlyph([{ bonus: 1 }, { bonus: 2 }])).toBe('+');
    });
});
