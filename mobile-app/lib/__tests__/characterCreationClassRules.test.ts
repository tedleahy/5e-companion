import {
    configuredStartingClassSkillOptions,
    configuredStartingProficiencyChoiceGroups,
    labelsForProficiencyChoices,
    splitProficiencyRules,
} from '../characterCreation/classRules';

describe('configuredStartingClassSkillOptions', () => {
    it('maps configured starting skill choice groups to character skill keys', () => {
        const classDefinition = {
            value: 'ranger',
            proficiencies: [
                { grant: 'STARTING', type: 'SKILL', name: 'Animal Handling', value: 'skill-animal-handling', choiceGroup: 1, choiceCount: 2 },
                { grant: 'STARTING', type: 'SKILL', name: 'Athletics', value: 'skill-athletics', choiceGroup: 1, choiceCount: 2 },
                { grant: 'STARTING', type: 'ARMOR', name: 'Light armour', value: 'light-armor', choiceGroup: null, choiceCount: null },
            ],
        } as never;

        expect(configuredStartingClassSkillOptions(classDefinition)).toEqual([{
            classId: 'ranger',
            choiceGroup: 1,
            pick: 2,
            options: ['animalHandling', 'athletics'],
        }]);
    });

    it('keeps independent skill choice groups separate', () => {
        const classDefinition = {
            value: 'custom-class',
            proficiencies: [
                { grant: 'STARTING', type: 'SKILL', name: 'Arcana', value: 'skill-arcana', choiceGroup: 1, choiceCount: 1 },
                { grant: 'STARTING', type: 'SKILL', name: 'History', value: 'skill-history', choiceGroup: 1, choiceCount: 1 },
                { grant: 'STARTING', type: 'SKILL', name: 'Athletics', value: 'skill-athletics', choiceGroup: 2, choiceCount: 1 },
                { grant: 'STARTING', type: 'SKILL', name: 'Survival', value: 'skill-survival', choiceGroup: 2, choiceCount: 1 },
            ],
        } as never;

        expect(configuredStartingClassSkillOptions(classDefinition)).toEqual([
            { classId: 'custom-class', choiceGroup: 1, pick: 1, options: ['arcana', 'history'] },
            { classId: 'custom-class', choiceGroup: 2, pick: 1, options: ['athletics', 'survival'] },
        ]);
    });

    it('returns null when the class has no configured starting skill choices', () => {
        expect(configuredStartingClassSkillOptions({ value: 'wizard', proficiencies: [] } as never)).toBeNull();
    });
});

describe('configuredStartingProficiencyChoiceGroups', () => {
    it('returns non-skill STARTING choice groups with option values', () => {
        const classDefinition = {
            value: 'bard',
            proficiencies: [
                { grant: 'STARTING', type: 'SKILL', name: 'Arcana', value: 'skill-arcana', choiceGroup: 1, choiceCount: 3 },
                { grant: 'STARTING', type: 'TOOL', name: 'Lute', value: 'lute', choiceGroup: 2, choiceCount: 3 },
                { grant: 'STARTING', type: 'TOOL', name: 'Flute', value: 'flute', choiceGroup: 2, choiceCount: 3 },
                { grant: 'STARTING', type: 'ARMOR', name: 'Light armour', value: 'light-armor', choiceGroup: null, choiceCount: null },
            ],
        } as never;

        expect(configuredStartingProficiencyChoiceGroups(classDefinition)).toEqual([
            {
                classId: 'bard',
                choiceGroup: 2,
                pick: 3,
                type: 'TOOL',
                options: [
                    { value: 'lute', name: 'Lute', type: 'TOOL' },
                    { value: 'flute', name: 'Flute', type: 'TOOL' },
                ],
            },
        ]);
    });

    it('uses custom proficiency ids from value and never falls back to display names', () => {
        const { choiceGroups } = splitProficiencyRules([
            {
                type: 'TOOL',
                name: 'Custom Lute',
                value: 'prof-custom-lute-id',
                choiceGroup: 1,
                choiceCount: 1,
            },
            {
                type: 'TOOL',
                name: 'Broken Option',
                value: null,
                choiceGroup: 1,
                choiceCount: 1,
            },
        ]);

        expect(choiceGroups).toEqual([{
            choiceGroup: 1,
            pick: 1,
            type: 'TOOL',
            options: [{ value: 'prof-custom-lute-id', name: 'Custom Lute', type: 'TOOL' }],
        }]);
    });

    it('returns an empty list when only skill choices exist', () => {
        const classDefinition = {
            value: 'wizard',
            proficiencies: [
                { grant: 'STARTING', type: 'SKILL', name: 'Arcana', value: 'skill-arcana', choiceGroup: 1, choiceCount: 1 },
            ],
        } as never;

        expect(configuredStartingProficiencyChoiceGroups(classDefinition)).toEqual([]);
    });
});

describe('labelsForProficiencyChoices', () => {
    it('resolves human-readable labels for selected class-scoped choices', () => {
        expect(labelsForProficiencyChoices(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute', 'flute'] }],
            [{
                classId: 'bard',
                choiceGroup: 2,
                pick: 2,
                type: 'TOOL',
                options: [
                    { value: 'lute', name: 'Lute', type: 'TOOL' },
                    { value: 'flute', name: 'Flute', type: 'TOOL' },
                    { value: 'drum', name: 'Drum', type: 'TOOL' },
                ],
            }],
        )).toEqual(['Lute', 'Flute']);
    });
});
