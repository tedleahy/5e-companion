import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { PaperProvider } from 'react-native-paper';
import CompendiumScreen, { GET_COMPENDIUM_COUNTS } from '../compendium';

const mockPush = jest.fn();

jest.mock('@/hooks/useProtectedNavigation', () => ({
    __esModule: true,
    default: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const COUNTS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_COMPENDIUM_COUNTS },
    result: {
        data: {
            compendiumCounts: {
                __typename: 'CompendiumCounts',
                srdSubclassCount: 1,
                customSubclassCount: 1,
                spellCount: 2,
            },
        },
    },
};

/** Renders the Compendium hub with representative category counts. */
function renderScreen() {
    return render(
        <MockedProvider mocks={[COUNTS_MOCK]}>
            <PaperProvider>
                <CompendiumScreen />
            </PaperProvider>
        </MockedProvider>,
    );
}

describe('Compendium screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders eight categories with Traits embedded rather than standalone', async () => {
        renderScreen();

        expect(screen.getAllByTestId(/^compendium-category-/)).toHaveLength(8);
        expect(screen.queryByText('Traits')).toBeNull();
        expect(screen.getByText('Subclasses')).toBeTruthy();
        expect(screen.getByText('Spells')).toBeTruthy();
        await waitFor(() => expect(screen.getByText('2 available')).toBeTruthy());
    });

    it('shows live counts for implemented categories', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('1 SRD · 1 custom')).toBeTruthy();
            expect(screen.getByText('2 available')).toBeTruthy();
        });
    });

    it('opens both implemented categories and leaves future categories disabled', async () => {
        renderScreen();

        await waitFor(() => expect(screen.getByText('2 available')).toBeTruthy());

        fireEvent.press(screen.getByTestId('compendium-category-subclasses'));
        fireEvent.press(screen.getByTestId('compendium-category-spells'));
        fireEvent.press(screen.getByTestId('compendium-category-classes'));

        await waitFor(() => {
            expect(mockPush.mock.calls).toEqual([
                ['/compendium/subclasses'],
                ['/compendium/spells'],
            ]);
        });
    });
});
