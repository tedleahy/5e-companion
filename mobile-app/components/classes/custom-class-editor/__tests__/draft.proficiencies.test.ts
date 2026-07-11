import {
    createDraft,
    fixedProficiencyValues,
    nextChoiceGroupId,
    proficiencyChoiceGroups,
    withChoiceGroups,
    withFixedProficiencies,
} from '../draft';

describe('custom class proficiency draft helpers', () => {
    const draft = {
        ...createDraft(),
        proficiencies: [
            { value: 'light-armor', grant: 'STARTING', choiceGroup: null, choiceCount: null },
            { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
            { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
            { value: 'simple-weapons', grant: 'MULTICLASS', choiceGroup: null, choiceCount: null },
        ],
    };

    test('fixedProficiencyValues returns only non-choice entries for a grant', () => {
        expect(fixedProficiencyValues(draft, 'STARTING')).toEqual(['light-armor']);
        expect(fixedProficiencyValues(draft, 'MULTICLASS')).toEqual(['simple-weapons']);
    });

    test('proficiencyChoiceGroups groups shared choice ids', () => {
        expect(proficiencyChoiceGroups(draft, 'STARTING')).toEqual([
            {
                choiceGroup: 1,
                choiceCount: 2,
                values: ['skill-acrobatics', 'skill-athletics'],
            },
        ]);
        expect(proficiencyChoiceGroups(draft, 'MULTICLASS')).toEqual([]);
    });

    test('withFixedProficiencies replaces fixed values and preserves choice groups', () => {
        const next = withFixedProficiencies(draft, 'STARTING', ['medium-armor', 'shields']);
        expect(fixedProficiencyValues({ ...draft, proficiencies: next }, 'STARTING')).toEqual([
            'medium-armor',
            'shields',
        ]);
        expect(proficiencyChoiceGroups({ ...draft, proficiencies: next }, 'STARTING')).toEqual([
            {
                choiceGroup: 1,
                choiceCount: 2,
                values: ['skill-acrobatics', 'skill-athletics'],
            },
        ]);
        expect(fixedProficiencyValues({ ...draft, proficiencies: next }, 'MULTICLASS')).toEqual([
            'simple-weapons',
        ]);
    });

    test('withChoiceGroups replaces choice groups and preserves fixed values', () => {
        const next = withChoiceGroups(draft, 'STARTING', [
            {
                choiceGroup: 2,
                choiceCount: 1,
                values: ['skill-stealth', 'skill-perception'],
            },
        ]);
        expect(fixedProficiencyValues({ ...draft, proficiencies: next }, 'STARTING')).toEqual([
            'light-armor',
        ]);
        expect(proficiencyChoiceGroups({ ...draft, proficiencies: next }, 'STARTING')).toEqual([
            {
                choiceGroup: 2,
                choiceCount: 1,
                values: ['skill-stealth', 'skill-perception'],
            },
        ]);
    });

    test('nextChoiceGroupId increments past the highest group', () => {
        expect(nextChoiceGroupId([])).toBe(1);
        expect(nextChoiceGroupId([{ choiceGroup: 1 }, { choiceGroup: 3 }])).toBe(4);
    });
});
