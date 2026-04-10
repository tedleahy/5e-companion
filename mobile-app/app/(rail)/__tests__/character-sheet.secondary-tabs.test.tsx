import { screen, waitFor } from '@testing-library/react-native';
import {
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
    openCharacterSheetTab,
} from './character-sheet.test-utils';

describe('CharacterByIdScreen secondary tabs', () => {
    setupCharacterSheetScreenTestHooks();

    it('switches to the gear tab and shows currency, weapons, and inventory', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Gear');

        await waitFor(() => {
            expect(screen.getByText('Currency')).toBeTruthy();
        });

        expect(screen.getByTestId('currency-gp-amount')).toHaveTextContent('847');
        expect(screen.getAllByText('Weapons').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Dagger')).toBeTruthy();
        expect(screen.getByTestId('weapon-stats-attack-1')).toHaveStyle({ alignItems: 'flex-end' });
        expect(screen.getByText('Backpack')).toBeTruthy();
        expect(screen.queryByText('Encumbrance')).toBeNull();
    });

    it('switches to the features tab and shows feature sections', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Features');

        await waitFor(() => {
            expect(screen.getByText('Class Features')).toBeTruthy();
        });

        expect(screen.getByText('Arcane Recovery')).toBeTruthy();
        expect(screen.getByText('Racial Traits')).toBeTruthy();
        expect(screen.getByText('Darkvision')).toBeTruthy();
        expect(screen.getByText('Feats')).toBeTruthy();
        expect(screen.getByText('War Caster')).toBeTruthy();
    });

    it('switches to the traits tab and shows personality and proficiencies', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Traits');

        await waitFor(() => {
            expect(screen.getByText('Personality & Background')).toBeTruthy();
        });

        expect(screen.getByText('Proficiencies & Languages')).toBeTruthy();
        expect(screen.getByText('Common')).toBeTruthy();
    });
});
