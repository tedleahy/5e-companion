import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import CollapsedRail from '@/components/navigation/CollapsedRail';

const mockDispatch = jest.fn();
const mockPush = jest.fn();
const mockUsePathname = jest.fn(() => '/characters');

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => mockUsePathname(),
}));

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');

    return {
        ...actual,
        useNavigation: () => ({ dispatch: mockDispatch }),
    };
});

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('CollapsedRail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/characters');
    });

    it('opens the drawer when avatar is pressed', () => {
        render(<CollapsedRail />);

        fireEvent.press(screen.getByTestId('collapsed-rail-avatar'));

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'OPEN_DRAWER' }));
    });

    it('opens the drawer when expand button is pressed', () => {
        render(<CollapsedRail />);

        fireEvent.press(screen.getByTestId('collapsed-rail-expand'));

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'OPEN_DRAWER' }));
    });

    it('navigates to spells from quick action', () => {
        render(<CollapsedRail />);

        fireEvent.press(screen.getByTestId('collapsed-rail-spells'));

        expect(mockPush).toHaveBeenCalledWith('/spells');
    });

    it('marks the active destination as selected', () => {
        mockUsePathname.mockReturnValue('/spells');

        render(<CollapsedRail />);

        expect(screen.getByLabelText('Open all spells').props.accessibilityState.selected).toBe(true);
        expect(screen.getByLabelText('Open characters').props.accessibilityState.selected).toBe(false);
    });
});
