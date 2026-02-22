import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import CharactersScreen from '../index';
import { supabase } from '@/lib/supabase';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: mockReplace,
        back: jest.fn(),
    }),
}));

jest.mock('@/components/characters/EmptyState', () => {
    const { Text } = jest.requireActual('react-native');

    /**
     * Minimal empty-state mock used to assert authenticated rendering behaviour.
     */
    function EmptyStateMock() {
        return <Text>Empty state rendered</Text>;
    }

    return {
        __esModule: true,
        default: EmptyStateMock,
    };
});

describe('CharactersScreen', () => {
    const mockGetSession = supabase.auth.getSession as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: 'token-123' } },
            error: null,
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

        resolveSession({ data: { session: { access_token: 'token-123' } }, error: null });

        await waitFor(() => {
            expect(screen.getByText('Empty state rendered')).toBeTruthy();
        });
    });

    it('redirects unauthenticated users to sign-in', async () => {
        mockGetSession.mockResolvedValue({
            data: { session: null },
            error: null,
        });

        render(<CharactersScreen />);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
        });
        expect(screen.queryByText('Empty state rendered')).toBeNull();
    });

    it('renders the empty state for authenticated users', async () => {
        render(<CharactersScreen />);

        await waitFor(() => {
            expect(screen.getByText('Empty state rendered')).toBeTruthy();
        });
        expect(mockReplace).not.toHaveBeenCalled();
    });
});
