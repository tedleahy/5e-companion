import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import NumericStepper from '@/components/wizard/NumericStepper';

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
});
