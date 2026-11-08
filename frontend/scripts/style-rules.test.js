const path = require('node:path');
const { ESLint } = require('eslint');
const config = require('../eslint.config.js');

const frontend = path.resolve(__dirname, '..');
let eslint;

beforeAll(() => {
    // Load the real CommonJS config directly because Jest cannot run ESLint's dynamic import.
    eslint = new ESLint({
        cwd: frontend,
        overrideConfigFile: true,
        overrideConfig: config,
    });
});

/** Lints a virtual source file with the shipped configuration, including its path exemptions. */
async function lint(source, file = 'src/components/style-example.tsx') {
    const [result] = await eslint.lintText(source, { filePath: path.join(frontend, file) });
    expect(result.fatalErrorCount).toBe(0);
    return result;
}

const styleContexts = [
    [
        'StyleSheet.create',
        (value) => `import { StyleSheet } from 'react-native';
            export default StyleSheet.create({ label: { color: ${value} } });`,
    ],
    [
        'an inline style',
        (value) => `import { View } from 'react-native';
            export default function Sample() { return <View style={{ color: ${value} }} />; }`,
    ],
    [
        'an inline style array',
        (value) => `import { View } from 'react-native';
            export default function Sample() { return <View style={[{ color: ${value} }]} />; }`,
    ],
    [
        'a conditional inline style',
        (value) => `import { View } from 'react-native';
            export default function Sample({ active }) {
                return <View style={active ? { color: ${value} } : { opacity: 1 }} />;
            }`,
    ],
    [
        'a conditional inside a style array',
        (value) => `import { View } from 'react-native';
            export default function Sample({ active }) {
                return <View style={[active && { color: ${value} }]} />;
            }`,
    ],
    [
        'a Pressable style function',
        (value) => `import { Pressable } from 'react-native';
            export default function Sample() {
                return <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 },
                    { color: ${value} }]} />;
            }`,
    ],
    [
        'a JSX color prop',
        (value) => `import { Text } from 'react-native';
            export default function Sample() { return <Text color={${value}} />; }`,
    ],
];

describe('color literals are lint errors', () => {
    it.each(
        styleContexts.flatMap(([context, source]) =>
            ["'#123abc'", "'rgba(0, 0, 0, 0.5)'", "'red'"].map((value) => [
                `${value} in ${context}`,
                source(value),
            ]),
        ),
    )('rejects %s', async (_name, source) => {
        const result = await lint(source);
        expect(result.errorCount).toBeGreaterThan(0);
    });

    it.each(['color', 'fill', 'stroke', 'stopColor', 'tintColor', 'placeholderTextColor'])(
        'rejects a named color in the JSX %s attribute',
        async (prop) => {
            const result = await lint(`import { Text } from 'react-native';
                export default function Sample() { return <Text ${prop}="red" />; }`);
            expect(result.errorCount).toBeGreaterThan(0);
        },
    );

    it.each([
        "'#abc'",
        "'#abcd'",
        "'#12345678'",
        "'rgb(1, 2, 3)'",
        "'hsl(0, 50%, 50%)'",
        "'hsla(0, 50%, 50%, 0.5)'",
    ])('rejects the literal form %s', async (value) => {
        const result = await lint(styleContexts[0][1](value));
        expect(result.errorCount).toBeGreaterThan(0);
    });

    it('rejects a color literal embedded in a longer style string', async () => {
        const result = await lint(`import { StyleSheet } from 'react-native';
            export default StyleSheet.create({ card: { boxShadow: '0 2px 4px #123abc' } });`);
        expect(result.errorCount).toBeGreaterThan(0);
    });
});

describe('fontWeight is a lint error', () => {
    it.each([
        ['an object key', 'export default { fontWeight: 700 };'],
        ['a quoted object key', "export default { 'fontWeight': 'bold' };"],
        [
            'a JSX attribute',
            `import { Text } from 'react-native';
                export default function Sample() { return <Text fontWeight="bold" />; }`,
        ],
        ['a member access', 'export default function weight(style) { return style.fontWeight; }'],
        [
            'a computed member access',
            "export default function weight(style) { return style['fontWeight']; }",
        ],
    ])('rejects %s outside style objects too', async (_name, source) => {
        const result = await lint(source);
        expect(result.errorCount).toBeGreaterThan(0);
    });
});

describe('allowed styles', () => {
    it.each([
        [
            'theme tokens',
            `import { colors } from '@/theme';
                import { StyleSheet } from 'react-native';
                export default StyleSheet.create({ label: { color: colors.text } });`,
        ],
        [
            'an inline theme token',
            `import { colors } from '@/theme'; import { View } from 'react-native';
                export default function Sample() { return <View style={{ color: colors.text }} />; }`,
        ],
        [
            'a JSX theme token',
            `import { colors } from '@/theme'; import { Text } from 'react-native';
                export default function Sample() { return <Text color={colors.text} />; }`,
        ],
        [
            'fill="none"',
            `import { Path } from 'react-native-svg';
                export default function Sample() { return <Path fill="none" />; }`,
        ],
        [
            'an SVG paint reference',
            `import { Path } from 'react-native-svg';
                export default function Sample({ id }) { return <Path fill={\`url(#\${id})\`} />; }`,
        ],
        [
            'pointerEvents: none',
            `import { StyleSheet } from 'react-native';
                export default StyleSheet.create({ card: { pointerEvents: 'none' } });`,
        ],
        [
            'transparent',
            `import { StyleSheet } from 'react-native';
                export default StyleSheet.create({ card: { backgroundColor: 'transparent' } });`,
        ],
        [
            'fontWeight in comments and strings',
            `// Use fontFamily instead of fontWeight.
                export const message = 'fontWeight';`,
        ],
        ['a color name in ordinary copy', "export const message = 'red';"],
    ])('accepts %s', async (_name, source) => {
        const result = await lint(source);
        expect(result.errorCount).toBe(0);
    });

    it('allows raw colors where theme tokens are defined', async () => {
        const result = await lint(
            `import { StyleSheet } from 'react-native';
                export default StyleSheet.create({ label: { color: '#123abc' } });`,
            'src/theme/style-example.tsx',
        );
        expect(result.errorCount).toBe(0);
    });
});
