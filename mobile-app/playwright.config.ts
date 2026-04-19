import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import {
    E2E_API_URL,
    E2E_WEB_BASE_URL,
    E2E_WEB_PORT,
    e2eEnv,
} from './e2e/env';

/**
 * Playwright configuration for end-to-end testing of the Expo web build.
 *
 * Run locally with `yarn e2e` (or `yarn e2e:ui` for the interactive UI).
 * Ensure the local Supabase stack is running first (`bun e2e:up` at repo root).
 *
 * Flow:
 *   1. globalSetup migrates the local Supabase DB and seeds the test user + character.
 *   2. The `webServer` array spawns the GraphQL backend (on port 4010) and Expo web
 *      (on port 8081), both pointed at the local Supabase stack.
 *   3. The `setup` project performs a UI login once and saves authenticated storage
 *      state. All other specs reuse it via `storageState`.
 */

const SERVER_ROOT = path.resolve(__dirname, '..', 'server');
const AUTH_STORAGE_STATE = path.resolve(__dirname, 'e2e', '.auth', 'user.json');

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    globalSetup: require.resolve('./e2e/globalSetup.ts'),
    globalTeardown: require.resolve('./e2e/globalTeardown.ts'),
    use: {
        baseURL: E2E_WEB_BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'smoke',
            testMatch: /smoke\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'chromium',
            testIgnore: [/auth\.setup\.ts/, /smoke\.spec\.ts/],
            use: {
                ...devices['Desktop Chrome'],
                storageState: AUTH_STORAGE_STATE,
            },
            dependencies: ['setup'],
        },
    ],
    webServer: [
        {
            name: 'graphql-server',
            command: 'bun run dev',
            cwd: SERVER_ROOT,
            url: E2E_API_URL,
            env: e2eEnv() as Record<string, string>,
            reuseExistingServer: !process.env.CI,
            timeout: 60_000,
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            name: 'expo-web',
            // --clear forces Metro to rebuild so the e2e env vars
            // (EXPO_PUBLIC_SUPABASE_URL etc) are baked into a fresh bundle
            // rather than being served from a previously cached build that
            // still points at the developer's cloud Supabase.
            command: `yarn web --port ${E2E_WEB_PORT} --clear`,
            url: E2E_WEB_BASE_URL,
            env: e2eEnv() as Record<string, string>,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            stdout: 'ignore',
            stderr: 'pipe',
        },
    ],
});

