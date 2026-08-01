import type { CharacterDraft } from '@/store/characterDraft';
import { CREATE_CHARACTER_ROUTES, type CreateCharacterRoute } from '@/lib/characterCreation/routes';
import { validateCharacterClassDraft } from '@/lib/characterCreation/multiclass';
import { SUBCLASS_OPTIONS, type OptionItem } from '@/lib/characterCreation/options';
import { getCreateFeatureChoiceGroups } from '@/lib/srdFeatureChoices';
import { type ClassProficiencyChoiceGroup } from '@/lib/characterCreation/classRules';
import { areProficiencyChoicesComplete } from '@/lib/characterCreation/proficiencyChoiceDraft';

/**
 * Returns whether the current create-character step is complete enough to continue.
 *
 * Proficiency choice groups and their loading/error flags describe creation
 * requirements across all class rows (see `useCreationProficiencyRequirements`)
 * and are only consulted on the skills route.
 */
export function isCreateCharacterStepComplete(
    route: CreateCharacterRoute,
    draft: CharacterDraft,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
    _deprecatedSkillChoiceGroups: unknown = [],
    skillRequirementsLoading = false,
    proficiencyChoiceGroups: ClassProficiencyChoiceGroup[] = [],
    skillRequirementsError = false,
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
        case CREATE_CHARACTER_ROUTES.skills:
            return !skillRequirementsLoading
                && !skillRequirementsError
                && areProficiencyChoicesComplete(draft.proficiencyChoices, proficiencyChoiceGroups);
        case CREATE_CHARACTER_ROUTES.abilities:
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
