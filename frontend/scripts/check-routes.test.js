const { spawnSync } = require('node:child_process');
const { accessSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const frontend = path.resolve(__dirname, '..');
const script = path.join(__dirname, 'check-routes.js');
let directory;

beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), 'check-routes-'));
});

afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
});

/** Writes a route fixture beneath this test's isolated directory. */
function writeRoute(name, source = 'export default function Screen() { return null; }') {
    const file = path.join(directory, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, source);
    return file;
}

/** Uses the frontend working directory to exercise the command's default path too. */
function checkRoutes(args = [directory]) {
    // A missing checker must fail the test, rather than looking like a rejected fixture.
    accessSync(script);
    const result = spawnSync(process.execPath, [script, ...args], {
        cwd: frontend,
        encoding: 'utf8',
        timeout: 10000,
    });
    if (result.error) throw result.error;
    return { status: result.status, output: result.stdout + result.stderr };
}

describe('accepted route files', () => {
    const extensions = ['js', 'jsx', 'ts', 'tsx'];
    const platforms = ['', '.web', '.native', '.ios', '.android'];

    it.each(
        extensions.flatMap((extension) => platforms.map((suffix) => `index${suffix}.${extension}`)),
    )('accepts %s with a default export', (name) => {
        writeRoute(name);
        expect(checkRoutes()).toMatchObject({ status: 0 });
    });

    it.each(['(tabs)/index.tsx', '[id].tsx', '[...rest].tsx', '_layout.tsx', '+not-found.tsx'])(
        'accepts the route name %s',
        (name) => {
            writeRoute(name);
            expect(checkRoutes()).toMatchObject({ status: 0 });
        },
    );

    it.each([
        'export default function Screen() { return null; }',
        'export default () => null;',
        'const Screen = () => null; export { Screen as default };',
        "export { default } from '../screens/home';",
        "export { Screen as default } from '../screens/home';",
    ])('accepts the default export syntax %s', (source) => {
        writeRoute('index.tsx', source);
        expect(checkRoutes()).toMatchObject({ status: 0 });
    });

    it.each([
        'health+api.ts',
        '(api)/health+api.ts',
        'health+api.web.ts',
        '+native-intent.tsx',
        '+native-intent.native.ts',
        '+native-intent.ios.tsx',
        '+native-intent.android.tsx',
    ])('accepts named exports in %s', (name) => {
        writeRoute(name, 'export function GET() { return null; }');
        expect(checkRoutes()).toMatchObject({ status: 0 });
    });

    it('accepts the current src/app when no directory is supplied', () => {
        expect(checkRoutes([])).toMatchObject({ status: 0 });
    });
});

describe('rejected files', () => {
    it.each([
        'screen.test.js',
        'screen.test.jsx',
        'screen.test.ts',
        'screen.test.tsx',
        'screen.spec.js',
        'screen.spec.jsx',
        'screen.spec.ts',
        'screen.spec.tsx',
        'screen.test.web.tsx',
        'screen.ios.spec.tsx',
        '__tests__/screen.tsx',
        '(tabs)/__tests__/screen.tsx',
        '__mocks__/screen.tsx',
        '__snapshots__/screen.tsx',
        'notes.md',
        'data.json',
        'styles.css',
        'icon.svg',
        'helper.mjs',
        'helper.cjs',
        'LICENSE',
    ])('reports and rejects %s even with a default export', (name) => {
        writeRoute(name);
        const result = checkRoutes();
        expect(result.status).not.toBe(0);

        expect(result.output).toContain(name);
    });

    it.each([
        '',
        'export const helper = () => null;',
        '// export default function Screen() {}\nexport const helper = 1;',
        "export const example = 'export default';",
    ])('rejects a source file without an actual default export: %s', (source) => {
        writeRoute('helper.ts', source);
        const result = checkRoutes();
        expect(result.status).not.toBe(0);

        expect(result.output).toContain('helper.ts');
    });

    it('reports every violation while allowing valid routes in the same tree', () => {
        writeRoute('index.tsx');
        writeRoute('(tabs)/notes.md', 'Notes');
        writeRoute('helper.ts', 'export const count = 1;');
        writeRoute('__tests__/screen.tsx');
        const result = checkRoutes();
        expect(result.status).not.toBe(0);

        expect(result.output).toContain('(tabs)/notes.md');

        expect(result.output).toContain('helper.ts');

        expect(result.output).toContain('__tests__/screen.tsx');
    });
});
