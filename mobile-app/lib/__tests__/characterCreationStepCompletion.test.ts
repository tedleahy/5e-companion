import { createDefaultDraft, type CharacterDraft } from '@/store/characterDraft';
import { CREATE_CHARACTER_ROUTES } from '@/lib/characterCreation/routes';
import { isCreateCharacterStepComplete } from '@/lib/characterCreation/stepCompletion';

/**
 * Builds a minimal character draft for step-completion tests.
 */
function createDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
    return {
        ...createDefaultDraft(),
        ...overrides,
    };
}

describe('characterCreationStepCompletion', () => {
    it('requires a valid class allocation on the class route', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 3,
                classes: [{ classId: 'wizard', subclassId: '', level: 2 }],
                startingClassId: 'wizard',
            }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 3,
                classes: [
                    { classId: 'wizard', subclassId: 'evocation', level: 2 },
                    { classId: 'fighter', subclassId: '', level: 1 },
                ],
                startingClassId: 'wizard',
            }),
        )).toBe(true);
    });

    it('blocks subclasses that have not reached their unlock level yet', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 1,
                classes: [{ classId: 'wizard', subclassId: 'evocation', level: 1 }],
                startingClassId: 'wizard',
            }),
        )).toBe(false);
    });

    it('requires every unlocked subclass choice before continuing', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 3,
                classes: [
                    { classId: 'wizard', subclassId: '', level: 2 },
                    { classId: 'fighter', subclassId: '', level: 1 },
                ],
                startingClassId: 'wizard',
            }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 3,
                classes: [
                    { classId: 'wizard', subclassId: 'evocation', level: 2 },
                    { classId: 'fighter', subclassId: '', level: 1 },
                ],
                startingClassId: 'wizard',
            }),
        )).toBe(true);
    });

    it('does not require a background on the abilities route for higher-level characters', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.abilities,
            createDraft({
                level: 2,
                classes: [{ classId: 'wizard', subclassId: 'evocation', level: 2 }],
                startingClassId: 'wizard',
            }),
        )).toBe(true);
    });

    it('requires every unlocked feature choice before the feature step can continue', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.features,
            createDraft({
                level: 3,
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 3 }],
                startingClassId: 'warlock',
                featureChoices: [],
            }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.features,
            createDraft({
                level: 3,
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 3 }],
                startingClassId: 'warlock',
                featureChoices: [
                    {
                        parentSrdIndex: 'eldritch-invocations',
                        chosenChildSrdIndex: 'eldritch-invocation-armor-of-shadows',
                    },
                    {
                        parentSrdIndex: 'eldritch-invocations',
                        chosenChildSrdIndex: 'eldritch-invocation-beast-speech',
                    },
                    {
                        parentSrdIndex: 'pact-boon',
                        chosenChildSrdIndex: 'pact-of-the-chain',
                    },
                ],
            }),
        )).toBe(true);
    });

    it('requires every pick for multi-choice class benefits', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.features,
            createDraft({
                level: 2,
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 2 }],
                startingClassId: 'warlock',
                featureChoices: [{
                    parentSrdIndex: 'eldritch-invocations',
                    chosenChildSrdIndex: 'eldritch-invocation-armor-of-shadows',
                }],
            }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.features,
            createDraft({
                level: 2,
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 2 }],
                startingClassId: 'warlock',
                featureChoices: [
                    {
                        parentSrdIndex: 'eldritch-invocations',
                        chosenChildSrdIndex: 'eldritch-invocation-armor-of-shadows',
                    },
                    {
                        parentSrdIndex: 'eldritch-invocations',
                        chosenChildSrdIndex: 'eldritch-invocation-beast-speech',
                    },
                ],
            }),
        )).toBe(true);
    });

    it('requires a background on the background route', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.background,
            createDraft({ level: 2 }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.background,
            createDraft({ background: 'Acolyte', level: 2 }),
        )).toBe(true);
    });
});
