import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import AbilityBlock from '../AbilityBlock';

function renderBlock(props: Partial<React.ComponentProps<typeof AbilityBlock>> = {}) {
    return render(
        <PaperProvider>
            <AbilityBlock
                ability="strength"
                score={15}
                onIncrement={jest.fn()}
                onDecrement={jest.fn()}
                {...props}
            />
        </PaperProvider>
    );
}

describe('AbilityBlock', () => {
    it('exposes the score via accessibilityLabel', () => {
        renderBlock();

        expect(screen.getByLabelText('STR score 15')).toBeTruthy();
    });

    it('exposes the modifier via accessibilityLabel', () => {
        renderBlock();

        // Score 15 -> modifier +2
        expect(screen.getByLabelText('STR modifier +2')).toBeTruthy();
    });

    it('calls onIncrement when the + button is pressed', () => {
        const onIncrement = jest.fn();
        renderBlock({ onIncrement });

        const plusBtn = screen.getByText('+');
        fireEvent.press(plusBtn);

        expect(onIncrement).toHaveBeenCalled();
    });

    it('calls onDecrement when the − button is pressed', () => {
        const onDecrement = jest.fn();
        renderBlock({ onDecrement });

        const minusBtn = screen.getByText('\u2212');
        fireEvent.press(minusBtn);

        expect(onDecrement).toHaveBeenCalled();
    });
});
