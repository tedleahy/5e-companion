import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CustomSubclassManagerRow } from './subclassManager.types';

type SubclassListRowProps = {
    subclass: CustomSubclassManagerRow;
    onEdit: (subclass: CustomSubclassManagerRow) => void;
    onDelete: (subclass: CustomSubclassManagerRow) => void;
};

/**
 * A single custom subclass row with compact edit and archive actions.
 */
export default function SubclassListRow({
    subclass,
    onEdit,
    onDelete,
}: SubclassListRowProps) {
    const classOption = CLASS_OPTIONS.find((option) => option.value === subclass.classId);
    const description = subclass.description.join('\n').trim();

    return (
        <View style={styles.row} testID={`custom-subclass-row-${subclass.id}`}>
            <View style={styles.iconBadge}>
                <Text style={styles.iconText}>{classOption?.icon ?? '✨'}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.name} numberOfLines={2}>{subclass.name}</Text>
                    <Text style={styles.className} numberOfLines={1}>{subclass.className}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {description || 'No description provided.'}
                </Text>
            </View>

            <View style={styles.actions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${subclass.name}`}
                    onPress={() => onEdit(subclass)}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                    testID={`edit-custom-subclass-${subclass.id}`}
                >
                    <Ionicons name="create-outline" size={19} color={fantasyTokens.colors.inkLight} />
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${subclass.name}`}
                    onPress={() => onDelete(subclass)}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.deletePressed]}
                    testID={`delete-custom-subclass-${subclass.id}`}
                >
                    <Ionicons name="trash-outline" size={19} color={fantasyTokens.colors.crimson} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        minHeight: 92,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    iconBadge: {
        width: 42,
        height: 42,
        borderRadius: fantasyTokens.radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    iconText: {
        fontSize: fantasyTokens.fontSizes.title,
    },
    content: {
        flex: 1,
        minWidth: 0,
        gap: fantasyTokens.spacing.xs,
    },
    titleRow: {
        gap: fantasyTokens.spacing.xs,
    },
    name: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
    },
    className: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
    description: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
    },
    actions: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.xs,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: fantasyTokens.radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    actionPressed: {
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    deletePressed: {
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
});

