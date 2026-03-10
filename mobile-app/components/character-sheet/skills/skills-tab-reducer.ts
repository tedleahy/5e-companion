import { ABILITY_KEYS, type AbilityKey, type SkillKey } from '@/lib/characterSheetUtils';
import {
    ProficiencyLevel,
    type SkillProficiencies,
} from '@/types/generated_graphql_types';

export type AbilityFilter = AbilityKey | 'all';
export type LocalSkillProficiencies = Record<SkillKey, ProficiencyLevel>;
type AbilitiesTabInitialState = {
    skillProficiencies: SkillProficiencies;
    savingThrowProficiencies: AbilityKey[];
};

export type AbilitiesTabState = {
    searchText: string;
    abilityFilter: AbilityFilter;
    localSkillProficiencies: LocalSkillProficiencies;
    localSavingThrowProficiencies: AbilityKey[];
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

type ToggleSavingThrowAction = {
    type: 'toggleSavingThrow';
    ability: AbilityKey;
};

type ResetSavingThrowProficienciesAction = {
    type: 'resetSavingThrowProficiencies';
    savingThrowProficiencies: AbilityKey[];
};

export type AbilitiesTabAction =
    | SetSearchTextAction
    | SetAbilityFilterAction
    | CycleSkillAction
    | ResetSkillProficienciesAction
    | ToggleSavingThrowAction
    | ResetSavingThrowProficienciesAction;

/**
 * Canonicalises saving throw proficiencies to unique, ability-order values.
 */
function normaliseSavingThrowProficiencies(savingThrowProficiencies: AbilityKey[]): AbilityKey[] {
    const proficiencySet = new Set(savingThrowProficiencies);
    return ABILITY_KEYS.filter((ability) => proficiencySet.has(ability));
}

/**
 * Converts generated GraphQL skill proficiencies to mutable local state.
 */
export function createLocalSkillProficiencies(
    skillProficiencies: SkillProficiencies,
): LocalSkillProficiencies {
    const { __typename: _typename, ...levels } = skillProficiencies;
    return levels;
}

/**
 * Builds initial state for the Abilities tab reducer.
 */
export function initAbilitiesTabState(initialState: AbilitiesTabInitialState): AbilitiesTabState {
    return {
        searchText: '',
        abilityFilter: 'all',
        localSkillProficiencies: createLocalSkillProficiencies(initialState.skillProficiencies),
        localSavingThrowProficiencies: normaliseSavingThrowProficiencies(
            initialState.savingThrowProficiencies,
        ),
    };
}

/**
 * Reducer for local filters and optimistic proficiency state in Abilities tab.
 */
export function skillsTabReducer(state: AbilitiesTabState, action: AbilitiesTabAction): AbilitiesTabState {
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

        case 'toggleSavingThrow': {
            const hasProficiency = state.localSavingThrowProficiencies.includes(action.ability);
            const nextSavingThrowProficiencies = hasProficiency
                ? state.localSavingThrowProficiencies.filter((ability) => ability !== action.ability)
                : [...state.localSavingThrowProficiencies, action.ability];

            return {
                ...state,
                localSavingThrowProficiencies: normaliseSavingThrowProficiencies(
                    nextSavingThrowProficiencies,
                ),
            };
        }

        case 'resetSavingThrowProficiencies':
            return {
                ...state,
                localSavingThrowProficiencies: normaliseSavingThrowProficiencies(
                    action.savingThrowProficiencies,
                ),
            };

        default:
            return state;
    }
}

/**
 * Cycles a skill's proficiency state: none -> proficient -> expert -> none.
 */
export function nextProficiencyLevel(level: ProficiencyLevel): ProficiencyLevel {
    if (level === ProficiencyLevel.None) return ProficiencyLevel.Proficient;
    if (level === ProficiencyLevel.Proficient) return ProficiencyLevel.Expert;
    return ProficiencyLevel.None;
}
