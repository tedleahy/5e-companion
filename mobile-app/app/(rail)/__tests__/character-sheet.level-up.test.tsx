import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import {
    enableCharacterSheetEditMode,
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

describe('CharacterByIdScreen level-up wizard shell', () => {
    setupCharacterSheetScreenTestHooks();

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

    it('navigates placeholder steps and switches the final action label', async () => {
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
