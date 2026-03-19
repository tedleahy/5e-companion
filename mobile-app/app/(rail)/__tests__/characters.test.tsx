import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CharactersScreen from '../characters';
import { GET_CURRENT_USER_CHARACTER_ROSTER } from '@/graphql/characterSheet.operations';
import { supabase } from '@/lib/supabase';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: jest.fn(),
    }),
}));

jest.mock('@apollo/client/react', () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('@/components/navigation/RailScreenShell', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/characters/EmptyState', () => {
    const { Text } = jest.requireActual('react-native');

    /**
     * Minimal empty-state mock used to assert conditional rendering behaviour.
     */
    function EmptyStateMock() {
        return <Text>Empty state rendered</Text>;
    }

    return {
        __esModule: true,
        default: EmptyStateMock,
    };
});

jest.mock('@/components/characters/CharacterCard', () => {
    const { Pressable, Text } = jest.requireActual('react-native');

    /**
     * Minimal character-card mock used to assert roster behaviours.
     */
    function CharacterCardMock({
        character,
        onPress,
    }: {
        character: { id: string; name: string };
        onPress: (id: string) => void;
    }) {
        return (
            <Pressable onPress={() => onPress(character.id)} testID={`character-card-${character.id}`}>
                <Text>{character.name}</Text>
            </Pressable>
        );
    }

    return {
        __esModule: true,
        default: CharacterCardMock,
    };
});

/**
 * Shared character row used in list-state tests.
 */
const LIST_CHARACTER = {
    id: 'char-1',
    name: 'Vaelindra Stormveil',
    race: 'High Elf',
    class: 'Wizard',
    subclass: 'Abjuration',
    level: 12,
    spellAttackBonus: 10,
    initiative: 5,
    ac: 17,
    conditions: ['Concentrating'],
    weapons: [] as { attackBonus: string }[],
    stats: {
        hp: {
            current: 54,
            max: 76,
        },
    },
};

/**
 * Renders the characters route and flushes pending microtasks from `useEffect`.
 */
async function renderScreenAndFlush() {
    render(<CharactersScreen />);
    await act(async () => {
        await Promise.resolve();
    });
}

describe('CharactersScreen', () => {
    const mockGetSession = supabase.auth.getSession as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: 'token-123' } },
            error: null,
        });
        mockUseQuery.mockReturnValue({
            data: { currentUserCharacters: [] },
            loading: false,
            error: undefined,
        });
    });

    it('shows a loading placeholder while session validation is in progress', async () => {
        let resolveSession: (value: { data: { session: { access_token: string } | null }; error: null }) => void = () => {};
        const pendingSession = new Promise<{ data: { session: { access_token: string } | null }; error: null }>((resolve) => {
            resolveSession = resolve;
        });
        mockGetSession.mockReturnValueOnce(pendingSession);

        render(<CharactersScreen />);

        expect(screen.getByText('Checking your adventurer records...')).toBeTruthy();

        await act(async () => {
            resolveSession({ data: { session: { access_token: 'token-123' } }, error: null });
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(screen.getByText('Empty state rendered')).toBeTruthy();
        });
    });

    it('redirects unauthenticated users to sign-in', async () => {
        mockGetSession.mockResolvedValue({
            data: { session: null },
            error: null,
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
        });
        expect(screen.queryByText('Empty state rendered')).toBeNull();
    });

    it('renders the empty state when there are no characters', async () => {
        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('Empty state rendered')).toBeTruthy();
        });
        expect(mockUseQuery).toHaveBeenCalledWith(
            GET_CURRENT_USER_CHARACTER_ROSTER,
            expect.objectContaining({
                fetchPolicy: 'cache-and-network',
                notifyOnNetworkStatusChange: true,
            }),
        );
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('renders the character roster when characters are returned', async () => {
        mockUseQuery.mockReturnValue({
            data: { currentUserCharacters: [LIST_CHARACTER] },
            loading: false,
            error: undefined,
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('My Characters')).toBeTruthy();
        });
        expect(screen.getByText('Vaelindra Stormveil')).toBeTruthy();
        expect(screen.queryByText('Empty state rendered')).toBeNull();
    });

    it('opens the dynamic character route when a card is tapped', async () => {
        mockUseQuery.mockReturnValue({
            data: { currentUserCharacters: [LIST_CHARACTER] },
            loading: false,
            error: undefined,
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByTestId('character-card-char-1')).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId('character-card-char-1'));

        expect(mockPush).toHaveBeenCalledWith('/character/char-1');
    });

    it('opens character creation when the FAB is tapped', async () => {
        mockUseQuery.mockReturnValue({
            data: { currentUserCharacters: [LIST_CHARACTER] },
            loading: false,
            error: undefined,
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByTestId('characters-list-fab')).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId('characters-list-fab'));

        expect(mockPush).toHaveBeenCalledWith('/characters/create');
    });

    it('redirects to sign-in on unauthenticated GraphQL errors', async () => {
        mockUseQuery.mockReturnValue({
            data: undefined,
            loading: false,
            error: new Error('UNAUTHENTICATED'),
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
        });
    });
});
