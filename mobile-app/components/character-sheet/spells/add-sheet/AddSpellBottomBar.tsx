import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type AddSpellBottomBarProps = {
    sessionChangesCount: number;
    onDone: () => void;
};

/**
 * Bottom status/action bar for the Add Spell sheet.
 */
export default function AddSpellBottomBar({ sessionChangesCount, onDone }: AddSpellBottomBarProps) {
    return (
        <View style={styles.bottomBar}>
            <Text style={styles.addedCountText}>
                {sessionChangesCount === 0
                    ? 'Tap a spell to add or remove it'
                    : `${sessionChangesCount} change${sessionChangesCount === 1 ? '' : 's'} made`}
            </Text>
            <Pressable onPress={onDone} style={styles.doneButton} accessibilityLabel="Done adding spells">
                <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomBar: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addedCountText: {
        color: fantasyTokens.colors.gold,
        opacity: 0.62,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
        fontStyle: 'italic',
    },
    doneButton: {
        borderRadius: 10,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: 22,
        paddingVertical: 9,
    },
    doneButtonText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '700',
    },
});
