import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { ALIGNMENT_OPTIONS } from '@/lib/dndHelpers';

type Props = {
    selected: string | null;
    onSelect: (value: string | null) => void;
};

export default function AlignmentGrid({ selected, onSelect }: Props) {
    const [skipped, setSkipped] = useState(selected === null);

    function handleSkipToggle() {
        if (skipped) {
            setSkipped(false);
        } else {
            setSkipped(true);
            onSelect(null);
        }
    }

    function handleSelect(value: string) {
        setSkipped(false);
        onSelect(value);
    }

    return (
        <View>
            {/* Header row with label and skip/undo */}
            <View style={styles.headerRow}>
                <Text style={styles.sectionLabel}>Alignment</Text>
                <Pressable onPress={handleSkipToggle} hitSlop={8}>
                    <Text style={styles.skipBtn}>{skipped ? 'Undo' : 'Skip'}</Text>
                </Pressable>
            </View>

            {skipped ? (
                <View style={styles.skippedBox}>
                    <Text style={styles.skippedTitle}>Not using alignment</Text>
                    <Text style={styles.skippedHint}>You can set this later in character settings</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {ALIGNMENT_OPTIONS.map((row, rowIdx) =>
                        row.map((alignment, colIdx) => {
                            const isSelected = alignment === selected;
                            return (
                                <Pressable
                                    key={`${rowIdx}-${colIdx}`}
                                    onPress={() => handleSelect(alignment)}
                                    style={[styles.cell, isSelected && styles.cellSelected]}
                                >
                                    <Text style={[styles.cellText, isSelected && styles.cellTextSelected]}>
                                        {alignment}
                                    </Text>
                                </Pressable>
                            );
                        }),
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.75,
    },
    skipBtn: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.4)',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    cell: {
        width: '31.5%',
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    cellSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    cellText: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(245,230,200,0.55)',
        textAlign: 'center',
    },
    cellTextSelected: {
        color: fantasyTokens.colors.gold,
    },
    skippedBox: {
        backgroundColor: 'rgba(201,146,42,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.15)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    skippedTitle: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.4)',
    },
    skippedHint: {
        fontFamily: 'serif',
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 3,
    },
});
