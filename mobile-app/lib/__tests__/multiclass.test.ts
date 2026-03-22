import {
    formatDraftClassSummary,
    sanitiseCharacterClassRow,
    validateCharacterClassDraft,
} from '@/lib/characterCreation/multiclass';

describe('multiclass helpers', () => {
    it('formats a single-class summary with its subclass label', () => {
        expect(formatDraftClassSummary([
            { classId: 'wizard', subclassId: 'evocation', level: 2 },
        ])).toBe('School of Evocation Wizard');
    });

    it('clears subclass selections when the class level drops below the unlock threshold', () => {
        expect(sanitiseCharacterClassRow({
            classId: 'wizard',
            subclassId: 'evocation',
            level: 1,
        })).toEqual({
            classId: 'wizard',
            subclassId: '',
            level: 1,
        });
    });

    it('requires the allocated class levels to match the chosen total level', () => {
        expect(validateCharacterClassDraft(
            [{ classId: 'fighter', subclassId: '', level: 2 }],
            3,
            0,
        )).toMatchObject({
            isValid: false,
            remainingLevels: 1,
        });
    });
});
