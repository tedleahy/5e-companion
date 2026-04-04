import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { CHARACTERS_MOCK, MOCK_CHARACTER } from './mocks/character-sheet.mocks';
import {
    enableCharacterSheetEditMode,
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
            expect(screen.getByText('Step 1 of 5 - Choose Class')).toBeTruthy();
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
});
