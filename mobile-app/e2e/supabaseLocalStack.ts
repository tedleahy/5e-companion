import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Shape of the fields we care about from `supabase status -o env`.
 * The CLI emits a number of other URLs/keys (imgproxy, S3, etc) that we
 * deliberately ignore here.
 */
export type SupabaseLocalStack = {
    apiUrl: string;
    dbUrl: string;
    publishableKey: string;
    secretKey: string;
};

/**
 * Repo root relative to this file: `mobile-app/e2e/` → `../../`. The Supabase
 * CLI config lives at the repo root, so `supabase status` must be run from here.
 */
const REPO_ROOT = path.resolve(__dirname, '..', '..');

let cached: SupabaseLocalStack | undefined;

/**
 * Runs `bunx supabase status -o env` synchronously and returns the parsed
 * URLs/keys. Throws a clear error if Supabase isn't running.
 *
 * Keys are intentionally not hardcoded anywhere in the repo — they are the
 * Supabase CLI's deterministic local-stack defaults, but hardcoding strings
 * that match `sb_secret_…` / `sb_publishable_…` triggers GitHub's secret
 * scanner (and teaches bad habits), so we source them at runtime instead.
 *
 * The result is cached for the lifetime of the process.
 */
export function getSupabaseLocalStack(): SupabaseLocalStack {
    if (cached) return cached;

    let output: string;
    try {
        output = execSync('bunx supabase status -o env', {
            cwd: REPO_ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
            'Could not read local Supabase status. Is the stack running? ' +
            'Start it with `bun e2e:up` from the repo root before running e2e tests.\n' +
            `Underlying error: ${message}`,
        );
    }

    const env = parseEnvOutput(output);
    const apiUrl = env.API_URL;
    const dbUrl = env.DB_URL;
    const publishableKey = env.PUBLISHABLE_KEY ?? env.ANON_KEY;
    const secretKey = env.SECRET_KEY ?? env.SERVICE_ROLE_KEY;

    if (!apiUrl || !dbUrl || !publishableKey || !secretKey) {
        throw new Error(
            'Unexpected `supabase status -o env` output: missing one of ' +
            'API_URL, DB_URL, PUBLISHABLE_KEY/ANON_KEY, SECRET_KEY/SERVICE_ROLE_KEY.',
        );
    }

    cached = { apiUrl, dbUrl, publishableKey, secretKey };
    return cached;
}

/**
 * Parses `KEY="value"` lines as emitted by `supabase status -o env` into a
 * plain object. Non-assignment lines (e.g. `Stopped services: […]`) are
 * ignored so the CLI's diagnostic preamble doesn't break parsing.
 */
function parseEnvOutput(output: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of output.split('\n')) {
        const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
        if (!match) continue;
        const [, key, value] = match;
        result[key] = value;
    }
    return result;
}
