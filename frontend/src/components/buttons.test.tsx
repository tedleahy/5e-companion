import { render, screen, userEvent } from '@testing-library/react-native';

import { PrimaryButton, SecondaryButton } from './buttons';

describe('PrimaryButton', () => {
    it('is a button named by its label', async () => {
        await render(<PrimaryButton label="Create character" />);

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();
    });

    it('calls onPress when pressed', async () => {
        const onPress = jest.fn();
        await render(<PrimaryButton label="Create character" onPress={onPress} />);

        await userEvent.press(screen.getByRole('button', { name: 'Create character' }));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});

describe('SecondaryButton', () => {
    it('is a button named by its label', async () => {
        await render(<SecondaryButton label="Sort: level" size="large" />);

        expect(screen.getByRole('button', { name: 'Sort: level' })).toBeOnTheScreen();
    });

    it('prefers an accessibility label over the visible one', async () => {
        await render(
            <SecondaryButton
                label="Resume"
                aria-label="Resume Kethra Ironsong's level-up"
                size="small"
            />,
        );

        expect(
            screen.getByRole('button', { name: "Resume Kethra Ironsong's level-up" }),
        ).toBeOnTheScreen();
    });

    it('can be a link', async () => {
        await render(
            <SecondaryButton
                label="Open sheet"
                aria-label="Open Thorn Grimsby's sheet"
                role="link"
                size="medium"
            />,
        );

        expect(screen.getByRole('link', { name: "Open Thorn Grimsby's sheet" })).toBeOnTheScreen();
    });

    it('calls onPress when pressed', async () => {
        const onPress = jest.fn();
        await render(<SecondaryButton label="Try again" size="medium" onPress={onPress} />);

        await userEvent.press(screen.getByRole('button', { name: 'Try again' }));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('presses without a handler', async () => {
        await render(<SecondaryButton label="Resume" size="small" />);

        await userEvent.press(screen.getByRole('button', { name: 'Resume' }));

        expect(screen.getByRole('button', { name: 'Resume' })).toBeEnabled();
    });
});
