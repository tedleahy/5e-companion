import {
    createDraft,
    fixedProficiencyValues,
    fixedProficiencyValuesForType,
    nextChoiceGroupId,
    proficiencyChoiceGroupForType,
    proficiencyChoiceGroups,
    withChoiceGroupForType,
    withChoiceGroups,
    withFixedProficiencies,
    withFixedProficienciesForType,
} from '../draft';

describe('custom class proficiency draft helpers', () => {
    const typeByValue = new Map([
        ['light-armor', 'ARMOR'],
        ['medium-armor', 'ARMOR'],
        ['shields', 'ARMOR'],
        ['simple-weapons', 'WEAPON'],
        ['skill-acrobatics', 'SKILL'],
        ['skill-athletics', 'SKILL'],
        ['skill-stealth', 'SKILL'],
        ['skill-perception', 'SKILL'],
        ['thieves-tools', 'TOOL'],
        ['smiths-tools', 'TOOL'],
    ]);

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

    test('fixedProficiencyValuesForType filters by category', () => {
        expect(fixedProficiencyValuesForType(draft, 'STARTING', 'ARMOR', typeByValue)).toEqual([
            'light-armor',
        ]);
        expect(fixedProficiencyValuesForType(draft, 'STARTING', 'SKILL', typeByValue)).toEqual([]);
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

    test('proficiencyChoiceGroupForType returns the pool for one category', () => {
        expect(proficiencyChoiceGroupForType(draft, 'STARTING', 'SKILL', typeByValue)).toEqual({
            choiceGroup: 1,
            choiceCount: 2,
            values: ['skill-acrobatics', 'skill-athletics'],
        });
        expect(proficiencyChoiceGroupForType(draft, 'STARTING', 'TOOL', typeByValue)).toBeNull();
    });

    test('proficiencyChoiceGroupForType merges legacy same-type groups', () => {
        const legacy = {
            ...draft,
            proficiencies: [
                { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 2, choiceCount: 1 },
            ],
        };
        expect(proficiencyChoiceGroupForType(legacy, 'STARTING', 'SKILL', typeByValue)).toEqual({
            choiceGroup: 1,
            choiceCount: 1,
            values: ['skill-acrobatics', 'skill-athletics'],
        });
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

    test('withFixedProficienciesForType only replaces one category', () => {
        const withTools = {
            ...draft,
            proficiencies: [
                ...draft.proficiencies,
                { value: 'thieves-tools', grant: 'STARTING', choiceGroup: null, choiceCount: null },
            ],
        };
        const next = withFixedProficienciesForType(
            withTools,
            'STARTING',
            'ARMOR',
            ['medium-armor'],
            typeByValue,
        );
        expect(fixedProficiencyValues({ ...withTools, proficiencies: next }, 'STARTING')).toEqual([
            'thieves-tools',
            'medium-armor',
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

    test('withChoiceGroupForType replaces only that category pool', () => {
        const withToolChoice = {
            ...draft,
            proficiencies: [
                ...draft.proficiencies,
                { value: 'smiths-tools', grant: 'STARTING', choiceGroup: 2, choiceCount: 1 },
                { value: 'thieves-tools', grant: 'STARTING', choiceGroup: 2, choiceCount: 1 },
            ],
        };
        const next = withChoiceGroupForType(
            withToolChoice,
            'STARTING',
            'SKILL',
            { choiceGroup: 3, choiceCount: 1, values: ['skill-stealth', 'skill-perception'] },
            typeByValue,
        );
        const asDraft = { ...withToolChoice, proficiencies: next };
        expect(proficiencyChoiceGroupForType(asDraft, 'STARTING', 'SKILL', typeByValue)).toEqual({
            choiceGroup: 3,
            choiceCount: 1,
            values: ['skill-stealth', 'skill-perception'],
        });
        expect(proficiencyChoiceGroupForType(asDraft, 'STARTING', 'TOOL', typeByValue)).toEqual({
            choiceGroup: 2,
            choiceCount: 1,
            values: ['smiths-tools', 'thieves-tools'],
        });
    });

    test('withChoiceGroupForType null clears that category pool', () => {
        const next = withChoiceGroupForType(draft, 'STARTING', 'SKILL', null, typeByValue);
        expect(proficiencyChoiceGroups({ ...draft, proficiencies: next }, 'STARTING')).toEqual([]);
        expect(fixedProficiencyValues({ ...draft, proficiencies: next }, 'STARTING')).toEqual([
            'light-armor',
        ]);
    });

    test('nextChoiceGroupId increments past the highest group', () => {
        expect(nextChoiceGroupId([])).toBe(1);
        expect(nextChoiceGroupId([{ choiceGroup: 1 }, { choiceGroup: 3 }])).toBe(4);
    });
});
