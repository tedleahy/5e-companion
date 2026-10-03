import { render, screen } from '@testing-library/react-native';

import { CharacterToken } from './character-token';

describe('CharacterToken', () => {
  it('shows the initial but hides it from screen readers', async () => {
    await render(<CharacterToken name="Thorn Grimsby" />);

    expect(screen.queryByText('T')).toBeNull();

    expect(screen.getByText('T', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('is empty for an unnamed draft', async () => {
    await render(<CharacterToken name={null} draft />);

    expect(screen.queryByText(/./, { includeHiddenElements: true })).toBeNull();
  });
});
