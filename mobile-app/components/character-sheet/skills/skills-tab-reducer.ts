import type { AbilityKey, SkillKey } from '@/lib/characterSheetUtils';
import {
    ProficiencyLevel,
    type SkillProficiencies,
} from '@/types/generated_graphql_types';

export type AbilityFilter = AbilityKey | 'all';
export type LocalSkillProficiencies = Record<SkillKey, ProficiencyLevel>;

export type SkillsTabState = {
    searchText: string;
    abilityFilter: AbilityFilter;
    localSkillProficiencies: LocalSkillProficiencies;
};

type SetSearchTextAction = {
    type: 'setSearchText';
    searchText: string;
};

type SetAbilityFilterAction = {
    type: 'setAbilityFilter';
    abilityFilter: AbilityFilter;
};

type CycleSkillAction = {
    type: 'cycleSkill';
    skillKey: SkillKey;
};

type ResetSkillProficienciesAction = {
    type: 'resetSkillProficiencies';
    skillProficiencies: SkillProficiencies;
};

export type SkillsTabAction =
    | SetSearchTextAction
    | SetAbilityFilterAction
    | CycleSkillAction
    | ResetSkillProficienciesAction;

export function createLocalSkillProficiencies(
    skillProficiencies: SkillProficiencies,
): LocalSkillProficiencies {
    const { __typename: _typename, ...levels } = skillProficiencies;
    return levels;
}

export function initSkillsTabState(skillProficiencies: SkillProficiencies): SkillsTabState {
    return {
        searchText: '',
        abilityFilter: 'all',
        localSkillProficiencies: createLocalSkillProficiencies(skillProficiencies),
    };
}

export function skillsTabReducer(state: SkillsTabState, action: SkillsTabAction): SkillsTabState {
    switch (action.type) {
        case 'setSearchText':
            return {
                ...state,
                searchText: action.searchText,
            };

        case 'setAbilityFilter':
            return {
                ...state,
                abilityFilter: action.abilityFilter,
            };

        case 'cycleSkill':
            return {
                ...state,
                localSkillProficiencies: {
                    ...state.localSkillProficiencies,
                    [action.skillKey]: nextProficiencyLevel(
                        state.localSkillProficiencies[action.skillKey],
                    ),
                },
            };

        case 'resetSkillProficiencies':
            return {
                ...state,
                localSkillProficiencies: createLocalSkillProficiencies(action.skillProficiencies),
            };

        default:
            return state;
    }
}

export function nextProficiencyLevel(level: ProficiencyLevel): ProficiencyLevel {
    if (level === ProficiencyLevel.None) return ProficiencyLevel.Proficient;
    if (level === ProficiencyLevel.Proficient) return ProficiencyLevel.Expert;
    return ProficiencyLevel.None;
}
