import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import ExpandedDrawer from '@/components/navigation/ExpandedDrawer';
import { supabase } from '@/lib/supabase';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockUsePathname = jest.fn(() => '/characters');
const mockCloseDrawer = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: jest.fn(),
    }),
    usePathname: () => mockUsePathname(),
}));

jest.mock('@/hooks/useProtectedNavigation', () => ({
    __esModule: true,
    default: () => ({
        push: mockPush,
        replace: mockReplace,
        back: jest.fn(),
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

/**
 * Builds minimal drawer props required by the custom drawer component tests.
 */
function buildDrawerProps(): DrawerContentComponentProps {
    return {
        state: {} as DrawerContentComponentProps['state'],
        navigation: {
            closeDrawer: mockCloseDrawer,
        } as unknown as DrawerContentComponentProps['navigation'],
        descriptors: {} as DrawerContentComponentProps['descriptors'],
    };
}

describe('ExpandedDrawer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/characters');
    });

    it('renders expected drawer menu items', () => {
        render(<ExpandedDrawer {...buildDrawerProps()} />);

        expect(screen.getByText('Characters')).toBeTruthy();
        expect(screen.getByText('All Spells')).toBeTruthy();
        expect(screen.getByText('Settings')).toBeTruthy();
        expect(screen.getByText('Sign Out')).toBeTruthy();
        expect(screen.getByText('Collapse')).toBeTruthy();
    });

    it('highlights the active destination', () => {
        mockUsePathname.mockReturnValue('/spells');

        render(<ExpandedDrawer {...buildDrawerProps()} />);

        expect(screen.getByLabelText('Open All Spells').props.accessibilityState.selected).toBe(true);
        expect(screen.getByLabelText('Open Characters').props.accessibilityState.selected).toBe(false);
    });

    it('navigates to settings and closes the drawer', async () => {
        render(<ExpandedDrawer {...buildDrawerProps()} />);

        fireEvent.press(screen.getByTestId('drawer-item-settings'));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/settings');
            expect(mockCloseDrawer).toHaveBeenCalled();
        });
    });

    it('signs out and redirects to sign-in', async () => {
        const signOutSpy = jest.spyOn(supabase.auth, 'signOut');
        signOutSpy.mockResolvedValue({ error: null });

        render(<ExpandedDrawer {...buildDrawerProps()} />);

        fireEvent.press(screen.getByTestId('drawer-sign-out'));

        await waitFor(() => {
            expect(signOutSpy).toHaveBeenCalled();
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
        });
        expect(mockCloseDrawer).toHaveBeenCalled();
    });

    it('collapses the drawer when collapse is pressed', () => {
        render(<ExpandedDrawer {...buildDrawerProps()} />);

        fireEvent.press(screen.getByTestId('drawer-collapse'));

        expect(mockCloseDrawer).toHaveBeenCalled();
    });
});
