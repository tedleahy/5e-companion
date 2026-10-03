import { render, screen } from '@testing-library/react-native';

import { colors } from '@/theme';

import { SearchIcon } from './search-icon';

describe('SearchIcon', () => {
  it('draws at 15 points in the given ink, hidden from screen readers', async () => {
    await render(<SearchIcon color={colors.dim} />);

    expect(screen.queryByTestId('search-icon')).toBeNull();

    const icon = screen.getByTestId('search-icon', { includeHiddenElements: true });

    expect(icon).toHaveProp('stroke', colors.dim);

    expect(icon).toHaveProp('width', 15);

    expect(icon).toHaveProp('height', 15);
  });
});
