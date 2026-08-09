import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AddSpellSheetHeader from '../add-sheet/AddSpellSheetHeader';

describe('AddSpellSheetHeader', () => {
    it('buffers search text locally while notifying the parent', () => {
        const onChangeSearchQuery = jest.fn();

        render(
            <AddSpellSheetHeader
                searchQuery=""
                onChangeSearchQuery={onChangeSearchQuery}
                onClearSearchQuery={jest.fn()}
                activeFilterCount={0}
                onOpenFilterPanel={jest.fn()}
            />,
        );

        const searchInput = screen.getByLabelText('Search spells');
        fireEvent.changeText(searchInput, 'fireball');

        expect(onChangeSearchQuery).toHaveBeenCalledWith('fireball');
        expect(searchInput.props.value).toBe('fireball');
        expect(searchInput.props.autoCorrect).toBe(false);
    });

    it('clears the local search text before the parent re-renders', () => {
        const onClearSearchQuery = jest.fn();

        render(
            <AddSpellSheetHeader
                searchQuery="shield"
                onChangeSearchQuery={jest.fn()}
                onClearSearchQuery={onClearSearchQuery}
                activeFilterCount={0}
                onOpenFilterPanel={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByLabelText('Clear spell search'));

        expect(onClearSearchQuery).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText('Search spells').props.value).toBe('');
    });

    it('syncs the buffer when the parent changes the search query', () => {
        const sharedProps = {
            onChangeSearchQuery: jest.fn(),
            onClearSearchQuery: jest.fn(),
            activeFilterCount: 0,
            onOpenFilterPanel: jest.fn(),
        };
        const { rerender } = render(
            <AddSpellSheetHeader searchQuery="shield" {...sharedProps} />,
        );

        rerender(<AddSpellSheetHeader searchQuery="magic missile" {...sharedProps} />);

        expect(screen.getByLabelText('Search spells').props.value).toBe('magic missile');
    });
});
