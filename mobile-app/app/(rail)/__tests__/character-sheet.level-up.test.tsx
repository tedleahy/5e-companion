import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { SAVE_CHARACTER_SHEET } from '@/graphql/characterSheet.operations';
import { CHARACTERS_MOCK, MOCK_CHARACTER, SAVE_CORE_CHARACTER_MOCKS } from './mocks/character-sheet.mocks';
import {
    enableCharacterSheetEditMode,
    openCharacterSheetTab,
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

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
            expect(screen.getByText('Step 1 of 6 - Choose Class')).toBeTruthy();
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
            expect(screen.getByText('Step 1 of 6 - Choose Class')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);

        await pressAndFlush(screen.getByTestId('level-up-back-to-current-class'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-current-class-card')).toBeTruthy();
        });

        expect(screen.getByText('Step 1 of 6 - Choose Class')).toBeTruthy();
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
            expect(screen.getByText('Step 1 of 6 - Choose Class')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
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
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
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
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - ASI / Feat')).toBeTruthy();
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
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - Subclass Selection')).toBeTruthy();
        });

        expect(screen.getByTestId('expandable-lore-read-more')).toBeTruthy();
        await pressAndFlush(screen.getByTestId('expandable-lore-read-more'));
        await waitFor(() => {
            expect(screen.getByTestId('expandable-lore-read-less')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-subclass-option-evocation'));

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 7 - Subclass Selection')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 7 - New Class Features')).toBeTruthy();
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
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - Subclass Selection')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-subclass-option-custom'));
        fireEvent.changeText(screen.getByTestId('level-up-custom-subclass-name-input'), 'School of Glass');

        await waitFor(() => {
            expect(screen.getByText('Step 3 of 7 - Subclass Selection')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 7 - New Class Features')).toBeTruthy();
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

    it('navigates placeholder steps after picking hit points and switches the final action label', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));

        await waitFor(() => {
            expect(screen.getByText('Step 1 of 6 - Choose Class')).toBeTruthy();
        });

        expect(screen.getByText('Next')).toBeTruthy();
        expect(screen.getByTestId('level-up-back-button').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
        });

        expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(true);

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));

        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - New Class Features')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 4 of 6 - Spellcasting Updates')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 5 of 6 - Class Resources')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 6 of 6 - Summary')).toBeTruthy();
        });

        expect(screen.getByText('Confirm Level Up')).toBeTruthy();

        await pressAndFlush(screen.getByTestId('level-up-back-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 5 of 6 - Class Resources')).toBeTruthy();
        });

        expect(screen.getByText('Next')).toBeTruthy();
    });

    it('applies the confirmed level-up into the local draft and closes the sheet', async () => {
        renderCharacterSheetScreen([ASI_ELIGIBLE_CHARACTER_SHEET_MOCK]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - ASI / Feat')).toBeTruthy();
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
            expect(screen.getByText('Step 4 of 6 - Spellcasting Updates')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 5 of 6 - Class Resources')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 6 of 6 - Summary')).toBeTruthy();
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
            LEVEL_UP_SAVE_MOCK,
        ]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Level up character'));
        await pressAndFlush(screen.getByTestId('level-up-next-button'));

        await waitFor(() => {
            expect(screen.getByText('Step 2 of 6 - Hit Points')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-hit-points-average-button'));
        await waitFor(() => {
            expect(screen.getByTestId('level-up-next-button').props.accessibilityState?.disabled).toBe(false);
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 3 of 6 - ASI / Feat')).toBeTruthy();
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
            expect(screen.getByText('Step 4 of 6 - Spellcasting Updates')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 5 of 6 - Class Resources')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('level-up-next-button'));
        await waitFor(() => {
            expect(screen.getByText('Step 6 of 6 - Summary')).toBeTruthy();
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
