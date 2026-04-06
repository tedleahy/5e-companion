import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import NumericStepper from '@/components/wizard/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Renders UI with the Paper provider used by the app.
 */
function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('NumericStepper', () => {
    it('fires increment and decrement handlers when enabled', () => {
        const onDecrease = jest.fn();
        const onIncrease = jest.fn();

        renderWithPaper(
            <NumericStepper
                value={3}
                decrementTestID="stepper-decrement"
                incrementTestID="stepper-increment"
                onDecrease={onDecrease}
                onIncrease={onIncrease}
            />,
        );

        fireEvent.press(screen.getByTestId('stepper-decrement'));
        fireEvent.press(screen.getByTestId('stepper-increment'));

        expect(onDecrease).toHaveBeenCalledTimes(1);
        expect(onIncrease).toHaveBeenCalledTimes(1);
    });

    it('marks controls disabled and blocks presses when disabled', () => {
        const onDecrease = jest.fn();
        const onIncrease = jest.fn();

        renderWithPaper(
            <NumericStepper
                value={1}
                canDecrease={false}
                canIncrease={false}
                decrementTestID="stepper-decrement"
                incrementTestID="stepper-increment"
                onDecrease={onDecrease}
                onIncrease={onIncrease}
            />,
        );

        fireEvent.press(screen.getByTestId('stepper-decrement'));
        fireEvent.press(screen.getByTestId('stepper-increment'));

        expect(screen.getByTestId('stepper-decrement').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByTestId('stepper-increment').props.accessibilityState.disabled).toBe(true);
        expect(onDecrease).not.toHaveBeenCalled();
        expect(onIncrease).not.toHaveBeenCalled();
    });

    it('uses the brighter night palette when requested', () => {
        renderWithPaper(
            <NumericStepper
                value={3}
                tone="night"
                decrementTestID="stepper-decrement"
                incrementTestID="stepper-increment"
                valueTestID="stepper-value"
                onDecrease={jest.fn()}
                onIncrease={jest.fn()}
            />,
        );

        expect(screen.getByTestId('stepper-decrement')).toHaveStyle({
            backgroundColor: 'rgba(201,146,42,0.18)',
        });
        expect(screen.getByTestId('stepper-value')).toHaveStyle({
            color: fantasyTokens.colors.parchment,
        });
        expect(screen.getByText('+')).toHaveStyle({
            color: fantasyTokens.colors.gold,
        });
    });
});
