import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react-native';
import CompendiumLayout from '../compendium/_layout';

jest.mock('expo-router', () => {
    const { View: MockView } = jest.requireActual('react-native');

    return {
        Stack: () => <MockView testID="compendium-stack" />,
    };
});

jest.mock('@/components/navigation/RailScreenShell', () => {
    const { View: MockView } = jest.requireActual('react-native');

    return {
        __esModule: true,
        default: ({ children }: { children: ReactNode }) => (
            <MockView testID="compendium-rail-shell">{children}</MockView>
        ),
    };
});

describe('CompendiumLayout', () => {
    it('applies the shared rail shell once around every category route', () => {
        render(<CompendiumLayout />);

        expect(
            within(screen.getByTestId('compendium-rail-shell')).getByTestId('compendium-stack'),
        ).toBeTruthy();
    });
});
