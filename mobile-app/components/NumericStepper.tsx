import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type NumericStepperTone = 'night' | 'parchment';

type NumericStepperProps = {
    value: number | string;
    canDecrease?: boolean;
    canIncrease?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
    decrementTestID?: string;
    incrementTestID?: string;
    tone?: NumericStepperTone;
    valueTestID?: string;
    onDecrease: () => void;
    onIncrease: () => void;
};

/**
 * Shared numeric stepper with decrement and increment actions around one value.
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
    valueTestID,
    onDecrease,
    onIncrease,
}: NumericStepperProps) {
    const isNightTone = tone === 'night';

    return (
        <View style={[styles.container, isNightTone ? styles.containerNight : styles.containerParchment]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={decrementLabel}
                accessibilityState={{ disabled: !canDecrease }}
                disabled={!canDecrease}
                onPress={onDecrease}
                style={({ pressed }) => [
                    styles.button,
                    isNightTone ? styles.buttonNight : styles.buttonParchment,
                    !canDecrease && styles.buttonDisabled,
                    pressed && canDecrease && (isNightTone ? styles.buttonPressedNight : styles.buttonPressedParchment),
                ]}
                testID={decrementTestID}
            >
                <Text style={[styles.buttonText, isNightTone ? styles.buttonTextNight : styles.buttonTextParchment]}>
                    {'\u2212'}
                </Text>
            </Pressable>

            <Text
                style={[styles.valueText, isNightTone ? styles.valueTextNight : styles.valueTextParchment]}
                testID={valueTestID}
            >
                {value}
            </Text>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={incrementLabel}
                accessibilityState={{ disabled: !canIncrease }}
                disabled={!canIncrease}
                onPress={onIncrease}
                style={({ pressed }) => [
                    styles.button,
                    isNightTone ? styles.buttonNight : styles.buttonParchment,
                    !canIncrease && styles.buttonDisabled,
                    pressed && canIncrease && (isNightTone ? styles.buttonPressedNight : styles.buttonPressedParchment),
                ]}
                testID={incrementTestID}
            >
                <Text style={[styles.buttonText, isNightTone ? styles.buttonTextNight : styles.buttonTextParchment]}>+</Text>
            </Pressable>
        </View>
    );
}

/**
 * Base styles for the shared numeric stepper.
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: fantasyTokens.radii.sm,
        overflow: 'hidden',
        justifyContent: 'space-between',
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
    },
    buttonNight: {
        backgroundColor: fantasyTokens.stepper.night.button,
    },
    buttonParchment: {
        backgroundColor: fantasyTokens.stepper.parchment.button,
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
    },
    buttonTextNight: {
        color: fantasyTokens.colors.gold,
    },
    buttonTextParchment: {
        color: fantasyTokens.colors.inkDark,
    },
    valueText: {
        minWidth: fantasyTokens.stepper.valueMinWidth,
        paddingHorizontal: fantasyTokens.stepper.valuePaddingHorizontal,
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        fontVariant: ['tabular-nums'],
    },
    valueTextNight: {
        color: fantasyTokens.colors.parchment,
    },
    valueTextParchment: {
        color: fantasyTokens.colors.inkDark,
    },
});
