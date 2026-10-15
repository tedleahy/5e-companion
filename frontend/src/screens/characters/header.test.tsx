import { fireEvent, render, screen } from '@testing-library/react-native';

import { Header, WidePlate } from './header';
import type { SearchState } from './search-controls';

/** Search and sort as the screen passes them, with spies for the handlers. */
function searchState(): SearchState {
    return {
        search: '',
        onSearchChange: jest.fn(),
        onSearchSubmit: jest.fn(),
        onSearchClear: jest.fn(),
        sort: 'level',
        onSortPress: jest.fn(),
    };
}

describe('Header', () => {
    it('shows the title as the top-level heading', async () => {
        await render(<Header />);

        expect(screen.getByRole('heading', { name: 'Characters' }).props['aria-level']).toBe(1);
    });

    it('holds only the title when there is nothing to search', async () => {
        await render(<Header />);

        expect(screen.queryByLabelText('Find a character')).toBeNull();

        expect(screen.queryByRole('button', { name: 'Sort: level' })).toBeNull();
    });

    it('shows search and sort when given them', async () => {
        const state = searchState();
        await render(<Header searchState={state} />);

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'ves');

        expect(state.onSearchChange).toHaveBeenCalledWith('ves');

        await fireEvent.press(screen.getByRole('button', { name: 'Sort: level' }));

        expect(state.onSortPress).toHaveBeenCalledTimes(1);
    });

    it('offers to clear a search that has text', async () => {
        const state = { ...searchState(), search: 'ves' };
        await render(<Header searchState={state} />);

        await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));

        expect(state.onSearchClear).toHaveBeenCalledTimes(1);
    });
});

describe('WidePlate', () => {
    it('holds only the top-level title', async () => {
        await render(<WidePlate />);

        expect(screen.getByRole('heading', { name: 'Characters' }).props['aria-level']).toBe(1);

        expect(screen.queryByLabelText('Find a character')).toBeNull();
    });
});
