import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    CHARACTERS_MOCK,
    TOGGLE_MOCK,
    UPDATE_DEATH_SAVES_MOCK,
} from './mocks/character-sheet.mocks';
import {
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

describe('CharacterByIdScreen core tab', () => {
    setupCharacterSheetScreenTestHooks();

    it('renders character identity details after loading', async () => {
        renderCharacterSheetScreen();

        await waitFor(() => {
            expect(screen.getByText('Vaelindra')).toBeTruthy();
        });

        expect(screen.getByText(/Level 12/)).toBeTruthy();
        expect(screen.getByText(/Wizard 10 \/ Warlock 2/)).toBeTruthy();
    });

    it('renders vitals on the default core tab', async () => {
        renderCharacterSheetScreen();

        await waitFor(() => {
            expect(screen.getByText('Hit Points')).toBeTruthy();
        });

        expect(screen.getByText('Armour Class')).toBeTruthy();
        expect(screen.getByText('Speed')).toBeTruthy();
    });

    it('renders death saves and passive senses', async () => {
        renderCharacterSheetScreen();

        await waitFor(() => {
            expect(screen.getByText('Death Saves')).toBeTruthy();
        });

        expect(screen.getByText('Passive Senses')).toBeTruthy();
        expect(screen.getByLabelText('Death save success 1')).toBeTruthy();
        expect(screen.getByLabelText('Death save failure 1')).toBeTruthy();
    });

    it('optimistically fills success circles when toggled', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, UPDATE_DEATH_SAVES_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Death save success 2')).toBeTruthy();
        });

        const secondCircleBefore = screen.getByTestId('death-save-success-circle-2');
        expect(secondCircleBefore).toHaveStyle({ borderColor: fantasyTokens.colors.divider });

        await pressAndFlush(screen.getByLabelText('Death save success 2'));

        await waitFor(() => {
            const secondCircleAfter = screen.getByTestId('death-save-success-circle-2');
            expect(secondCircleAfter).toHaveStyle({
                backgroundColor: fantasyTokens.colors.greenDark,
                borderColor: fantasyTokens.colors.greenDark,
            });
        });
    });

    it('renders temp HP and the empty conditions message', async () => {
        renderCharacterSheetScreen();

        await waitFor(() => {
            expect(screen.getByText('+2 temp')).toBeTruthy();
        });

        expect(screen.getByText('No conditions')).toBeTruthy();
    });

    it('renders the tab bar with core active by default', async () => {
        renderCharacterSheetScreen();

        await waitFor(() => {
            expect(screen.getByText('Core')).toBeTruthy();
        });

        expect(screen.getByText('Abilities')).toBeTruthy();
        expect(screen.getByText('Spells')).toBeTruthy();
        expect(screen.getByText('Gear')).toBeTruthy();
        expect(screen.getByText('Features')).toBeTruthy();
    });

    it('renders and updates the inspiration toggle optimistically', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, TOGGLE_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Toggle inspiration')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Toggle inspiration'));

        await waitFor(() => {
            expect(screen.getByText('Inspired')).toBeTruthy();
        });
    });
});
