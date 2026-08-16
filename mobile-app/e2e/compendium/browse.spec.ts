import { expect, test, type Page } from '@playwright/test';

const BROWSE_CATEGORIES = [
    { key: 'races', noun: 'races' },
    { key: 'subraces', noun: 'subraces' },
    { key: 'backgrounds', noun: 'backgrounds' },
    { key: 'feats', noun: 'feats' },
    { key: 'languages', noun: 'languages' },
] as const;

async function waitForBrowseList(page: Page) {
    await expect(page.getByTestId('compendium-collection-list')).toBeVisible();
    const firstRow = page.locator('[data-testid^="compendium-row-"]').first();
    await expect(firstRow).toBeVisible();
    return firstRow;
}

test.describe('Compendium browse categories', () => {
    test('enables all five browse cards and routes each one to loaded data', async ({ page }) => {
        await page.goto('/compendium');

        for (const category of BROWSE_CATEGORIES) {
            const card = page.getByTestId(`compendium-category-${category.key}`);
            await expect(card).toBeVisible();
            await expect(card).toBeEnabled();
            await card.click();

            await expect(page).toHaveURL(new RegExp(`/compendium/${category.key}$`));
            await waitForBrowseList(page);
            await page.goto('/compendium');
        }

        await expect(page.getByText('Coming soon')).toHaveCount(0);
    });

    test('supports search, detail/back, and deep-link arrival for every browse category', async ({ page }) => {
        for (const category of BROWSE_CATEGORIES) {
            await page.goto(`/compendium/${category.key}`);
            const firstRow = await waitForBrowseList(page);
            const rowTestId = await firstRow.getAttribute('data-testid');
            expect(rowTestId).toMatch(/^compendium-row-.+/);

            const search = page.getByLabel(`Search ${category.noun}`);
            await expect(search).toBeVisible();
            await search.fill('__no_matching_compendium_entry__');
            await expect(page.getByTestId('compendium-collection-empty')).toBeVisible();
            await search.fill('');
            await expect(firstRow).toBeVisible();

            await firstRow.click();
            await expect(page.getByTestId('compendium-detail-back')).toBeVisible();
            await expect(page.getByTestId('compendium-collection-list')).toBeHidden();

            await page.getByTestId('compendium-detail-back').click();
            await expect(page.getByTestId('compendium-collection-list')).toBeVisible();

            const value = rowTestId?.replace('compendium-row-', '');
            expect(value).toBeTruthy();
            await page.goto(`/compendium/${category.key}?value=${encodeURIComponent(value ?? '')}`);
            await expect(page.getByTestId('compendium-detail-back')).toBeVisible();
        }
    });

    test('keeps category filters visible and hides the rail menu on a phone viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('/compendium/subraces');
        await waitForBrowseList(page);
        await expect(page.getByTestId('subrace-parent-filter')).toBeVisible();
        await expect(page.getByTestId('rail-shell-menu')).toBeHidden();
        await expect(page.getByRole('button', { name: 'Back to all Compendium categories' })).toBeVisible();

        await page.goto('/compendium/languages');
        await waitForBrowseList(page);
        await expect(page.getByTestId('language-type-filter')).toBeVisible();
        await expect(page.getByTestId('language-script-filter')).toBeVisible();
        await expect(page.getByTestId('rail-shell-menu')).toBeHidden();
    });
});
