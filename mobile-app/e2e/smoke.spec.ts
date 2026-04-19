import { expect, test } from '@playwright/test';

/**
 * Basic smoke test: the web build should load and render the sign-in screen
 * for an unauthenticated visitor. This verifies the Playwright + Expo web
 * pipeline is wired up correctly before we layer on richer e2e scenarios.
 */
test.describe('web app smoke', () => {
    test('renders the sign-in screen for unauthenticated users', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
        await expect(page.getByText('Welcome back, adventurer.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
});
