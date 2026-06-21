import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type FloatingAddButtonProps = {
    accessibilityLabel: string;
    testID: string;
    onPress: () => void;
};

/** Shared floating add action used on collection manager screens. */
export default function FloatingAddButton({
    accessibilityLabel,
    testID,
    onPress,
}: FloatingAddButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
            testID={testID}
        >
            <Text style={styles.fabIcon}>+</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: fantasyTokens.floatingActionButton.insetRight,
        bottom: fantasyTokens.floatingActionButton.insetBottom,
        width: fantasyTokens.floatingActionButton.size,
        height: fantasyTokens.floatingActionButton.size,
        borderRadius: fantasyTokens.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.crimson,
    },
    fabPressed: {
        opacity: 0.9,
    },
    fabIcon: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.headline,
        lineHeight: fantasyTokens.floatingActionButton.iconLineHeight,
        marginTop: fantasyTokens.floatingActionButton.iconOffsetTop,
    },
});
