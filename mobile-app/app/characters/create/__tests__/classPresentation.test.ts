import {
    createClassPresentation,
    formatPresentedClassRowLabel,
    presentationClassLabel,
    presentationSavingThrows,
    pruneClassPresentation,
    withClassPresentation,
} from '@/lib/characterCreation/multiclass';

describe('create-class presentation metadata', () => {
    const customClass = {
        value: 'custom-rune-knight',
        name: 'Rune Knight',
        savingThrowIndexes: ['str', 'con'],
    };

    test('stores and resolves custom class labels and saving throws from presentation', () => {
        const presentationById = withClassPresentation({}, customClass.value, [customClass]);

        expect(presentationById[customClass.value]).toEqual(createClassPresentation(customClass));
        expect(presentationClassLabel(customClass.value, presentationById)).toBe('Rune Knight');
        expect(presentationSavingThrows(customClass.value, presentationById)).toEqual([
            'strength',
            'constitution',
        ]);
        expect(formatPresentedClassRowLabel(
            { classId: customClass.value, subclassId: '', level: 1 },
            presentationById,
        )).toBe('Rune Knight');
    });

    test('falls back to SRD maps only when presentation is absent', () => {
        expect(presentationClassLabel('wizard', {})).toBe('Wizard');
        expect(presentationSavingThrows('wizard', {})).toEqual(['intelligence', 'wisdom']);
        expect(presentationClassLabel('custom-missing', {})).toBe('Unknown class');
        expect(presentationSavingThrows('custom-missing', {})).toEqual([]);
    });

    test('prunes presentation entries when classes are removed', () => {
        const previous = withClassPresentation(
            withClassPresentation({}, 'wizard', [{
                value: 'wizard',
                name: 'Wizard',
                savingThrowIndexes: ['int', 'wis'],
            }]),
            customClass.value,
            [customClass],
        );

        expect(pruneClassPresentation(previous, [customClass.value])).toEqual({
            [customClass.value]: createClassPresentation(customClass),
        });
    });
});
