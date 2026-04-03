import {
    CREATE_CHARACTER_ROUTES,
    deriveCreateCharacterStepIndex,
    getCreateCharacterStepRoutes,
} from '@/lib/characterCreation/routes';

describe('characterCreationRoutes', () => {
    it('returns the wizard route order for level 1 characters', () => {
        expect(getCreateCharacterStepRoutes(1)).toEqual([
            CREATE_CHARACTER_ROUTES.identity,
            CREATE_CHARACTER_ROUTES.class,
            CREATE_CHARACTER_ROUTES.abilities,
            CREATE_CHARACTER_ROUTES.background,
            CREATE_CHARACTER_ROUTES.skills,
            CREATE_CHARACTER_ROUTES.review,
        ]);
    });

    it('uses the same route order for higher-level characters', () => {
        expect(getCreateCharacterStepRoutes(2)).toEqual([
            CREATE_CHARACTER_ROUTES.identity,
            CREATE_CHARACTER_ROUTES.class,
            CREATE_CHARACTER_ROUTES.abilities,
            CREATE_CHARACTER_ROUTES.background,
            CREATE_CHARACTER_ROUTES.skills,
            CREATE_CHARACTER_ROUTES.review,
        ]);
    });

    it('matches the current step even when the pathname has a trailing slash', () => {
        const stepRoutes = getCreateCharacterStepRoutes(1);

        expect(deriveCreateCharacterStepIndex('/characters/create/skills/', stepRoutes)).toBe(4);
    });

    it('falls back to the first step when the pathname is outside the wizard flow', () => {
        const stepRoutes = getCreateCharacterStepRoutes(1);

        expect(deriveCreateCharacterStepIndex('/characters', stepRoutes)).toBe(0);
    });
});
