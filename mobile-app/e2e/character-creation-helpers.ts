import { expect, type Page } from '@playwright/test';
import type { SkillKey } from '../lib/characterSheetUtils';

/** Step headings rendered by the create-character wizard screens. */
export const CREATE_STEP_HEADINGS = {
    identity: 'Who are you?',
    class: 'Choose your class and level.',
    abilities: 'Set your abilities.',
    background: 'Background & alignment.',
    skills: 'Choose your skills.',
    features: 'Additional Class Benefits',
    review: 'Ready to begin?',
} as const;

/**
 * Builds a unique character name so repeated e2e runs do not collide in the roster.
 */
export function uniqueCharacterName(prefix: string): string {
    return `${prefix} ${Date.now()}`;
}

/**
 * Clicks an OptionGrid tile whose accessible name includes the given label.
 *
 * RN Web exposes icon + label + hint as one button name (for example
 * "Human +1 all stats").  This matches the label inside the composite name
 * while treating hyphenated race names like "Half-Elf" as one token, so
 * selecting "Elf" does not also match "Half-Elf".
 */
export async function clickOptionGridItem(page: Page, label: string): Promise<void> {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = new RegExp(`(^|[^A-Za-z0-9-])${escapedLabel}($|[^A-Za-z0-9-])`, 'i');
    await page.getByRole('button', { name: namePattern }).click();
}

/**
 * Opens the create-character wizard from the authenticated characters roster.
 */
export async function openCharacterCreationFromRoster(page: Page): Promise<void> {
    await page.goto('/characters');
    await expect(page.getByText('My Characters')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Create a new character' }).click();
    await expect(page).toHaveURL(/\/characters\/create/);
    await expect(page.getByText(CREATE_STEP_HEADINGS.identity)).toBeVisible();
}

/**
 * Fills the identity step and advances to class selection.
 */
export async function completeIdentityStep(
    page: Page,
    options: { name: string; race: string },
): Promise<void> {
    await page.getByPlaceholder('e.g. Vaelindra Stormveil').fill(options.name);
    await clickOptionGridItem(page, options.race);
    await continueFromStep(page, CREATE_STEP_HEADINGS.class);
}

/**
 * Selects a class on the class step and advances to abilities.
 */
export async function completeClassStep(page: Page, classLabel: string): Promise<void> {
    await expect(page.getByText(CREATE_STEP_HEADINGS.class)).toBeVisible();
    await clickOptionGridItem(page, classLabel);
    await continueFromStep(page, CREATE_STEP_HEADINGS.abilities);
}

/**
 * Advances through the abilities step (always valid with default scores).
 */
export async function completeAbilitiesStep(page: Page): Promise<void> {
    await expect(page.getByText(CREATE_STEP_HEADINGS.abilities)).toBeVisible();
    await continueFromStep(page, CREATE_STEP_HEADINGS.background);
}

/**
 * Selects background (and optional alignment) then advances to skills.
 */
export async function completeBackgroundStep(
    page: Page,
    options: { background?: string; alignment?: string } = {},
): Promise<void> {
    const background = options.background ?? 'Acolyte';

    await expect(page.getByText(CREATE_STEP_HEADINGS.background)).toBeVisible();
    await clickOptionGridItem(page, background);

    if (options.alignment) {
        await page.getByText(options.alignment, { exact: true }).click();
    }

    await continueFromStep(page, CREATE_STEP_HEADINGS.skills);
}

/**
 * Toggles class-skill proficiencies on the skills step by stable testID.
 * Keyed off SkillKey so background-granted skills (locked toggles with the
 * same label) cannot be hit by accident.
 */
export async function selectClassSkills(page: Page, skillKeys: SkillKey[]): Promise<void> {
    for (const skillKey of skillKeys) {
        await page.getByTestId(`create-skill-class-${skillKey}`).click();
    }
}

/**
 * Advances from skills to the next step (features when applicable, otherwise review).
 */
export async function continueFromSkillsStep(page: Page): Promise<void> {
    await expect(page.getByText(CREATE_STEP_HEADINGS.skills)).toBeVisible();
    await page.getByText('Continue', { exact: true }).click();
}

/**
 * Selects a fighting-style (or other parent/child) option on the features step.
 */
export async function selectFeatureChoice(
    page: Page,
    parentSrdIndex: string,
    childSrdIndex: string,
): Promise<void> {
    await expect(page.getByText(CREATE_STEP_HEADINGS.features)).toBeVisible();
    await page.getByTestId(`create-feature-choice-${parentSrdIndex}-${childSrdIndex}`).click();
    await continueFromStep(page, CREATE_STEP_HEADINGS.review);
}

/**
 * Submits the review step and waits for the new character sheet route.
 */
export async function submitCharacterCreation(page: Page, characterName: string): Promise<void> {
    await expect(page.getByText(CREATE_STEP_HEADINGS.review)).toBeVisible();
    await expect(page.getByText(characterName)).toBeVisible();
    await page.getByText(/Create Character/).click();
    await expect(page).toHaveURL(/\/character\/[^/]+$/, { timeout: 20_000 });
    await expect(page.getByText('Character Sheet')).toBeVisible();
    await expect(
        page
            .getByTestId('character-sheet-header-subtitle')
            .locator('..')
            .getByText(characterName, { exact: true }),
    ).toBeVisible();
}

/**
 * Asserts the opened character sheet header shows the expected summary line.
 */
export async function expectCharacterSheetSummary(
    page: Page,
    summaryPattern: RegExp,
): Promise<void> {
    await expect(page.getByText(summaryPattern)).toBeVisible();
}

/**
 * Clicks the wizard footer Continue button and waits for the next step heading.
 */
export async function continueFromStep(page: Page, nextHeading: string): Promise<void> {
    await page.getByText('Continue', { exact: true }).click();
    await expect(page.getByText(nextHeading)).toBeVisible();
}

/**
 * Runs the standard level-1 wizard path with no conditional feature step.
 */
export async function completeWizardLevelOneFlow(
    page: Page,
    options: { name: string; race?: string; classLabel?: string; skills?: SkillKey[] },
): Promise<void> {
    await completeIdentityStep(page, {
        name: options.name,
        race: options.race ?? 'Human',
    });
    await completeClassStep(page, options.classLabel ?? 'Wizard');
    await completeAbilitiesStep(page);
    await completeBackgroundStep(page);
    await selectClassSkills(page, options.skills ?? ['arcana', 'history']);
    await continueFromSkillsStep(page);
    await expect(page.getByText(CREATE_STEP_HEADINGS.review)).toBeVisible();
}
