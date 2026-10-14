import { render, screen } from '@testing-library/react-native';

import { Heading } from './heading';

describe('Heading', () => {
    it('is a heading named by its text', async () => {
        await render(<Heading level={2}>Waiting to be finished</Heading>);

        expect(screen.getByRole('heading', { name: 'Waiting to be finished' })).toBeOnTheScreen();
    });

    it.each([1, 2, 3] as const)('passes level %i on for the web', async (level) => {
        await render(<Heading level={level}>Characters</Heading>);

        expect(screen.getByRole('heading').props['aria-level']).toBe(level);
    });
});
