import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SubclassClassFilterChips, { ALL_CLASSES_FILTER } from './SubclassClassFilterChips';
import SubclassListRow from './SubclassListRow';
import type { SubclassManagerRow } from './subclassManager.types';
import {
    animateSubclassValue,
    SUBCLASS_EXPAND_DURATION_MS,
    SUBCLASS_FADE_DURATION_MS,
} from './subclassExpandMotion';

type SubclassManagerCardProps = {
    subclasses: SubclassManagerRow[];
    allSubclassCount: number;
    selectedClassId: string;
    onSelectClassId: (classId: string) => void;
    onCreate: () => void;
    onEdit: (subclass: SubclassManagerRow) => void;
    onDelete: (subclass: SubclassManagerRow) => void;
    onExpandSubclass?: () => void;
};

const FILTER_MAX_HEIGHT = 50;

/**
 * Parchment manager panel containing filters and the reusable subclass list.
 */
export default function SubclassManagerCard({
    subclasses,
    allSubclassCount,
    selectedClassId,
    onSelectClassId,
    onCreate,
    onEdit,
    onDelete,
    onExpandSubclass,
}: SubclassManagerCardProps) {
    const [expandedSubclassId, setExpandedSubclassId] = useState<string | null>(null);
    const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isCardExpanded = expandedSubclassId != null;

    const listBorderWidth = useRef(new Animated.Value(1)).current;
    const filterOpacity = useRef(new Animated.Value(1)).current;
    const filterMaxHeight = useRef(new Animated.Value(FILTER_MAX_HEIGHT)).current;
    const filterPaddingBottom = useRef(new Animated.Value(1)).current;

    const selectedClass = CLASS_OPTIONS.find((option) => option.value === selectedClassId);
    const emptyTitle = selectedClassId === ALL_CLASSES_FILTER
        ? 'No subclasses available.'
        : `No ${selectedClass?.label ?? 'class'} subclasses yet.`;
    const emptyBody = allSubclassCount === 0
        ? 'Add a custom subclass to make one available.'
        : 'Try another class or add one.';
    const displayedSubclasses = useMemo(
        () => expandedSubclassId
            ? subclasses.filter((subclass) => subclass.id === expandedSubclassId)
            : subclasses,
        [expandedSubclassId, subclasses],
    );

    useEffect(() => {
        return () => {
            if (collapseTimeoutRef.current) {
                clearTimeout(collapseTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        animateSubclassValue(listBorderWidth, isCardExpanded ? 0 : 1, SUBCLASS_FADE_DURATION_MS);
        animateSubclassValue(filterOpacity, isCardExpanded ? 0 : 1, SUBCLASS_FADE_DURATION_MS);
        animateSubclassValue(filterMaxHeight, isCardExpanded ? 0 : FILTER_MAX_HEIGHT, 300);
        animateSubclassValue(filterPaddingBottom, isCardExpanded ? 0 : 1, 300);
    }, [
        listBorderWidth,
        filterMaxHeight,
        filterOpacity,
        filterPaddingBottom,
        isCardExpanded,
    ]);

    useEffect(() => {
        if (expandedSubclassId && !subclasses.some((subclass) => subclass.id === expandedSubclassId)) {
            setExpandedSubclassId(null);
        }
    }, [expandedSubclassId, subclasses]);

    /**
     * Collapses the expanded row and optionally runs a callback after the animation.
     */
    function collapseExpandedRow(onComplete?: () => void) {
        setExpandedSubclassId(null);

        if (!onComplete) return;

        if (collapseTimeoutRef.current) {
            clearTimeout(collapseTimeoutRef.current);
        }

        collapseTimeoutRef.current = setTimeout(() => {
            onComplete();
            collapseTimeoutRef.current = null;
        }, SUBCLASS_EXPAND_DURATION_MS);
    }

    /**
     * Expands or collapses a subclass row when tapped.
     */
    function handleRowPress(subclassId: string) {
        if (expandedSubclassId === subclassId) {
            collapseExpandedRow();
            return;
        }

        if (expandedSubclassId) {
            collapseExpandedRow(() => {
                setExpandedSubclassId(subclassId);
                onExpandSubclass?.();
            });
            return;
        }

        setExpandedSubclassId(subclassId);
        onExpandSubclass?.();
    }

    /**
     * Applies a class filter, collapsing any expanded row first.
     */
    function handleSelectClassId(classId: string) {
        if (expandedSubclassId) {
            collapseExpandedRow(() => onSelectClassId(classId));
            return;
        }

        onSelectClassId(classId);
    }

    return (
        <View
            style={[styles.card, isCardExpanded && styles.cardExpanded]}
            testID="subclass-manager-card"
        >
            {!isCardExpanded && (
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                        <Text style={styles.cardTitle}>Subclasses</Text>
                    </View>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Add custom subclass"
                        onPress={onCreate}
                        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                        testID="add-custom-subclass"
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                </View>
            )}

            {isCardExpanded && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to all subclasses"
                    onPress={() => collapseExpandedRow()}
                    style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                    testID="subclass-expand-back"
                >
                    <Ionicons
                        name="chevron-back"
                        size={12}
                        color={fantasyTokens.colors.crimson}
                    />
                    <Text style={styles.backButtonText}>All Subclasses</Text>
                </Pressable>
            )}

            <Animated.View
                pointerEvents={isCardExpanded ? 'none' : 'auto'}
                importantForAccessibility={isCardExpanded ? 'no-hide-descendants' : 'auto'}
                style={{
                    opacity: filterOpacity,
                    maxHeight: filterMaxHeight,
                    paddingBottom: Animated.multiply(filterPaddingBottom, 11),
                    overflow: 'hidden',
                }}
            >
                <SubclassClassFilterChips
                    selectedClassId={selectedClassId}
                    onSelectClassId={handleSelectClassId}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.list,
                    {
                        borderTopWidth: listBorderWidth,
                    },
                ]}
            >
                {displayedSubclasses.length > 0 ? (
                    displayedSubclasses.map((subclass) => (
                        <SubclassListRow
                            key={subclass.id}
                            subclass={subclass}
                            isOpen={expandedSubclassId === subclass.id}
                            onPress={() => handleRowPress(subclass.id)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState} testID="custom-subclass-empty-state">
                        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                        <Text style={styles.emptyBody}>{emptyBody}</Text>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: fantasyTokens.colors.cardBg,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        padding: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.md,
    },
    cardExpanded: {
        gap: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    cardTitleGroup: {
        flex: 1,
        minWidth: 0,
    },
    cardTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
    },
    addButton: {
        minWidth: 72,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    addButtonPressed: {
        opacity: 0.9,
    },
    addButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        paddingBottom: fantasyTokens.spacing.xs,
    },
    backButtonPressed: {
        opacity: 0.8,
    },
    backButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        fontSize: fantasyTokens.fontSizes.utility,
    },
    list: {
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    emptyState: {
        minHeight: 180,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    emptyTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        textAlign: 'center',
        fontWeight: '700',
    },
    emptyBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        textAlign: 'center',
    },
});
