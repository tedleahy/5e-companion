import {
    ADD_SPELL_SCHOOL_OPTIONS,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    optionLabel,
    spellLevelLabel,
    type AddSpellFilterState,
} from '../SpellFilterState';
import type { AddSpellListItem, AddSpellSection } from '../addSpell.types';

/**
 * Active filter chip metadata shown above the spell results.
 */
export type ActiveFilterChip = {
    id: string;
    label: string;
    type: 'class' | 'level' | 'school' | 'component' | 'boolean';
    value: string;
};

/**
 * Creates level-grouped sections for the add-sheet spell list.
 */
export function buildAddSpellSections(spells: AddSpellListItem[]): AddSpellSection[] {
    const grouped = new Map<number, AddSpellListItem[]>();

    for (const spell of spells) {
        const list = grouped.get(spell.level);
        if (list) {
            list.push(spell);
            continue;
        }

        grouped.set(spell.level, [spell]);
    }

    return Array.from(grouped.entries())
        .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
        .map(([level, levelSpells]) => ({
            title: spellLevelLabel(level),
            data: [...levelSpells].sort((leftSpell, rightSpell) => leftSpell.name.localeCompare(rightSpell.name)),
        }));
}

/**
 * Converts active filter state to removable filter-chip descriptors.
 */
export function buildActiveFilterChips(filters: AddSpellFilterState): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = [];

    for (const classKey of filters.classes) {
        chips.push({
            id: `class-${classKey}`,
            label: optionLabel(CLASS_OPTIONS, classKey),
            type: 'class',
            value: classKey,
        });
    }

    for (const level of filters.levels) {
        chips.push({
            id: `level-${level}`,
            label: spellLevelLabel(level),
            type: 'level',
            value: String(level),
        });
    }

    for (const school of filters.schools) {
        chips.push({
            id: `school-${school}`,
            label: optionLabel(ADD_SPELL_SCHOOL_OPTIONS, school),
            type: 'school',
            value: school,
        });
    }

    for (const component of filters.components) {
        chips.push({
            id: `component-${component}`,
            label: optionLabel(COMPONENT_OPTIONS, component),
            type: 'component',
            value: component,
        });
    }

    if (filters.ritual) {
        chips.push({ id: 'flag-ritual', label: 'Ritual', type: 'boolean', value: 'ritual' });
    }
    if (filters.concentration) {
        chips.push({ id: 'flag-concentration', label: 'Concentration', type: 'boolean', value: 'concentration' });
    }
    if (filters.hasHigherLevel) {
        chips.push({ id: 'flag-higher', label: 'Has Higher Level', type: 'boolean', value: 'hasHigherLevel' });
    }
    if (filters.hasMaterial) {
        chips.push({ id: 'flag-material', label: 'Requires Material', type: 'boolean', value: 'hasMaterial' });
    }

    return chips;
}

/**
 * Removes one active chip from the applied add-sheet filters.
 */
export function removeActiveFilterChip(
    filters: AddSpellFilterState,
    chip: ActiveFilterChip,
): AddSpellFilterState {
    if (chip.type === 'class') {
        return {
            ...filters,
            classes: filters.classes.filter((classValue) => classValue !== chip.value),
        };
    }

    if (chip.type === 'level') {
        return {
            ...filters,
            levels: filters.levels.filter((level) => String(level) !== chip.value),
        };
    }

    if (chip.type === 'school') {
        return {
            ...filters,
            schools: filters.schools.filter((school) => school !== chip.value),
        };
    }

    if (chip.type === 'component') {
        return {
            ...filters,
            components: filters.components.filter((component) => component !== chip.value),
        };
    }

    if (chip.value === 'ritual') {
        return { ...filters, ritual: undefined };
    }
    if (chip.value === 'concentration') {
        return { ...filters, concentration: undefined };
    }
    if (chip.value === 'hasHigherLevel') {
        return { ...filters, hasHigherLevel: undefined };
    }

    return { ...filters, hasMaterial: undefined };
}
