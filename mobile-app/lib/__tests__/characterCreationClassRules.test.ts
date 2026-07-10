import { configuredStartingClassSkillOptions } from '../characterCreation/classRules';

describe('configuredStartingClassSkillOptions', () => {
    it('maps configured starting skill choice groups to character skill keys', () => {
        const classDefinition = {
            proficiencies: [
                { grant: 'STARTING', type: 'SKILL', name: 'Animal Handling', choiceGroup: 1, choiceCount: 2 },
                { grant: 'STARTING', type: 'SKILL', name: 'Athletics', choiceGroup: 1, choiceCount: 2 },
                { grant: 'STARTING', type: 'ARMOR', name: 'Light armour', choiceGroup: null, choiceCount: null },
            ],
        } as never;

        expect(configuredStartingClassSkillOptions(classDefinition)).toEqual([{
            choiceGroup: 1,
            pick: 2,
            options: ['animalHandling', 'athletics'],
        }]);
    });

    it('keeps independent skill choice groups separate', () => {
        const classDefinition = {
            proficiencies: [
                { grant: 'STARTING', type: 'SKILL', name: 'Arcana', choiceGroup: 1, choiceCount: 1 },
                { grant: 'STARTING', type: 'SKILL', name: 'History', choiceGroup: 1, choiceCount: 1 },
                { grant: 'STARTING', type: 'SKILL', name: 'Athletics', choiceGroup: 2, choiceCount: 1 },
                { grant: 'STARTING', type: 'SKILL', name: 'Survival', choiceGroup: 2, choiceCount: 1 },
            ],
        } as never;

        expect(configuredStartingClassSkillOptions(classDefinition)).toEqual([
            { choiceGroup: 1, pick: 1, options: ['arcana', 'history'] },
            { choiceGroup: 2, pick: 1, options: ['athletics', 'survival'] },
        ]);
    });

    it('returns null when the class has no configured starting skill choices', () => {
        expect(configuredStartingClassSkillOptions({ proficiencies: [] } as never)).toBeNull();
    });
});
