import { render, screen, within } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { SearchResultsStatus } from './list-messages';

afterEach(() => {
    jest.restoreAllMocks();
});

it('keeps the web result live region mounted through result changes and clearing', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const { rerender } = await render(<SearchResultsStatus message={null} />);
    const region = screen.getByRole('status');

    await rerender(<SearchResultsStatus message={'No characters match “Zephyr”'} />);

    expect(screen.getByRole('status')).toBe(region);

    expect(within(region).getByText('No characters match “Zephyr”')).toBeOnTheScreen();

    await rerender(<SearchResultsStatus message={null} />);

    expect(screen.getByRole('status')).toBe(region);

    expect(within(region).queryByText('No characters match “Zephyr”')).toBeNull();
});
