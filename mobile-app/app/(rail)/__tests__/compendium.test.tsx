import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { PaperProvider } from 'react-native-paper';
import CompendiumScreen from '../compendium';
import { GET_COMPENDIUM_COUNTS } from '@/graphql/compendium.operations';

const mockPush = jest.fn();

jest.mock('@/hooks/useProtectedNavigation', () => ({
    __esModule: true,
    default: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const COUNTS_DATA = {
    compendiumCounts: {
        __typename: 'CompendiumCounts' as const,
        srdClassCount: 12,
        customClassCount: 3,
        srdSubclassCount: 1,
        customSubclassCount: 1,
        spellCount: 2,
    },
};

const COUNTS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_COMPENDIUM_COUNTS },
    result: {
        data: COUNTS_DATA,
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
            expect(screen.getByText('12 SRD · 3 custom')).toBeTruthy();
            expect(screen.getByText('2 available')).toBeTruthy();
        });
    });

    it('refreshes cached counts from the network', async () => {
        const cache = new InMemoryCache();
        cache.writeQuery({
            query: GET_COMPENDIUM_COUNTS,
            data: COUNTS_DATA,
        });
        const refreshedCountsMock: MockLink.MockedResponse = {
            request: { query: GET_COMPENDIUM_COUNTS },
            result: {
                data: {
                    compendiumCounts: {
                        __typename: 'CompendiumCounts',
                        srdClassCount: 12,
                        customClassCount: 3,
                        srdSubclassCount: 1,
                        customSubclassCount: 2,
                        spellCount: 2,
                    },
                },
            },
        };

        render(
            <MockedProvider cache={cache} mocks={[refreshedCountsMock]}>
                <PaperProvider>
                    <CompendiumScreen />
                </PaperProvider>
            </MockedProvider>,
        );

        expect(screen.getByText('1 SRD · 1 custom')).toBeTruthy();
        await waitFor(() => expect(screen.getByText('1 SRD · 2 custom')).toBeTruthy());
    });

    it('opens implemented categories and leaves future categories disabled', async () => {
        renderScreen();

        await waitFor(() => expect(screen.getByText('2 available')).toBeTruthy());

        fireEvent.press(screen.getByTestId('compendium-category-subclasses'));
        fireEvent.press(screen.getByTestId('compendium-category-spells'));
        fireEvent.press(screen.getByTestId('compendium-category-classes'));

        await waitFor(() => {
            expect(mockPush.mock.calls).toEqual([
                ['/(rail)/compendium/subclasses'],
                ['/(rail)/compendium/spells'],
                ['/(rail)/compendium/classes'],
            ]);
        });
    });
});
