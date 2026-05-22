import {
    CREATE_CHARACTER_ROUTES,
    deriveCreateCharacterStepIndex,
    getCreateCharacterStepRoutes,
} from '@/lib/characterCreation/routes';
import { createDefaultDraft } from '@/store/characterDraft';

describe('characterCreationRoutes', () => {
    it('returns the wizard route order when no feature-choice step is needed', () => {
        expect(getCreateCharacterStepRoutes(createDefaultDraft())).toEqual([
            CREATE_CHARACTER_ROUTES.identity,
            CREATE_CHARACTER_ROUTES.class,
            CREATE_CHARACTER_ROUTES.abilities,
            CREATE_CHARACTER_ROUTES.background,
            CREATE_CHARACTER_ROUTES.skills,
            CREATE_CHARACTER_ROUTES.review,
        ]);
    });

    it('inserts the feature-choice route after class selection when choices are required', () => {
        expect(getCreateCharacterStepRoutes({
            ...createDefaultDraft(),
            classes: [{ classId: 'warlock', subclassId: 'fiend', level: 3 }],
        })).toEqual([
            CREATE_CHARACTER_ROUTES.identity,
            CREATE_CHARACTER_ROUTES.class,
            CREATE_CHARACTER_ROUTES.features,
            CREATE_CHARACTER_ROUTES.abilities,
            CREATE_CHARACTER_ROUTES.background,
            CREATE_CHARACTER_ROUTES.skills,
            CREATE_CHARACTER_ROUTES.review,
        ]);
    });

    it('matches the current step even when the pathname has a trailing slash', () => {
        const stepRoutes = getCreateCharacterStepRoutes(createDefaultDraft());

        expect(deriveCreateCharacterStepIndex('/characters/create/skills/', stepRoutes)).toBe(4);
    });

    it('falls back to the first step when the pathname is outside the wizard flow', () => {
        const stepRoutes = getCreateCharacterStepRoutes(createDefaultDraft());

        expect(deriveCreateCharacterStepIndex('/characters', stepRoutes)).toBe(0);
    });
});
