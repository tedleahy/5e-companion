import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

/** Main-sheet dismiss drag distance threshold. */
const SHEET_DISMISS_DRAG_DISTANCE = 88;

/** Nested detail-sheet dismiss drag distance threshold. */
const DETAIL_DISMISS_DRAG_DISTANCE = 84;

/** Minimum downward velocity that counts as an intentional dismiss fling. */
const DISMISS_DRAG_VELOCITY = 800;

/** Scroll offset still treated as "at the top" for drag-to-dismiss. */
const SCROLL_TOP_TOLERANCE = 12;

/** Extra travel below the viewport when the main sheet is hidden. */
const SHEET_HIDDEN_OFFSET = 48;

/** Extra travel below the viewport when the detail sheet is hidden. */
const DETAIL_HIDDEN_OFFSET = 48;

/**
 * Props required to drive add-sheet motion and gesture state.
 */
type UseAddSpellSheetMotionArgs = {
    visible: boolean;
    filterPanelOpen: boolean;
    selectedSpellVisible: boolean;
    windowHeight: number;
    windowWidth: number;
    onClose: () => void;
    closeFilterPanel: () => void;
    clearSelectedSpell: () => void;
};

/**
 * Animated state and actions exposed to the sheet shell.
 */
type UseAddSpellSheetMotionResult = {
    isRendered: boolean;
    backdropOpacity: Animated.Value;
    sheetTranslateY: Animated.Value;
    filterPanelTranslateX: Animated.Value;
    detailOverlayOpacity: Animated.Value;
    detailModalTranslateY: Animated.Value;
    requestSheetClose: () => void;
    animateCloseSpellDetail: () => void;
    handleSpellListScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    handleDetailBodyScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    sheetDismissGesture: ReturnType<typeof Gesture.Pan>;
    detailDismissGesture: ReturnType<typeof Gesture.Pan>;
};

/**
 * Treats tiny initial scroll offsets as "still at the top" for dismiss gestures.
 */
function normaliseTopOffset(offsetY: number): number {
    if (offsetY <= SCROLL_TOP_TOLERANCE) return 0;
    return offsetY;
}

/**
 * Owns animated values, dismiss choreography, and drag gestures for Add Spell.
 */
export default function useAddSpellSheetMotion({
    visible,
    filterPanelOpen,
    selectedSpellVisible,
    windowHeight,
    windowWidth,
    onClose,
    closeFilterPanel,
    clearSelectedSpell,
}: UseAddSpellSheetMotionArgs): UseAddSpellSheetMotionResult {
    const sheetHiddenTranslateY = windowHeight + SHEET_HIDDEN_OFFSET;
    const detailHiddenTranslateY = windowHeight + DETAIL_HIDDEN_OFFSET;
    const [isRendered, setIsRendered] = useState(visible);
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
        clearSelectedSpell,
        closeFilterPanel,
        detailModalTranslateY,
        detailOverlayOpacity,
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

    /**
     * Animates the main sheet and backdrop back to their resting position.
     */
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

    /**
     * Animates the nested detail sheet and overlay back to rest.
     */
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
        backdropOpacity.setValue(Math.max(0, 1 - (translationY / 420)));
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Applies live drag positioning to the nested detail sheet.
     */
    const updateDetailDragPosition = useCallback((translationY: number) => {
        detailModalTranslateY.setValue(translationY);
        detailOverlayOpacity.setValue(Math.max(0, 0.55 - (translationY / 560)));
    }, [detailModalTranslateY, detailOverlayOpacity]);

    /**
     * Closes the nested spell-detail sheet with its dismiss animation.
     */
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

    /**
     * Requests full sheet dismissal and notifies the parent once the animation ends.
     */
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
        if (!selectedSpellVisible) return;

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
    }, [detailModalTranslateY, detailOverlayOpacity, selectedSpellVisible]);

    /**
     * Tracks spell-list scroll position for top-of-list dismiss gestures.
     */
    const handleSpellListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        spellListScrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);

    /**
     * Tracks detail-body scroll position for top-of-sheet dismiss gestures.
     */
    const handleDetailBodyScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        detailBodyScrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);

    /**
     * Native pan gesture for dismissing the main add-spell sheet.
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

    return {
        isRendered,
        backdropOpacity,
        sheetTranslateY,
        filterPanelTranslateX,
        detailOverlayOpacity,
        detailModalTranslateY,
        requestSheetClose,
        animateCloseSpellDetail,
        handleSpellListScroll,
        handleDetailBodyScroll,
        sheetDismissGesture,
        detailDismissGesture,
    };
}
