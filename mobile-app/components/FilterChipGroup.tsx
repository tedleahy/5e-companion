import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type FilterChipGroupProps = {
    label: string;
    options: { key: string; label: string }[];
    selected: string[];
    onToggle: (key: string) => void;
};

/** A labelled row of toggle chips. */
export default function FilterChipGroup({ label, options, selected, onToggle }: FilterChipGroupProps) {
    return (
        <>
            <Text style={styles.sectionLabel}>{label}</Text>
            <View style={styles.chipRow}>
                {options.map(({ key, label: chipLabel }) => {
                    const active = selected.includes(key);
                    return (
                        <Chip
                            key={key}
                            selected={active}
                            onPress={() => onToggle(key)}
                            style={[styles.chip, active && styles.chipSelected]}
                            textStyle={[styles.chipText, active && styles.chipTextSelected]}
                            showSelectedOverlay={false}
                            showSelectedCheck={false}
                        >
                            {chipLabel}
                        </Chip>
                    );
                })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        fontFamily: fantasyTokens.fonts.regular,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        marginTop: fantasyTokens.spacing.md,
        marginBottom: fantasyTokens.spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
    },
    chipTextSelected: {
        color: fantasyTokens.colors.parchment,
    },
});
