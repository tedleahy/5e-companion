import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Dimensions, FlatList } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import OptionGrid from '../OptionGrid';

const OPTIONS = [
    { value: 'elf', label: 'Elf', icon: '🧝', hint: '+2 DEX' },
    { value: 'human', label: 'Human', icon: '👨', hint: '+1 all' },
];

/**
 * Sets the viewport width exposed to responsive components.
 */
function setViewportWidth(width: number) {
    const scaledSize = {
        width,
        height: 800,
        scale: 1,
        fontScale: 1,
    };

    Dimensions.set({
        window: scaledSize,
        screen: scaledSize,
    });
}

/**
 * Renders the option grid with paper context.
 */
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
    beforeEach(() => {
        setViewportWidth(fantasyTokens.breakpoints.tablet - 1);
    });

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

    it('uses two columns below the tablet breakpoint', () => {
        setViewportWidth(fantasyTokens.breakpoints.tablet - 1);
        renderGrid();

        expect(screen.UNSAFE_getByType(FlatList).props.numColumns).toBe(2);
    });

    it('uses three columns at the tablet breakpoint', () => {
        setViewportWidth(fantasyTokens.breakpoints.tablet);
        renderGrid();

        expect(screen.UNSAFE_getByType(FlatList).props.numColumns).toBe(3);
    });

    it('uses four columns at the laptop breakpoint', () => {
        setViewportWidth(fantasyTokens.breakpoints.laptop);
        renderGrid();

        expect(screen.UNSAFE_getByType(FlatList).props.numColumns).toBe(4);
    });
});
