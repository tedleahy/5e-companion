import type { CharacterDraft } from '@/store/characterDraft';
import { CREATE_CHARACTER_ROUTES } from '@/lib/characterCreation/routes';
import { isCreateCharacterStepComplete } from '@/lib/characterCreation/stepCompletion';

/**
 * Builds a minimal character draft for step-completion tests.
 */
function createDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
    return {
        name: '',
        race: '',
        class: '',
        subclass: '',
        level: 1,
        abilityScores: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
        },
        background: '',
        alignment: null,
        personalityTraits: '',
        ideals: '',
        bonds: '',
        flaws: '',
        skillProficiencies: [],
        asiAllocations: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
        },
        expertiseSkills: [],
        abilityMode: 'roll',
        ...overrides,
    };
}

describe('characterCreationStepCompletion', () => {
    it('requires a subclass on the subclass route', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.subclass,
            createDraft({ class: 'Wizard', level: 2 }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.subclass,
            createDraft({ class: 'Wizard', subclass: 'School of Evocation', level: 2 }),
        )).toBe(true);
    });

    it('does not require a background on the abilities route for higher-level characters', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.abilities,
            createDraft({ class: 'Wizard', subclass: 'School of Evocation', level: 2 }),
        )).toBe(true);
    });

    it('requires a background on the background route', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.background,
            createDraft({ level: 2 }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.background,
            createDraft({ background: 'Sage', level: 2 }),
        )).toBe(true);
    });
});
