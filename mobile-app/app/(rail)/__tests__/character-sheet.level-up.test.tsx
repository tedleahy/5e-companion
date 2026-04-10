import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { SEARCH_SPELLS_FOR_SHEET } from '@/components/character-sheet/spells/AddSpellSheet';
import { LEARN_SPELL, SAVE_CHARACTER_SHEET } from '@/graphql/characterSheet.operations';
import { CHARACTERS_MOCK, MOCK_CHARACTER, SAVE_CORE_CHARACTER_MOCKS } from './mocks/character-sheet.mocks';
import {
    enableCharacterSheetEditMode,
    openCharacterSheetTab,
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

jest.mock('@/hooks/useAvailableSubclasses', () => ({
    __esModule: true,
    default: jest.fn((classIds: string[]) => {
        const byClassId: Record<string, Array<{
            id: string;
            value: string;
            srdIndex: string | null;
            classId: string;
            className: string;
            name: string;
            description: string;
            isCustom: boolean;
            features: Array<{
                id: string;
                name: string;
                description: string;
                level: number;
            }>;
            icon: string;
            hint?: string;
        }>> = {
            wizard: [
                {
                    id: 'subclass-evocation-id',
                    value: 'evocation',
                    srdIndex: 'evocation',
                    classId: 'wizard',
                    className: 'Wizard',
                    name: 'School of Evocation',
                    description: 'Focus your magic on raw elemental force, disciplined blast shaping, and battlefield control through practiced destructive wizardry that turns fire, frost, and thunder into precise arcane tools.',
                    isCustom: false,
                    features: [],
                    icon: '\u{1F525}',
                },
                {
                    id: 'custom-wizard-subclass-id',
                    value: 'custom-wizard-subclass-id',
                    srdIndex: null,
                    classId: 'wizard',
                    className: 'Wizard',
                    name: 'School of Glass',
                    description: 'A delicate art of mirrored wards and refractions.',
                    isCustom: true,
                    features: [
                        {
                            id: 'glass-feature-refraction-shield',
                            name: 'Refraction Shield',
                            description: 'Bend light to turn aside attacks.',
                            level: 2,
                        },
                    ],
                    icon: '\u2728',
                },
            ],
        };

        const filtered = Object.fromEntries(
            classIds.map((classId) => [classId, byClassId[classId] ?? []]),
        );

        return {
            availableSubclasses: Object.values(filtered).flat(),
            availableSubclassesByClassId: filtered,
            subclassOptionItemsByClassId: Object.fromEntries(
                Object.entries(filtered).map(([classId, subclasses]) => [
                    classId,
                    subclasses.map((subclass) => ({
                        value: subclass.value,
                        label: subclass.name,
                        icon: subclass.icon,
                        hint: subclass.hint,
                    })),
                ]),
            ),
            loading: false,
        };
    }),
}));

const LOW_CON_CHARACTER_SHEET_MOCK = {
    request: {
        ...CHARACTERS_MOCK.request,
    },
    result: {
        data: {
            character: {
                ...MOCK_CHARACTER,
                stats: {
                    ...MOCK_CHARACTER.stats,
                    abilityScores: {
                        ...MOCK_CHARACTER.stats.abilityScores,
                        constitution: 1,
                    },
                },
            },
            hasCurrentUserCharacters: true,
        },
    },
};

const ASI_ELIGIBLE_CHARACTER_SHEET_MOCK = {
    request: {
        ...CHARACTERS_MOCK.request,
    },
    result: {
        data: {
            character: {
                ...MOCK_CHARACTER,
                level: 13,
                classes: [
                    {
                        ...MOCK_CHARACTER.classes[0],
                        level: 11,
                    },
                    MOCK_CHARACTER.classes[1],
                ],
                spellcastingProfiles: [
                    {
                        ...MOCK_CHARACTER.spellcastingProfiles[0],
                        classLevel: 11,
                    },
                    MOCK_CHARACTER.spellcastingProfiles[1],
                ],
            },
            hasCurrentUserCharacters: true,
        },
    },
};

const SUBCLASS_ELIGIBLE_CHARACTER_SHEET_MOCK = {
    request: {
        ...CHARACTERS_MOCK.request,
    },
    result: {
        data: {
            character: {
                ...MOCK_CHARACTER,
                level: 1,
                proficiencyBonus: 2,
                classes: [
                    {
                        ...MOCK_CHARACTER.classes[0],
                        subclassId: null,
                        subclassName: null,
                        level: 1,
                    },
                ],
                spellcastingProfiles: [
                    {
                        ...MOCK_CHARACTER.spellcastingProfiles[0],
                        subclassId: null,
                        subclassName: null,
                        classLevel: 1,
                        spellSaveDC: 15,
                        spellAttackBonus: 7,
                    },
                ],
            },
            hasCurrentUserCharacters: true,
        },
    },
};

const LEVEL_UP_SAVE_MOCK = {
    request: {
        query: SAVE_CHARACTER_SHEET,
        variables: {
            characterId: 'char-1',
            input: {
                ...SAVE_CORE_CHARACTER_MOCKS[0].request.variables.input,
                hp: {
                    current: 60,
                    max: 82,
                    temp: 2,
                },
                abilityScores: {
                    ...SAVE_CORE_CHARACTER_MOCKS[0].request.variables.input.abilityScores,
                    constitution: 15,
                },
                classes: [
                    {
                        ...SAVE_CORE_CHARACTER_MOCKS[0].request.variables.input.classes[0],
                        level: 12,
                    },
                    SAVE_CORE_CHARACTER_MOCKS[0].request.variables.input.classes[1],
                ],
                features: [
                    ...SAVE_CORE_CHARACTER_MOCKS[0].request.variables.input.features,
                    {
                        name: 'Resilient',
                        source: 'Feat',
                        description: 'Gain proficiency in Constitution saving throws and improve concentration checks.\n\nConstitution +1',
                        usesMax: null,
                        usesRemaining: null,
                        recharge: null,
                        customSubclassFeature: null,
                    },
                ],
            },
        },
    },
    result: {
        data: {
            saveCharacterSheet: {
                ...MOCK_CHARACTER,
                level: 14,
                proficiencyBonus: 5,
                classes: [
                    {
                        ...MOCK_CHARACTER.classes[0],
                        level: 12,
                    },
                    MOCK_CHARACTER.classes[1],
                ],
                spellcastingProfiles: [
                    {
                        ...MOCK_CHARACTER.spellcastingProfiles[0],
                        classLevel: 12,
                        spellSaveDC: 18,
                        spellAttackBonus: 10,
                    },
                    MOCK_CHARACTER.spellcastingProfiles[1],
                ],
                features: [
                    ...MOCK_CHARACTER.features,
                    {
                        __typename: 'CharacterFeature',
                        id: 'feature-resilient',
                        name: 'Resilient',
                        source: 'Feat',
                        description: 'Gain proficiency in Constitution saving throws and improve concentration checks.\n\nConstitution +1',
                        usesMax: null,
                        usesRemaining: null,
                        recharge: null,
                    },
                ],
                stats: {
                    ...MOCK_CHARACTER.stats,
                    abilityScores: {
                        __typename: 'AbilityScores',
                        ...MOCK_CHARACTER.stats.abilityScores,
                        constitution: 15,
                    },
                    hp: {
                        __typename: 'HP',
                        current: 60,
                        max: 82,
                        temp: 2,
                    },
                },
            },
        },
    },
};

const LEVEL_UP_SPELL_SELECTION_QUERY_MOCK = {
    request: {
        query: SEARCH_SPELLS_FOR_SHEET,
        variables: {
            filter: {
                classes: ['wizard'],
                levels: [1, 2, 3, 4, 5, 6],
            },
            pagination: {
                limit: 500,
                offset: 0,
            },
        },
    },
    result: {
        data: {
            spells: [
                {
                    __typename: 'Spell',
                    id: 'spell-counterspell',
                    name: 'Counterspell',
                    level: 3,
                    schoolIndex: 'abjuration',
                    classIndexes: ['wizard', 'sorcerer', 'warlock'],
                    castingTime: '1 reaction',
                    range: '60 feet',
                    concentration: false,
                    ritual: false,
                },
                {
                    __typename: 'Spell',
                    id: 'spell-wall-of-force',
                    name: 'Wall of Force',
                    level: 5,
                    schoolIndex: 'evocation',
                    classIndexes: ['wizard'],
                    castingTime: '1 action',
                    range: '120 feet',
                    concentration: true,
                    ritual: false,
                },
            ],
        },
    },
};

const COUNTERSPELL = {
    __typename: 'Spell',
    id: 'spell-counterspell',
    name: 'Counterspell',
    level: 3,
    schoolIndex: 'abjuration',
    classIndexes: ['wizard', 'sorcerer', 'warlock'],
    castingTime: '1 reaction',
    range: '60 feet',
    concentration: false,
    ritual: false,
} as const;

const WALL_OF_FORCE = {
    __typename: 'Spell',
    id: 'spell-wall-of-force',
    name: 'Wall of Force',
    level: 5,
    schoolIndex: 'evocation',
    classIndexes: ['wizard'],
    castingTime: '1 action',
    range: '120 feet',
    concentration: true,
    ritual: false,
} as const;

function buildLearnSpellMock(spell: {
    id: string;
    name: string;
    level: number;
    schoolIndex: string;
    classIndexes: string[];
    castingTime: string;
    range: string;
    concentration: boolean;
    ritual: boolean;
}) {
    return {
        request: {
            query: LEARN_SPELL,
            variables: {
                characterId: 'char-1',
                spellId: spell.id,
            },
        },
        result: {
            data: {
                learnSpell: {
                    __typename: 'CharacterSpell',
                    prepared: false,
                    spell: {
                        __typename: 'Spell',
                        id: spell.id,
                        name: spell.name,
                        level: spell.level,
                        schoolIndex: spell.schoolIndex,
                        classIndexes: spell.classIndexes,
                        castingTime: spell.castingTime,
                        range: spell.range,
                        concentration: spell.concentration,
                        ritual: spell.ritual,
                    },
                },
            },
        },
    };
}

async function chooseWizardLevelUpSpells() {
    await pressAndFlush(screen.getByText('+ Choose 2 New Spells'));

    await waitFor(() => {
        expect(screen.getByText('Counterspell')).toBeTruthy();
        expect(screen.getByText('Wall of Force')).toBeTruthy();
    });

    const sheet = () => within(screen.getByTestId('add-spell-sheet'));

    await pressAndFlush(sheet().getAllByLabelText('Add spell')[0]!);
    await waitFor(() => {
        expect(screen.getByText('1 of 2 spells selected')).toBeTruthy();
    });

    await pressAndFlush(sheet().getAllByLabelText('Add spell')[0]!);

    await pressAndFlush(sheet().getByLabelText('Done adding spells'));

    await waitFor(() => {
        expect(screen.getByText('2 of 2 spells selected')).toBeTruthy();
    });
}

describe('CharacterByIdScreen level-up wizard', () => {
    setupCharacterSheetScreenTestHooks();

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('only shows the level-up button while edit mode is active', async () => {
        renderCharacterSheetScreen();

        await waitFor(() => {
            expect(screen.getByText('Vaelindra')).toBeTruthy();
        });

        expect(screen.queryByLabelText('Level up character')).toBeNull();

        await enableCharacterSheetEditMode();

        expect(screen.getByLabelText('Level up character')).toBeTruthy();
    });

    it('opens the level-up sheet and dismisses it from the backdrop', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));

        await waitFor(() => {
            expect(screen.getByText('Advance Vaelindra to Level 13')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-wizard-sheet')).toBeTruthy();
        fireEvent.press(screen.getByLabelText('Dismiss level up wizard'));

        await waitFor(() => {
            expect(screen.queryByText('Advance Vaelindra to Level 13')).toBeNull();
        });
    });

    it('starts on the default current-class view and keeps the picker hidden', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));

        await waitFor(() => {
            expect(screen.getByText('Step 1 of 5 - Choose Class')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-current-class-card')).toBeTruthy();
        expect(screen.getByText('Level 10 -> 11')).toBeTruthy();
        expect(screen.queryByTestId('level-up-class-option-fighter')).toBeNull();
        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
    });

    it('opens the multiclass picker, disables next until a class is chosen, and resets on back', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-open-class-picker'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-class-option-fighter')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-class-option-fighter'));

        await waitFor(() => {
            expect(screen.getByText('Step 1 of 5 - Choose Class')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);

        await pressAndFlush(screen.getByTestId('level-up-back-to-current-class'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-current-class-card')).toBeTruthy();
        });

        expect(screen.getByText('Step 1 of 5 - Choose Class')).toBeTruthy();
        expect(screen.queryByTestId('level-up-class-option-fighter')).toBeNull();
    });

    it('shows informational warnings for unmet multiclass prerequisites', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-open-class-picker'));
        await pressAndFlush(screen.getByTestId('level-up-class-option-bard'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-multiclass-warning')).toBeTruthy();
        });

        expect(
            screen.getByText(
                'New class multiclass requirement not met for Bard: CHA 13. Current scores: CHA 11.',
            ),
        ).toBeTruthy();
        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
    });

    it('captures rolled, rerolled, and average hit points before continuing', async () => {
        const randomSpy = jest.spyOn(Math, 'random');

        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));

        await waitFor(() => {
            expect(screen.getByText('Step 1 of 5 - Choose Class')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        expect(String(screen.getByTestId('level-up-hit-points-die-value').props.children)).toBe('d6');
        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(true);

        randomSpy.mockReturnValue(0.5);
        await pressAndFlush(screen.getByTestId('level-up-hit-points-roll-button'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-hit-points-breakdown')).toBeTruthy();
        });

        expect(String(screen.getByTestId('level-up-hit-points-die-value').props.children)).toBe('4');
        expect(screen.getByText('Hit Die Roll')).toBeTruthy();
        expect(screen.getByText('+6')).toBeTruthy();
        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        expect(screen.getByText('Re-roll')).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByTestId('level-up-hit-points-roll-button').props.accessibilityState?.disabled).toBe(false);
        });

        randomSpy.mockReturnValue(0.99);
        await pressAndFlush(screen.getByTestId('level-up-hit-points-roll-button'));

        await waitFor(() => {
            expect(screen.getByText('+8')).toBeTruthy();
        });

        expect(String(screen.getByTestId('level-up-hit-points-die-value').props.children)).toBe('6');

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));

        await waitFor(() => {
            expect(screen.getByText('Average Hit Die')).toBeTruthy();
        });

        expect(String(screen.getByTestId('level-up-hit-points-die-value').props.children)).toBe('4');
        expect(screen.getByText('+6')).toBeTruthy();
    });

    it('applies the minimum-one HP rule for low-CON characters', async () => {
        renderCharacterSheetScreen([LOW_CON_CHARACTER_SHEET_MOCK]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-hit-points-breakdown')).toBeTruthy();
        });

        expect(screen.getByText('Average Hit Die')).toBeTruthy();
        expect(screen.getAllByText('\u22125').length).toBeGreaterThan(0);
        expect(screen.getAllByText('+1').length).toBeGreaterThan(0);
    });

    it('shows the ASI / feat step at eligible levels and preserves both modes while switching', async () => {
        renderCharacterSheetScreen([ASI_ELIGIBLE_CHARACTER_SHEET_MOCK]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - ASI / Feat')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-asi-panel')).toBeTruthy();
        expect(screen.getByText('2 points remaining')).toBeTruthy();
        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(true);
        expect(screen.getByTestId('level-up-asi-decrement-wisdom').props.accessibilityState?.disabled).toBe(true);
        expect(screen.getByTestId('level-up-asi-increment-intelligence').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-asi-increment-wisdom'));
        expect(screen.getByText('1 point remaining')).toBeTruthy();
        expect(screen.getByTestId('level-up-asi-decrement-wisdom').props.accessibilityState?.disabled).toBe(false);

        await pressAndFlush(screen.getByTestId('level-up-asi-increment-charisma'));
        expect(screen.getByText('0 points remaining')).toBeTruthy();
        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        expect(screen.getByTestId('level-up-asi-increment-charisma').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-feat-choice'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-feat-panel')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(true);

        fireEvent.changeText(screen.getByTestId('level-up-feat-name-input'), 'Resilient');
        fireEvent.changeText(
            screen.getByTestId('level-up-feat-description-input'),
            'Gain proficiency in Constitution saving throws and improve concentration checks.',
        );

        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-asi-choice'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-asi-panel')).toBeTruthy();
        });

        expect(screen.getByText('0 points remaining')).toBeTruthy();
        expect(screen.getByTestId('level-up-asi-increase-wisdom').props.children).toBe('+1');
        expect(screen.getByTestId('level-up-asi-increase-charisma').props.children).toBe('+1');

        await pressAndFlush(screen.getByTestId('level-up-feat-choice'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-feat-panel')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-feat-name-input').props.value).toBe('Resilient');
        expect(screen.getByTestId('level-up-feat-description-input').props.value).toContain('Constitution saving throws');
    });

    it('shows subclass selection, then inserts the new-features step after picking the SRD subclass', async () => {
        renderCharacterSheetScreen([SUBCLASS_ELIGIBLE_CHARACTER_SHEET_MOCK]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - Subclass Selection')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-subclass-option-evocation'));

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - Subclass Selection')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 6 - New Class Features')).toBeTruthy();
        });

        expect(screen.getByText('Evocation Savant')).toBeTruthy();
        expect(screen.getByText('Sculpt Spells')).toBeTruthy();
    });

    it('supports the custom subclass branch and custom feature entry', async () => {
        renderCharacterSheetScreen([SUBCLASS_ELIGIBLE_CHARACTER_SHEET_MOCK]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - Subclass Selection')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-subclass-option-custom'));
        fireEvent.changeText(screen.getByTestId('level-up-custom-subclass-name-input'), 'School of Glass');
        fireEvent.changeText(
            screen.getByTestId('level-up-custom-subclass-description-input'),
            'A delicate art of mirrored wards and refractions.',
        );

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - Subclass Selection')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 6 - New Class Features')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-custom-feature-section')).toBeTruthy();
        await pressAndFlush(screen.getByTestId('level-up-add-custom-feature'));
        fireEvent.changeText(screen.getByTestId('level-up-custom-feature-name-0'), 'Prismatic Ward');
        fireEvent.changeText(
            screen.getByTestId('level-up-custom-feature-description-0'),
            'Bend light around yourself to deflect incoming attacks.',
        );

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
    });

    it('replays persisted custom subclass features when selecting an existing custom subclass', async () => {
        renderCharacterSheetScreen([SUBCLASS_ELIGIBLE_CHARACTER_SHEET_MOCK]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - Subclass Selection')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-subclass-option-custom-wizard-subclass-id'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 4 of 6 - New Class Features')).toBeTruthy();
        });

        expect(screen.getByText('Refraction Shield')).toBeTruthy();
        expect(screen.getByText('Bend light to turn aside attacks.')).toBeTruthy();
    });

    it('navigates placeholder steps after picking hit points and switches the final action label', async () => {
        renderCharacterSheetScreen([
            CHARACTERS_MOCK,
            LEVEL_UP_SPELL_SELECTION_QUERY_MOCK,
        ]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));

        await waitFor(() => {
            expect(screen.getByText('Step 1 of 5 - Choose Class')).toBeTruthy();
        });

        expect(screen.getByText('Next')).toBeTruthy();
        expect(screen.getByTestId('level-up-back-button').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - New Class Features')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 5 - Spellcasting Updates')).toBeTruthy();
        });

        await chooseWizardLevelUpSpells();
        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 5 of 5 - Summary')).toBeTruthy();
        });

        expect(screen.getByText('Confirm Level Up')).toBeTruthy();

        await pressAndFlush(screen.getByTestId('level-up-back-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 4 of 5 - Spellcasting Updates')).toBeTruthy();
        });

        expect(screen.getByText('Next')).toBeTruthy();
    });

    it('applies the confirmed level-up into the local draft and closes the sheet', async () => {
        renderCharacterSheetScreen([
            ASI_ELIGIBLE_CHARACTER_SHEET_MOCK,
            LEVEL_UP_SPELL_SELECTION_QUERY_MOCK,
        ]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - ASI / Feat')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-feat-choice'));
        fireEvent.changeText(screen.getByTestId('level-up-feat-name-input'), 'Resilient');
        fireEvent.changeText(
            screen.getByTestId('level-up-feat-description-input'),
            'Gain proficiency in Constitution saving throws and improve concentration checks.',
        );

        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 5 - Spellcasting Updates')).toBeTruthy();
        });

        await chooseWizardLevelUpSpells();
        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 5 of 5 - Summary')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-summary-class-level')).toBeTruthy();
        expect(screen.getByTestId('level-up-summary-hit-points')).toBeTruthy();
        expect(screen.getByTestId('level-up-summary-feat')).toBeTruthy();
        expect(screen.getByText('Confirm Level Up')).toBeTruthy();

        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.queryByTestId('level-up-wizard-sheet')).toBeNull();
        });

        expect(screen.getByTestId('character-sheet-header-subtitle').props.children).toEqual(
            'Level 14\nWizard 12 / Warlock 2 · High Elf · Chaotic Good',
        );
        expect(screen.getByTestId('vitals-hp-current').props.value).toBe('60');
        expect(screen.getByTestId('vitals-hp-max').props.value).toBe('82');

        await openCharacterSheetTab('Features');

        await waitFor(() => {
            expect(screen.getByDisplayValue('Resilient')).toBeTruthy();
        });
    });

    it('persists supported level-up changes when Done saves the draft', async () => {
        renderCharacterSheetScreen([
            ASI_ELIGIBLE_CHARACTER_SHEET_MOCK,
            LEVEL_UP_SPELL_SELECTION_QUERY_MOCK,
            LEVEL_UP_SAVE_MOCK,
            buildLearnSpellMock({
                ...COUNTERSPELL,
            }),
            buildLearnSpellMock({
                ...WALL_OF_FORCE,
            }),
        ]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 5 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 5 - ASI / Feat')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-feat-choice'));
        fireEvent.changeText(screen.getByTestId('level-up-feat-name-input'), 'Resilient');
        fireEvent.changeText(
            screen.getByTestId('level-up-feat-description-input'),
            'Gain proficiency in Constitution saving throws and improve concentration checks.',
        );
        await pressAndFlush(screen.getByTestId('level-up-feat-ability-increase-button'));
        await pressAndFlush(screen.getByTestId('level-up-feat-ability-increase-constitution'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 5 - Spellcasting Updates')).toBeTruthy();
        });

        await chooseWizardLevelUpSpells();
        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 5 of 5 - Summary')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.queryByTestId('level-up-wizard-sheet')).toBeNull();
        });

        await pressAndFlush(screen.getByLabelText('Save character sheet edits'));

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        expect(screen.queryByLabelText('Level up character')).toBeNull();
        expect(screen.getByTestId('character-sheet-header-subtitle').props.children).toEqual(
            'Level 14\nWizard 12 / Warlock 2 · High Elf · Chaotic Good',
        );

        await openCharacterSheetTab('Features');

        await waitFor(() => {
            expect(screen.getByText('Resilient')).toBeTruthy();
        });
    });
});
