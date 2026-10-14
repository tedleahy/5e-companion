import { StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors, typography, type ShadowDepth } from '@/theme';

import { PrintPressable } from './print-pressable';

type ButtonProps = {
    label: string;
    onPress?: () => void;
    accessibilityLabel?: string;
    onPlate?: boolean;
    style?: StyleProp<ViewStyle>;
};

type PrimaryButtonProps = ButtonProps & {
    size?: 'large' | 'medium';
};

/**
 * Primary button used for key actions in the app.
 *
 * @param props - The button content, appearance, and forwarded press options.
 * @param props.label - The visible action label.
 * @param props.size - The button size that selects padding, text, and touch-target spacing.
 * @param props.style - Additional styles for the button surface.
 * @param props.onPress - Runs the action when pressed. Leave unset until the action exists; the
 *   button still looks and responds as enabled.
 * @param props.accessibilityLabel - The action name announced by screen readers when it differs from the visible label.
 * @param props.onPlate - Whether the button sits on the structural plate and needs a light focus ring.
 */
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
    role?: 'button' | 'link';
};

/**
 * A secondary action on a card-colored face with a structural outline and an accent shadow.
 *
 * @param props - The button content, appearance, and forwarded press options.
 * @param props.label - The visible action label.
 * @param props.size - The button size that selects padding, text, and touch-target spacing.
 * @param props.style - Additional styles for the button surface.
 * @param props.onPress - Runs the action when pressed. Leave unset until the action exists; the
 *   button still looks and responds as enabled.
 * @param props.accessibilityLabel - The action name announced by screen readers when it differs from the visible label.
 * @param props.onPlate - Whether the button sits on the structural plate and needs a light focus ring.
 * @param props.role - The accessible role, using link when the action opens another screen.
 */
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
