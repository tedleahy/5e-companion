const { readdirSync, readFileSync, statSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const SOURCE_EXTENSION = /\.(js|jsx|ts|tsx)$/;
const TEST_FILE = /\.(test|spec)(?:\.(web|native|ios|android))?\.(js|jsx|ts|tsx)$/;
const PLATFORM_SUFFIX = /\.(web|native|ios|android)$/;
const FORBIDDEN_DIRECTORIES = new Set(['__tests__', '__mocks__', '__snapshots__']);

/**
 * Reports anything under a route directory that is not an Expo route, then exits non-zero.
 * A route is a `.js`, `.jsx`, `.ts`, or `.tsx` file, including platform variants, with a
 * default export. `+api` and `+native-intent` files export handlers by name instead.
 */
function main() {
    const directory = path.resolve(process.argv[2] ?? 'src/app');
    let stats;
    try {
        stats = statSync(directory);
    } catch {
        process.stderr.write(`Not a directory: ${directory}\n`);
        process.exitCode = 1;
        return;
    }
    if (!stats.isDirectory()) {
        process.stderr.write(`Not a directory: ${directory}\n`);
        process.exitCode = 1;
        return;
    }

    const violations = routeViolations(directory);
    if (violations.length === 0) return;

    process.stdout.write(`${violations.join('\n')}\n`);
    process.exitCode = 1;
}

/** Paths relative to `directory`, using `/` separators, for every file that is not a route. */
function routeViolations(directory) {
    const violations = [];
    for (const file of listFiles(directory)) {
        const relative = path.relative(directory, file).split(path.sep).join('/');
        if (!isRoute(file, relative)) violations.push(relative);
    }
    violations.sort();
    return violations;
}

function listFiles(directory) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...listFiles(full));
        else if (entry.isFile()) files.push(full);
    }
    return files;
}

/**
 * @param file - Absolute path of the candidate.
 * @param relative - Path of that file relative to the route directory.
 */
function isRoute(file, relative) {
    const parts = relative.split('/');
    if (parts.some((part) => FORBIDDEN_DIRECTORIES.has(part))) return false;

    const basename = parts[parts.length - 1];
    if (!SOURCE_EXTENSION.test(basename) || TEST_FILE.test(basename)) return false;
    if (skipsDefaultExport(basename)) return true;

    return hasDefaultExport(readFileSync(file, 'utf8'), basename);
}

/** `+api` and `+native-intent` are routes with named exports, so a missing default is fine. */
function skipsDefaultExport(basename) {
    const stem = basename.replace(SOURCE_EXTENSION, '').replace(PLATFORM_SUFFIX, '');
    return stem === '+native-intent' || stem.endsWith('+api');
}

/**
 * True when the file has a real default export. Comments and strings do not count.
 * @param source - The file contents.
 * @param fileName - Picks the JavaScript or TSX parser.
 */
function hasDefaultExport(source, fileName) {
    const sourceFile = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true,
        scriptKind(fileName),
    );
    return sourceFile.statements.some(statementExportsDefault);
}

function scriptKind(fileName) {
    if (fileName.endsWith('.tsx')) return ts.ScriptKind.TSX;
    if (fileName.endsWith('.ts')) return ts.ScriptKind.TS;
    if (fileName.endsWith('.jsx')) return ts.ScriptKind.JSX;
    return ts.ScriptKind.JS;
}

function statementExportsDefault(statement) {
    if (ts.isExportAssignment(statement)) return !statement.isExportEquals;
    if (hasDefaultModifier(statement)) return true;
    if (!ts.isExportDeclaration(statement) || !statement.exportClause) return false;
    if (!ts.isNamedExports(statement.exportClause)) return false;

    return statement.exportClause.elements.some((element) => element.name.text === 'default');
}

function hasDefaultModifier(statement) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    return modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
}

main();
