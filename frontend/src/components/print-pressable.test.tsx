import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';

import { offsetShadow } from '@/theme';

import { PrintPressable } from './print-pressable';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('PrintPressable', () => {
    it('sinks onto its shadow while pressed', async () => {
        await render(<PrintPressable depth={4} role="button" aria-label="Sort" />);
        const button = screen.getByRole('button', { name: 'Sort' });

        expect(button).toHaveStyle({ boxShadow: offsetShadow(4, 'accent') });

        await fireEvent(button, 'pressIn');

        expect(button).toHaveStyle({ transform: [{ translateX: 4 }, { translateY: 4 }] });

        expect(button).not.toHaveStyle({ boxShadow: offsetShadow(4, 'accent') });

        await fireEvent(button, 'pressOut');

        expect(button).toHaveStyle({ boxShadow: offsetShadow(4, 'accent') });

        expect(button).not.toHaveStyle({ transform: [{ translateX: 4 }, { translateY: 4 }] });
    });

    it('passes its own press handlers on', async () => {
        const onPressIn = jest.fn();
        const onPressOut = jest.fn();
        await render(
            <PrintPressable
                depth={3}
                role="button"
                aria-label="Resume"
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            />,
        );
        const button = screen.getByRole('button', { name: 'Resume' });

        await fireEvent(button, 'pressIn');

        await fireEvent(button, 'pressOut');

        expect(onPressIn).toHaveBeenCalledTimes(1);

        expect(onPressOut).toHaveBeenCalledTimes(1);
    });

    it('reaches past its border on web, where Pressable ignores hit slop', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');
        await render(
            <PrintPressable
                depth={3}
                hitSlop={4}
                role="button"
                aria-label="Resume"
                style={{ borderWidth: 2 }}
            />,
        );

        expect(
            StyleSheet.flatten(
                screen.getByTestId('hit-area', { includeHiddenElements: true }).props.style,
            ),
        ).toMatchObject({ position: 'absolute', top: -6, right: -6, bottom: -6, left: -6 });
    });

    it('leaves hit slop to Pressable on native', async () => {
        await render(<PrintPressable depth={3} hitSlop={4} role="button" aria-label="Resume" />);

        expect(screen.queryByTestId('hit-area', { includeHiddenElements: true })).toBeNull();

        expect(screen.getByRole('button', { name: 'Resume' })).toHaveProp('hitSlop', 4);
    });

    it('casts its shadow in the given ink', async () => {
        await render(
            <PrintPressable depth={5} shadowToken="structural" role="button" aria-label="Create" />,
        );

        expect(screen.getByRole('button', { name: 'Create' })).toHaveStyle({
            boxShadow: offsetShadow(5, 'structural'),
        });
    });
});
