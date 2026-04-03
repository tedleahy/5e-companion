import type { Href } from 'expo-router';

/** Typed route constants for the character-creation wizard flow. */
export const CREATE_CHARACTER_ROUTES = {
    identity: '/characters/create',
    race: '/characters/create/race',
    class: '/characters/create/class',
    abilities: '/characters/create/abilities',
    background: '/characters/create/background',
    skills: '/characters/create/skills',
    review: '/characters/create/review',
} as const satisfies Record<string, Href>;

/** Union of all supported character-creation wizard routes. */
export type CreateCharacterRoute = (typeof CREATE_CHARACTER_ROUTES)[keyof typeof CREATE_CHARACTER_ROUTES];

/** Base step order for the character wizard (race is merged into identity). */
const BASE_CREATE_CHARACTER_STEP_ROUTES: readonly CreateCharacterRoute[] = [
    CREATE_CHARACTER_ROUTES.identity,
    CREATE_CHARACTER_ROUTES.class,
    CREATE_CHARACTER_ROUTES.abilities,
    CREATE_CHARACTER_ROUTES.background,
    CREATE_CHARACTER_ROUTES.skills,
    CREATE_CHARACTER_ROUTES.review,
];

/**
 * Returns the typed route order for the create-character wizard.
 */
export function getCreateCharacterStepRoutes(_level: number): CreateCharacterRoute[] {
    return [...BASE_CREATE_CHARACTER_STEP_ROUTES];
}

/**
 * Derives the active wizard step index from the current pathname.
 */
export function deriveCreateCharacterStepIndex(
    pathname: string,
    stepRoutes: readonly CreateCharacterRoute[],
): number {
    const normalisedPathname = pathname.replace(/\/$/, '');
    const stepIndex = stepRoutes.findIndex((route) => route === normalisedPathname);
    return stepIndex >= 0 ? stepIndex : 0;
}
