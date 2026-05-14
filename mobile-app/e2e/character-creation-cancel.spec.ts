import { expect, test } from '@playwright/test';

/**
 * Regression test for bug #2: Cancel button must show a cross-platform
 * confirmation dialog on web (Alert.alert is a no-op on web).
 *
 * Depends on `auth.setup.ts` having signed in the e2e test user.
 */

test.describe('Character creation — Cancel confirmation', () => {
    test('shows confirmation dialog and abandons draft on web', async ({ page }) => {
        await page.goto('/characters/create');

        // Fill in a name to create draft data
        await expect(page.getByText('Who are you?')).toBeVisible();
        const nameField = page.getByPlaceholder('e.g. Vaelindra Stormveil');
        await nameField.fill('E2E Test Hero');

        // Click Cancel — should show the confirmation dialog
        await page.getByText('Cancel').click();

        await expect(page.getByRole('heading', { name: 'Abandon Character?' })).toBeVisible();
        await expect(page.getByText('Your progress will be lost.')).toBeVisible();

        // Click Keep Editing — dialog closes, stays on creation page
        await page.getByRole('button', { name: 'Keep Editing' }).click();
        await expect(page.getByRole('heading', { name: 'Abandon Character?' })).toBeHidden();
        await expect(page).toHaveURL(/\/characters\/create/);

        // Click Cancel again and then Abandon — navigates away
        await page.getByText('Cancel').click();
        await expect(page.getByRole('heading', { name: 'Abandon Character?' })).toBeVisible();

        await page.getByRole('button', { name: 'Abandon' }).click();
        await expect(page).toHaveURL(/\/characters$/);
    });
});
