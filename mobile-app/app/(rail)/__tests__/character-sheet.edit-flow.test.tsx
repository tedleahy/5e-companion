import { fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import {
    CHARACTERS_MOCK,
    SAVE_CHARACTER_SHEET_FAILURE_MOCK,
    SAVE_CORE_CHARACTER_MOCKS,
} from './mocks/character-sheet.mocks';
import {
    enableCharacterSheetEditMode,
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
    openCharacterSheetTab,
} from './character-sheet.test-utils';
import { SAVE_CHARACTER_SHEET } from '@/graphql/characterSheet.operations';

/**
 * Returns the most recently registered hardware-back handler from the mocked BackHandler.
 */
function latestHardwareBackHandler(): () => boolean {
    const addEventListenerMock = BackHandler.addEventListener as unknown as jest.Mock;
    const lastCallIndex = addEventListenerMock.mock.calls.length - 1;
    const handler = addEventListenerMock.mock.calls[lastCallIndex]?.[1] as (() => boolean) | undefined;

    if (!handler) {
        throw new Error('Expected hardware back handler to be registered');
    }

    return handler;
}

describe('CharacterByIdScreen edit flow', () => {
    setupCharacterSheetScreenTestHooks();

    it('shows edit controls and banner while editing', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();

        expect(screen.getByLabelText('Cancel character sheet edits')).toBeTruthy();
        expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();
        expect(screen.getByText('Editing — tap any highlighted field to change it')).toBeTruthy();
    });

    it('preserves edit mode and shows error snackbar when save fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        renderCharacterSheetScreen([
            CHARACTERS_MOCK,
            SAVE_CHARACTER_SHEET_FAILURE_MOCK,
            ...SAVE_CORE_CHARACTER_MOCKS.filter((mock) => mock.request.query !== SAVE_CHARACTER_SHEET),
        ]);

        await enableCharacterSheetEditMode();
        await pressAndFlush(screen.getByLabelText('Save character sheet edits'));

        await waitFor(() => {
            expect(screen.getByText(/Failed to save/)).toBeTruthy();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to save core character sheet edits',
            expect.any(Error),
        );
        expect(screen.queryByText('Saved')).toBeNull();
        expect(screen.getByLabelText('Cancel character sheet edits')).toBeTruthy();
        expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();

        consoleErrorSpy.mockRestore();
    });

    it('discards gear draft changes on Cancel', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await openCharacterSheetTab('Gear');

        await waitFor(() => {
            expect(screen.getByTestId('currency-gp-amount')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByTestId('currency-gp-amount'), '900');
        fireEvent.press(screen.getByLabelText('Add weapons'));
        fireEvent.press(screen.getByLabelText('Add backpack'));

        await waitFor(() => {
            expect(screen.getByDisplayValue('900')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Cancel character sheet edits'));

        await waitFor(() => {
            expect(screen.getByText('Discard changes?')).toBeTruthy();
        });

        expect(screen.getByText('You have unsaved changes to your character sheet. Are you sure you want to discard them?')).toBeTruthy();
        expect(screen.getByLabelText('Keep Editing')).toBeTruthy();
        expect(screen.getByLabelText('Discard')).toBeTruthy();

        await pressAndFlush(screen.getByLabelText('Discard'));

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        await openCharacterSheetTab('Gear');

        await waitFor(() => {
            expect(screen.getByTestId('currency-gp-amount')).toHaveTextContent('847');
        });

        expect(screen.queryByDisplayValue('900')).toBeNull();
    });

    it('exits edit mode immediately when Cancel pressed with no changes', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();

        fireEvent.press(screen.getByLabelText('Cancel character sheet edits'));

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        expect(screen.queryByText('Discard changes?')).toBeNull();
    });

    it('shows discard confirmation when hardware back button pressed with unsaved changes', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await openCharacterSheetTab('Gear');

        await waitFor(() => {
            expect(screen.getByTestId('currency-gp-amount')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByTestId('currency-gp-amount'), '900');

        await waitFor(() => {
            expect(screen.getByDisplayValue('900')).toBeTruthy();
        });

        // Simulate hardware back button press
        const handler = latestHardwareBackHandler();

        // Call the handler (simulating back button press)
        let shouldPreventDefault = false;

        await act(async () => {
            shouldPreventDefault = handler();
            await Promise.resolve();
        });

        // Should return true to prevent default back action
        expect(shouldPreventDefault).toBe(true);

        // Should show discard confirmation
        expect(screen.getByText('Discard changes?')).toBeTruthy();
        expect(screen.getByText('You have unsaved changes to your character sheet. Are you sure you want to discard them?')).toBeTruthy();
        expect(screen.getByLabelText('Keep Editing')).toBeTruthy();
        expect(screen.getByLabelText('Discard')).toBeTruthy();
    });

    it('allows hardware back button without confirmation when no unsaved changes', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();

        // Simulate hardware back button press
        const handler = latestHardwareBackHandler();

        // Call the handler (simulating back button press)
        const shouldPreventDefault = handler();

        // Should return false to allow default back action (no changes)
        expect(shouldPreventDefault).toBe(false);

        // Should not show discard confirmation
        expect(screen.queryByText('Discard changes?')).toBeNull();
    });
});
