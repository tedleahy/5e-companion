import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import CompendiumDetailBackBar from '@/components/compendium/compendium-detail-back-bar';
import { fantasyTokens } from '@/theme/fantasyTheme';

const LONG_NAME = 'Warden of the Everlasting Twilight Grove';

describe('CompendiumDetailBackBar', () => {
    it('renders the title and returns through the back control', () => {
        const onBack = jest.fn();
        render(
            <CompendiumDetailBackBar
                title="Barbarian"
                accessibilityLabel="Back to all classes"
                onBack={onBack}
                testID="detail-back"
            />,
        );

        expect(screen.getByText('Barbarian')).toBeTruthy();
        fireEvent.press(screen.getByTestId('detail-back'));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('still renders the control when no title is known yet', () => {
        render(
            <CompendiumDetailBackBar
                title={null}
                accessibilityLabel="Back to all classes"
                onBack={jest.fn()}
                testID="detail-back"
            />,
        );

        expect(screen.getByTestId('detail-back')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Back to all classes' })).toBeTruthy();
    });

    it('gives long names a second line instead of clipping them', () => {
        render(
            <CompendiumDetailBackBar
                title={LONG_NAME}
                accessibilityLabel="Back to all classes"
                onBack={jest.fn()}
            />,
        );

        const title = screen.getByText(LONG_NAME);
        expect(title.props.numberOfLines).toBeGreaterThanOrEqual(2);
    });

    it('bleeds past its container padding, defaulting to the shared detail padding', () => {
        const { rerender } = render(
            <CompendiumDetailBackBar
                title="Barbarian"
                accessibilityLabel="Back to all classes"
                onBack={jest.fn()}
                testID="detail-back"
            />,
        );

        const barStyle = () => StyleSheet.flatten(screen.root.props.style);
        expect(barStyle().marginHorizontal).toBe(-fantasyTokens.spacing.lg);
        expect(barStyle().marginTop).toBe(-fantasyTokens.spacing.lg);

        rerender(
            <CompendiumDetailBackBar
                title="Barbarian"
                accessibilityLabel="Back to all classes"
                onBack={jest.fn()}
                bleed={fantasyTokens.spacing.md}
                testID="detail-back"
            />,
        );

        expect(barStyle().marginHorizontal).toBe(-fantasyTokens.spacing.md);
        expect(barStyle().marginTop).toBe(-fantasyTokens.spacing.md);
    });
});
