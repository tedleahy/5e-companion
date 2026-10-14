import { render, screen } from '@testing-library/react-native';

import { ComponentLibrary } from './component-library';

describe('ComponentLibrary', () => {
    it('has a section for each component', async () => {
        await render(<ComponentLibrary />);

        const sections = screen
            .getAllByRole('heading')
            .filter((heading) => heading.props['aria-level'] === 2);

        expect(sections.map((heading) => heading.props.children)).toEqual([
            'Paper',
            'Heading',
            'SearchIcon',
            'WarningIcon',
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
