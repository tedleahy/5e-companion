import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { ActiveFilterChip } from './addSpellSheetFilters';

/**
 * Props for the applied-filter chip row.
 */
type AddSpellActiveFilterChipsProps = {
    chips: ActiveFilterChip[];
    onRemoveChip: (chip: ActiveFilterChip) => void;
};

/**
 * Horizontal row showing the currently applied add-sheet filters.
 */
export default function AddSpellActiveFilterChips({
    chips,
    onRemoveChip,
}: AddSpellActiveFilterChipsProps) {
    if (chips.length === 0) {
        return null;
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeChipsScroll}
            contentContainerStyle={styles.activeChipsRow}
        >
            {chips.map((chip) => (
                <View key={chip.id} style={styles.activeChip}>
                    <Text style={styles.activeChipText}>{chip.label}</Text>
                    <Pressable onPress={() => onRemoveChip(chip)} accessibilityLabel={`Remove ${chip.label} filter`}>
                        <Text style={styles.activeChipRemove}>x</Text>
                    </Pressable>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    activeChipsScroll: {
        maxHeight: 34,
    },
    activeChipsRow: {
        paddingHorizontal: 12,
        gap: 6,
        alignItems: 'center',
    },
    activeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.3)',
        backgroundColor: 'rgba(139,26,26,0.12)',
        paddingLeft: 10,
        paddingRight: 8,
        paddingVertical: 3,
    },
    activeChipText: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeChipRemove: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        opacity: 0.7,
    },
});
