import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SpellFilterDrawer, { EMPTY_FILTERS, type SpellFilters } from '../SpellFilterDrawer';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('SpellFilterDrawer', () => {
    it('renders the Filters title when visible', () => {
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={jest.fn()}
            />
        );
        expect(screen.getByText('Filters')).toBeTruthy();
    });

    it('renders class chip labels', () => {
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={jest.fn()}
            />
        );
        expect(screen.getByText('Wizard')).toBeTruthy();
        expect(screen.getByText('Cleric')).toBeTruthy();
        expect(screen.getByText('Bard')).toBeTruthy();
    });

    it('renders school chip labels', () => {
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={jest.fn()}
            />
        );
        expect(screen.getByText('Abjuration')).toBeTruthy();
        expect(screen.getByText('Evocation')).toBeTruthy();
    });

    it('renders level chips including Cantrip', () => {
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={jest.fn()}
            />
        );
        expect(screen.getByText('Cantrip')).toBeTruthy();
        expect(screen.getByText('9')).toBeTruthy();
    });

    it('calls onChange with toggled class when a class chip is pressed', () => {
        const onChange = jest.fn();
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={onChange}
            />
        );
        fireEvent.press(screen.getByText('Wizard'));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ classes: ['wizard'] })
        );
    });

    it('calls onChange with toggled level when a level chip is pressed', () => {
        const onChange = jest.fn();
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={onChange}
            />
        );
        fireEvent.press(screen.getByText('Cantrip'));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ levels: [0] })
        );
    });

    it('calls onChange with toggled school when a school chip is pressed', () => {
        const onChange = jest.fn();
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={onChange}
            />
        );
        fireEvent.press(screen.getByText('Abjuration'));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ schools: ['abjuration'] })
        );
    });

    it('toggles ritual switch', () => {
        const onChange = jest.fn();
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={EMPTY_FILTERS}
                onClose={jest.fn()}
                onChange={onChange}
            />
        );
        // Find the switch next to "Ritual only"
        const switches = screen.getAllByRole('switch');
        fireEvent(switches[0], 'valueChange', true);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ ritual: true })
        );
    });

    it('clears all filters when "Clear all" is pressed', () => {
        const onChange = jest.fn();
        const activeFilters: SpellFilters = {
            ...EMPTY_FILTERS,
            classes: ['wizard'],
            levels: [3],
            schools: ['evocation'],
            ritual: true,
        };
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={activeFilters}
                onClose={jest.fn()}
                onChange={onChange}
            />
        );
        fireEvent.press(screen.getByText('Clear all'));
        expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS);
    });

    it('removes a class when toggling an already-selected class', () => {
        const onChange = jest.fn();
        const filters: SpellFilters = { ...EMPTY_FILTERS, classes: ['wizard'] };
        renderWithPaper(
            <SpellFilterDrawer
                visible={true}
                filters={filters}
                onClose={jest.fn()}
                onChange={onChange}
            />
        );
        fireEvent.press(screen.getByText('Wizard'));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ classes: [] })
        );
    });
});
