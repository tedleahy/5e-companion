import { render, screen } from '@testing-library/react-native';

import { Characters } from './characters';

describe('Characters', () => {
  it('shows the screen title as a heading', async () => {
    await render(<Characters />);

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeOnTheScreen();
  });
});
