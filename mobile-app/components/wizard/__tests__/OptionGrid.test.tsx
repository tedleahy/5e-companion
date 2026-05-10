import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import OptionGrid from '../OptionGrid';

const OPTIONS = [
    { value: 'elf', label: 'Elf', icon: '🧝', hint: '+2 DEX' },
    { value: 'human', label: 'Human', icon: '👨', hint: '+1 all' },
];

function renderGrid(props: Partial<React.ComponentProps<typeof OptionGrid>> = {}) {
    return render(
        <PaperProvider>
            <OptionGrid
                options={OPTIONS}
                selected=""
                onSelect={jest.fn()}
                {...props}
            />
        </PaperProvider>
    );
}

describe('OptionGrid', () => {
    it('calls onSelect when an unselected item is pressed', () => {
        const onSelect = jest.fn();
        renderGrid({ selected: '', onSelect });

        const elfBtn = screen.getByText('Elf');
        fireEvent.press(elfBtn);

        expect(onSelect).toHaveBeenCalledWith('elf');
    });

    it('does not call onSelect when the already-selected item is pressed', () => {
        const onSelect = jest.fn();
        renderGrid({ selected: 'elf', onSelect });

        const elfBtn = screen.getByText('Elf');
        fireEvent.press(elfBtn);

        expect(onSelect).not.toHaveBeenCalled();
    });

    it('allows selecting a different item when one is already selected', () => {
        const onSelect = jest.fn();
        renderGrid({ selected: 'elf', onSelect });

        const humanBtn = screen.getByText('Human');
        fireEvent.press(humanBtn);

        expect(onSelect).toHaveBeenCalledWith('human');
    });
});
