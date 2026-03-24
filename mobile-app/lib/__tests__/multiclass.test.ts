import {
    formatDraftClassSummary,
    normaliseStartingClassId,
    sanitiseCharacterClassRow,
    sortClassRowsForDisplay,
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
            'fighter',
        )).toMatchObject({
            isValid: false,
            remainingLevels: 1,
        });
    });

    it('requires a subclass once a class reaches its unlock level', () => {
        expect(validateCharacterClassDraft(
            [{ classId: 'wizard', subclassId: '', level: 2 }],
            2,
            'wizard',
        )).toMatchObject({
            isValid: false,
            errors: ['Choose a subclass for Wizard.'],
        });
    });

    it('sorts classes by level, then starting class, then class name', () => {
        expect(sortClassRowsForDisplay([
            { classId: 'wizard', subclassId: '', level: 2 },
            { classId: 'fighter', subclassId: '', level: 3 },
            { classId: 'cleric', subclassId: '', level: 3 },
        ], 'fighter').map((classRow) => classRow.classId)).toEqual([
            'fighter',
            'cleric',
            'wizard',
        ]);
    });

    it('falls back to the first displayed class when the starting class is removed', () => {
        expect(normaliseStartingClassId([
            { classId: 'wizard', subclassId: '', level: 2 },
            { classId: 'fighter', subclassId: '', level: 3 },
        ], '')).toBe('fighter');
    });

    it('ignores empty class rows when choosing a fallback starting class', () => {
        expect(normaliseStartingClassId([
            { classId: '', subclassId: '', level: 1 },
            { classId: 'wizard', subclassId: '', level: 2 },
            { classId: 'fighter', subclassId: '', level: 3 },
        ], '')).toBe('fighter');
    });
});
