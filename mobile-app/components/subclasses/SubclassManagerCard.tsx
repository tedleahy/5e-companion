import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import {
    Animated,
    Easing,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SubclassClassFilterChips, {
    ALL_CLASSES_FILTER,
    FILTER_CHIP_HEIGHT,
} from './SubclassClassFilterChips';
import SubclassListRow from './SubclassListRow';
import type { SubclassManagerRow } from './subclassManager.types';

type SubclassManagerCardProps = {
    subclasses: SubclassManagerRow[];
    allSubclassCount: number;
    selectedClassId: string;
    style?: StyleProp<ViewStyle>;
    onListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onDetailVisibilityChange?: (visible: boolean) => void;
    onSelectClassId: (classId: string) => void;
    onEdit: (subclass: SubclassManagerRow) => void;
    onDelete: (subclass: SubclassManagerRow) => void;
};

const DETAIL_TRANSITION_DURATION_MS = 220;
const SWIPE_BACK_DISTANCE = 72;
const SWIPE_BACK_VELOCITY = 700;
const SWIPE_BACK_ACTIVE_OFFSET_X = 12;
const SWIPE_BACK_FAIL_OFFSET_Y = 18;
const DETAIL_BACK_BUTTON_FADE_DISTANCE = 24;
const DETAIL_BACK_BUTTON_HEIGHT = fantasyTokens.fontSizes.body
    + (fantasyTokens.spacing.xs * 2);

/**
 * Parchment manager panel containing filters and the reusable subclass list.
 */
export default function SubclassManagerCard({
    subclasses,
    allSubclassCount,
    selectedClassId,
    style,
    onListScroll,
    onDetailVisibilityChange,
    onSelectClassId,
    onEdit,
    onDelete,
}: SubclassManagerCardProps) {
    const { width: windowWidth } = useWindowDimensions();
    const hiddenDetailTranslateX = Math.max(1, windowWidth);
    const [expandedSubclassId, setExpandedSubclassId] = useState<string | null>(null);
    const [detailClosing, setDetailClosing] = useState(false);
    const isCardExpanded = expandedSubclassId != null;
    const showListChrome = !isCardExpanded || detailClosing;
    const showDetailChrome = isCardExpanded && !detailClosing;
    const detailTranslateX = useRef(new Animated.Value(hiddenDetailTranslateX)).current;
    const listOpacity = useRef(new Animated.Value(1)).current;
    const listChromeVisibility = useRef(new Animated.Value(1)).current;
    const closingDetailRef = useRef(false);
    const detailClosingRef = useRef(false);
    const previousHiddenDetailTranslateXRef = useRef(hiddenDetailTranslateX);

    useEffect(() => {
        onDetailVisibilityChange?.(isCardExpanded);
    }, [isCardExpanded, onDetailVisibilityChange]);

    const selectedClass = CLASS_OPTIONS.find((option) => option.value === selectedClassId);
    const emptyTitle = selectedClassId === ALL_CLASSES_FILTER
        ? 'No subclasses available.'
        : `No ${selectedClass?.label ?? 'class'} subclasses yet.`;
    const emptyBody = allSubclassCount === 0
        ? 'Add a custom subclass to make one available.'
        : 'Try another class or add one.';
    const expandedSubclass = expandedSubclassId
        ? subclasses.find((subclass) => subclass.id === expandedSubclassId)
        : undefined;

    const setDetailClosingState = useCallback((nextClosing: boolean) => {
        if (detailClosingRef.current === nextClosing) return;

        detailClosingRef.current = nextClosing;
        setDetailClosing(nextClosing);
    }, []);

    useEffect(() => {
        if (expandedSubclassId && !subclasses.some((subclass) => subclass.id === expandedSubclassId)) {
            detailTranslateX.setValue(hiddenDetailTranslateX);
            listOpacity.setValue(1);
            listChromeVisibility.setValue(1);
            setExpandedSubclassId(null);
            setDetailClosingState(false);
        }
    }, [
        detailTranslateX,
        expandedSubclassId,
        hiddenDetailTranslateX,
        listOpacity,
        listChromeVisibility,
        setDetailClosingState,
        subclasses,
    ]);

    useEffect(() => {
        if (previousHiddenDetailTranslateXRef.current === hiddenDetailTranslateX) return;

        previousHiddenDetailTranslateXRef.current = hiddenDetailTranslateX;
        detailTranslateX.setValue(isCardExpanded ? 0 : hiddenDetailTranslateX);
    }, [detailTranslateX, hiddenDetailTranslateX, isCardExpanded]);

    const animateDetailOpen = useCallback(() => {
        closingDetailRef.current = false;
        setDetailClosingState(false);
        detailTranslateX.setValue(hiddenDetailTranslateX);
        listOpacity.setValue(1);
        listChromeVisibility.setValue(1);

        Animated.parallel([
            Animated.timing(detailTranslateX, {
                toValue: 0,
                duration: DETAIL_TRANSITION_DURATION_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(listOpacity, {
                toValue: 0,
                duration: DETAIL_TRANSITION_DURATION_MS,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(listChromeVisibility, {
                toValue: 0,
                duration: DETAIL_TRANSITION_DURATION_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    }, [
        detailTranslateX,
        hiddenDetailTranslateX,
        listChromeVisibility,
        listOpacity,
        setDetailClosingState,
    ]);

    /**
     * Animates the detail pane back to the list.
     */
    const closeExpandedRow = useCallback((onComplete?: () => void) => {
        if (!expandedSubclassId || closingDetailRef.current) return;

        closingDetailRef.current = true;
        setDetailClosingState(true);

        Animated.parallel([
            Animated.timing(detailTranslateX, {
                toValue: hiddenDetailTranslateX,
                duration: DETAIL_TRANSITION_DURATION_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(listOpacity, {
                toValue: 1,
                duration: DETAIL_TRANSITION_DURATION_MS,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(listChromeVisibility, {
                toValue: 1,
                duration: DETAIL_TRANSITION_DURATION_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start(({ finished }) => {
            if (!finished) return;

            closingDetailRef.current = false;
            setExpandedSubclassId(null);
            setDetailClosingState(false);
            onComplete?.();
        });
    }, [
        detailTranslateX,
        expandedSubclassId,
        hiddenDetailTranslateX,
        listChromeVisibility,
        listOpacity,
        setDetailClosingState,
    ]);

    const animateDetailBack = useCallback(() => {
        closingDetailRef.current = false;
        setDetailClosingState(false);

        Animated.parallel([
            Animated.timing(detailTranslateX, {
                toValue: 0,
                duration: 180,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(listOpacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(listChromeVisibility, {
                toValue: 0,
                duration: 180,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    }, [detailTranslateX, listChromeVisibility, listOpacity, setDetailClosingState]);

    const detailSwipeBackGesture = useMemo(() => Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX(SWIPE_BACK_ACTIVE_OFFSET_X)
        .failOffsetY([-SWIPE_BACK_FAIL_OFFSET_Y, SWIPE_BACK_FAIL_OFFSET_Y])
        .onUpdate((event) => {
            if (!expandedSubclassId || closingDetailRef.current) return;
            if (event.translationX <= 0) return;

            detailTranslateX.setValue(event.translationX);
            listOpacity.setValue(Math.min(1, event.translationX / SWIPE_BACK_DISTANCE));
            listChromeVisibility.setValue(Math.min(1, event.translationX / SWIPE_BACK_DISTANCE));
        })
        .onEnd((event) => {
            if (!expandedSubclassId || closingDetailRef.current) return;

            const shouldClose = event.translationX > SWIPE_BACK_DISTANCE
                || event.velocityX > SWIPE_BACK_VELOCITY;

            if (shouldClose) {
                closeExpandedRow();
            }
        })
        .onFinalize(() => {
            if (!expandedSubclassId || closingDetailRef.current) return;

            animateDetailBack();
        }), [
        animateDetailBack,
        closeExpandedRow,
        detailTranslateX,
        expandedSubclassId,
        listChromeVisibility,
        listOpacity,
    ]);

    /**
     * Expands or collapses a subclass row when tapped.
     */
    function handleRowPress(subclassId: string) {
        if (expandedSubclassId === subclassId) {
            closeExpandedRow();
            return;
        }

        setExpandedSubclassId(subclassId);
        animateDetailOpen();
    }

    /**
     * Applies a class filter, collapsing any expanded row first.
     */
    function handleSelectClassId(classId: string) {
        if (expandedSubclassId && !detailClosing) {
            closeExpandedRow(() => onSelectClassId(classId));
            return;
        }

        onSelectClassId(classId);
    }

    const detailSceneOpacity = detailTranslateX.interpolate({
        inputRange: [0, hiddenDetailTranslateX],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const listChromeHeight = listChromeVisibility.interpolate({
        inputRange: [0, 1],
        outputRange: [0, FILTER_CHIP_HEIGHT],
        extrapolate: 'clamp',
    });
    const tableHeaderHeight = listChromeVisibility.interpolate({
        inputRange: [0, 1],
        outputRange: [DETAIL_BACK_BUTTON_HEIGHT, FILTER_CHIP_HEIGHT],
        extrapolate: 'clamp',
    });
    const detailBackButtonOpacity = detailTranslateX.interpolate({
        inputRange: [0, DETAIL_BACK_BUTTON_FADE_DISTANCE],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    return (
        <View
            style={[styles.card, style]}
            testID="subclass-manager-card"
        >
            <Animated.View style={[styles.tableHeader, { height: tableHeaderHeight }]}>
                <Animated.View
                    pointerEvents={showListChrome ? 'auto' : 'none'}
                    importantForAccessibility={showListChrome ? 'auto' : 'no-hide-descendants'}
                    style={[
                        styles.listChromeSlot,
                        {
                            height: listChromeHeight,
                            opacity: listChromeVisibility,
                        },
                    ]}
                >
                    <SubclassClassFilterChips
                        selectedClassId={selectedClassId}
                        onSelectClassId={handleSelectClassId}
                    />
                </Animated.View>
                {showDetailChrome && (
                    <Animated.View
                        style={[
                            styles.backButtonOverlay,
                            { opacity: detailBackButtonOpacity },
                        ]}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Back to all subclasses"
                            onPress={() => closeExpandedRow()}
                            style={({ pressed }) => [
                                styles.backButton,
                                pressed && styles.backButtonPressed,
                            ]}
                            testID="subclass-expand-back"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={12}
                                color={fantasyTokens.colors.crimson}
                            />
                            <Text style={styles.backButtonText}>All Subclasses</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </Animated.View>

            <View style={styles.listFrame}>
                <Animated.View
                    pointerEvents={showListChrome ? 'auto' : 'none'}
                    importantForAccessibility={showListChrome ? 'auto' : 'no-hide-descendants'}
                    style={[styles.listScene, { opacity: listOpacity }]}
                >
                    <ScrollView
                        style={styles.listScroll}
                        contentContainerStyle={styles.listContent}
                        nestedScrollEnabled
                        onScroll={onListScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator
                        testID="subclass-list-scroll"
                    >
                        {subclasses.length > 0 ? (
                            subclasses.map((subclass) => (
                                <SubclassListRow
                                    key={subclass.id}
                                    subclass={subclass}
                                    isOpen={false}
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
                    </ScrollView>
                </Animated.View>

                {isCardExpanded && expandedSubclass && (
                    <GestureDetector gesture={detailSwipeBackGesture}>
                        <Animated.View
                            style={[
                                styles.detailScene,
                                {
                                    opacity: detailSceneOpacity,
                                    transform: [{ translateX: detailTranslateX }],
                                },
                            ]}
                        >
                            <ScrollView
                                key={`subclass-detail-${expandedSubclass.id}`}
                                style={styles.listScroll}
                                contentContainerStyle={styles.listContent}
                                nestedScrollEnabled
                                onScroll={onListScroll}
                                scrollEventThrottle={16}
                                showsVerticalScrollIndicator
                                testID="subclass-detail-scroll"
                            >
                                <SubclassListRow
                                    subclass={expandedSubclass}
                                    isOpen
                                    onPress={() => handleRowPress(expandedSubclass.id)}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                )}
            </View>
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
        minHeight: 0,
    },
    tableHeader: {
        backgroundColor: fantasyTokens.colors.cardBg,
        zIndex: 1,
    },
    listChromeSlot: {
        gap: fantasyTokens.spacing.sm,
        overflow: 'hidden',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        paddingVertical: fantasyTokens.spacing.xs,
    },
    backButtonOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 3,
        backgroundColor: fantasyTokens.colors.cardBg,
    },
    backButtonPressed: {
        opacity: 0.8,
    },
    backButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: fantasyTokens.fontSizes.body,
    },
    listFrame: {
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    listScene: {
        flex: 1,
    },
    detailScene: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: fantasyTokens.colors.cardBg,
    },
    listScroll: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
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
