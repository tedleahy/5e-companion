import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SignIn from '../sign-in';
import { supabase } from '@/lib/supabase';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

function renderScreen() {
    return render(
        <PaperProvider>
            <SignIn />
        </PaperProvider>
    );
}

describe('SignIn', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the sign-in form', () => {
        renderScreen();
        expect(screen.getByText('Sign in')).toBeTruthy();
        expect(screen.getByText('Sign into your account')).toBeTruthy();
    });

    it('renders email and password fields', () => {
        renderScreen();
        expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Password').length).toBeGreaterThan(0);
    });

    it('renders the sign-in button', () => {
        renderScreen();
        expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('renders a link to sign up', () => {
        renderScreen();
        expect(screen.getByText('Forge a new account')).toBeTruthy();
    });

    it('navigates to sign-up when link is pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Forge a new account'));
        expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up');
    });

    it('shows error on invalid login', async () => {
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: {}, error: null });
        (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null } });

        renderScreen();

        const inputs = screen.getAllByDisplayValue('');
        fireEvent.changeText(inputs[0], 'test@example.com');
        fireEvent.changeText(inputs[1], 'password123');

        fireEvent.press(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password. Please try again.')).toBeTruthy();
        });
    });

    it('redirects to home on successful login', async () => {
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: {}, error: null });
        (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
            data: { session: { access_token: 'token123' } },
        });

        renderScreen();

        const inputs = screen.getAllByDisplayValue('');
        fireEvent.changeText(inputs[0], 'test@example.com');
        fireEvent.changeText(inputs[1], 'password123');

        fireEvent.press(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/');
        });
    });
});
