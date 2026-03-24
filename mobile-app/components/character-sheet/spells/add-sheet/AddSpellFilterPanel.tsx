import type { Dispatch, SetStateAction } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import FilterChipGroup from '@/components/FilterChipGroup';
import FilterSwitch from '@/components/FilterSwitch';
import { toggleBooleanFilter, toggleFilterValue } from '@/lib/spellFilters';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    ADD_SPELL_SCHOOL_OPTIONS,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    LEVEL_OPTIONS,
    type AddSpellFilterState,
} from '../SpellFilterState';

/**
 * Props for the add-sheet filter panel.
 */
type AddSpellFilterPanelProps = {
    draftFilters: AddSpellFilterState;
    setDraftFilters: Dispatch<SetStateAction<AddSpellFilterState>>;
    onBack: () => void;
    onClear: () => void;
    onApply: () => void;
};

/**
 * Renders the add-sheet filter controls separately from the sheet shell.
 */
export default function AddSpellFilterPanel({
    draftFilters,
    setDraftFilters,
    onBack,
    onClear,
    onApply,
}: AddSpellFilterPanelProps) {
    return (
        <View style={styles.filterPanelContent}>
            <View style={styles.filterPanelHeader}>
                <Pressable onPress={onBack} accessibilityLabel="Back to spell list">
                    <Text style={styles.filterBackText}>Back</Text>
                </Pressable>
                <Text style={styles.filterPanelTitle}>Filters</Text>
                <Pressable onPress={onClear} accessibilityLabel="Clear all filters">
                    <Text style={styles.filterClearText}>Clear</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
                <FilterChipGroup
                    label="Class"
                    options={CLASS_OPTIONS}
                    selected={draftFilters.classes}
                    onToggle={(classKey) => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            classes: toggleFilterValue(previousFilters.classes, classKey),
                        }));
                    }}
                />

                <FilterChipGroup
                    label="Level"
                    options={LEVEL_OPTIONS}
                    selected={draftFilters.levels.map(String)}
                    onToggle={(levelKey) => {
                        const level = Number(levelKey);

                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            levels: toggleFilterValue(previousFilters.levels, level),
                        }));
                    }}
                />

                <FilterSwitch
                    label="Ritual only"
                    value={draftFilters.ritual === true}
                    onToggle={() => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            ritual: toggleBooleanFilter(previousFilters.ritual),
                        }));
                    }}
                />

                <FilterSwitch
                    label="Concentration"
                    value={draftFilters.concentration === true}
                    onToggle={() => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            concentration: toggleBooleanFilter(previousFilters.concentration),
                        }));
                    }}
                />

                <FilterSwitch
                    label="Has higher level"
                    value={draftFilters.hasHigherLevel === true}
                    onToggle={() => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            hasHigherLevel: toggleBooleanFilter(previousFilters.hasHigherLevel),
                        }));
                    }}
                />

                <FilterSwitch
                    label="Requires material"
                    value={draftFilters.hasMaterial === true}
                    onToggle={() => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            hasMaterial: toggleBooleanFilter(previousFilters.hasMaterial),
                        }));
                    }}
                />

                <FilterChipGroup
                    label="Components"
                    options={COMPONENT_OPTIONS}
                    selected={draftFilters.components}
                    onToggle={(component) => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            components: toggleFilterValue(previousFilters.components, component),
                        }));
                    }}
                />

                <FilterChipGroup
                    label="School"
                    options={ADD_SPELL_SCHOOL_OPTIONS}
                    selected={draftFilters.schools}
                    onToggle={(school) => {
                        setDraftFilters((previousFilters) => ({
                            ...previousFilters,
                            schools: toggleFilterValue(previousFilters.schools, school),
                        }));
                    }}
                />
            </ScrollView>

            <View style={styles.filterApplyWrap}>
                <Pressable onPress={onApply} style={styles.filterApplyButton} accessibilityLabel="Show filtered spell results">
                    <Text style={styles.filterApplyButtonText}>Show Results</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    filterPanelContent: {
        flex: 1,
    },
    filterPanelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.08)',
    },
    filterBackText: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
    },
    filterPanelTitle: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        fontWeight: '700',
    },
    filterClearText: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
    },
    filterScroll: {
        flex: 1,
    },
    filterScrollContent: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xl,
    },
    filterApplyWrap: {
        padding: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.08)',
    },
    filterApplyButton: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderRadius: fantasyTokens.radii.lg,
        paddingVertical: 14,
        alignItems: 'center',
    },
    filterApplyButtonText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        fontWeight: '700',
    },
});
