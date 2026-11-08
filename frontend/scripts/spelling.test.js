const { spawnSync } = require('node:child_process');
const { accessSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const frontend = path.resolve(__dirname, '..');
const repository = path.resolve(frontend, '..');
const config = path.join(frontend, 'cspell.json');
const executable = path.join(frontend, 'node_modules/.bin/cspell');
const temporaryDirectories = [];

afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
        rmSync(directory, { recursive: true, force: true });
    }
});

/** Runs the installed CLI so configuration failures cannot look like spelling rejections. */
function runSpell(args, input) {
    accessSync(config);
    accessSync(executable);
    const result = spawnSync(
        process.execPath,
        [
            executable,
            'lint',
            '--config',
            config,
            '--no-progress',
            '--no-summary',
            '--no-cache',
            ...args,
        ],
        { cwd: frontend, input, encoding: 'utf8', timeout: 15000 },
    );
    if (result.error) throw result.error;
    return { status: result.status, output: result.stdout + result.stderr };
}

/** Supplies a frontend filename so stdin uses the same language and overrides as app code. */
function spellSource(source) {
    return runSpell([`stdin://${path.join(frontend, 'src/spelling-example.ts')}`], source);
}

/** Makes a real file in the requested scope; afterEach removes it even on failure. */
function writeScopedFile(parent, name, source) {
    const directory = mkdtempSync(path.join(repository, parent, 'spelling-check-'));
    temporaryDirectories.push(directory);
    const file = path.join(directory, name);
    writeFileSync(file, source);
    return file;
}

describe('American English spelling', () => {
    // These examples are intentionally wrong, but the test file must pass the real spell check.
    // cspell:disable
    it.each([
        ['camelCase', 'export const inkColour = 1;', 'Colour'],
        ['snake_case', 'export const armor_colour = 1;', 'colour'],
        ['upper case', "export const ink = 'GREY';", 'GREY'],
        ['copy', "export const label = 'Choose your armour';", 'armour'],
        ['an unknown word', "export const label = 'mispellzzword';", 'mispellzzword'],
    ])('rejects %s', (_name, source, word) => {
        const result = spellSource(source);
        expect(result.status).toBe(1);

        expect(result.output.toLowerCase()).toContain(word.toLowerCase());
    });

    it.each([
        'levelling',
        'levelled',
        'honour',
        'favour',
        'favourite',
        'behaviour',
        'neighbour',
        'centre',
        'metre',
        'defence',
        'offence',
        'catalogue',
        'travelling',
        'cancelled',
        'labelled',
        'modelled',
        'organise',
        'recognise',
        'realise',
        'analyse',
        'customise',
        'initialise',
        'normalise',
        'synthesise',
        'colours',
        'armours',
        'favourites',
        'organised',
        'organising',
        'recognised',
        'recognising',
        'customised',
        'customising',
    ])('rejects the flagged form %s', (word) => {
        const result = spellSource(`export const label = '${word}';`);
        expect(result.status).toBe(1);

        expect(result.output.toLowerCase()).toContain(word);
    });
    // cspell:enable

    it.each([
        'color armor gray leveling leveled honor favor favorite behavior neighbor center meter defense offense catalog traveling canceled labeled modeled organize recognize realize analyze customize initialize normalize synthesize',
        'cantrip',
        'dialogue',
    ])('accepts %s', (words) => {
        expect(spellSource(`export const label = '${words}';`)).toMatchObject({ status: 0 });
    });
});

describe('the configured spelling scope', () => {
    // cspell:disable-next-line
    const badWord = 'mispellzzword';

    it.each([
        ['backend/app/controllers', 'example_controller.rb'],
        ['backend/app/mailers', 'example_mailer.rb'],
        ['backend/app/models', 'example.rb'],
        ['backend/app/views', 'example.html.erb'],
        ['backend/config/locales', 'example.yml'],
    ])('checks whole files under %s, including comments', (parent, name) => {
        const file = writeScopedFile(parent, name, `# ${badWord}\n`);
        // File lists are filtered by cspell's configured files globs and ignore paths.
        const result = runSpell(['--file-list', 'stdin', '--no-must-find-files'], `${file}\n`);
        expect(result.status).toBe(1);

        expect(result.output).toContain(badWord);

        expect(result.output).toContain(name);
    });

    it.each(['docs', 'mockups'])('excludes files under %s', (parent) => {
        const file = writeScopedFile(parent, 'spelling-example.md', `${badWord}\n`);
        const result = runSpell(['--file-list', 'stdin', '--no-must-find-files'], `${file}\n`);
        expect(result.status).toBe(0);

        expect(result.output).not.toContain(badWord);
    });
});
