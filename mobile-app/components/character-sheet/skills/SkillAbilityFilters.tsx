import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { AbilityKey } from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';

type AbilityFilter = AbilityKey | 'all';

type SkillAbilityFiltersProps = {
    activeFilter: AbilityFilter;
    onFilterChange: (nextFilter: AbilityFilter) => void;
};

const ABILITY_FILTER_OPTIONS: { label: string; value: AbilityFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'STR', value: 'strength' },
    { label: 'DEX', value: 'dexterity' },
    { label: 'CON', value: 'constitution' },
    { label: 'INT', value: 'intelligence' },
    { label: 'WIS', value: 'wisdom' },
    { label: 'CHA', value: 'charisma' },
];

export default function SkillAbilityFilters({
    activeFilter,
    onFilterChange,
}: SkillAbilityFiltersProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
        >
            {ABILITY_FILTER_OPTIONS.map((option) => {
                const isActive = activeFilter === option.value;
                return (
                    <Pressable
                        key={option.label}
                        onPress={() => onFilterChange(option.value)}
                        style={[styles.filterPill, isActive && styles.filterPillActive]}
                        accessibilityRole="button"
                        accessibilityLabel={`Filter by ${option.label}`}
                    >
                        <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    filterScroll: {
        flexGrow: 0,
    },
    filterRow: {
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 10,
        gap: 6,
        alignItems: 'flex-start',
    },
    filterPill: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'transparent',
        paddingVertical: 5,
        paddingHorizontal: 12,
        height: 'auto',
    },
    filterPillActive: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    filterPillText: {
        fontFamily: 'serif',
        fontSize: 8.5,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
    filterPillTextActive: {
        color: fantasyTokens.colors.gold,
        opacity: 1,
    },
});
