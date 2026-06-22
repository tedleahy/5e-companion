import { expect, type Page } from '@playwright/test';

/**
 * Builds a unique subclass name so repeated e2e runs do not collide.
 */
export function uniqueSubclassName(prefix: string): string {
    return `${prefix} ${Date.now()}`;
}

/**
 * Navigates to the subclass manager and waits for the list to load.
 */
export async function openSubclassManager(page: Page): Promise<void> {
    await page.goto('/subclasses');
    await expect(page.getByText('Subclass Manager')).toBeVisible();
    await expect(page.getByTestId('subclass-manager-card')).toBeVisible();
}

/**
 * Clicks the Add button and waits for the create form to appear.
 */
export async function openCreateForm(page: Page): Promise<void> {
    await page.getByTestId('add-custom-subclass').click();
    await expect(page.getByTestId('custom-subclass-form-sheet')).toBeVisible();
    await expect(page.getByText('Create Subclass')).toBeVisible();
}

/**
 * Fills the subclass form fields. Does not submit.
 */
export async function fillSubclassForm(
    page: Page,
    {
        name,
        classId,
        description,
        selectionLevel = '3',
        features,
    }: {
        name: string;
        classId: string;
        description: string;
        selectionLevel?: string;
        features?: Array<{ level: string; name: string; description: string }>;
    },
): Promise<void> {
    await page.getByTestId('custom-subclass-name-input').fill(name);
    await page.getByTestId(`custom-subclass-class-${classId}`).click();
    await page.getByTestId('custom-subclass-description-input').fill(description);
    await page.getByTestId('custom-subclass-selection-level-input').fill(selectionLevel);

    if (features && features.length > 0) {
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            await page.getByTestId('add-custom-subclass-feature').click();
            await page.getByTestId(`custom-subclass-feature-level-${i}`).fill(feature.level);
            await page.getByTestId(`custom-subclass-feature-name-${i}`).fill(feature.name);
            await page.getByTestId(`custom-subclass-feature-description-${i}`).fill(feature.description);
        }
    }
}

/**
 * Clicks Save and waits for the form to close.
 */
export async function saveSubclassForm(page: Page): Promise<void> {
    await page.getByTestId('save-custom-subclass').click();
    await expect(page.getByTestId('custom-subclass-form-sheet')).toBeHidden();
}

/**
 * Clicks Cancel and waits for the form to close. When the form is dirty
 * (i.e. the user has unsaved changes), the sheet shows a "Discard changes?"
 * confirmation; we accept the discard so the sheet closes.
 */
export async function cancelSubclassForm(page: Page): Promise<void> {
    await page.getByTestId('cancel-custom-subclass-form').click();
    const discardButton = page.getByRole('button', { name: 'Discard', exact: true });
    if (await discardButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await discardButton.click();
    }
    await expect(page.getByTestId('custom-subclass-form-sheet')).toBeHidden();
}

/**
 * Expands a subclass row by name.
 */
export async function expandSubclass(page: Page, name: string): Promise<void> {
    await page.getByRole('button', { name: `View details for ${name}` }).click();
    await expect(page.getByTestId('subclass-expand-back')).toBeVisible();
}

/**
 * Clicks the Back button to collapse an expanded subclass.
 */
export async function collapseExpandedSubclass(page: Page): Promise<void> {
    await page.getByTestId('subclass-expand-back').click();
    await expect(page.getByTestId('subclass-expand-back')).toBeHidden();
}

/**
 * Opens edit form for a custom subclass from its collapsed row.
 */
export async function editSubclassFromRow(page: Page, id: string): Promise<void> {
    await page.getByTestId('subclass-list-scroll').getByTestId(`edit-custom-subclass-${id}`).click();
    await expect(page.getByTestId('custom-subclass-form-sheet')).toBeVisible();
    await expect(page.getByText('Edit Subclass')).toBeVisible();
}

/**
 * Opens the delete confirmation for a custom subclass from its collapsed row.
 */
export async function deleteSubclassFromRow(page: Page, id: string): Promise<void> {
    await page.getByTestId('subclass-list-scroll').getByTestId(`delete-custom-subclass-${id}`).click();
    await expect(page.getByText('Delete custom subclass?')).toBeVisible();
}

/**
 * Confirms deletion in the dialog.
 */
export async function confirmDelete(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText('Delete custom subclass?')).toBeHidden();
}

/**
 * Cancels deletion in the dialog.
 */
export async function cancelDelete(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByText('Delete custom subclass?')).toBeHidden();
}

/**
 * Selects a class filter chip.
 */
export async function selectClassFilter(page: Page, classId: string): Promise<void> {
    await page.getByTestId(`subclass-filter-${classId}`).click();
}

/**
 * Returns the visible test-id suffix of a custom subclass row by its visible name.
 * This is needed because row testIDs include the generated Prisma id.
 */
export async function findCustomSubclassRowId(page: Page, name: string): Promise<string | null> {
    const row = page.getByTestId('subclass-list-scroll').locator('[data-testid^="custom-subclass-row-"]').filter({
        has: page.locator('text=' + name),
    });
    if (await row.count() === 0) return null;
    const testId = await row.getAttribute('data-testid');
    if (!testId) return null;
    // testId format: custom-subclass-row-{id}
    const parts = testId.split('custom-subclass-row-');
    return parts[1] ?? null;
}
