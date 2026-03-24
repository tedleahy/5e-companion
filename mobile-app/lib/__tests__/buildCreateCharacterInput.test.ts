import { buildCreateCharacterInput } from '@/lib/characterCreation/buildCreateCharacterInput';
import { createDefaultDraft } from '@/store/characterDraft';

describe('buildCreateCharacterInput', () => {
    it('maps sorted multiclass rows and the selected starting class id', () => {
        const input = buildCreateCharacterInput({
            ...createDefaultDraft(),
            name: 'Vaelindra',
            race: 'Elf',
            level: 5,
            classes: [
                { classId: 'warlock', subclassId: 'fiend', level: 2 },
                { classId: 'wizard', subclassId: 'evocation', level: 3 },
            ],
            startingClassId: 'warlock',
            background: 'Acolyte',
        });

        expect(input.classes).toEqual([
            { classId: 'wizard', subclassId: 'evocation', level: 3 },
            { classId: 'warlock', subclassId: 'fiend', level: 2 },
        ]);
        expect(input.startingClassId).toBe('warlock');
    });

    it('drops stale subclass ids that are not valid for the class row', () => {
        const input = buildCreateCharacterInput({
            ...createDefaultDraft(),
            name: 'Brom',
            race: 'Human',
            level: 1,
            classes: [{ classId: 'fighter', subclassId: 'evocation', level: 1 }],
            startingClassId: 'fighter',
            background: 'Acolyte',
        });

        expect(input.classes).toEqual([{ classId: 'fighter', level: 1 }]);
    });
});
