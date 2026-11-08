const path = require('node:path');
const { ESLint } = require('eslint');
const config = require('../eslint.config.js');

const frontend = path.resolve(__dirname, '..');
let eslint;

beforeAll(() => {
    // Jest cannot load ESLint's dynamic import, so supply the real config directly.
    eslint = new ESLint({
        cwd: frontend,
        overrideConfigFile: true,
        overrideConfig: config,
    });
});

/** Lints virtual app source with the shipped rules and theme exemption. */
async function lint(source, file = 'src/components/color-example.tsx') {
    const [result] = await eslint.lintText(source, { filePath: path.join(frontend, file) });
    expect(result.fatalErrorCount).toBe(0);
    return result;
}

const colorFunctions = [
    'rgb(1e2 0 0)',
    'rgb(none 0 0)',
    'rgb(from red r g b)',
    'rgba(from red r g b / .5)',
    'hsl(1e2 100% 50%)',
    'hsl(none 100% 50%)',
    'hsla(from red h s l / .5)',
    'RGB(calc(100 + 20) 0 0)',
];

const styleContexts = [
    [
        'StyleSheet.create',
        (color) => `import { StyleSheet } from 'react-native';
            export default StyleSheet.create({ card: { boxShadow: '0 2px 4px ${color}' } });`,
    ],
    [
        'an inline shadow',
        (color) => `import { View } from 'react-native';
            export const Sample = () => <View style={{ boxShadow: '0 2px 4px ${color}' }} />;`,
    ],
    [
        'a paint prop',
        (color) => `import { Path } from 'react-native-svg';
            export const Sample = () => <Path fill="${color}" />;`,
    ],
];

describe('CSS color function syntax', () => {
    it.each(
        styleContexts.flatMap(([context, source]) =>
            colorFunctions.map((color) => [`${color} in ${context}`, source(color)]),
        ),
    )('rejects %s', async (_name, source) => {
        const result = await lint(source);
        expect(result.messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: 'sheet/no-color-literals', severity: 2 }),
            ]),
        );
    });

    it.each(['none', 'transparent', 'url(#deadbeef)'])(
        'preserves the paint exemption for %s',
        async (value) => {
            const result = await lint(`import { Path } from 'react-native-svg';
                export const Sample = () => <Path fill="${value}" />;`);
            expect(result.errorCount).toBe(0);
        },
    );

    it('allows function strings in ordinary copy', async () => {
        const result = await lint("export const example = 'rgb(from red r g b)';");
        expect(result.errorCount).toBe(0);
    });

    it('allows function colors in theme definitions', async () => {
        const result = await lint(
            styleContexts[0][1]('rgb(from red r g b)'),
            'src/theme/color-example.tsx',
        );
        expect(result.errorCount).toBe(0);
    });
});
