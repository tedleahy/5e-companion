import { getCreateFeatureChoiceGroups } from '@/lib/srdFeatureChoices';

describe('srdFeatureChoices', () => {
    it('resolves warlock Eldritch Invocation choices during character creation', () => {
        const groups = getCreateFeatureChoiceGroups([
            { classId: 'warlock', subclassId: 'fiend', level: 2 },
        ]);

        const invocationGroup = groups.find((group) => group.parentSrdIndex === 'eldritch-invocations');

        expect(invocationGroup).toBeDefined();
        expect(invocationGroup?.chooseCount).toBe(2);
        expect(invocationGroup?.options).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    childSrdIndex: 'eldritch-invocation-armor-of-shadows',
                    name: 'Eldritch Invocation: Armor of Shadows',
                }),
                expect.objectContaining({
                    childSrdIndex: 'eldritch-invocation-beast-speech',
                    name: 'Eldritch Invocation: Beast Speech',
                }),
            ]),
        );
    });

    it('resolves two initial sorcerer Metamagic choices during character creation', () => {
        const groups = getCreateFeatureChoiceGroups([
            { classId: 'sorcerer', subclassId: 'draconic', level: 3 },
        ]);

        const metamagicGroup = groups.find((group) => group.parentSrdIndex === 'metamagic-1');

        expect(metamagicGroup).toBeDefined();
        expect(metamagicGroup?.chooseCount).toBe(2);
        expect(metamagicGroup?.options).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    childSrdIndex: 'metamagic-careful-spell',
                    name: 'Metamagic: Careful Spell',
                }),
            ]),
        );
    });
});
