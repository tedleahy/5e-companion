import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
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
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        await openCharacterSheetTab('Gear');

        await waitFor(() => {
            expect(screen.getByTestId('currency-gp-amount')).toHaveTextContent('847');
        });

        expect(screen.queryByDisplayValue('900')).toBeNull();
    });
});
