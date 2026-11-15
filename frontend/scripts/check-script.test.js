const { readFileSync } = require('node:fs');
const path = require('node:path');

const { scripts } = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

describe('the combined check script', () => {
    it.each(['format:check', 'lint', 'typecheck', 'test', 'spell', 'check:routes'])(
        'runs %s',
        (name) => {
            expect(typeof scripts.check).toBe('string');

            // Match complete commands so, for example, format cannot stand in for format:check.
            const commands = scripts.check.split('&&').map((command) => command.trim());
            const accepted = [`npm run ${name}`, ...(name === 'test' ? ['npm test'] : [])];
            expect(commands.some((command) => accepted.includes(command))).toBe(true);
        },
    );

    it('stops and returns a failure when any constituent check fails', () => {
        expect(typeof scripts.check).toBe('string');

        const commands = scripts.check.split('&&').map((command) => command.trim());
        expect(commands.length).toBeGreaterThanOrEqual(6);

        expect(commands.every((command) => /^npm (?:run [\w:-]+|test)$/.test(command))).toBe(true);
    });
});
