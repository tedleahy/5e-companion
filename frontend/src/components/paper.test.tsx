import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { Paper } from './paper';

/** The ids of every SVG pattern rendered, which react-native-svg passes on as `name`. */
function patternIds(): string[] {
    const ids: string[] = [];
    const visit = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) return node.forEach(visit);
        const { type, props, children } = node as {
            type: string;
            props: { name?: string };
            children: unknown;
        };
        if (type === 'RNSVGPattern' && props.name) ids.push(props.name);
        visit(children);
    };
    visit(screen.toJSON());
    return ids;
}

describe('Paper', () => {
    it('renders its children', async () => {
        await render(
            <Paper>
                <Text>Characters</Text>
            </Paper>,
        );

        expect(screen.getByText('Characters')).toBeOnTheScreen();
    });

    it('fills itself with a grid that screen readers skip', async () => {
        await render(<Paper />);

        expect(screen.queryByTestId('paper-grid')).toBeNull();

        expect(
            StyleSheet.flatten(
                screen.getByTestId('paper-grid', { includeHiddenElements: true }).props.style,
            ),
        ).toMatchObject({ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('gives each instance its own pattern ids', async () => {
        await render(
            <>
                <Paper />
                <Paper />
            </>,
        );
        const ids = patternIds();

        expect(ids).toHaveLength(4);

        expect(new Set(ids).size).toBe(4);
    });
});
