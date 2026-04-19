import fs from 'node:fs';
import path from 'node:path';
import { spawn, type SpawnOptions } from 'node:child_process';
import {
    E2E_TEST_USER,
    e2eDevLocalEnvFileContents,
    e2eEnv,
    e2eSupabaseUrl,
} from './env';

/**
 * Playwright globalSetup.
 *
 * Ensures the local Supabase stack is reachable, applies the Prisma schema
 * to its database, and seeds the e2e test user + character. Runs once per
 * test run before any specs (including the auth setup project).
 */

const SERVER_ROOT = path.resolve(__dirname, '..', '..', 'server');
const MOBILE_APP_ROOT = path.resolve(__dirname, '..');
const DEV_LOCAL_ENV_FILE = path.join(MOBILE_APP_ROOT, '.env.development.local');
const DEV_LOCAL_ENV_BACKUP = path.join(MOBILE_APP_ROOT, '.env.development.local.e2e-backup');

/**
 * Writes `mobile-app/.env.development.local` with the e2e URLs so the Expo
 * bundle points at the local Supabase stack. If the developer already has
 * their own `.env.development.local`, it is moved aside and restored in
 * globalTeardown.
 */
function writeDevLocalEnvFile(): void {
    if (fs.existsSync(DEV_LOCAL_ENV_FILE)) {
        fs.renameSync(DEV_LOCAL_ENV_FILE, DEV_LOCAL_ENV_BACKUP);
    }
    fs.writeFileSync(DEV_LOCAL_ENV_FILE, e2eDevLocalEnvFileContents(), 'utf8');
}

/**
 * Spawns a child process with the combined parent + e2e env and waits for it
 * to exit. Throws if the process exits non-zero. Stdout/stderr are streamed
 * directly so the developer can see migration output during long runs.
 */
function runCommand(command: string, args: string[], options: SpawnOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            ...options,
            env: { ...e2eEnv(), ...options.env },
        });

        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
        });
    });
}

async function assertSupabaseIsRunning(): Promise<void> {
    const apiUrl = e2eSupabaseUrl();
    try {
        const response = await fetch(`${apiUrl}/auth/v1/health`);
        if (!response.ok) {
            throw new Error(`Supabase health check failed with ${response.status}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
            `Local Supabase does not appear to be running at ${apiUrl}. ` +
            `Start it with \`bun e2e:up\` from the repo root before running e2e tests.\n` +
            `Underlying error: ${message}`,
        );
    }
}

export default async function globalSetup(): Promise<void> {
    await assertSupabaseIsRunning();

    writeDevLocalEnvFile();

    // Apply Prisma migrations to the local Supabase database.
    await runCommand('bunx', ['prisma', 'migrate', 'deploy'], {
        cwd: SERVER_ROOT,
    });

    // Seed SRD data (if empty) + test user + fresh Fighter 4 character.
    await runCommand('bun', ['run', 'prisma/e2e-setup.ts'], {
        cwd: SERVER_ROOT,
        env: {
            ...e2eEnv(),
            E2E_TEST_EMAIL: E2E_TEST_USER.email,
            E2E_TEST_PASSWORD: E2E_TEST_USER.password,
        },
    });
}
