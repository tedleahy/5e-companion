import {
    canContinueFromNewFeatures,
    canContinueFromSubclassSelection,
    getLevelUpFeatures,
    getLevelUpFeatureChoiceGroups,
    isPickerManagedFeature,
    isSubclassChoiceLevel,
    mapCustomFeatureDrafts,
    mapSelectedFeatureChoiceFeatures,
} from '@/lib/characterLevelUp/subclassFeatures';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';

/**
 * Builds one selected-class fixture for feature-lookup tests.
 */
function createSelectedClass(
    overrides: Partial<LevelUpWizardSelectedClass>,
): LevelUpWizardSelectedClass {
    return {
        classId: 'wizard',
        className: 'Wizard',
        currentLevel: 10,
        newLevel: 11,
        isExistingClass: true,
        subclassId: 'evocation',
        subclassName: 'School of Evocation',
        subclassDescription: null,
        subclassIsCustom: false,
        subclassFeatures: [],
        customSubclass: null,
        ...overrides,
    };
}

describe('characterLevelUp subclass features', () => {
    it('detects subclass-choice levels from the SRD progression table', () => {
        expect(isSubclassChoiceLevel('wizard', 2)).toBe(true);
        expect(isSubclassChoiceLevel('wizard', 3)).toBe(false);
        expect(isSubclassChoiceLevel('fighter', 3)).toBe(true);
    });

    it('treats invocation and metamagic entries as picker-managed features', () => {
        expect(isPickerManagedFeature('Eldritch Invocation: Agonizing Blast')).toBe(true);
        expect(isPickerManagedFeature('Metamagic: Careful Spell')).toBe(true);
    });

    it('does not treat unrelated feature names as picker-managed', () => {
        expect(isPickerManagedFeature('Mystic Arcanum (6th): Mass Suggestion')).toBe(false);
        expect(isPickerManagedFeature('Eldritch Invocation')).toBe(false);
        expect(isPickerManagedFeature('Metamagic')).toBe(false);
        expect(isPickerManagedFeature('Ability Score Improvement')).toBe(false);
    });

    it('includes new spell-slot-tier unlocks in the feature list', () => {
        expect(getLevelUpFeatures(createSelectedClass({
            currentLevel: 12,
            newLevel: 13,
        }))).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: '7th Level Spell Slot',
                kind: 'spell_slot',
                source: 'Wizard 13',
                customSubclassFeature: null,
            }),
        ]));
    });

    it('includes subclass features once an SRD subclass has been chosen', () => {
        expect(getLevelUpFeatures(createSelectedClass({
            currentLevel: 1,
            newLevel: 2,
            subclassFeatures: [],
        }))).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Evocation Savant', kind: 'subclass', customSubclassFeature: null }),
            expect.objectContaining({ name: 'Sculpt Spells', kind: 'subclass', customSubclassFeature: null }),
        ]));
    });

    it('keeps parent choice features in the feature list while exposing child options separately', () => {
        const selectedClass = createSelectedClass({
            classId: 'warlock',
            className: 'Warlock',
            currentLevel: 2,
            newLevel: 3,
            subclassId: 'fiend',
            subclassName: 'Fiend',
        });

        expect(getLevelUpFeatures(selectedClass)).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Pact Boon' }),
        ]));
        expect(getLevelUpFeatures(selectedClass)).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Pact Boon', srdIndex: 'pact-boon' }),
        ]));
        expect(getLevelUpFeatures(selectedClass)).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ name: 'Pact of the Blade' }),
            expect.objectContaining({ name: 'Pact of the Chain' }),
            expect.objectContaining({ name: 'Pact of the Tome' }),
        ]));

        expect(getLevelUpFeatureChoiceGroups(selectedClass)).toEqual([
            expect.objectContaining({
                parentSrdIndex: 'pact-boon',
                options: expect.arrayContaining([
                    expect.objectContaining({ childSrdIndex: 'pact-of-the-chain', name: 'Pact of the Chain' }),
                    expect.objectContaining({ childSrdIndex: 'pact-of-the-blade', name: 'Pact of the Blade' }),
                    expect.objectContaining({ childSrdIndex: 'pact-of-the-tome', name: 'Pact of the Tome' }),
                ]),
            }),
        ]);
    });

    it('includes persisted custom subclass features for owned subclasses at the current level', () => {
        expect(getLevelUpFeatures(createSelectedClass({
            currentLevel: 1,
            newLevel: 2,
            subclassId: 'custom-wizard-subclass-id',
            subclassName: 'School of Glass',
            subclassDescription: 'A delicate art of mirrored wards and refractions.',
            subclassIsCustom: true,
            subclassFeatures: [
                {
                    id: 'glass-2-refraction-shield',
                    name: 'Refraction Shield',
                    description: 'Bend light to turn aside attacks.',
                    level: 2,
                },
                {
                    id: 'glass-6-prism-step',
                    name: 'Prism Step',
                    description: 'Fold space through mirrored angles.',
                    level: 6,
                },
            ],
            customSubclass: null,
        }))).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'Refraction Shield',
                kind: 'custom',
                customSubclassFeature: {
                    classId: 'wizard',
                    level: 2,
                },
            }),
        ]));
    });

    it('requires drafted custom subclass features to be complete before continuing', () => {
        expect(canContinueFromNewFeatures([], [], {})).toBe(true);
        expect(canContinueFromNewFeatures([
            { id: 'feature-1', name: 'Runic Ward', description: 'Create a brief shield of force.' },
        ], [], {})).toBe(true);
        expect(canContinueFromNewFeatures([
            { id: 'feature-1', name: 'Runic Ward', description: '' },
        ], [], {})).toBe(false);
        expect(canContinueFromNewFeatures(
            [],
            getLevelUpFeatureChoiceGroups(createSelectedClass({
                classId: 'warlock',
                className: 'Warlock',
                currentLevel: 2,
                newLevel: 3,
                subclassId: 'fiend',
                subclassName: 'Fiend',
            })),
            {},
        )).toBe(false);
    });

    it('maps custom subclass features into persisted feature rows', () => {
        expect(mapCustomFeatureDrafts(createSelectedClass({
            currentLevel: 1,
            newLevel: 2,
            subclassId: null,
            subclassName: 'School of Glass',
            subclassDescription: 'A delicate art of mirrored wards and refractions.',
            subclassIsCustom: true,
            customSubclass: {
                name: 'School of Glass',
                description: 'A delicate art of mirrored wards and refractions.',
            },
        }), [
            {
                id: 'feature-1',
                name: 'Refraction Shield',
                description: 'Bend light to turn aside attacks.',
            },
        ])).toEqual([
            expect.objectContaining({
                name: 'Refraction Shield',
                kind: 'custom',
                source: 'School of Glass Wizard 2',
                customSubclassFeature: {
                    classId: 'wizard',
                    level: 2,
                },
            }),
        ]);
    });

    it('maps selected child feature choices into persisted level-up features', () => {
        const choiceGroups = getLevelUpFeatureChoiceGroups(createSelectedClass({
            classId: 'warlock',
            className: 'Warlock',
            currentLevel: 2,
            newLevel: 3,
            subclassId: 'fiend',
            subclassName: 'Fiend',
        }));

        expect(mapSelectedFeatureChoiceFeatures(choiceGroups, {
            'pact-boon': 'pact-of-the-chain',
        })).toEqual([
            expect.objectContaining({
                srdIndex: 'pact-of-the-chain',
                parentSrdIndex: 'pact-boon',
                name: 'Pact of the Chain',
            }),
        ]);
    });

    it('requires a concrete subclass choice before the subclass step can continue', () => {
        expect(canContinueFromSubclassSelection({
            mode: 'none',
            selectedSubclassId: null,
            selectedSubclassName: null,
            selectedSubclassDescription: '',
            selectedSubclassIsCustom: false,
            selectedSubclassFeatures: [],
            customSubclassName: '',
            customSubclassDescription: '',
        })).toBe(false);

        expect(canContinueFromSubclassSelection({
            mode: 'srd',
            selectedSubclassId: 'evocation',
            selectedSubclassName: 'School of Evocation',
            selectedSubclassDescription: 'Focus your magic on raw elemental force.',
            selectedSubclassIsCustom: false,
            selectedSubclassFeatures: [],
            customSubclassName: '',
            customSubclassDescription: '',
        })).toBe(true);

        expect(canContinueFromSubclassSelection({
            mode: 'custom',
            selectedSubclassId: null,
            selectedSubclassName: null,
            selectedSubclassDescription: '',
            selectedSubclassIsCustom: false,
            selectedSubclassFeatures: [],
            customSubclassName: 'School of Glass',
            customSubclassDescription: 'A delicate art of mirrored wards and refractions.',
        })).toBe(true);
    });
});
