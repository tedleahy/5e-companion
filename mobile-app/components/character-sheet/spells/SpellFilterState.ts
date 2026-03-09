import {
    buildSpellFilterInput,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    countActiveSpellFilters,
    defaultSpellFiltersForClass,
    LEVEL_OPTIONS,
    optionLabel,
    spellLevelLabel,
    type SpellFilterOption,
    type SpellFilterState,
} from '@/lib/spellFilters';
import type { SpellFilter } from '@/types/generated_graphql_types';

/**
 * Add-sheet filter state extends shared spell filters with school selection.
 */
export type AddSpellFilterState = SpellFilterState & {
    schools: string[];
};

/**
 * Allowed spell school options for add-sheet local filtering.
 */
export const ADD_SPELL_SCHOOL_OPTIONS: SpellFilterOption[] = [
    { key: 'abjuration', label: 'Abjuration' },
    { key: 'conjuration', label: 'Conjuration' },
    { key: 'divination', label: 'Divination' },
    { key: 'enchantment', label: 'Enchantment' },
    { key: 'evocation', label: 'Evocation' },
    { key: 'illusion', label: 'Illusion' },
    { key: 'necromancy', label: 'Necromancy' },
    { key: 'transmutation', label: 'Transmutation' },
];

export {
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
    return {
        ...defaultSpellFiltersForClass(characterClass),
        schools: [],
    };
}

/**
 * Counts active add-sheet filters including school filters.
 */
export function countActiveFilters(filters: AddSpellFilterState): number {
    return countActiveSpellFilters(filters) + filters.schools.length;
}

/**
 * Builds GraphQL spell filter input from add-sheet filter state.
 */
export function buildAddSpellFilterInput(filters: AddSpellFilterState, searchQuery: string): SpellFilter | undefined {
    return buildSpellFilterInput(filters, searchQuery);
}
