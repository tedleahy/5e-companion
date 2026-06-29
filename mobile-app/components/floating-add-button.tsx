import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { fantasyTokens } from '@/theme/fantasyTheme';

type FloatingAddButtonProps = {
    accessibilityLabel: string;
    testID: string;
    onPress: () => void;
};

const ENTER_DURATION_MS = 180;

/** Shared floating add action used on collection manager screens. */
export default function FloatingAddButton({
    accessibilityLabel,
    testID,
    onPress,
}: FloatingAddButtonProps) {
    return (
        <Animated.View
            entering={FadeIn.duration(ENTER_DURATION_MS)}
            style={styles.fabPosition}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                onPress={onPress}
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
                testID={testID}
            >
                <Text style={styles.fabIcon}>+</Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    fabPosition: {
        position: 'absolute',
        right: fantasyTokens.floatingActionButton.insetRight,
        bottom: fantasyTokens.floatingActionButton.insetBottom,
        width: fantasyTokens.floatingActionButton.size,
        height: fantasyTokens.floatingActionButton.size,
    },
    fab: {
        flex: 1,
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
