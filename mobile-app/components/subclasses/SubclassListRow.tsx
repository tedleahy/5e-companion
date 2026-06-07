import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { SubclassManagerRow } from './subclassManager.types';
import {
    animateSubclassValue,
    SUBCLASS_BADGE_SIZE_COLLAPSED,
    SUBCLASS_BADGE_SIZE_EXPANDED,
    SUBCLASS_CLASS_SIZE_COLLAPSED,
    SUBCLASS_CLASS_SIZE_EXPANDED,
    SUBCLASS_EXPAND_DURATION_MS,
    SUBCLASS_NAME_SIZE_COLLAPSED,
    SUBCLASS_NAME_SIZE_EXPANDED,
    SUBCLASS_ROW_EXPANDED_MAX_HEIGHT,
    SUBCLASS_ROW_MAX_HEIGHT,
} from './subclassExpandMotion';

const AnimatedText = Animated.createAnimatedComponent(Text);

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

    const rowMaxHeight = useRef(new Animated.Value(SUBCLASS_ROW_MAX_HEIGHT)).current;
    const badgeSize = useRef(new Animated.Value(SUBCLASS_BADGE_SIZE_COLLAPSED)).current;
    const nameSize = useRef(new Animated.Value(SUBCLASS_NAME_SIZE_COLLAPSED)).current;
    const classSize = useRef(new Animated.Value(SUBCLASS_CLASS_SIZE_COLLAPSED)).current;
    const classMarginTop = useRef(new Animated.Value(1)).current;
    const expandedActionsOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        animateSubclassValue(
            rowMaxHeight,
            isOpen ? SUBCLASS_ROW_EXPANDED_MAX_HEIGHT : SUBCLASS_ROW_MAX_HEIGHT,
            SUBCLASS_EXPAND_DURATION_MS,
        );

        const openDelay = isOpen ? 80 : 0;
        animateSubclassValue(badgeSize, isOpen ? SUBCLASS_BADGE_SIZE_EXPANDED : SUBCLASS_BADGE_SIZE_COLLAPSED, 300, openDelay);
        animateSubclassValue(nameSize, isOpen ? SUBCLASS_NAME_SIZE_EXPANDED : SUBCLASS_NAME_SIZE_COLLAPSED, 300, openDelay);
        animateSubclassValue(classSize, isOpen ? SUBCLASS_CLASS_SIZE_EXPANDED : SUBCLASS_CLASS_SIZE_COLLAPSED, 300, openDelay);
        animateSubclassValue(classMarginTop, isOpen ? fantasyTokens.spacing.xs : 1, 300, openDelay);
        animateSubclassValue(expandedActionsOpacity, isOpen ? 1 : 0, 300, isOpen ? 140 : 0);
    }, [
        badgeSize,
        classMarginTop,
        classSize,
        expandedActionsOpacity,
        isOpen,
        nameSize,
        rowMaxHeight,
    ]);

    return (
        <Animated.View
            style={[
                styles.row,
                isOpen && styles.rowOpen,
                {
                    maxHeight: rowMaxHeight,
                    paddingVertical: fantasyTokens.spacing.md,
                    overflow: isOpen ? 'visible' : 'hidden',
                },
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
                <Animated.View
                    style={[
                        styles.iconBadge,
                        {
                            width: badgeSize,
                            height: badgeSize,
                        },
                    ]}
                >
                    <Text style={styles.iconText}>{classOption?.icon ?? '✨'}</Text>
                </Animated.View>

                <View style={styles.content}>
                    <AnimatedText
                        style={[
                            styles.name,
                            {
                                fontSize: nameSize,
                                lineHeight: Animated.multiply(nameSize, 1.3),
                            },
                        ]}
                        numberOfLines={isOpen ? undefined : 2}
                    >
                        {subclass.name}
                    </AnimatedText>
                    <AnimatedText
                        style={[
                            styles.className,
                            {
                                fontSize: classSize,
                                lineHeight: Animated.multiply(classSize, 1.3),
                                marginTop: classMarginTop,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {subclass.className}
                    </AnimatedText>

                    <Text
                        style={styles.description}
                        numberOfLines={isOpen ? undefined : 2}
                        ellipsizeMode={isOpen ? undefined : 'tail'}
                    >
                        {description}
                    </Text>

                    {subclass.isCustom && isOpen && (
                        <Animated.View style={[styles.expandedActions, { opacity: expandedActionsOpacity }]}>
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
                        </Animated.View>
                    )}
                </View>
            </Pressable>

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

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    rowOpen: {
        flexWrap: 'wrap',
        borderBottomWidth: 0,
    },
    rowPressable: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.md,
    },
    rowPressed: {
        backgroundColor: 'rgba(140, 29, 56, 0.02)',
    },
    iconBadge: {
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
    name: {
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
        fontFamily: fantasyTokens.fonts.regular,
    },
    className: {
        color: fantasyTokens.colors.ember,
        fontFamily: fantasyTokens.fonts.medium,
        fontWeight: '500',
    },
    description: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
        marginTop: fantasyTokens.spacing.xs,
        lineHeight: fantasyTokens.fontSizes.caption * 1.6,
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
    expandedActions: {
        width: '100%',
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.md,
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
