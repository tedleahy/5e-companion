import fs from 'node:fs';
import path from 'node:path';

/** Persisted e2e seed output written by `server/prisma/e2e-setup.ts` during globalSetup. */
export type E2ESeedState = {
    userId: string;
    characterId: string;
    characterName: string;
};

const SEED_STATE_PATH = path.resolve(__dirname, '.seed', 'state.json');

/**
 * Reads the character id seeded for Scenario 1 and related e2e specs.
 */
export function readE2ESeedState(): E2ESeedState {
    if (!fs.existsSync(SEED_STATE_PATH)) {
        throw new Error(
            `Missing e2e seed state at ${SEED_STATE_PATH}. ` +
            'Run the Playwright suite so globalSetup can seed the test character first.',
        );
    }

    return JSON.parse(fs.readFileSync(SEED_STATE_PATH, 'utf8')) as E2ESeedState;
}
