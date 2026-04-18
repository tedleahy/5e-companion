import { Animated, Easing } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

/** Sheet dismiss drag distance threshold. */
export const SHEET_DISMISS_DRAG_DISTANCE = 88;

/** Nested detail-sheet dismiss drag distance threshold. */
export const DETAIL_DISMISS_DRAG_DISTANCE = 84;

/** Minimum downward velocity that counts as an intentional dismiss fling. */
export const DISMISS_DRAG_VELOCITY = 800;

/** Scroll offset still treated as "at the top" for drag-to-dismiss. */
export const SCROLL_TOP_TOLERANCE = 12;

/** Extra travel below the viewport when the main sheet is hidden. */
export const SHEET_HIDDEN_OFFSET = 48;

/** Extra travel below the viewport when the detail sheet is hidden. */
export const DETAIL_HIDDEN_OFFSET = 48;

/**
 * Treats tiny initial scroll offsets as "still at the top" for dismiss gestures.
 */
export function normaliseTopOffset(offsetY: number): number {
    if (offsetY <= SCROLL_TOP_TOLERANCE) return 0;
    return offsetY;
}

/**
 * Core animation configuration for showing a sheet.
 */
export function animateSheetShow(
    backdropOpacity: Animated.Value,
    sheetTranslateY: Animated.Value,
    sheetHiddenTranslateY: number,
) {
    sheetTranslateY.setValue(sheetHiddenTranslateY);
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
}

/**
 * Core animation configuration for hiding a sheet.
 */
export function animateSheetHide(
    backdropOpacity: Animated.Value,
    sheetTranslateY: Animated.Value,
    sheetHiddenTranslateY: number,
    onComplete?: () => void,
) {
    Animated.parallel([
        Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
            toValue: sheetHiddenTranslateY,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }),
    ]).start(onComplete);
}

/**
 * Animates the sheet and backdrop back to their resting position.
 */
export function animateSheetBack(
    backdropOpacity: Animated.Value,
    sheetTranslateY: Animated.Value,
) {
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
}

/**
 * Applies live drag positioning to a sheet with backdrop opacity fading.
 */
export function updateSheetDragPosition(
    sheetTranslateY: Animated.Value,
    backdropOpacity: Animated.Value,
    translationY: number,
) {
    sheetTranslateY.setValue(translationY);
    backdropOpacity.setValue(Math.max(0, 1 - (translationY / 420)));
}

/**
 * Applies live drag positioning to a nested detail sheet with overlay opacity fading.
 */
export function updateDetailDragPosition(
    detailModalTranslateY: Animated.Value,
    detailOverlayOpacity: Animated.Value,
    translationY: number,
) {
    detailModalTranslateY.setValue(translationY);
    detailOverlayOpacity.setValue(Math.max(0, 0.55 - (translationY / 560)));
}

/**
 * Creates a core pan gesture for dismissing a sheet.
 */
export function createSheetDismissGesture(options: {
    scrollOffsetYRef: { current: number };
    sheetCloseInFlightRef: { current: boolean };
    updateDragPosition: (translationY: number) => void;
    requestSheetClose: () => void;
    animateSheetBack: () => void;
}) {
    const {
        scrollOffsetYRef,
        sheetCloseInFlightRef,
        updateDragPosition,
        requestSheetClose,
        animateSheetBack,
    } = options;

    return Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (sheetCloseInFlightRef.current) return;
            if (scrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateDragPosition(event.translationY);
        })
        .onEnd((event) => {
            if (sheetCloseInFlightRef.current) return;

            const shouldDismiss =
                scrollOffsetYRef.current <= SCROLL_TOP_TOLERANCE
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
        });
}

/**
 * Creates a pan gesture for dismissing a nested detail sheet.
 */
export function createDetailDismissGesture(options: {
    scrollOffsetYRef: { current: number };
    detailCloseInFlightRef: { current: boolean };
    updateDragPosition: (translationY: number) => void;
    animateCloseSpellDetail: () => void;
    animateDetailBack: () => void;
}) {
    const {
        scrollOffsetYRef,
        detailCloseInFlightRef,
        updateDragPosition,
        animateCloseSpellDetail,
        animateDetailBack,
    } = options;

    return Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (detailCloseInFlightRef.current) return;
            if (scrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateDragPosition(event.translationY);
        })
        .onEnd((event) => {
            if (detailCloseInFlightRef.current) return;

            const shouldDismiss =
                scrollOffsetYRef.current <= SCROLL_TOP_TOLERANCE
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
        });
}

