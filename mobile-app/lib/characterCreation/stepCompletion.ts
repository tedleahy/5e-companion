import type { CharacterDraft } from '@/store/characterDraft';
import { CREATE_CHARACTER_ROUTES, type CreateCharacterRoute } from '@/lib/characterCreation/routes';
import { validateCharacterClassDraft } from '@/lib/characterCreation/multiclass';
import { SUBCLASS_OPTIONS, type OptionItem } from '@/lib/characterCreation/options';
import { getCreateFeatureChoiceGroups } from '@/lib/srdFeatureChoices';

/**
 * Returns whether the current create-character step is complete enough to continue.
 */
export function isCreateCharacterStepComplete(
    route: CreateCharacterRoute,
    draft: CharacterDraft,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): boolean {
    switch (route) {
        case CREATE_CHARACTER_ROUTES.identity:
            return draft.name.trim().length > 0 && draft.race !== '';
        case CREATE_CHARACTER_ROUTES.class:
            return validateCharacterClassDraft(
                draft.classes,
                draft.level,
                draft.startingClassId,
                subclassOptionsByClassId,
            ).isValid;
        case CREATE_CHARACTER_ROUTES.features:
            return hasCompletedFeatureChoices(draft);
        case CREATE_CHARACTER_ROUTES.background:
            return draft.background !== '';
        case CREATE_CHARACTER_ROUTES.abilities:
        case CREATE_CHARACTER_ROUTES.skills:
        case CREATE_CHARACTER_ROUTES.review:
            return true;
        default:
            return false;
    }
}

/**
 * Returns true when every required create-flow feature choice has been selected.
 */
function hasCompletedFeatureChoices(draft: CharacterDraft): boolean {
    const featureChoiceGroups = getCreateFeatureChoiceGroups(draft.classes);

    return featureChoiceGroups.every((group) => {
        const selectedChildSrdIndexes = draft.featureChoices
            .filter((choice) => choice.parentSrdIndex === group.parentSrdIndex)
            .map((choice) => choice.chosenChildSrdIndex);
        const uniqueSelectedChildCount = new Set(selectedChildSrdIndexes).size;

        return selectedChildSrdIndexes.length === group.chooseCount
            && uniqueSelectedChildCount === group.chooseCount;
    });
}
