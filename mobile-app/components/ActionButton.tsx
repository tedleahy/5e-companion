import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Visual variants supported by the shared action button.
 */
export type ActionButtonVariant = 'ghost' | 'filledCrimson' | 'outlineCrimson' | 'ghostCrimson';

/**
 * Props for the shared action button component.
 */
type ActionButtonProps = {
    variant: ActionButtonVariant;
    onPress: () => void;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    accessibilityLabel?: string;
    testID?: string;
};

/**
 * Shared compact action button used by inline spell-row actions.
 */
export default function ActionButton({
    variant,
    onPress,
    children,
    style,
    textStyle,
    disabled = false,
    accessibilityLabel,
    testID,
}: ActionButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            style={({ pressed }) => [
                styles.base,
                variantStyles[variant].container,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text style={[styles.text, variantStyles[variant].text, textStyle]}>{children}</Text>
        </Pressable>
    );
}

const variantStyles: Record<ActionButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    ghost: {
        container: {
            borderWidth: 1,
            borderColor: 'rgba(26,15,0,0.2)',
            backgroundColor: 'transparent',
        },
        text: {
            color: 'rgba(26,15,0,0.55)',
        },
    },
    filledCrimson: {
        container: {
            borderWidth: 1,
            borderColor: 'transparent',
            backgroundColor: fantasyTokens.colors.crimson,
        },
        text: {
            color: fantasyTokens.colors.parchment,
        },
    },
    outlineCrimson: {
        container: {
            borderWidth: 1,
            borderColor: 'rgba(139,26,26,0.3)',
            backgroundColor: 'rgba(139,26,26,0.07)',
        },
        text: {
            color: fantasyTokens.colors.crimson,
        },
    },
    ghostCrimson: {
        container: {
            borderWidth: 1,
            borderColor: 'rgba(139,26,26,0.22)',
            backgroundColor: 'transparent',
        },
        text: {
            color: fantasyTokens.colors.crimson,
        },
    },
};

const styles = StyleSheet.create({
    base: {
        minHeight: 28,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.45,
    },
});
