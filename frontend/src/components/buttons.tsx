import { StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors, typography, type ShadowDepth } from '@/theme';

import { PrintPressable } from './print-pressable';

type ButtonProps = {
    label: string;
    /** Unset until the action exists. The button still looks and responds as if it were enabled. */
    onPress?: () => void;
    accessibilityLabel?: string;
    /** Sits on the structural plate, so its focus ring needs the light ink. */
    onPlate?: boolean;
    style?: StyleProp<ViewStyle>;
};

type PrimaryButtonProps = ButtonProps & {
    /** `large` has more padding and larger text than `medium`. */
    size?: 'large' | 'medium';
};

/** Primary button used for key actions in the app. */
export function PrimaryButton({ label, size = 'large', style, ...props }: PrimaryButtonProps) {
    return (
        <PrintPressable
            {...props}
            role="button"
            depth={5}
            shadowToken="structural"
            // The medium face is about 42 points tall, so its hit area reaches a little past it.
            hitSlop={size === 'medium' ? 2 : undefined}
            style={[
                styles.primary,
                size === 'large' ? styles.primaryLarge : styles.primaryMedium,
                style,
            ]}
        >
            <Text
                style={[
                    size === 'large' ? typography.buttonPrimary : typography.buttonPrimaryCompact,
                    styles.primaryText,
                ]}
            >
                {label}
            </Text>
        </PrintPressable>
    );
}

/** The secondary button sizes. */
type SecondarySize = 'small' | 'medium' | 'large';

const SECONDARY_SIZES: Record<
    SecondarySize,
    { depth: ShadowDepth; box: ViewStyle; text: TextStyle; hitSlop?: number }
> = {
    // Shorter than 44 points, so the hit area reaches past its edges.
    small: {
        depth: 3,
        box: { paddingVertical: 8, paddingHorizontal: 12 },
        text: typography.buttonSecondaryCompact,
        hitSlop: 4,
    },
    medium: {
        depth: 3,
        box: { paddingVertical: 9, paddingHorizontal: 14 },
        text: typography.buttonSecondary,
        hitSlop: 4,
    },
    // 44 points tall, a full touch target, so it needs no extra hit area.
    large: {
        depth: 4,
        box: { minHeight: 44, paddingHorizontal: 13 },
        text: typography.buttonSecondary,
    },
};

type SecondaryButtonProps = ButtonProps & {
    size: SecondarySize;
    /** `link` for a button that goes somewhere rather than acting here. */
    role?: 'button' | 'link';
};

/** A secondary action on a card-coloured face with a structural outline and an accent shadow. */
export function SecondaryButton({
    label,
    size,
    role = 'button',
    style,
    ...props
}: SecondaryButtonProps) {
    const { depth, box, text, hitSlop } = SECONDARY_SIZES[size];

    return (
        <PrintPressable
            {...props}
            role={role}
            depth={depth}
            hitSlop={hitSlop}
            style={[styles.secondary, box, style]}
        >
            <Text numberOfLines={1} style={[text, styles.secondaryText]}>
                {label}
            </Text>
        </PrintPressable>
    );
}

const styles = StyleSheet.create({
    primary: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
    },
    primaryLarge: {
        padding: 14,
    },
    primaryMedium: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    primaryText: {
        color: colors.onAccent,
    },
    secondary: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
    },
    secondaryText: {
        color: colors.structural,
    },
});
