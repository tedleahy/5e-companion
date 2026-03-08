import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import SpellSearch from '../spells';

jest.mock('@/components/navigation/RailScreenShell', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signOut: jest.fn().mockResolvedValue({ error: null }),
            getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
    },
}));

const SEARCH_SPELLS = gql`
    query Spells($filter: SpellFilter) {
        spells(filter: $filter) {
            id
            name
            level
            schoolIndex
            castingTime
            range
            concentration
            ritual
        }
    }
`;

const SPELLS_MOCK: MockLink.MockedResponse = {
    request: { query: SEARCH_SPELLS },
    result: {
        data: {
            spells: [
                {
                    __typename: 'Spell',
                    id: '1',
                    name: 'Fireball',
                    level: 3,
                    schoolIndex: 'evocation',
                    castingTime: '1 action',
                    range: '150 feet',
                    concentration: false,
                    ritual: false,
                },
                {
                    __typename: 'Spell',
                    id: '2',
                    name: 'Magic Missile',
                    level: 1,
                    schoolIndex: 'evocation',
                    castingTime: '1 action',
                    range: '120 feet',
                    concentration: false,
                    ritual: false,
                },
            ],
        },
    },
};

function renderScreen(mocks: MockLink.MockedResponse[] = [SPELLS_MOCK]) {
    return render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <SpellSearch />
            </PaperProvider>
        </MockedProvider>
    );
}

describe('SpellSearch screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading indicator initially', () => {
        renderScreen();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders spell names after loading', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Fireball')).toBeTruthy();
        });
        expect(screen.getByText('Magic Missile')).toBeTruthy();
    });

    it('renders the search bar', () => {
        renderScreen();
        expect(screen.getByPlaceholderText('Search spells...')).toBeTruthy();
    });

    it('renders the filter button', () => {
        renderScreen();
        expect(screen.getByText('Filter')).toBeTruthy();
    });
});
