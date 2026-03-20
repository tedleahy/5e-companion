import {
    buildSpellFilterInput,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    countActiveSpellFilters,
    defaultSpellFiltersForClass,
    LEVEL_OPTIONS,
    optionLabel,
    SCHOOL_OPTIONS,
    spellLevelLabel,
    type SpellFilterOption,
    type SpellFilterState,
} from '@/lib/spellFilters';

/**
 * Add-sheet filter state reuses the shared spell-filter model.
 */
export type AddSpellFilterState = SpellFilterState;

export {
    SCHOOL_OPTIONS as ADD_SPELL_SCHOOL_OPTIONS,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    LEVEL_OPTIONS,
    optionLabel,
    spellLevelLabel,
    type SpellFilterOption,
};

/**
 * Builds add-sheet default filters pre-selected to the character class.
 */
export function defaultFilterForClass(characterClass: string): AddSpellFilterState {
    return defaultSpellFiltersForClass(characterClass);
}

/**
 * Counts active add-sheet filters including school filters.
 */
export function countActiveFilters(filters: AddSpellFilterState): number {
    return countActiveSpellFilters(filters);
}

/**
 * Builds GraphQL spell filter input from add-sheet filter state.
 */
export function buildAddSpellFilterInput(filters: AddSpellFilterState, searchQuery: string) {
    return buildSpellFilterInput(filters, searchQuery);
}
