import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { SubclassManagerRow } from './subclassManager.types';

const SUBCLASS_BADGE_SIZE_COLLAPSED = 42;
const SUBCLASS_BADGE_SIZE_EXPANDED = 52;

type SubclassListRowProps = {
    subclass: SubclassManagerRow;
    isOpen: boolean;
    onPress: () => void;
    onEdit: (subclass: SubclassManagerRow) => void;
    onDelete: (subclass: SubclassManagerRow) => void;
};

/**
 * A single subclass row with tap-to-expand details and compact or expanded actions.
 */
export default function SubclassListRow({
    subclass,
    isOpen,
    onPress,
    onEdit,
    onDelete,
}: SubclassListRowProps) {
    const classOption = CLASS_OPTIONS.find((option) => option.value === subclass.classId);
    const description = subclass.description.join('\n').trim() || 'No description provided.';
    const features = subclass.features
        .slice()
        .sort((left, right) => {
            if (left.level !== right.level) return left.level - right.level;
            return left.name.localeCompare(right.name);
        });

    return (
        <View
            style={[
                styles.row,
                isOpen && styles.rowOpen,
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View details for ${subclass.name}`}
                accessibilityState={{ expanded: isOpen }}
                disabled={isOpen}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.rowPressable,
                    pressed && !isOpen && styles.rowPressed,
                ]}
                testID={`custom-subclass-row-${subclass.id}`}
            >
                <View style={styles.header}>
                    <View style={[styles.iconBadge, isOpen && styles.iconBadgeOpen]}>
                        <Text style={styles.iconText}>{classOption?.icon ?? '✨'}</Text>
                    </View>

                    <View style={styles.content}>
                        <Text
                            style={[styles.name, isOpen && styles.nameOpen]}
                            numberOfLines={isOpen ? undefined : 2}
                        >
                            {subclass.name}
                        </Text>
                        <Text
                            style={[styles.className, isOpen && styles.classNameOpen]}
                            numberOfLines={1}
                        >
                            {subclass.className}
                        </Text>
                    </View>
                </View>

                <Text
                    style={styles.description}
                    numberOfLines={isOpen ? undefined : 2}
                    ellipsizeMode={isOpen ? undefined : 'tail'}
                >
                    {description}
                </Text>

                {isOpen && (
                    <View style={styles.featuresSection}>
                        <Text style={styles.featuresTitle}>Features</Text>
                        {features.length === 0 ? (
                            <Text style={styles.emptyFeaturesText}>No subclass features yet.</Text>
                        ) : (
                            features.map((feature) => (
                                <View key={feature.id} style={styles.featureItem}>
                                    <Text style={styles.featureLevel}>Level {feature.level}</Text>
                                    <Text style={styles.featureName}>{feature.name}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </Pressable>

            {subclass.isCustom && isOpen && (
                <View style={styles.expandedActionsRow}>
                    <View style={styles.expandedActionsSpacer} />
                    <View style={styles.expandedActions}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Edit ${subclass.name}`}
                            onPress={() => onEdit(subclass)}
                            style={({ pressed }) => [
                                styles.expandedActionButton,
                                styles.expandedEditButton,
                                pressed && styles.expandedActionPressed,
                            ]}
                            testID={`edit-custom-subclass-${subclass.id}`}
                        >
                            <Text style={styles.expandedEditLabel}>Edit Subclass</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Delete ${subclass.name}`}
                            onPress={() => onDelete(subclass)}
                            style={({ pressed }) => [
                                styles.expandedActionButton,
                                styles.expandedDeleteButton,
                                pressed && styles.expandedDeletePressed,
                            ]}
                            testID={`delete-custom-subclass-${subclass.id}`}
                        >
                            <Text style={styles.expandedDeleteLabel}>Delete</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {subclass.isCustom && !isOpen && (
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
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
        paddingVertical: fantasyTokens.spacing.md,
    },
    rowOpen: {
        flexWrap: 'wrap',
        borderBottomWidth: 0,
    },
    rowPressable: {
        flex: 1,
        minWidth: 0,
        gap: fantasyTokens.spacing.xs,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.md,
    },
    rowPressed: {
        backgroundColor: 'rgba(140, 29, 56, 0.02)',
    },
    iconBadge: {
        width: SUBCLASS_BADGE_SIZE_COLLAPSED,
        height: SUBCLASS_BADGE_SIZE_COLLAPSED,
        borderRadius: fantasyTokens.radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    iconBadgeOpen: {
        width: SUBCLASS_BADGE_SIZE_EXPANDED,
        height: SUBCLASS_BADGE_SIZE_EXPANDED,
    },
    iconText: {
        fontSize: fantasyTokens.fontSizes.title,
    },
    content: {
        flex: 1,
        minWidth: 0,
        gap: fantasyTokens.spacing.xs,
    },
    name: {
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        lineHeight: fantasyTokens.fontSizes.bodyLarge * 1.3,
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
        fontFamily: fantasyTokens.fonts.regular,
    },
    nameOpen: {
        fontSize: fantasyTokens.fontSizes.title,
        lineHeight: fantasyTokens.fontSizes.title * 1.3,
    },
    className: {
        fontSize: fantasyTokens.fontSizes.utility,
        lineHeight: fantasyTokens.fontSizes.utility * 1.3,
        marginTop: 1,
        color: fantasyTokens.colors.ember,
        fontFamily: fantasyTokens.fonts.medium,
        fontWeight: '500',
    },
    classNameOpen: {
        fontSize: fantasyTokens.fontSizes.caption,
        lineHeight: fantasyTokens.fontSizes.caption * 1.3,
        marginTop: fantasyTokens.spacing.xs,
    },
    description: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
        marginTop: fantasyTokens.spacing.xs,
        lineHeight: fantasyTokens.fontSizes.caption * 1.6,
    },
    featuresSection: {
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    featuresTitle: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: fantasyTokens.fontSizes.body,
        color: fantasyTokens.colors.ember,
        paddingTop: 10,
    },
    emptyFeaturesText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
        fontStyle: 'italic',
    },
    featureItem: {
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        backgroundColor: fantasyTokens.colors.rowOpenBg,
        padding: fantasyTokens.spacing.sm,
    },
    featureLevel: {
        ...fantasyTokens.typography.statLabel,
        color: fantasyTokens.colors.ember,
    },
    featureName: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
    },
    featureDescription: {
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
    expandedActionsRow: {
        width: '100%',
        flexDirection: 'row',
        gap: fantasyTokens.spacing.md,
        marginTop: fantasyTokens.spacing.md,
    },
    expandedActionsSpacer: {
        width: SUBCLASS_BADGE_SIZE_EXPANDED,
    },
    expandedActions: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    expandedActionButton: {
        flex: 1,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1.5,
        paddingHorizontal: fantasyTokens.spacing.sm,
    },
    expandedEditButton: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'transparent',
    },
    expandedDeleteButton: {
        borderColor: 'rgba(140, 29, 56, 0.35)',
        backgroundColor: 'transparent',
    },
    expandedActionPressed: {
        opacity: 0.9,
    },
    expandedDeletePressed: {
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    expandedEditLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkDark,
    },
    expandedDeleteLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
    },
});
