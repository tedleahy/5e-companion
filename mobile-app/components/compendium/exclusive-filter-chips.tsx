import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

export const ALL_FILTER_VALUE = 'all';

export type ExclusiveFilterOption = {
    value: string;
    label: string;
};

type ExclusiveFilterChipsProps = {
    options: ExclusiveFilterOption[];
    selectedValue: string;
    onSelectedValueChange: (value: string) => void;
    accessibilityLabelPrefix: string;
    allLabel?: string;
    testID?: string;
};

/** Horizontal single-select filter with a built-in catch-all option. */
export default function ExclusiveFilterChips({
    options,
    selectedValue,
    onSelectedValueChange,
    accessibilityLabelPrefix,
    allLabel = 'All',
    testID = 'exclusive-filter',
}: ExclusiveFilterChipsProps) {
    const allOptions = [
        { value: ALL_FILTER_VALUE, label: allLabel },
        ...options.filter((option) => option.value !== ALL_FILTER_VALUE),
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            testID={testID}
        >
            <View style={styles.chipRow}>
                {allOptions.map((option) => {
                    const selected = selectedValue === option.value;

                    return (
                        <Chip
                            key={option.value}
                            selected={selected}
                            onPress={() => onSelectedValueChange(option.value)}
                            style={[styles.chip, selected && styles.selectedChip]}
                            textStyle={[styles.chipText, selected && styles.selectedChipText]}
                            showSelectedOverlay={false}
                            showSelectedCheck={false}
                            accessibilityLabel={`${accessibilityLabelPrefix} ${option.label}`}
                            accessibilityState={{ selected }}
                            testID={`${testID}-${option.value}`}
                        >
                            {option.label}
                        </Chip>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        alignItems: 'center',
        paddingRight: fantasyTokens.spacing.md,
    },
    chipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    chip: {
        minHeight: fantasyTokens.spacing.xl + fantasyTokens.spacing.sm,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: fantasyTokens.colors.parchment,
    },
    selectedChip: {
        borderColor: fantasyTokens.colors.crimson,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    chipText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
        ...(process.env.EXPO_OS === 'web' ? {} : {
            includeFontPadding: false,
            marginVertical: 0,
        }),
    },
    selectedChipText: {
        color: fantasyTokens.colors.parchment,
    },
});
