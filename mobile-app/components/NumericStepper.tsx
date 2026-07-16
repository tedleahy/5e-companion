import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type NumericStepperTone = 'night' | 'parchment';
type NumericStepperSize = 'default' | 'compact';

type NumericStepperProps = {
    value: number | string;
    canDecrease?: boolean;
    canIncrease?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
    decrementTestID?: string;
    incrementTestID?: string;
    tone?: NumericStepperTone;
    /** `compact` is the mini − n + control for dense grids (e.g. spell slots). */
    size?: NumericStepperSize;
    valueTestID?: string;
    onDecrease: () => void;
    onIncrease: () => void;
};

type StepperButtonProps = {
    label: string;
    glyph: string;
    disabled: boolean;
    testID?: string;
    isNightTone: boolean;
    compact: boolean;
    onPress: () => void;
};

/**
 * Shared −/+ press target used by both default and compact steppers.
 */
function StepperButton({
    label,
    glyph,
    disabled,
    testID,
    isNightTone,
    compact,
    onPress,
}: StepperButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            disabled={disabled}
            hitSlop={compact ? fantasyTokens.stepper.compact.hitSlop : undefined}
            onPress={onPress}
            style={({ pressed }) => [
                compact ? styles.compactButton : styles.button,
                compact && (isNightTone ? styles.compactButtonNight : styles.compactButtonParchment),
                disabled && styles.buttonDisabled,
                pressed && !disabled && (isNightTone
                    ? styles.buttonPressedNight
                    : styles.buttonPressedParchment),
            ]}
            testID={testID}
        >
            <Text
                style={[
                    compact ? styles.compactButtonText : styles.buttonText,
                    isNightTone ? styles.buttonTextNight : styles.buttonTextParchment,
                ]}
            >
                {glyph}
            </Text>
        </Pressable>
    );
}

/**
 * Shared numeric stepper with decrement and increment actions around one value.
 *
 * - `default`: bordered shell with vertical dividers (form rows).
 * - `compact`: separate mini bordered buttons for tight grids.
 */
export default function NumericStepper({
    value,
    canDecrease = true,
    canIncrease = true,
    decrementLabel = 'Decrease value',
    incrementLabel = 'Increase value',
    decrementTestID,
    incrementTestID,
    tone = 'parchment',
    size = 'default',
    valueTestID,
    onDecrease,
    onIncrease,
}: NumericStepperProps) {
    const isNightTone = tone === 'night';
    const isCompact = size === 'compact';

    if (isCompact) {
        return (
            <View style={styles.compactRow}>
                <StepperButton
                    label={decrementLabel}
                    glyph={'\u2212'}
                    disabled={!canDecrease}
                    testID={decrementTestID}
                    isNightTone={isNightTone}
                    compact
                    onPress={onDecrease}
                />
                <Text
                    style={[
                        styles.compactValueText,
                        isNightTone ? styles.valueTextNight : styles.valueTextParchment,
                    ]}
                    testID={valueTestID}
                >
                    {value}
                </Text>
                <StepperButton
                    label={incrementLabel}
                    glyph="+"
                    disabled={!canIncrease}
                    testID={incrementTestID}
                    isNightTone={isNightTone}
                    compact
                    onPress={onIncrease}
                />
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                isNightTone ? styles.containerNight : styles.containerParchment,
            ]}
        >
            <StepperButton
                label={decrementLabel}
                glyph={'\u2212'}
                disabled={!canDecrease}
                testID={decrementTestID}
                isNightTone={isNightTone}
                compact={false}
                onPress={onDecrease}
            />
            <View
                style={[
                    styles.valueCell,
                    isNightTone ? styles.valueDividerNight : styles.valueDividerParchment,
                ]}
            >
                <Text
                    style={[
                        styles.valueText,
                        isNightTone ? styles.valueTextNight : styles.valueTextParchment,
                    ]}
                    testID={valueTestID}
                >
                    {value}
                </Text>
            </View>
            <StepperButton
                label={incrementLabel}
                glyph="+"
                disabled={!canIncrease}
                testID={incrementTestID}
                isNightTone={isNightTone}
                compact={false}
                onPress={onIncrease}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: fantasyTokens.radii.sm,
        overflow: 'hidden',
    },
    containerNight: {
        borderColor: fantasyTokens.stepper.night.border,
        backgroundColor: fantasyTokens.stepper.night.background,
    },
    containerParchment: {
        borderColor: fantasyTokens.stepper.parchment.border,
        backgroundColor: fantasyTokens.stepper.parchment.background,
    },
    button: {
        width: fantasyTokens.stepper.buttonSize,
        height: fantasyTokens.stepper.buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    buttonPressedNight: {
        backgroundColor: fantasyTokens.stepper.night.buttonPressed,
    },
    buttonPressedParchment: {
        backgroundColor: fantasyTokens.stepper.parchment.buttonPressed,
    },
    buttonDisabled: {
        opacity: 0.35,
    },
    buttonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        lineHeight: fantasyTokens.fontSizes.bodyLarge + 2,
    },
    buttonTextNight: {
        color: fantasyTokens.colors.goldLight,
    },
    buttonTextParchment: {
        color: fantasyTokens.colors.inkDark,
    },
    valueCell: {
        minWidth: fantasyTokens.stepper.valueMinWidth,
        height: fantasyTokens.stepper.buttonSize,
        paddingHorizontal: fantasyTokens.stepper.valuePaddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    valueDividerNight: {
        borderLeftColor: fantasyTokens.stepper.night.border,
        borderRightColor: fantasyTokens.stepper.night.border,
    },
    valueDividerParchment: {
        borderLeftColor: fantasyTokens.stepper.parchment.border,
        borderRightColor: fantasyTokens.stepper.parchment.border,
    },
    valueText: {
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    valueTextNight: {
        color: fantasyTokens.colors.parchment,
    },
    valueTextParchment: {
        color: fantasyTokens.colors.inkDark,
    },
    compactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        gap: fantasyTokens.stepper.compact.gap,
    },
    compactButton: {
        width: fantasyTokens.stepper.compact.buttonSize,
        height: fantasyTokens.stepper.compact.buttonSize,
        borderRadius: fantasyTokens.stepper.compact.buttonRadius,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    compactButtonNight: {
        borderColor: fantasyTokens.stepper.night.border,
    },
    compactButtonParchment: {
        borderColor: fantasyTokens.stepper.parchment.border,
    },
    compactButtonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.stepper.compact.buttonFontSize,
        lineHeight: fantasyTokens.stepper.compact.buttonFontSize + 2,
        textAlign: 'center',
    },
    compactValueText: {
        minWidth: fantasyTokens.stepper.compact.valueMinWidth,
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.stepper.compact.fontSize,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
});
