import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for end-to-end testing of the Expo web build.
 *
 * Run locally with `yarn e2e` (or `yarn e2e:ui` for the interactive UI).
 * The `webServer` block auto-starts Expo web on port 8081 when a test run begins.
 */
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
    use: {
        baseURL: 'http://localhost:8081',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'yarn web',
        url: 'http://localhost:8081',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
