import type { CharacterDraft } from '@/store/characterDraft';
import { CREATE_CHARACTER_ROUTES, type CreateCharacterRoute } from '@/lib/characterCreation/routes';

/**
 * Returns whether the current create-character step is complete enough to continue.
 */
export function isCreateCharacterStepComplete(
    route: CreateCharacterRoute,
    draft: CharacterDraft,
): boolean {
    switch (route) {
        case CREATE_CHARACTER_ROUTES.identity:
            return draft.name.trim().length > 0;
        case CREATE_CHARACTER_ROUTES.race:
            return draft.race !== '';
        case CREATE_CHARACTER_ROUTES.class:
            return draft.class !== '';
        case CREATE_CHARACTER_ROUTES.subclass:
            return draft.subclass !== '';
        case CREATE_CHARACTER_ROUTES.background:
            return draft.background !== '';
        case CREATE_CHARACTER_ROUTES.abilities:
        case CREATE_CHARACTER_ROUTES.skills:
        case CREATE_CHARACTER_ROUTES.review:
            return true;
    }
}
