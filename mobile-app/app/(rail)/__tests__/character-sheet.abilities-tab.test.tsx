import { fireEvent, screen } from '@testing-library/react-native';
import { waitFor } from '@/test-utils/waitFor';
import {
    CHARACTERS_MOCK,
    UPDATE_SAVING_THROW_PROFICIENCIES_MOCK,
    UPDATE_SKILLS_MOCK,
} from './mocks/character-sheet.mocks';
import {
    enableCharacterSheetEditMode,
    openCharacterSheetTab,
    pressAndFlush,
    renderCharacterSheetScreen,
    setupCharacterSheetScreenTestHooks,
} from './character-sheet.test-utils';

// Sibling sheet areas have dedicated route suites; omit them from this focused render.
jest.mock('@/components/character-sheet/DeathSavesCard', () => () => null);
jest.mock('@/components/character-sheet/FeaturesTab', () => () => null);
jest.mock('@/components/character-sheet/GearTab', () => () => null);
jest.mock('@/components/character-sheet/level-up/LevelUpWizardSheet', () => () => null);
jest.mock('@/components/character-sheet/QuickStatsCard', () => () => null);
jest.mock('@/components/character-sheet/skills/PassiveSensesCard', () => () => null);
jest.mock('@/components/character-sheet/SpellsTab', () => () => null);
jest.mock('@/components/character-sheet/TraitsTab', () => () => null);
jest.mock('@/components/character-sheet/VitalsCard', () => () => null);

describe('CharacterByIdScreen abilities tab', () => {
    setupCharacterSheetScreenTestHooks();

    it('switches to the abilities tab and shows abilities and skills', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getByText('Abilities & Skills')).toBeTruthy();
        });
    });

    it('renders saving throw rows on the abilities tab', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getAllByText('Saving Throw').length).toBe(6);
        });
    });

    it('renders skill rows on the abilities tab', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });
    });

    it('cycles skill proficiency and updates the skill modifier', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, UPDATE_SKILLS_MOCK]);

        await enableCharacterSheetEditMode();
        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getByTestId('ability-skills-mod-perception')).toHaveTextContent('+5');
        });

        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Perception');

        await waitFor(() => {
            expect(screen.getByLabelText('Cycle proficiency for Perception')).toBeTruthy();
        });

        await pressAndFlush(screen.getByLabelText('Cycle proficiency for Perception'));

        await waitFor(() => {
            expect(screen.getByTestId('ability-skills-mod-perception')).toHaveTextContent('+9');
        });
    });

    it('toggles saving throw proficiency and updates the modifier', async () => {
        renderCharacterSheetScreen([CHARACTERS_MOCK, UPDATE_SAVING_THROW_PROFICIENCIES_MOCK]);

        await enableCharacterSheetEditMode();
        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getByTestId('ability-saves-mod-strength')).toHaveTextContent('−1');
        });

        await pressAndFlush(screen.getByLabelText('Toggle saving throw proficiency for Strength'));

        await waitFor(() => {
            expect(screen.getByTestId('ability-saves-mod-strength')).toHaveTextContent('+3');
        });
    });

    it('allows editing ability scores in edit mode', async () => {
        renderCharacterSheetScreen();

        await enableCharacterSheetEditMode();
        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getByDisplayValue('20')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByDisplayValue('20'), '18');

        await waitFor(() => {
            expect(screen.getByDisplayValue('18')).toBeTruthy();
        });
    });

    it('filters skills by search text', async () => {
        renderCharacterSheetScreen();

        await openCharacterSheetTab('Abilities');

        await waitFor(() => {
            expect(screen.getByLabelText('Search skills')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Arcana');

        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });

        expect(screen.queryByText('Athletics')).toBeNull();
        expect(screen.getAllByText('Saving Throw').length).toBe(1);
        expect(screen.queryByTestId('ability-saves-mod-strength')).toBeNull();
    });
});
