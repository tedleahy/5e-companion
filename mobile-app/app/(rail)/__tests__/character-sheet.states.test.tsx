import { screen, waitFor } from '@testing-library/react-native';
import {
    EMPTY_MOCK,
    ERROR_MOCK,
    NOT_FOUND_MOCK,
} from './mocks/character-sheet.mocks';
import {
    mockUseLocalSearchParams,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

describe('CharacterByIdScreen screen states', () => {
    setupCharacterSheetScreenTestHooks();

    it('shows a loading indicator initially', async () => {
        renderCharacterSheetScreen();

        expect(screen.getByRole('progressbar')).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByText('Vaelindra')).toBeTruthy();
        });
    });

    it('shows empty state when no characters exist', async () => {
        renderCharacterSheetScreen([EMPTY_MOCK]);

        await waitFor(() => {
            expect(screen.getByText('No characters yet.')).toBeTruthy();
        });
    });

    it('shows a not-found state when the roster exists but the character does not', async () => {
        renderCharacterSheetScreen([NOT_FOUND_MOCK]);

        await waitFor(() => {
            expect(screen.getByText('Character not found.')).toBeTruthy();
        });
    });

    it('shows an invalid-link state when the route id is blank', async () => {
        mockUseLocalSearchParams.mockReturnValue({ id: '   ' });

        renderCharacterSheetScreen([]);

        await waitFor(() => {
            expect(screen.getByText('Invalid character link.')).toBeTruthy();
        });
    });

    it('shows error state on network error', async () => {
        renderCharacterSheetScreen([ERROR_MOCK]);

        await waitFor(() => {
            expect(screen.getByText('Failed to load character.')).toBeTruthy();
        });
    });
});
