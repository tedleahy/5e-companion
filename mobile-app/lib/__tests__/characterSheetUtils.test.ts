import {
    abilityModifier,
    formatSignedNumber,
    savingThrowModifier,
    skillModifier,
    hpPercentage,
} from '../characterSheetUtils';
import { ProficiencyLevel } from '@/types/generated_graphql_types';

describe('abilityModifier', () => {
    it('returns 0 for score 10', () => {
        expect(abilityModifier(10)).toBe(0);
    });

    it('returns 0 for score 11', () => {
        expect(abilityModifier(11)).toBe(0);
    });

    it('returns +5 for score 20', () => {
        expect(abilityModifier(20)).toBe(5);
    });

    it('returns -1 for score 8', () => {
        expect(abilityModifier(8)).toBe(-1);
    });

    it('returns -5 for score 1', () => {
        expect(abilityModifier(1)).toBe(-5);
    });

    it('returns +3 for score 16', () => {
        expect(abilityModifier(16)).toBe(3);
    });

    it('returns +2 for score 14', () => {
        expect(abilityModifier(14)).toBe(2);
    });

    it('returns +1 for score 13', () => {
        expect(abilityModifier(13)).toBe(1);
    });
});

describe('formatSignedNumber', () => {
    it('formats positive numbers with +', () => {
        expect(formatSignedNumber(3)).toBe('+3');
    });

    it('formats zero with +', () => {
        expect(formatSignedNumber(0)).toBe('+0');
    });

    it('formats negative numbers with unicode minus', () => {
        expect(formatSignedNumber(-1)).toBe('\u22121');
    });

    it('formats large negative numbers', () => {
        expect(formatSignedNumber(-5)).toBe('\u22125');
    });
});

describe('savingThrowModifier', () => {
    it('returns ability mod when not proficient', () => {
        expect(savingThrowModifier(14, false, 4)).toBe(2);
    });

    it('adds proficiency bonus when proficient', () => {
        expect(savingThrowModifier(14, true, 4)).toBe(6);
    });

    it('works with negative ability modifier', () => {
        expect(savingThrowModifier(8, false, 4)).toBe(-1);
    });

    it('adds proficiency to negative modifier', () => {
        expect(savingThrowModifier(8, true, 4)).toBe(3);
    });
});

describe('skillModifier', () => {
    it('returns ability mod for none proficiency', () => {
        expect(skillModifier(14, ProficiencyLevel.None, 4)).toBe(2);
    });

    it('adds proficiency bonus once for proficient', () => {
        expect(skillModifier(14, ProficiencyLevel.Proficient, 4)).toBe(6);
    });

    it('adds proficiency bonus twice for expert', () => {
        expect(skillModifier(14, ProficiencyLevel.Expert, 4)).toBe(10);
    });

    it('works with score 20 and expertise', () => {
        expect(skillModifier(20, ProficiencyLevel.Expert, 4)).toBe(13);
    });
});

describe('hpPercentage', () => {
    it('returns 100 when at full HP', () => {
        expect(hpPercentage(76, 76)).toBe(100);
    });

    it('returns 0 when at 0 HP', () => {
        expect(hpPercentage(0, 76)).toBe(0);
    });

    it('returns approximate percentage', () => {
        expect(hpPercentage(38, 76)).toBe(50);
    });

    it('clamps to 0 for negative current', () => {
        expect(hpPercentage(-5, 76)).toBe(0);
    });

    it('clamps to 100 for current > max', () => {
        expect(hpPercentage(100, 76)).toBe(100);
    });

    it('returns 0 when max is 0', () => {
        expect(hpPercentage(10, 0)).toBe(0);
    });
});
