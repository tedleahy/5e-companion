import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DrawerActions } from '@react-navigation/native';
import { Text } from 'react-native';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import { fantasyTokens } from '@/theme/fantasyTheme';

const mockDispatch = jest.fn();
const originalTabletBreakpoint = fantasyTokens.breakpoints.tablet;
const MockMockText = Text;

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');

    return {
        ...actual,
        useNavigation: () => ({ dispatch: mockDispatch }),
    };
});

jest.mock('@/components/navigation/CollapsedRail', () => ({
    __esModule: true,
    default: () => <MockMockText>Collapsed rail</MockMockText>,
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('RailScreenShell', () => {
    afterEach(() => {
        fantasyTokens.breakpoints.tablet = originalTabletBreakpoint;
        jest.clearAllMocks();
    });

    it('renders the persistent rail when viewport is above the breakpoint', () => {
        fantasyTokens.breakpoints.tablet = 0;

        render(
            <RailScreenShell>
                <Text>Screen content</Text>
            </RailScreenShell>
        );

        expect(screen.getByText('Collapsed rail')).toBeTruthy();
        expect(screen.queryByTestId('rail-shell-menu')).toBeNull();
    });

    it('renders a hamburger trigger when viewport is below the breakpoint', () => {
        fantasyTokens.breakpoints.tablet = Number.MAX_SAFE_INTEGER;

        render(
            <RailScreenShell>
                <Text>Screen content</Text>
            </RailScreenShell>
        );

        expect(screen.queryByText('Collapsed rail')).toBeNull();
        expect(screen.getByTestId('rail-shell-menu')).toBeTruthy();
    });

    it('opens the drawer when the hamburger trigger is pressed', () => {
        fantasyTokens.breakpoints.tablet = Number.MAX_SAFE_INTEGER;

        render(
            <RailScreenShell>
                <Text>Screen content</Text>
            </RailScreenShell>
        );

        fireEvent.press(screen.getByTestId('rail-shell-menu'));

        expect(mockDispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());
    });
});
