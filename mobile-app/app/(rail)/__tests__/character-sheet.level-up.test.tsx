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
});
