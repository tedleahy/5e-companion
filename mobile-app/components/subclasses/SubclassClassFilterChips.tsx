import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SubclassClassFilterChipsProps = {
    selectedClassId: string;
    onSelectClassId: (classId: string) => void;
};

const ALL_CLASSES_FILTER = 'all';

/**
 * Horizontal single-select class filter used by the subclass manager.
 */
export default function SubclassClassFilterChips({
    selectedClassId,
    onSelectClassId,
}: SubclassClassFilterChipsProps) {
    const options = [
        { value: ALL_CLASSES_FILTER, label: 'All' },
        ...CLASS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            testID="subclass-class-filter-chips"
        >
            <View style={styles.chipRow}>
                {options.map((option) => {
                    const active = selectedClassId === option.value;

                    return (
                        <Chip
                            key={option.value}
                            selected={active}
                            onPress={() => onSelectClassId(option.value)}
                            style={[styles.chip, active && styles.chipSelected]}
                            textStyle={[styles.chipText, active && styles.chipTextSelected]}
                            showSelectedOverlay={false}
                            showSelectedCheck={false}
                            accessibilityLabel={`Filter subclasses by ${option.label}`}
                            accessibilityState={{ selected: active }}
                            testID={`subclass-filter-${option.value}`}
                        >
                            {option.label}
                        </Chip>
                    );
                })}
            </View>
        </ScrollView>
    );
}

export { ALL_CLASSES_FILTER };

const styles = StyleSheet.create({
    scrollContent: {
        paddingRight: fantasyTokens.spacing.md,
    },
    chipRow: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
    },
    chip: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
    },
    chipSelected: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderColor: fantasyTokens.colors.crimson,
    },
    chipText: {
        color: fantasyTokens.colors.inkLight,
        ...fantasyTokens.typography.bodySmall,
    },
    chipTextSelected: {
        color: fantasyTokens.colors.parchment,
    },
});
