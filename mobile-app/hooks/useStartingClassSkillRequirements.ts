import useCreationProficiencyRequirements from '@/hooks/useCreationProficiencyRequirements';
import type { ClassProficiencyChoiceGroup } from '@/lib/characterCreation/classRules';
import type { SkillKey } from '@/lib/characterSheetUtils';

type UseStartingClassSkillRequirementsResult = {
    /** Independently limited choice groups for the starting class (SKILL + named). */
    proficiencyChoiceGroups: ClassProficiencyChoiceGroup[];
    /** Fixed starting skill grants (`choiceGroup == null`) — auto-selected, not choosable. */
    fixedSkillKeys: SkillKey[];
    /** True while the class definition needed to resolve requirements is still loading. */
    loading: boolean;
    error: ReturnType<typeof useCreationProficiencyRequirements>['error'];
};

/**
 * @deprecated Prefer {@link useCreationProficiencyRequirements} for multiclass-aware creation.
 * Thin wrapper kept for call sites that only need the starting class.
 */
export default function useStartingClassSkillRequirements(
    startingClassId: string,
): UseStartingClassSkillRequirementsResult {
    const requirements = useCreationProficiencyRequirements(
        startingClassId ? [{ classId: startingClassId, subclassId: '', level: 1 }] : [],
        startingClassId,
    );

    return {
        proficiencyChoiceGroups: requirements.proficiencyChoiceGroups,
        fixedSkillKeys: requirements.fixedSkillKeys,
        loading: requirements.loading,
        error: requirements.error,
    };
}
