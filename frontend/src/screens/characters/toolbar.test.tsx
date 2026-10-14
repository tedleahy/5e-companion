import { fireEvent, render, screen } from '@testing-library/react-native';

import type { SearchState } from './search-controls';
import { Toolbar } from './toolbar';

/** Search and sort as the screen passes them, with spies for the handlers. */
function searchState(): SearchState {
    return {
        search: '',
        onSearchChange: jest.fn(),
        onSearchSubmit: jest.fn(),
        sort: 'name',
        onSortPress: jest.fn(),
    };
}

describe('Toolbar', () => {
    it('holds search, sort and Create character', async () => {
        await render(<Toolbar searchState={searchState()} />);

        expect(screen.getByLabelText('Find a character')).toBeOnTheScreen();

        expect(screen.getByRole('button', { name: 'Sort: name' })).toBeOnTheScreen();

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();
    });

    it('keeps only Create character when there is nothing to search', async () => {
        await render(<Toolbar />);

        expect(screen.queryByLabelText('Find a character')).toBeNull();

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();
    });

    it('calls onCreate when Create character is pressed', async () => {
        const onCreate = jest.fn();
        await render(<Toolbar onCreate={onCreate} />);

        await fireEvent.press(screen.getByRole('button', { name: 'Create character' }));

        expect(onCreate).toHaveBeenCalledTimes(1);
    });
});
