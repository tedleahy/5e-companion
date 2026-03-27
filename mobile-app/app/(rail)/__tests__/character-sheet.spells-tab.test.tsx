import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import {
    CHARACTERS_MOCK,
    PREPARE_BIGBYS_HAND_MOCK,
    TOGGLE_SLOT_LEVEL_1_MOCK,
    UNPREPARE_FIREBALL_MOCK,
} from './mocks/character-sheet.mocks';
import {
    ADD_SPELL_LIST_MOCK,
    openCharacterSheetTab,
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

describe('CharacterByIdScreen spells tab', () => {
    setupCharacterSheetScreenTestHooks();

    it('switches to the spells tab and shows spellbook content', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Spells');

        await waitFor(() => {
            expect(screen.getByText('Spellcasting')).toBeTruthy();
        });

        expect(screen.getByText('Fireball')).toBeTruthy();
        expect(screen.getByText('Detect Magic')).toBeTruthy();
        expect(screen.getByText('All (3)')).toBeTruthy();
        expect(screen.getByText('Prepared (2)')).toBeTruthy();
        expect(screen.getByText('Unprepared (1)')).toBeTruthy();
        expect(screen.getAllByText('+9').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Pact Magic').length).toBeGreaterThanOrEqual(1);
    });

    it('updates spell slot count optimistically when a slot pip is pressed', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, TOGGLE_SLOT_LEVEL_1_MOCK]);

        await openCharacterSheetTab('Spells');

        await waitFor(() => {
            expect(screen.getByText('3 / 4')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('spell-slot-pip-1-1'));

        await waitFor(() => {
            expect(screen.getByText('2 / 4')).toBeTruthy();
        });
    });

    it('toggles a prepared spell to unprepared', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, UNPREPARE_FIREBALL_MOCK]);

        await openCharacterSheetTab('Spells');

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-fireball')).toHaveStyle({
                opacity: 1,
            });
        });

        fireEvent.press(screen.getByTestId('character-spell-row-spell-fireball'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepare-spell-fireball')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('character-spell-prepare-spell-fireball'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-fireball')).toHaveStyle({
                opacity: 0,
            });
            expect(screen.getByText('Prepared (1)')).toBeTruthy();
            expect(screen.getByText('Unprepared (2)')).toBeTruthy();
        });
    });

    it('toggles an unprepared spell to prepared', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, PREPARE_BIGBYS_HAND_MOCK]);

        await openCharacterSheetTab('Spells');

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-bigbys-hand')).toHaveStyle({
                opacity: 0,
            });
        });

        fireEvent.press(screen.getByTestId('character-spell-row-spell-bigbys-hand'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepare-spell-bigbys-hand')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('character-spell-prepare-spell-bigbys-hand'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-bigbys-hand')).toHaveStyle({
                opacity: 1,
            });
        });
    });

    it('disables pager swiping while the add spell sheet is open', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, ADD_SPELL_LIST_MOCK]);

        await openCharacterSheetTab('Spells');

        await waitFor(() => {
            expect(screen.getByLabelText('Add spell')).toBeTruthy();
        });

        expect(screen.getByTestId('character-sheet-pager').props.scrollEnabled).toBe(true);

        fireEvent.press(screen.getByLabelText('Add spell'));

        await waitFor(() => {
            expect(screen.getByText('Add Spell')).toBeTruthy();
        });

        expect(screen.getByTestId('character-sheet-pager').props.scrollEnabled).toBe(false);
    });
});
