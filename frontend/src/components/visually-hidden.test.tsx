import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { VisuallyHidden } from './visually-hidden';

describe('VisuallyHidden', () => {
    it('keeps its text for screen readers', async () => {
        await render(
            <VisuallyHidden>
                <Text>Searching…</Text>
            </VisuallyHidden>,
        );

        expect(screen.getByText('Searching…')).toBeOnTheScreen();
    });

    it('passes View props on, such as a live region role', async () => {
        await render(<VisuallyHidden accessible role="status" />);

        expect(screen.getByRole('status')).toBeOnTheScreen();
    });

    it('stays a one point clipped square, whatever style it is given', async () => {
        await render(
            <VisuallyHidden testID="hidden" style={{ width: 200, overflow: 'visible' }} />,
        );

        expect(screen.getByTestId('hidden')).toHaveStyle({
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
        });
    });
});
