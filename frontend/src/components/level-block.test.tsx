import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { colors } from '@/theme';

import { LevelBlock } from './level-block';

afterEach(() => {
    jest.restoreAllMocks();
});

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

    describe('on the web, which ignores a label on an element with no role', () => {
        beforeEach(() => {
            jest.replaceProperty(Platform, 'OS', 'web');
        });

        it.each([
            [8, 'Level 8'],
            [0, 'Level not set'],
        ])('says level %i as hidden text', async (level, label) => {
            await render(<LevelBlock level={level} />);

            expect(screen.getByText(label)).toBeOnTheScreen();

            expect(screen.queryByLabelText(label)).toBeNull();
        });

        it('hides the visible label and number from screen readers', async () => {
            await render(<LevelBlock level={0} />);

            expect(screen.queryByText('Level')).toBeNull();

            expect(screen.getByText('Level', { includeHiddenElements: true })).toBeOnTheScreen();

            expect(screen.queryByText('–')).toBeNull();

            expect(screen.getByText('–', { includeHiddenElements: true })).toBeOnTheScreen();
        });
    });

    it('enlarges the label for desktop', async () => {
        await render(<LevelBlock level={8} large />);

        expect(screen.getByText('Level')).toHaveStyle({ fontSize: 13 });
    });
});
