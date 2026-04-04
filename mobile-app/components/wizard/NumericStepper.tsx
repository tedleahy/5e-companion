import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type NumericStepperProps = {
    value: number | string;
    canDecrease?: boolean;
    canIncrease?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
    decrementTestID?: string;
    incrementTestID?: string;
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
    valueTestID,
    onDecrease,
    onIncrease,
}: NumericStepperProps) {
    return (
        <View style={styles.container}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={decrementLabel}
                accessibilityState={{ disabled: !canDecrease }}
                disabled={!canDecrease}
                onPress={onDecrease}
                style={({ pressed }) => [
                    styles.button,
                    !canDecrease && styles.buttonDisabled,
                    pressed && canDecrease && styles.buttonPressed,
                ]}
                testID={decrementTestID}
            >
                <Text style={styles.buttonText}>{'\u2212'}</Text>
            </Pressable>

            <Text style={styles.valueText} testID={valueTestID}>
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
                    !canIncrease && styles.buttonDisabled,
                    pressed && canIncrease && styles.buttonPressed,
                ]}
                testID={incrementTestID}
            >
                <Text style={styles.buttonText}>+</Text>
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
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(240,224,188,0.06)',
    },
    button: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    buttonPressed: {
        backgroundColor: 'rgba(201,146,42,0.16)',
    },
    buttonDisabled: {
        opacity: 0.35,
    },
    buttonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        color: fantasyTokens.colors.inkDark,
    },
    valueText: {
        minWidth: 42,
        paddingHorizontal: 10,
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        color: fantasyTokens.colors.inkDark,
    },
});
