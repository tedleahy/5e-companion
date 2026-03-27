import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Props for an inline row remove action.
 */
export type RemoveButtonProps = {
    editMode: boolean;
    onPress: () => void;
    accessibilityLabel?: string;
    style?: any;
};

/**
 * Small crimson remove button shown only while edit mode is active.
 */
export default function RemoveButton({
    editMode,
    onPress,
    accessibilityLabel = 'Remove item',
    style,
}: RemoveButtonProps) {
    if (!editMode) return null;

    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, style]}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Text style={styles.label}>{'\u00d7'}</Text>
        </Pressable>
    );
}

/** Styles for edit-mode remove action control. */
const styles = StyleSheet.create({
    button: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(139,26,26,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#8b1a1a',
        fontSize: fantasyTokens.fontSizes.label,
        fontWeight: '700',
    },
});
