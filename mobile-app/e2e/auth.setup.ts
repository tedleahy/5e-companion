import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { E2E_TEST_USER } from './env';

/**
 * Logs in once via the real sign-in UI and persists the authenticated storage
 * state to disk. Other specs declare this project as a dependency and consume
 * the saved state via `storageState`, so they start already logged in.
 */

const STORAGE_STATE_PATH = path.resolve(__dirname, '.auth', 'user.json');

setup('authenticate test user', async ({ page }) => {
    await page.goto('/');

    // react-native-paper TextInput maps `keyboardType="email-address"` to input[type=email]
    // and `secureTextEntry` to input[type=password] on web.
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');

    await emailField.fill(E2E_TEST_USER.email);
    await passwordField.fill(E2E_TEST_USER.password);

    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // After a successful login the sign-in screen disappears and the rail navigation
    // (Characters / Spells / Settings) becomes visible.
    await expect(page.getByText('Sign in', { exact: true })).toBeHidden({ timeout: 15_000 });

    await page.context().storageState({ path: STORAGE_STATE_PATH });
});
