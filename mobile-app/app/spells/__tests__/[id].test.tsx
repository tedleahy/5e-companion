import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import SpellDetails from '../[id]';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({ id: 'spell-1' }),
}));

const GET_SPELL = gql`
    query Spell($id: ID!) {
        spell(id: $id) {
            id
            name
            level
            schoolIndex
            classIndexes
            description
            higherLevel
            range
            components
            material
            ritual
            duration
            concentration
            castingTime
        }
    }
`;

const SPELL_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL, variables: { id: 'spell-1' } },
    result: {
        data: {
            spell: {
                __typename: 'Spell',
                id: 'spell-1',
                name: 'Fireball',
                level: 3,
                schoolIndex: 'evocation',
                classIndexes: ['wizard', 'sorcerer'],
                description: ['A bright streak flashes from your pointing finger.'],
                higherLevel: ['When you cast this spell using a spell slot of 4th level or higher...'],
                range: '150 feet',
                components: ['V', 'S', 'M'],
                material: 'A tiny ball of bat guano and sulfur',
                ritual: false,
                duration: 'Instantaneous',
                concentration: false,
                castingTime: '1 action',
            },
        },
    },
};

const SPELL_NOT_FOUND_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL, variables: { id: 'spell-1' } },
    result: { data: { spell: null } },
};

function renderScreen(mocks: MockLink.MockedResponse[] = [SPELL_MOCK]) {
    return render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <SpellDetails />
            </PaperProvider>
        </MockedProvider>
    );
}

describe('SpellDetails screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading indicator initially', () => {
        renderScreen();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders spell name after loading', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Fireball')).toBeTruthy();
        });
    });

    it('renders the school and level label', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('3rd level Evocation')).toBeTruthy();
        });
    });

    it('renders spell details', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('1 action')).toBeTruthy();
        });
        expect(screen.getByText('150 feet')).toBeTruthy();
        expect(screen.getByText('Instantaneous')).toBeTruthy();
    });

    it('renders components with material', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('V, S, M (A tiny ball of bat guano and sulfur)')).toBeTruthy();
        });
    });

    it('renders the description', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('A bright streak flashes from your pointing finger.')).toBeTruthy();
        });
    });

    it('renders higher level text', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('At Higher Levels')).toBeTruthy();
        });
    });

    it('shows "Spell not found" when spell is null', async () => {
        renderScreen([SPELL_NOT_FOUND_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('Spell not found.')).toBeTruthy();
        });
    });
});
