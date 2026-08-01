import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import type { ErrorLike } from '@apollo/client';
import {
    configuredFixedSkillsForGrant,
    configuredProficiencyChoiceGroupsForGrant,
    fallbackStartingSkillChoiceGroup,
    type ClassProficiencyChoiceGroup,
} from '@/lib/characterCreation/classRules';
import { GET_ATTACHED_CLASS_DETAILS } from '@/graphql/class.operations';
import type {
    AttachedClassDetailsQuery,
    AttachedClassDetailsQueryVariables,
    ClassDetailsFieldsFragment,
} from '@/types/generated_graphql_types';
import type { SkillKey } from '@/lib/characterSheetUtils';
import type { CharacterClassDraft } from '@/lib/characterCreation/multiclass';

export type CreationProficiencyRequirements = {
    /**
     * Independently limited choice groups (SKILL + named) across all class rows.
     * Option values are proficiency identities (`srdIndex ?? id`).
     */
    proficiencyChoiceGroups: ClassProficiencyChoiceGroup[];
    /** Fixed skill grants that the server auto-applies (starting + secondary). */
    fixedSkillKeys: SkillKey[];
    /** True while any required class definition is still loading. */
    loading: boolean;
    /**
     * Query failure, or a settled batch that did not resolve every selected class.
     * Either case blocks Continue and drives the skills-step retry UI.
     */
    error: ErrorLike | undefined;
    /** Reloads class definitions after a failure. */
    refetch: () => void;
    /** Loaded class definitions keyed by selection value. */
    classDefinitionsByValue: Map<string, ClassDetailsFieldsFragment>;
};

/**
 * Builds a requirements error when the batch query settled without every selected class.
 */
function missingClassDefinitionsError(unresolvedClassIds: string[]): Error {
    return new Error(
        `Could not load class proficiency requirements for: ${unresolvedClassIds.join(', ')}`,
    );
}

/**
 * Loads STARTING proficiency requirements for the starting class and MULTICLASS
 * requirements for every secondary class. Shared by the skills step, wizard
 * step-completion gate, and review display.
 */
export default function useCreationProficiencyRequirements(
    classes: readonly CharacterClassDraft[],
    startingClassId: string,
): CreationProficiencyRequirements {
    const classIds = useMemo(
        () => [...new Set(classes.map((classRow) => classRow.classId).filter((classId) => classId.length > 0))],
        [classes],
    );

    const { data, loading, error, refetch } = useQuery<
        AttachedClassDetailsQuery,
        AttachedClassDetailsQueryVariables
    >(
        GET_ATTACHED_CLASS_DETAILS,
        {
            variables: { values: classIds },
            skip: classIds.length === 0,
            fetchPolicy: 'cache-first',
        },
    );

    const classDefinitionsByValue = useMemo(() => {
        const map = new Map<string, ClassDetailsFieldsFragment>();
        for (const classDefinition of data?.attachedClassDetails ?? []) {
            map.set(classDefinition.value, classDefinition);
            if (classDefinition.srdIndex) {
                map.set(classDefinition.srdIndex, classDefinition);
            }
            map.set(classDefinition.id, classDefinition);
        }
        return map;
    }, [data?.attachedClassDetails]);

    const queryInFlight = loading && classIds.length > 0;
    const unresolvedClassIds = classIds.filter((classId) => !classDefinitionsByValue.has(classId));
    // Once the batch has settled, every selected class must resolve. Soft skill-table
    // fallbacks for missing definitions would omit MULTICLASS / named groups and let
    // Continue through to a server rejection.
    const incompleteBatchError = (
        !queryInFlight
        && classIds.length > 0
        && !error
        && unresolvedClassIds.length > 0
    )
        ? missingClassDefinitionsError(unresolvedClassIds)
        : undefined;
    const requirementsError = classIds.length > 0
        ? (error ?? incompleteBatchError)
        : undefined;

    const resolvedStartingClassId = startingClassId.length > 0
        ? startingClassId
        : (classes[0]?.classId ?? '');

    const proficiencyChoiceGroups: ClassProficiencyChoiceGroup[] = [];
    const fixedSkillKeys: SkillKey[] = [];

    // While the query is in flight or failed (including incomplete batches), omit
    // groups so completion stays blocked rather than falling through with an
    // incomplete requirement set.
    if (!requirementsError && !queryInFlight) {
        for (const classRow of classes) {
            if (!classRow.classId) continue;
            const isStarting = classRow.classId === resolvedStartingClassId;
            const grant = isStarting ? 'STARTING' : 'MULTICLASS';
            const classDefinition = classDefinitionsByValue.get(classRow.classId) ?? null;
            if (!classDefinition) continue;

            const configured = configuredProficiencyChoiceGroupsForGrant(
                classDefinition,
                grant,
                classRow.classId,
            );

            if (configured.length > 0) {
                proficiencyChoiceGroups.push(...configured);
            } else if (isStarting && !configured.some((group) => group.type === 'SKILL')) {
                // Definition resolved but authoring omitted SKILL choice rules: SRD
                // static skill table fills starting skill picks only.
                const hasSkillChoiceRules = (classDefinition.proficiencies ?? [])
                    .some((rule) => rule.grant === 'STARTING' && rule.type === 'SKILL' && rule.choiceGroup != null);
                if (!hasSkillChoiceRules) {
                    const fallback = fallbackStartingSkillChoiceGroup(classRow.classId);
                    if (fallback) proficiencyChoiceGroups.push(fallback);
                }
            }

            fixedSkillKeys.push(...configuredFixedSkillsForGrant(classDefinition, grant));
        }
    }

    return {
        proficiencyChoiceGroups,
        fixedSkillKeys: [...new Set(fixedSkillKeys)],
        loading: queryInFlight,
        error: requirementsError,
        refetch: () => {
            void refetch();
        },
        classDefinitionsByValue,
    };
}
