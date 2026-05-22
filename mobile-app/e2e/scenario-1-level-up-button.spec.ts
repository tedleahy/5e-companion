import { expect, test } from '@playwright/test';
import { readE2ESeedState } from './seedState';

/**
 * Scenario 1, check 1: the `Level Up` button must only be visible when the
 * character sheet is in edit mode.
 *
 * Depends on `auth.setup.ts` having signed in the e2e test user and
 * `globalSetup.ts` having seeded a Fighter 4 character named `E2E Test Fighter`.
 */

test.describe('Scenario 1 — Level Up button visibility', () => {
    test('Level Up button appears only in edit mode', async ({ page }) => {
        const { characterId } = readE2ESeedState();

        // Open the freshly seeded e2e Fighter by id so duplicate legacy names
        // on the roster cannot confuse the selector.
        await page.goto(`/character/${characterId}`);

        const levelUpButton = page.getByRole('button', { name: 'Level up character' });
        const editButton = page.getByRole('button', { name: 'Enable character sheet edit mode' });
        const cancelButton = page.getByRole('button', { name: 'Cancel character sheet edits' });

        // Sheet opens in read-only mode — Level Up must be hidden.
        await expect(editButton).toBeVisible({ timeout: 15_000 });
        await expect(levelUpButton).toBeHidden();

        // Enter edit mode — Level Up becomes visible.
        await editButton.click();
        await expect(levelUpButton).toBeVisible();

        // Leave edit mode via Cancel (no backend round-trip needed) — Level Up hides again.
        await cancelButton.click();
        await expect(editButton).toBeVisible();
        await expect(levelUpButton).toBeHidden();
    });
});
