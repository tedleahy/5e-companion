import {
    buildPendingMulticlassProficiencyChoices,
    getMulticlassProficiencyGains,
    getAutomaticProficiencyLabels,
    hasAnyMulticlassProficiencies,
    canContinueFromMulticlassProficiencies,
    createLevelUpMulticlassProficiencyState,
    toggleMulticlassProficiencyChoice,
} from '../characterLevelUp/multiclassProficiencies';
import type { LevelUpWizardSelectedClass } from '../characterLevelUp/types';

function makeSelectedClass(classId: string, isExistingClass: boolean): LevelUpWizardSelectedClass {
    return {
        classId,
        className: classId.charAt(0).toUpperCase() + classId.slice(1),
        currentLevel: 0,
        newLevel: 1,
        isExistingClass,
        subclassId: null,
        subclassName: null,
        subclassDescription: null,
        subclassIsCustom: false,
        subclassFeatures: [],
        customSubclass: null,
    };
}

describe('multiclass proficiency gains', () => {
    it('returns proficiency data for all SRD classes', () => {
        const knownClasses = [
            'barbarian', 'bard', 'cleric', 'druid', 'fighter',
            'monk', 'paladin', 'ranger', 'rogue', 'warlock', 'wizard',
            'sorcerer',
        ];

        for (const classId of knownClasses) {
            expect(getMulticlassProficiencyGains(classId)).not.toBeNull();
        }
    });

    it('returns null for unknown classes', () => {
        expect(getMulticlassProficiencyGains('artificer')).toBeNull();
    });

    it('returns correct proficiencies for fighter', () => {
        const gains = getMulticlassProficiencyGains('fighter')!;

        expect(gains.armor).toEqual(['Light armour', 'Medium armour', 'Shields']);
        expect(gains.weapons).toEqual(['Simple weapons', 'Martial weapons']);
        expect(gains.choiceGroups).toEqual([]);
    });

    it('returns correct proficiencies for bard with skill and instrument choices', () => {
        const gains = getMulticlassProficiencyGains('bard')!;

        expect(gains.armor).toEqual(['Light armour']);
        expect(gains.weapons).toEqual(['Simple weapons']);
        expect(gains.tools).toEqual([]);
        expect(gains.choiceGroups).toEqual(expect.arrayContaining([
            expect.objectContaining({
                choiceGroup: 1,
                pick: 1,
                type: 'SKILL',
                options: expect.arrayContaining([
                    expect.objectContaining({ name: 'Acrobatics' }),
                    expect.objectContaining({ name: 'Survival' }),
                ]),
            }),
            expect.objectContaining({ choiceGroup: 2, pick: 1, type: 'TOOL' }),
        ]));
        expect(gains.choiceGroups.find((group) => group.choiceGroup === 1)?.options).toHaveLength(18);
        expect(gains.choiceGroups.find((group) => group.choiceGroup === 2)?.options)
            .toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Lute' })]));
    });

    it('returns correct proficiencies for druid', () => {
        const gains = getMulticlassProficiencyGains('druid')!;

        expect(gains.armor).toEqual(['Light armour', 'Medium armour', 'Shields (non-metal)']);
        expect(gains.weapons).toEqual([
            'Clubs',
            'Daggers',
            'Darts',
            'Javelins',
            'Maces',
            'Quarterstaffs',
            'Scimitars',
            'Sickles',
            'Slings',
            'Spears',
        ]);
        expect(gains.tools).toEqual(['Herbalism kit']);
    });

    it('returns rogue tool proficiency gains', () => {
        const gains = getMulticlassProficiencyGains('rogue')!;

        expect(gains.tools).toEqual(["Thieves' tools"]);
        expect(gains.choiceGroups).toEqual([
            expect.objectContaining({ choiceGroup: 1, pick: 1, type: 'SKILL' }),
        ]);
    });

    it('returns no proficiencies for wizard', () => {
        const gains = getMulticlassProficiencyGains('wizard')!;

        expect(gains.armor).toEqual([]);
        expect(gains.weapons).toEqual([]);
        expect(gains.tools).toEqual([]);
        expect(gains.choiceGroups).toEqual([]);
    });

    it('hasAnyMulticlassProficiencies returns false for wizard', () => {
        expect(hasAnyMulticlassProficiencies('wizard')).toBe(false);
    });

    it('hasAnyMulticlassProficiencies returns true for fighter', () => {
        expect(hasAnyMulticlassProficiencies('fighter')).toBe(true);
    });
});

describe('getAutomaticProficiencyLabels', () => {
    it('combines armor, weapons, tools, and automatic skills into a flat list', () => {
        const gains = getMulticlassProficiencyGains('fighter')!;
        const labels = getAutomaticProficiencyLabels(gains);

        expect(labels).toEqual([
            'Light armour', 'Medium armour', 'Shields',
            'Simple weapons', 'Martial weapons',
        ]);
    });
});

describe('configured (custom class) multiclass proficiency gains', () => {
    function customSelectedClass(
        proficiencies: Array<{
            grant: 'MULTICLASS';
            type: string;
            name: string;
            value?: string;
            choiceGroup: number | null;
            choiceCount?: number | null;
        }>,
    ): LevelUpWizardSelectedClass {
        return {
            ...makeSelectedClass('custom-class-id', false),
            classDefinition: { proficiencies } as never,
        };
    }

    it('separates fixed SKILL grants (choiceGroup null) from choice-group skill options', () => {
        const selectedClass = customSelectedClass([
            { grant: 'MULTICLASS', type: 'SKILL', name: 'Survival', value: 'skill-survival', choiceGroup: null },
            { grant: 'MULTICLASS', type: 'SKILL', name: 'Athletics', value: 'skill-athletics', choiceGroup: 1, choiceCount: 1 },
            { grant: 'MULTICLASS', type: 'SKILL', name: 'Perception', value: 'skill-perception', choiceGroup: 1, choiceCount: 1 },
        ]);

        const gains = getMulticlassProficiencyGains(selectedClass.classId, selectedClass)!;

        expect(gains.automaticSkills).toEqual(['Survival']);
        expect(gains.choiceGroups).toEqual([
            expect.objectContaining({
                choiceGroup: 1,
                pick: 1,
                type: 'SKILL',
                options: expect.arrayContaining([
                    expect.objectContaining({ value: 'skill-athletics', name: 'Athletics' }),
                    expect.objectContaining({ value: 'skill-perception', name: 'Perception' }),
                ]),
            }),
        ]);
    });

    it('surfaces non-skill TOOL choice groups from configured rules', () => {
        const selectedClass = customSelectedClass([
            { grant: 'MULTICLASS', type: 'ARMOR', name: 'Light armour', choiceGroup: null },
            { grant: 'MULTICLASS', type: 'TOOL', name: 'Lute', choiceGroup: 2, choiceCount: 1, value: 'lute' },
            { grant: 'MULTICLASS', type: 'TOOL', name: 'Flute', choiceGroup: 2, choiceCount: 1, value: 'flute' },
        ]);

        const gains = getMulticlassProficiencyGains(selectedClass.classId, selectedClass)!;

        expect(gains.armor).toEqual(['Light armour']);
        expect(gains.tools).toEqual([]);
        expect(gains.choiceGroups).toEqual([
            expect.objectContaining({
                choiceGroup: 2,
                pick: 1,
                type: 'TOOL',
                options: expect.arrayContaining([
                    expect.objectContaining({ value: 'lute', name: 'Lute' }),
                    expect.objectContaining({ value: 'flute', name: 'Flute' }),
                ]),
            }),
        ]);
    });

    it('includes automatic skills alongside armor, weapons, and tools in the display labels', () => {
        const selectedClass = customSelectedClass([
            { grant: 'MULTICLASS', type: 'ARMOR', name: 'Medium armour', choiceGroup: null },
            { grant: 'MULTICLASS', type: 'SKILL', name: 'Survival', choiceGroup: null },
        ]);

        const gains = getMulticlassProficiencyGains(selectedClass.classId, selectedClass)!;

        expect(getAutomaticProficiencyLabels(gains)).toEqual(['Medium armour', 'Survival']);
    });
});

describe('toggleMulticlassProficiencyChoice', () => {
    it('adds a skill option value to the selection', () => {
        const state = createLevelUpMulticlassProficiencyState();
        const next = toggleMulticlassProficiencyChoice(state, 1, 'skill-stealth', 1);

        expect(next.selections).toEqual([{ choiceGroup: 1, values: ['skill-stealth'] }]);
    });

    it('removes an already-selected value', () => {
        const state = { selections: [{ choiceGroup: 1, values: ['skill-stealth'] }] };
        const next = toggleMulticlassProficiencyChoice(state, 1, 'skill-stealth', 1);

        expect(next.selections).toEqual([]);
    });

    it('does not exceed the max choices', () => {
        const state = { selections: [{ choiceGroup: 1, values: ['skill-stealth'] }] };
        const next = toggleMulticlassProficiencyChoice(state, 1, 'skill-perception', 1);

        expect(next.selections).toEqual([{ choiceGroup: 1, values: ['skill-stealth'] }]);
    });

    it('buildPendingMulticlassProficiencyChoices attaches classId', () => {
        const state = {
            selections: [
                { choiceGroup: 1, values: ['skill-stealth'] },
                { choiceGroup: 2, values: ['lute'] },
            ],
        };

        expect(buildPendingMulticlassProficiencyChoices('bard', state)).toEqual([
            { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
        ]);
    });
});

describe('canContinueFromMulticlassProficiencies', () => {
    it('returns true when no skill choices are required', () => {
        const selectedClass = makeSelectedClass('fighter', false);
        const state = createLevelUpMulticlassProficiencyState();

        expect(canContinueFromMulticlassProficiencies(selectedClass, state)).toBe(true);
    });

    it('returns false when skill choices are required but not filled', () => {
        const selectedClass = makeSelectedClass('rogue', false);
        const state = createLevelUpMulticlassProficiencyState();

        expect(canContinueFromMulticlassProficiencies(selectedClass, state)).toBe(false);
    });

    it('returns true when skill choices are filled', () => {
        const selectedClass = makeSelectedClass('rogue', false);
        const state = { selections: [{ choiceGroup: 1, values: ['skill-stealth'] }] };

        expect(canContinueFromMulticlassProficiencies(selectedClass, state)).toBe(true);
    });

    it('requires bard instrument picks in addition to skill picks', () => {
        const selectedClass = makeSelectedClass('bard', false);
        const incomplete = {
            selections: [{ choiceGroup: 1, values: ['skill-stealth'] }],
        };
        const complete = {
            selections: [
                { choiceGroup: 1, values: ['skill-stealth'] },
                { choiceGroup: 2, values: ['lute'] },
            ],
        };

        expect(canContinueFromMulticlassProficiencies(selectedClass, incomplete)).toBe(false);
        expect(canContinueFromMulticlassProficiencies(selectedClass, complete)).toBe(true);
    });
});
