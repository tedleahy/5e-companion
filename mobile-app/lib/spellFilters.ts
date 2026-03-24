import type { SpellFilter } from '@/types/generated_graphql_types';
import { spellLevelLabel as spellLevelDisplayLabel } from '@/lib/spellPresentation';

/**
 * Chip option shape used by spell filter UI controls.
 */
export type SpellFilterOption = {
    key: string;
    label: string;
};

/**
 * Shared filter state for spell list queries.
 */
export type SpellFilterState = {
    classes: string[];
    levels: number[];
    schools: string[];
    ritual: boolean | undefined;
    concentration: boolean | undefined;
    hasHigherLevel: boolean | undefined;
    hasMaterial: boolean | undefined;
    components: string[];
    rangeCategories: string[];
    durationCategories: string[];
    castingTimeCategories: string[];
};

/**
 * Class filter options.
 */
export const CLASS_OPTIONS: SpellFilterOption[] = [
    { key: 'bard', label: 'Bard' },
    { key: 'cleric', label: 'Cleric' },
    { key: 'druid', label: 'Druid' },
    { key: 'paladin', label: 'Paladin' },
    { key: 'ranger', label: 'Ranger' },
    { key: 'sorcerer', label: 'Sorcerer' },
    { key: 'warlock', label: 'Warlock' },
    { key: 'wizard', label: 'Wizard' },
];

/**
 * Level filter options.
 */
export const LEVEL_OPTIONS: SpellFilterOption[] = [
    { key: '0', label: 'Cantrip' },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
];

/**
 * Components filter options.
 */
export const COMPONENT_OPTIONS: SpellFilterOption[] = [
    { key: 'V', label: 'Verbal' },
    { key: 'S', label: 'Somatic' },
    { key: 'M', label: 'Material' },
];

/**
 * School filter options.
 */
export const SCHOOL_OPTIONS: SpellFilterOption[] = [
    { key: 'abjuration', label: 'Abjuration' },
    { key: 'conjuration', label: 'Conjuration' },
    { key: 'divination', label: 'Divination' },
    { key: 'enchantment', label: 'Enchantment' },
    { key: 'evocation', label: 'Evocation' },
    { key: 'illusion', label: 'Illusion' },
    { key: 'necromancy', label: 'Necromancy' },
    { key: 'transmutation', label: 'Transmutation' },
];

/**
 * Range-category filter options.
 */
export const RANGE_CATEGORY_OPTIONS: SpellFilterOption[] = [
    { key: 'self', label: 'Self' },
    { key: 'touch', label: 'Touch' },
    { key: 'short', label: 'Short (≤30 ft)' },
    { key: 'medium', label: 'Medium (31–120 ft)' },
    { key: 'long', label: 'Long (>120 ft)' },
    { key: 'sight', label: 'Sight' },
    { key: 'special', label: 'Special' },
];

/**
 * Duration-category filter options.
 */
export const DURATION_CATEGORY_OPTIONS: SpellFilterOption[] = [
    { key: 'instantaneous', label: 'Instantaneous' },
    { key: '1_round', label: '1 Round' },
    { key: 'up_to_1_minute', label: '≤1 Minute' },
    { key: 'up_to_10_minutes', label: '≤10 Minutes' },
    { key: 'up_to_1_hour', label: '≤1 Hour' },
    { key: 'up_to_8_hours', label: '≤8 Hours' },
    { key: 'up_to_24_hours', label: '≤24 Hours' },
    { key: 'days_plus', label: 'Days+' },
    { key: 'until_dispelled', label: 'Until Dispelled' },
    { key: 'special', label: 'Special' },
];

/**
 * Casting-time-category filter options.
 */
export const CASTING_TIME_CATEGORY_OPTIONS: SpellFilterOption[] = [
    { key: '1_action', label: '1 Action' },
    { key: '1_bonus_action', label: '1 Bonus Action' },
    { key: '1_reaction', label: '1 Reaction' },
    { key: '1_minute', label: '1 Minute' },
    { key: '10_minutes', label: '10 Minutes' },
    { key: '1_hour_plus', label: '1 Hour+' },
];

/**
 * Empty shared spell filter state.
 */
export const EMPTY_SPELL_FILTERS: SpellFilterState = {
    classes: [],
    levels: [],
    schools: [],
    ritual: undefined,
    concentration: undefined,
    hasHigherLevel: undefined,
    hasMaterial: undefined,
    components: [],
    rangeCategories: [],
    durationCategories: [],
    castingTimeCategories: [],
};

/**
 * Normalises a character class label into a spell class index.
 */
export function normaliseClassIndex(characterClass: string): string {
    return characterClass
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Normalises multiple class labels into unique spell class indexes.
 */
export function normaliseClassIndexes(characterClasses: string[]): string[] {
    const classIndexes = new Set<string>();

    for (const characterClass of characterClasses) {
        const classIndex = normaliseClassIndex(characterClass);

        if (classIndex) {
            classIndexes.add(classIndex);
        }
    }

    return [...classIndexes];
}

/**
 * Creates default spell filters pre-selecting the supplied character class.
 */
export function defaultSpellFiltersForClass(characterClass: string): SpellFilterState {
    return defaultSpellFiltersForClasses([characterClass]);
}

/**
 * Creates default spell filters pre-selecting all supplied character classes.
 */
export function defaultSpellFiltersForClasses(characterClasses: string[]): SpellFilterState {
    const classIndexes = normaliseClassIndexes(characterClasses);

    if (classIndexes.length === 0) {
        return EMPTY_SPELL_FILTERS;
    }

    return {
        ...EMPTY_SPELL_FILTERS,
        classes: classIndexes,
    };
}

/**
 * Toggles an element in or out of an array immutably.
 */
export function toggleFilterValue<T>(values: T[], value: T): T[] {
    return values.includes(value)
        ? values.filter((currentValue) => currentValue !== value)
        : [...values, value];
}

/**
 * Toggles a boolean filter between `true` and `undefined`.
 */
export function toggleBooleanFilter(value: boolean | undefined): boolean | undefined {
    return value ? undefined : true;
}

/**
 * Builds GraphQL `SpellFilter` input from local filter state and optional name search.
 */
export function buildSpellFilterInput(
    filters: SpellFilterState,
    name?: string | null,
): SpellFilter | undefined {
    const filter: SpellFilter = {};
    const trimmedName = name?.trim();

    if (trimmedName) filter.name = trimmedName;
    if (filters.levels.length > 0) filter.levels = filters.levels;
    if (filters.classes.length > 0) filter.classes = filters.classes;
    if (filters.schools.length > 0) filter.schools = filters.schools;
    if (filters.ritual != null) filter.ritual = filters.ritual;
    if (filters.concentration != null) filter.concentration = filters.concentration;
    if (filters.hasHigherLevel != null) filter.hasHigherLevel = filters.hasHigherLevel;
    if (filters.hasMaterial != null) filter.hasMaterial = filters.hasMaterial;
    if (filters.components.length > 0) filter.components = filters.components;
    if (filters.rangeCategories.length > 0) filter.rangeCategories = filters.rangeCategories;
    if (filters.durationCategories.length > 0) filter.durationCategories = filters.durationCategories;
    if (filters.castingTimeCategories.length > 0) filter.castingTimeCategories = filters.castingTimeCategories;

    return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Counts active shared spell filters for filter-badge display.
 */
export function countActiveSpellFilters(filters: SpellFilterState): number {
        return filters.classes.length
        + filters.levels.length
        + filters.schools.length
        + (filters.ritual != null ? 1 : 0)
        + (filters.concentration != null ? 1 : 0)
        + (filters.hasHigherLevel != null ? 1 : 0)
        + (filters.hasMaterial != null ? 1 : 0)
        + filters.components.length
        + filters.rangeCategories.length
        + filters.durationCategories.length
        + filters.castingTimeCategories.length;
}

/**
 * Converts a spell level into an ordinal display label.
 */
export function spellLevelLabel(level: number): string {
    return spellLevelDisplayLabel(level);
}

/**
 * Returns a display label for an option key.
 */
export function optionLabel(options: SpellFilterOption[], key: string): string {
    const option = options.find((candidate) => candidate.key === key);
    return option?.label ?? key;
}
