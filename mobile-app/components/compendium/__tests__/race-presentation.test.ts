import {
    raceAbilityPills,
    raceLanguageSummary,
    raceMark,
} from '@/components/compendium/race-presentation';
import { parentMark, subraceBonusGlyph } from '@/components/compendium/subrace-presentation';

describe('raceMark', () => {
    it('resolves the icon by srdIndex value, not display label', () => {
        expect(raceMark({ value: 'elf', name: 'Elf', isCustom: false })).toBe('\u{1F9DD}');
        expect(raceMark({ value: 'half-orc', name: 'Half-Orc', isCustom: false })).toBe('🧟‍♂️');
        // A renamed SRD race keeps its emblem.
        expect(raceMark({ value: 'elf', name: 'Eladrin', isCustom: false })).toBe('\u{1F9DD}');
    });

    it('falls back to initials for custom races and unmapped values', () => {
        expect(raceMark({ value: 'river-folk', name: 'River Folk', isCustom: true })).toBe('RF');
        expect(raceMark({ value: 'unmapped-kin', name: 'Unmapped Kin', isCustom: false })).toBe('UK');
    });
});

describe('raceAbilityPills', () => {
    it('collapses a uniform six-way spread for any bonus, matching abilitySummary', () => {
        const spread = (bonus: number) => ['str', 'dex', 'con', 'int', 'wis', 'cha']
            .map((abilityIndex) => ({ abilityIndex, abilityName: abilityIndex, bonus }));

        expect(raceAbilityPills({ abilityBonuses: spread(1) })).toEqual(['All +1']);
        expect(raceAbilityPills({ abilityBonuses: spread(2) })).toEqual(['All +2']);
    });

    it('does not collapse a partial spread', () => {
        const partial = ['str', 'dex', 'con']
            .map((abilityIndex) => ({ abilityIndex, abilityName: abilityIndex, bonus: 1 }));

        expect(raceAbilityPills({ abilityBonuses: partial })).toEqual(['STR +1', 'DEX +1', 'CON +1']);
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
        expect(parentMark('elf')).toBe('\u{1F9DD}');
        expect(parentMark('unmapped')).toBe('✦');
    });

    it('shows a single bonus, a plus for several, and a dash for none', () => {
        expect(subraceBonusGlyph([])).toBe('—');
        expect(subraceBonusGlyph([{ bonus: 1 }])).toBe('+1');
        expect(subraceBonusGlyph([{ bonus: 1 }, { bonus: 2 }])).toBe('+');
    });
});
