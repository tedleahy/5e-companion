import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Props for a section heading that can optionally show an add action in edit mode.
 */
export type SectionHeaderProps = {
    title: string;
    editMode: boolean;
    onAdd?: () => void;
    addLabel?: string;
};

/**
 * Renders a shared card section heading row with optional add control.
 */
export default function SectionHeader({
    title,
    editMode,
    onAdd,
    addLabel = '+ Add',
}: SectionHeaderProps) {
    const canShowAdd = editMode && typeof onAdd === 'function';

    return (
        <View style={styles.row}>
            <Text style={styles.title}>{title}</Text>
            {canShowAdd ? (
                <Pressable
                    onPress={onAdd}
                    style={styles.addButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${title.toLowerCase()}`}
                >
                    <Text style={styles.addButtonText}>{addLabel}</Text>
                </Pressable>
            ) : (
                <View />
            )}
        </View>
    );
}

/** Shared section-header styles for edit mode sections. */
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.divider,
    },
    title: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.crimson,
        fontWeight: '700',
    },
    addButton: {
        borderWidth: fantasyTokens.addButton.borderWidth,
        borderColor: fantasyTokens.addButton.borderColor,
        borderRadius: fantasyTokens.addButton.borderRadius,
        backgroundColor: fantasyTokens.addButton.backgroundColor,
        paddingVertical: fantasyTokens.addButton.paddingVertical,
        paddingHorizontal: fantasyTokens.addButton.paddingHorizontal,
    },
    addButtonText: {
        fontFamily: fantasyTokens.addButton.fontFamily,
        fontSize: fantasyTokens.addButton.fontSize,
        letterSpacing: fantasyTokens.addButton.letterSpacing,
        textTransform: fantasyTokens.addButton.textTransform,
        color: fantasyTokens.addButton.color,
    },
});
