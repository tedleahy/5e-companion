import { render, screen } from '@testing-library/react-native';

import { colors } from '@/theme';

import { ClearIcon } from './clear-icon';

describe('ClearIcon', () => {
    it('draws at 14 points in the given ink, hidden from screen readers', async () => {
        await render(<ClearIcon color={colors.structural} />);

        expect(screen.queryByTestId('clear-icon')).toBeNull();

        const icon = screen.getByTestId('clear-icon', { includeHiddenElements: true });

        expect(icon).toHaveProp('stroke', colors.structural);

        expect(icon).toHaveProp('width', 14);

        expect(icon).toHaveProp('height', 14);
    });
});
