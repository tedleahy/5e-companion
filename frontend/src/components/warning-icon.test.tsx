import { render, screen } from '@testing-library/react-native';

import { colors } from '@/theme';

import { WarningIcon } from './warning-icon';

describe('WarningIcon', () => {
    it('draws at the given size in the given ink, hidden from screen readers', async () => {
        await render(<WarningIcon color={colors.accentText} size={20} />);

        expect(screen.queryByTestId('warning-icon')).toBeNull();

        const icon = screen.getByTestId('warning-icon', { includeHiddenElements: true });

        expect(icon).toHaveProp('stroke', colors.accentText);

        expect(icon).toHaveProp('width', 20);

        expect(icon).toHaveProp('height', 20);
    });
});
