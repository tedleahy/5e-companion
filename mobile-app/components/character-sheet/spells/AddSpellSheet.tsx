import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    Keyboard,
    useWindowDimensions,
    View,
} from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { fantasyTokens } from '@/theme/fantasyTheme';
import AddSpellFilterPanel from './add-sheet/AddSpellFilterPanel';
import AddSpellBottomBar from './add-sheet/AddSpellBottomBar';
import AddSpellSectionList from './add-sheet/AddSpellSectionList';
import { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET } from './add-sheet/addSpellSheetQueries';
import useAddSpellSheetController from './add-sheet/useAddSpellSheetController';
import SpellDetailModal from './SpellDetailModal';

type AddSpellSheetProps = {
    visible: boolean;
    onClose: () => void;
    characterClass: string;
    knownSpellIds: string[];
    onSpellAdded: (spellId: string) => Promise<void>;
    onSpellRemoved: (spellId: string) => Promise<void>;
};

const SHEET_HEIGHT_PERCENTAGE = '92%';
const SHEET_DISMISS_DRAG_DISTANCE = 88;
const DETAIL_DISMISS_DRAG_DISTANCE = 84;
const DISMISS_DRAG_VELOCITY = 800;
const SCROLL_TOP_TOLERANCE = 12;
const SHEET_HIDDEN_OFFSET = 48;
const DETAIL_HIDDEN_OFFSET = 48;

/**
 * Treats tiny initial scroll offsets as "still at the top" for dismiss gestures.
 */
function normaliseTopOffset(offsetY: number): number {
    if (offsetY <= SCROLL_TOP_TOLERANCE) return 0;
    return offsetY;
}

export { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET };

/**
 * Add Spell bottom sheet rendered over the character Spells tab.
 */
export default function AddSpellSheet({
    visible,
    onClose,
    characterClass,
    knownSpellIds,
    onSpellAdded,
    onSpellRemoved,
}: AddSpellSheetProps) {
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const sheetHiddenTranslateY = windowHeight + SHEET_HIDDEN_OFFSET;
    const detailHiddenTranslateY = windowHeight + DETAIL_HIDDEN_OFFSET;
    const [isRendered, setIsRendered] = useState(visible);
    const {
        actionErrorMessage,
        activeFilterChips,
        activeFilterCount,
        applyFilters,
        clearActionErrorMessage,
        clearDraftFilters,
        clearSelectedSpell,
        closeFilterPanel,
        draftFilters,
        errorMessage,
        filterPanelOpen,
        isKnownSpell,
        loading,
        openFilterPanel,
        openSpellDetail,
        pendingSpellIds,
        prefetchSpellDetail,
        removeAppliedFilterChip,
        retrySelectedSpellDetail,
        searchQuery,
        sections,
        selectedSpell,
        selectedSpellDetail,
        selectedSpellDetailErrorMessage,
        selectedSpellDetailLoading,
        sessionChangesCount,
        setDraftFilters,
        setSearchQuery,
        toggleSpellSelection,
    } = useAddSpellSheetController({
        visible,
        characterClass,
        knownSpellIds,
        onSpellAdded,
        onSpellRemoved,
    });

    const sheetTranslateY = useRef(new Animated.Value(sheetHiddenTranslateY)).current;
    const sheetHiddenTranslateYRef = useRef(sheetHiddenTranslateY);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const filterPanelTranslateX = useRef(new Animated.Value(windowWidth)).current;
    const detailOverlayOpacity = useRef(new Animated.Value(0)).current;
    const detailModalTranslateY = useRef(new Animated.Value(detailHiddenTranslateY)).current;
    const detailHiddenTranslateYRef = useRef(detailHiddenTranslateY);
    const spellListScrollOffsetYRef = useRef(0);
    const detailBodyScrollOffsetYRef = useRef(0);
    const sheetCloseInFlightRef = useRef(false);
    const detailCloseInFlightRef = useRef(false);

    useEffect(() => {
        sheetHiddenTranslateYRef.current = sheetHiddenTranslateY;
    }, [sheetHiddenTranslateY]);

    useEffect(() => {
        detailHiddenTranslateYRef.current = detailHiddenTranslateY;
    }, [detailHiddenTranslateY]);

    useEffect(() => {
        if (visible) return;
        spellListScrollOffsetYRef.current = 0;
        detailBodyScrollOffsetYRef.current = 0;
    }, [visible]);

    useEffect(() => {
        if (visible) {
            sheetCloseInFlightRef.current = false;
            detailCloseInFlightRef.current = false;
            spellListScrollOffsetYRef.current = 0;
            detailBodyScrollOffsetYRef.current = 0;
            setIsRendered(true);
            sheetTranslateY.setValue(sheetHiddenTranslateYRef.current);
            backdropOpacity.setValue(0);

            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();

            return;
        }

        if (!isRendered) return;

        closeFilterPanel();
        clearSelectedSpell();
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateYRef.current);

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: sheetHiddenTranslateYRef.current,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsRendered(false);
        });
    }, [
        backdropOpacity,
        detailModalTranslateY,
        detailOverlayOpacity,
        clearSelectedSpell,
        closeFilterPanel,
        isRendered,
        sheetTranslateY,
        visible,
    ]);

    useEffect(() => {
        Animated.spring(filterPanelTranslateX, {
            toValue: filterPanelOpen ? 0 : windowWidth,
            damping: 20,
            stiffness: 200,
            mass: 0.9,
            useNativeDriver: true,
        }).start();
    }, [filterPanelOpen, filterPanelTranslateX, windowWidth]);

    const animateSheetBack = useCallback(() => {
        Animated.parallel([
            Animated.timing(sheetTranslateY, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [backdropOpacity, sheetTranslateY]);

    const animateDetailBack = useCallback(() => {
        Animated.parallel([
            Animated.timing(detailModalTranslateY, {
                toValue: 0,
                duration: 180,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(detailOverlayOpacity, {
                toValue: 0.55,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [detailModalTranslateY, detailOverlayOpacity]);

    /**
     * Applies live drag positioning to the main sheet.
     */
    const updateSheetDragPosition = useCallback((translationY: number) => {
        sheetTranslateY.setValue(translationY);
        const nextBackdropOpacity = Math.max(0, 1 - (translationY / 420));
        backdropOpacity.setValue(nextBackdropOpacity);
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Applies live drag positioning to the nested spell-detail sheet.
     */
    const updateDetailDragPosition = useCallback((translationY: number) => {
        detailModalTranslateY.setValue(translationY);
        const nextOverlayOpacity = Math.max(0, 0.55 - (translationY / 560));
        detailOverlayOpacity.setValue(nextOverlayOpacity);
    }, [detailModalTranslateY, detailOverlayOpacity]);

    const animateCloseSpellDetail = useCallback(() => {
        if (detailCloseInFlightRef.current) return;

        detailCloseInFlightRef.current = true;
        Animated.parallel([
            Animated.timing(detailOverlayOpacity, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(detailModalTranslateY, {
                toValue: detailHiddenTranslateY,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            detailCloseInFlightRef.current = false;
            detailBodyScrollOffsetYRef.current = 0;
            clearSelectedSpell();
        });
    }, [clearSelectedSpell, detailHiddenTranslateY, detailModalTranslateY, detailOverlayOpacity]);

    const requestSheetClose = useCallback(() => {
        if (sheetCloseInFlightRef.current || !isRendered) return;

        sheetCloseInFlightRef.current = true;
        closeFilterPanel();
        clearSelectedSpell();
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateYRef.current);
        spellListScrollOffsetYRef.current = 0;
        detailBodyScrollOffsetYRef.current = 0;

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: sheetHiddenTranslateYRef.current,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            sheetCloseInFlightRef.current = false;
            setIsRendered(false);
            onClose();
        });
    }, [
        backdropOpacity,
        clearSelectedSpell,
        closeFilterPanel,
        detailModalTranslateY,
        detailOverlayOpacity,
        isRendered,
        onClose,
        sheetTranslateY,
    ]);

    useEffect(() => {
        if (!selectedSpell) return;

        const animationFrameId = requestAnimationFrame(() => {
            Animated.parallel([
                Animated.timing(detailOverlayOpacity, {
                    toValue: 0.55,
                    duration: 280,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(detailModalTranslateY, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [detailModalTranslateY, detailOverlayOpacity, selectedSpell]);

    /**
     * Native pan gesture for dismissing the main add-spell sheet.
     * This lives in the same native gesture system as ScrollView/SectionList.
     */
    const sheetDismissGesture = useMemo(() => Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (sheetCloseInFlightRef.current) return;
            if (spellListScrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateSheetDragPosition(event.translationY);
        })
        .onEnd((event) => {
            if (sheetCloseInFlightRef.current) return;

            const shouldDismiss =
                spellListScrollOffsetYRef.current <= SCROLL_TOP_TOLERANCE
                && event.translationY > 0
                && (event.translationY > SHEET_DISMISS_DRAG_DISTANCE || event.velocityY > DISMISS_DRAG_VELOCITY);

            if (shouldDismiss) {
                requestSheetClose();
                return;
            }

            animateSheetBack();
        })
        .onFinalize(() => {
            if (sheetCloseInFlightRef.current) return;
            animateSheetBack();
        }), [animateSheetBack, requestSheetClose, updateSheetDragPosition]);

    /**
     * Native pan gesture for dismissing the nested spell-detail sheet.
     */
    const detailDismissGesture = useMemo(() => Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (detailCloseInFlightRef.current) return;
            if (detailBodyScrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateDetailDragPosition(event.translationY);
        })
        .onEnd((event) => {
            if (detailCloseInFlightRef.current) return;

            const shouldDismiss =
                detailBodyScrollOffsetYRef.current <= SCROLL_TOP_TOLERANCE
                && event.translationY > 0
                && (event.translationY > DETAIL_DISMISS_DRAG_DISTANCE || event.velocityY > DISMISS_DRAG_VELOCITY);

            if (shouldDismiss) {
                animateCloseSpellDetail();
                return;
            }

            animateDetailBack();
        })
        .onFinalize(() => {
            if (detailCloseInFlightRef.current) return;
            animateDetailBack();
        }), [animateCloseSpellDetail, animateDetailBack, updateDetailDragPosition]);

    const handleSpellListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        spellListScrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);

    const handleDetailBodyScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        detailBodyScrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);
    if (!isRendered) {
        return null;
    }

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none">
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <Pressable style={styles.backdropPressable} onPress={requestSheetClose} accessibilityLabel="Close add spell sheet" />
            </Animated.View>

            <GestureDetector gesture={sheetDismissGesture}>
                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
                    onStartShouldSetResponderCapture={() => {
                        Keyboard.dismiss();
                        return false;
                    }}
                >
                <View style={styles.headerDragZone}>
                    <View style={styles.handleRow}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.titleRow}>
                        <View>
                            <Text style={styles.title}>Add Spell</Text>
                            <Text style={styles.subtitle}>Choose spells to add to your spellbook</Text>
                        </View>
                    </View>

                    <View style={styles.searchFilterRow}>
                        <View style={styles.searchWrapper}>
                            <Ionicons name="search" size={14} color="rgba(245,230,200,0.35)" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search spells..."
                                placeholderTextColor="rgba(245,230,200,0.28)"
                                style={styles.searchInput}
                                accessibilityLabel="Search spells"
                            />
                            <Pressable
                                onPress={() => setSearchQuery('')}
                                accessibilityRole="button"
                                accessibilityLabel="Clear spell search"
                                style={styles.clearSearchButton}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={16}
                                    color={searchQuery.length > 0 ? 'rgba(245,230,200,0.58)' : 'rgba(245,230,200,0.2)'}
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={openFilterPanel}
                            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                            accessibilityLabel="Open spell filters"
                        >
                            <Ionicons name="filter" size={14} color="rgba(245,230,200,0.45)" />
                            <Text style={styles.filterButtonText}>Filter</Text>
                            {activeFilterCount > 0 && (
                                <View style={styles.filterCountBadge}>
                                    <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>

                {activeFilterChips.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.activeChipsScroll}
                        contentContainerStyle={styles.activeChipsRow}
                    >
                        {activeFilterChips.map((chip) => (
                            <View key={chip.id} style={styles.activeChip}>
                                <Text style={styles.activeChipText}>{chip.label}</Text>
                                <Pressable onPress={() => removeAppliedFilterChip(chip)} accessibilityLabel={`Remove ${chip.label} filter`}>
                                    <Text style={styles.activeChipRemove}>x</Text>
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.divider} />

                <AddSpellSectionList
                    sections={sections}
                    loading={loading}
                    errorMessage={errorMessage}
                    isKnownSpell={isKnownSpell}
                    pendingSpellIds={pendingSpellIds}
                    onToggleSpellSelection={(spell) => {
                        void toggleSpellSelection(spell);
                    }}
                    onPrefetchSpellDetail={prefetchSpellDetail}
                    onOpenSpellDetail={openSpellDetail}
                    onScroll={handleSpellListScroll}
                />

                <AddSpellBottomBar sessionChangesCount={sessionChangesCount} onDone={requestSheetClose} />

                <Animated.View style={[styles.filterPanel, { transform: [{ translateX: filterPanelTranslateX }] }]}>
                    <AddSpellFilterPanel
                        draftFilters={draftFilters}
                        setDraftFilters={setDraftFilters}
                        onBack={closeFilterPanel}
                        onClear={clearDraftFilters}
                        onApply={applyFilters}
                    />
                </Animated.View>

                {selectedSpell && (
                    <>
                        <Animated.View style={[styles.detailBackdrop, { opacity: detailOverlayOpacity }]}>
                            <Pressable style={styles.backdropPressable} onPress={animateCloseSpellDetail} accessibilityLabel="Close spell details" />
                        </Animated.View>

                        <GestureDetector gesture={detailDismissGesture}>
                            <Animated.View style={[styles.detailModalWrap, { transform: [{ translateY: detailModalTranslateY }] }]}>
                                <SpellDetailModal
                                    spell={selectedSpellDetail}
                                    spellName={selectedSpell.name}
                                    known={isKnownSpell(selectedSpell.id)}
                                    loading={selectedSpellDetailLoading && selectedSpellDetail == null}
                                    errorMessage={selectedSpellDetailErrorMessage}
                                    onRetry={retrySelectedSpellDetail}
                                    onToggleSelection={() => {
                                        void toggleSpellSelection(selectedSpell);
                                    }}
                                    onBodyScroll={handleDetailBodyScroll}
                                />
                            </Animated.View>
                        </GestureDetector>
                    </>
                )}

                <Snackbar
                    visible={actionErrorMessage != null}
                    onDismiss={clearActionErrorMessage}
                    duration={3000}
                    style={styles.errorSnackbar}
                >
                    {actionErrorMessage ?? ''}
                </Snackbar>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: SHEET_HEIGHT_PERCENTAGE,
        backgroundColor: fantasyTokens.colors.night,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 20,
    },
    headerDragZone: {
        flexShrink: 0,
    },
    handleRow: {
        paddingTop: 16,
        paddingHorizontal: fantasyTokens.spacing.md,
        alignItems: 'center',
        position: 'relative',
        minHeight: 40,
        paddingBottom: 6,
    },
    handle: {
        position: 'absolute',
        top: 8,
        left: '50%',
        marginLeft: -18,
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(201,146,42,0.2)',
    },
    titleRow: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: 6,
        paddingBottom: 10,
    },
    title: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        color: fantasyTokens.colors.gold,
        opacity: 0.55,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 1,
    },
    searchFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.15)',
        borderRadius: 10,
        backgroundColor: 'rgba(245,230,200,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 2,
        minHeight: 40,
    },
    searchInput: {
        flex: 1,
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 15,
        paddingVertical: 6,
    },
    clearSearchButton: {
        marginLeft: 4,
        paddingVertical: 2,
        paddingHorizontal: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.18)',
        borderRadius: 10,
        backgroundColor: 'rgba(245,230,200,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    filterButtonActive: {
        backgroundColor: 'rgba(139,26,26,0.15)',
        borderColor: 'rgba(139,26,26,0.4)',
    },
    filterButtonText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.62,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    filterCountBadge: {
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    filterCountText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        fontWeight: '700',
    },
    activeChipsScroll: {
        maxHeight: 34,
    },
    activeChipsRow: {
        paddingHorizontal: 12,
        gap: 6,
        alignItems: 'center',
    },
    activeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.3)',
        backgroundColor: 'rgba(139,26,26,0.12)',
        paddingLeft: 10,
        paddingRight: 8,
        paddingVertical: 3,
    },
    activeChipText: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeChipRemove: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        opacity: 0.7,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    filterPanel: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#140e06',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(201,146,42,0.12)',
        zIndex: 10,
    },
    detailBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 30,
    },
    detailModalWrap: {
        ...StyleSheet.absoluteFillObject,
        top: '10%',
        zIndex: 31,
    },
    errorSnackbar: {
        backgroundColor: '#8b1a1a',
    },
});
