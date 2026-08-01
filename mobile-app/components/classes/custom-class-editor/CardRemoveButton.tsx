import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CardRemoveButtonProps = {
    accessibilityLabel: string;
    onPress: () => void;
    testID?: string;
    style?: StyleProp<ViewStyle>;
};

/**
 * Shared top-right remove affordance for editable custom-class cards.
 */
export default function CardRemoveButton({
    accessibilityLabel,
    onPress,
    testID,
    style,
}: CardRemoveButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                style,
            ]}
            testID={testID}
        >
            <Ionicons name="trash-outline" size={18} color={fantasyTokens.colors.crimson} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.sheet.form.card,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
    },
    buttonPressed: {
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
});
