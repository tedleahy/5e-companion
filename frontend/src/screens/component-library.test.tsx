import { render, screen } from '@testing-library/react-native';

import { ComponentLibrary } from './component-library';

describe('ComponentLibrary', () => {
  it('has a section for each component', async () => {
    await render(<ComponentLibrary />);

    expect(screen.getAllByRole('heading').map((heading) => heading.props.children)).toEqual([
      'Component library',
      'Paper',
      'SearchIcon',
      'CharacterToken',
      'HitPoints',
      'LevelBlock',
      'Spinner',
      'PrintPressable',
      'PrimaryButton',
      'SecondaryButton',
    ]);
  });

  it('renders the components themselves', async () => {
    await render(<ComponentLibrary />);

    expect(screen.getByText('68/72 hit points')).toBeOnTheScreen();

    expect(screen.getByRole('button', { name: 'Sort: name' })).toBeOnTheScreen();
  });
});
