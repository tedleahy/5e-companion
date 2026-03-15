import { ScrollView, StyleSheet } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import FilterChipGroup from '@/components/FilterChipGroup';
import FilterSwitch from '@/components/FilterSwitch';
import {
    CASTING_TIME_CATEGORY_OPTIONS,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    DURATION_CATEGORY_OPTIONS,
    EMPTY_SPELL_FILTERS,
    LEVEL_OPTIONS,
    RANGE_CATEGORY_OPTIONS,
    toggleBooleanFilter,
    toggleFilterValue,
    type SpellFilterState,
} from '@/lib/spellFilters';

/**
 * Active filter criteria for the spell list.
 *
 * @property classes - Selected class indexes (e.g. `['wizard', 'cleric']`). Empty means no class filter.
 * @property levels - Selected spell levels (0 = cantrip). Empty means no level filter.
 * @property ritual - `true` to show only ritual spells; `undefined` for no ritual filter.
 */
export type SpellFilters = SpellFilterState;

/** Default filter state with nothing selected. */
export const EMPTY_FILTERS: SpellFilters = EMPTY_SPELL_FILTERS;

/**
 * Props for {@link SpellFilterDrawer}.
 *
 * @property visible - Whether the drawer modal is shown.
 * @property filters - Current filter state.
 * @property onClose - Called when the user dismisses the drawer.
 * @property onChange - Called with the updated filters whenever a selection changes.
 */
type SpellFilterDrawerProps = {
    visible: boolean;
    filters: SpellFilters;
    onClose: () => void;
    onChange: (filters: SpellFilters) => void;
};

/**
 * A slide-in modal drawer that lets the user filter spells by class, level, and ritual status.
 * Renders chip groups for class/level and a toggle switch for ritual-only mode.
 */
export default function SpellFilterDrawer({ visible, filters, onClose, onChange }: SpellFilterDrawerProps) {
    /** Toggles an element in/out of an array, returning a new array. */
    function toggle<T>(array: T[], item: T): T[] {
        return toggleFilterValue(array, item);
    }

    /** Toggles a string-keyed array filter field. */
    function toggleArrayFilter(field: keyof SpellFilters, key: string) {
        const current = filters[field] as string[];
        onChange({ ...filters, [field]: toggle(current, key) });
    }

    /** Toggles a level (stored as number[], but chip keys are strings). */
    function toggleLevel(key: string) {
        const num = Number(key);
        onChange({ ...filters, levels: toggle(filters.levels, num) });
    }

    /** Toggles a boolean | undefined filter between `true` and `undefined`. */
    function toggleBoolFilter(field: keyof SpellFilters) {
        const currentValue = filters[field] as boolean | undefined;
        onChange({ ...filters, [field]: toggleBooleanFilter(currentValue) });
    }

    /** Resets all filters to {@link EMPTY_FILTERS}. */
    function clearAll() {
        onChange(EMPTY_FILTERS);
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.drawer}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.drawerTitle}>Filters</Text>

                    <FilterChipGroup
                        label="Class"
                        options={CLASS_OPTIONS}
                        selected={filters.classes}
                        onToggle={(key) => toggleArrayFilter('classes', key)}
                    />

                    <FilterChipGroup
                        label="Level"
                        options={LEVEL_OPTIONS}
                        selected={filters.levels.map(String)}
                        onToggle={toggleLevel}
                    />

                    <FilterSwitch label="Ritual only" value={filters.ritual === true} onToggle={() => toggleBoolFilter('ritual')} />
                    <FilterSwitch label="Concentration" value={filters.concentration === true} onToggle={() => toggleBoolFilter('concentration')} />
                    <FilterSwitch label="Has higher level" value={filters.hasHigherLevel === true} onToggle={() => toggleBoolFilter('hasHigherLevel')} />
                    <FilterSwitch label="Requires material" value={filters.hasMaterial === true} onToggle={() => toggleBoolFilter('hasMaterial')} />

                    <FilterChipGroup
                        label="Components"
                        options={COMPONENT_OPTIONS}
                        selected={filters.components}
                        onToggle={(key) => toggleArrayFilter('components', key)}
                    />

                    <FilterChipGroup
                        label="Range"
                        options={RANGE_CATEGORY_OPTIONS}
                        selected={filters.rangeCategories}
                        onToggle={(key) => toggleArrayFilter('rangeCategories', key)}
                    />

                    <FilterChipGroup
                        label="Duration"
                        options={DURATION_CATEGORY_OPTIONS}
                        selected={filters.durationCategories}
                        onToggle={(key) => toggleArrayFilter('durationCategories', key)}
                    />

                    <FilterChipGroup
                        label="Casting Time"
                        options={CASTING_TIME_CATEGORY_OPTIONS}
                        selected={filters.castingTimeCategories}
                        onToggle={(key) => toggleArrayFilter('castingTimeCategories', key)}
                    />

                    {/* ── Clear ── */}
                    <Button
                        mode="outlined"
                        onPress={clearAll}
                        style={styles.clearButton}
                        textColor={fantasyTokens.colors.parchment}
                    >
                        Clear all
                    </Button>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '80%',
        backgroundColor: fantasyTokens.colors.night,
        padding: fantasyTokens.spacing.md,
        borderLeftWidth: 1,
        borderLeftColor: fantasyTokens.colors.gold,
    },
    drawerTitle: {
        fontSize: 22,
        fontFamily: fantasyTokens.fonts.regular,
        color: fantasyTokens.colors.parchment,
        marginBottom: fantasyTokens.spacing.md,
    },
    clearButton: {
        marginTop: fantasyTokens.spacing.lg,
        borderColor: fantasyTokens.colors.gold,
    },
});
