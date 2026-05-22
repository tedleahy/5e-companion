import { expect, test } from '@playwright/test';
import {
    completeAbilitiesStep,
    completeBackgroundStep,
    completeClassStep,
    completeIdentityStep,
    completeWizardLevelOneFlow,
    continueFromSkillsStep,
    CREATE_STEP_HEADINGS,
    expectCharacterSheetSummary,
    openCharacterCreationFromRoster,
    selectClassSkills,
    selectFeatureChoice,
    submitCharacterCreation,
    uniqueCharacterName,
} from './character-creation-helpers';

/**
 * End-to-end coverage for the multi-step character creation wizard.
 *
 * Depends on `auth.setup.ts` for an authenticated session and `globalSetup.ts`
 * for the local Supabase stack + SRD seed data.
 */

test.describe('Character creation — full wizard flow', () => {
    // Depends on seeded roster data and the auth.setup.ts storage state.
    test('creates a level 1 wizard from the roster and opens the new sheet', async ({ page }) => {
        const characterName = uniqueCharacterName('E2E Wizard');

        await openCharacterCreationFromRoster(page);
        await completeWizardLevelOneFlow(page, { name: characterName });
        await submitCharacterCreation(page, characterName);
        await expectCharacterSheetSummary(page, /Wizard · Human/);
    });

    test('inserts the fighting style features step for a level 1 fighter', async ({ page }) => {
        const characterName = uniqueCharacterName('E2E Fighter');

        await page.goto('/characters/create');
        await completeIdentityStep(page, { name: characterName, race: 'Dwarf' });
        await completeClassStep(page, 'Fighter');
        await completeAbilitiesStep(page);
        await completeBackgroundStep(page);
        await selectClassSkills(page, ['athletics', 'perception']);
        await continueFromSkillsStep(page);

        await selectFeatureChoice(
            page,
            'fighter-fighting-style',
            'fighter-fighting-style-dueling',
        );

        await expect(page.getByText(characterName)).toBeVisible();
        await expect(page.getByText('Fighter — Level 1')).toBeVisible();
        await expect(page.getByText('Ready to begin?').locator('..').getByText('Fighting Style: Dueling')).toBeVisible();
    });

    test('shows review summary before submission', async ({ page }) => {
        const characterName = uniqueCharacterName('E2E Review');

        await page.goto('/characters/create');
        await completeWizardLevelOneFlow(page, {
            name: characterName,
            race: 'Elf',
            classLabel: 'Wizard',
            skills: ['investigation', 'medicine'],
        });

        await expect(page.getByText(CREATE_STEP_HEADINGS.review)).toBeVisible();
        await expect(page.getByText(characterName)).toBeVisible();
        await expect(page.getByText('Ready to begin?').locator('..').getByText('Elf', { exact: true })).toBeVisible();
        await expect(page.getByText('Ready to begin?').locator('..').getByText('Acolyte', { exact: true })).toBeVisible();
        await expect(page.getByText('Fighter — Level 1')).toBeHidden();
        await expect(page.getByText('Wizard — Level 1')).toBeVisible();
    });
});

test.describe('Character creation — step gating', () => {
    test('keeps Continue disabled on identity until name and race are set', async ({ page }) => {
        await page.goto('/characters/create');
        await expect(page.getByText(CREATE_STEP_HEADINGS.identity)).toBeVisible();

        const continueButton = page.getByText('Continue', { exact: true });

        await expect(continueButton).toBeVisible();
        await continueButton.click({ force: true });
        await expect(page.getByText(CREATE_STEP_HEADINGS.identity)).toBeVisible();

        await page.getByPlaceholder('e.g. Vaelindra Stormveil').fill('Gate Test Hero');
        await continueButton.click({ force: true });
        await expect(page.getByText(CREATE_STEP_HEADINGS.identity)).toBeVisible();

        await page.getByRole('button', { name: /Halfling/i }).click();
        await continueButton.click();
        await expect(page.getByText(CREATE_STEP_HEADINGS.class)).toBeVisible();
    });

    test('keeps Continue disabled on class until a class is selected', async ({ page }) => {
        await page.goto('/characters/create');
        await completeIdentityStep(page, { name: 'Class Gate Hero', race: 'Human' });

        const continueButton = page.getByText('Continue', { exact: true });
        await continueButton.click({ force: true });
        await expect(page.getByText(CREATE_STEP_HEADINGS.class)).toBeVisible();

        await page.getByRole('button', { name: /Rogue/i }).click();
        await continueButton.click();
        await expect(page.getByText(CREATE_STEP_HEADINGS.abilities)).toBeVisible();
    });

    test('keeps Continue disabled on background until a background is chosen', async ({ page }) => {
        await page.goto('/characters/create');
        await completeIdentityStep(page, { name: 'Background Gate Hero', race: 'Human' });
        await completeClassStep(page, 'Wizard');
        await completeAbilitiesStep(page);

        const continueButton = page.getByText('Continue', { exact: true });
        await continueButton.click({ force: true });
        await expect(page.getByText(CREATE_STEP_HEADINGS.background)).toBeVisible();

        await page.getByRole('button', { name: /Acolyte/i }).click();
        await continueButton.click();
        await expect(page.getByText(CREATE_STEP_HEADINGS.skills)).toBeVisible();
    });
});
