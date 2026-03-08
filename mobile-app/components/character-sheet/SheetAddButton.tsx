import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SheetAddButtonProps = {
    label: string;
    accessibilityLabel: string;
    onPress?: () => void;
    disabled?: boolean;
};

export default function SheetAddButton({
    label,
    accessibilityLabel,
    onPress,
    disabled = false,
}: SheetAddButtonProps) {
    const isDisabled = disabled || !onPress;

    return (
        <Pressable
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled: isDisabled }}
        >
            <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.3)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    buttonText: {
        fontFamily: 'serif',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
    },
});
