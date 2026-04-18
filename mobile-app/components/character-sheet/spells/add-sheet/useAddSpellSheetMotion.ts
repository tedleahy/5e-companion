import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
    SHEET_HIDDEN_OFFSET,
    DETAIL_HIDDEN_OFFSET,
    normaliseTopOffset,
    animateSheetShow,
    animateSheetHide,
    animateSheetBack as coreAnimateSheetBack,
    updateSheetDragPosition as coreUpdateSheetDragPosition,
    updateDetailDragPosition as coreUpdateDetailDragPosition,
    createSheetDismissGesture,
    createDetailDismissGesture,
} from '@/hooks/useSheetMotionCore';

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
    const isClosingRef = useRef(false);
    const isDetailClosingRef = useRef(false);

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
            isClosingRef.current = false;
            isDetailClosingRef.current = false;
            spellListScrollOffsetYRef.current = 0;
            detailBodyScrollOffsetYRef.current = 0;
            setIsRendered(true);
            animateSheetShow(backdropOpacity, sheetTranslateY, sheetHiddenTranslateYRef.current);
            return;
        }

        if (!isRendered) return;

        closeFilterPanel();
        clearSelectedSpell();
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateYRef.current);

        animateSheetHide(
            backdropOpacity,
            sheetTranslateY,
            sheetHiddenTranslateYRef.current,
            () => setIsRendered(false),
        );
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
        coreAnimateSheetBack(backdropOpacity, sheetTranslateY);
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
        coreUpdateSheetDragPosition(sheetTranslateY, backdropOpacity, translationY);
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Applies live drag positioning to the nested detail sheet.
     */
    const updateDetailDragPosition = useCallback((translationY: number) => {
        coreUpdateDetailDragPosition(detailModalTranslateY, detailOverlayOpacity, translationY);
    }, [detailModalTranslateY, detailOverlayOpacity]);

    /**
     * Closes the nested spell-detail sheet with its dismiss animation.
     */
    const animateCloseSpellDetail = useCallback(() => {
        if (isDetailClosingRef.current) return;

        isDetailClosingRef.current = true;
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
            isDetailClosingRef.current = false;
            detailBodyScrollOffsetYRef.current = 0;
            clearSelectedSpell();
        });
    }, [clearSelectedSpell, detailHiddenTranslateY, detailModalTranslateY, detailOverlayOpacity]);

    /**
     * Requests full sheet dismissal and notifies the parent once the animation ends.
     */
    const requestSheetClose = useCallback(() => {
        if (isClosingRef.current || !isRendered) return;

        isClosingRef.current = true;
        closeFilterPanel();
        clearSelectedSpell();
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateYRef.current);
        spellListScrollOffsetYRef.current = 0;
        detailBodyScrollOffsetYRef.current = 0;

        animateSheetHide(
            backdropOpacity,
            sheetTranslateY,
            sheetHiddenTranslateYRef.current,
            () => {
                isClosingRef.current = false;
                setIsRendered(false);
                onClose();
            },
        );
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

/**
 * Owns animated values, dismiss choreography, and drag gestures for Add Spell.
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
    const sheetDismissGesture = useMemo(() => createSheetDismissGesture({
        scrollOffsetYRef: spellListScrollOffsetYRef,
        isClosingRef,
        updateDragPosition: updateSheetDragPosition,
        requestSheetClose,
        animateSheetBack,
    }), [animateSheetBack, requestSheetClose, updateSheetDragPosition]);

    /**
     * Native pan gesture for dismissing the nested spell-detail sheet.
     */
    const detailDismissGesture = useMemo(() => createDetailDismissGesture({
        scrollOffsetYRef: detailBodyScrollOffsetYRef,
        isDetailClosingRef,
        updateDragPosition: updateDetailDragPosition,
        animateCloseSpellDetail,
        animateDetailBack,
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
