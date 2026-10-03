import { render, screen } from '@testing-library/react-native';

import { colors } from '@/theme';

import { LevelBlock } from './level-block';

describe('LevelBlock', () => {
    it('shows the level under its label', async () => {
        await render(<LevelBlock level={8} />);

        expect(screen.getByLabelText('Level 8')).toBeOnTheScreen();

        expect(screen.getByText('8')).toHaveStyle({ color: colors.structural });
    });

    it('shows a dim dash when the character has no classes', async () => {
        await render(<LevelBlock level={0} />);

        expect(screen.getByLabelText('Level not set')).toBeOnTheScreen();

        expect(screen.getByText('–')).toHaveStyle({ color: colors.dim });
    });

    it('enlarges the label for desktop', async () => {
        await render(<LevelBlock level={8} large />);

        expect(screen.getByText('Level')).toHaveStyle({ fontSize: 13 });
    });
});
