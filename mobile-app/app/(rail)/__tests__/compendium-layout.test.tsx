import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react-native';
import CompendiumLayout, { unstable_settings } from '../compendium/_layout';

jest.mock('expo-router', () => {
    const { View: MockView } = jest.requireActual('react-native');

    function MockStack({ children }: { children?: ReactNode }) {
        return <MockView testID="compendium-stack">{children}</MockView>;
    }

    MockStack.Screen = ({ name }: { name: string }) => (
        <MockView testID={`compendium-stack-screen-${name}`} />
    );

    return {
        Stack: MockStack,
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
    it('anchors the nested stack on the hub index', () => {
        expect(unstable_settings.initialRouteName).toBe('index');
    });

    it('applies the shared rail shell once around every category route', () => {
        render(<CompendiumLayout />);

        const shell = screen.getByTestId('compendium-rail-shell');
        const stack = within(shell).getByTestId('compendium-stack');

        expect(within(stack).getByTestId('compendium-stack-screen-index')).toBeTruthy();
        expect(within(stack).getByTestId('compendium-stack-screen-classes')).toBeTruthy();
        expect(within(stack).getByTestId('compendium-stack-screen-subclasses')).toBeTruthy();
        expect(within(stack).getByTestId('compendium-stack-screen-spells')).toBeTruthy();
    });
});
