import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

/** Whether the code is running in a test environment. */
const IS_TEST_ENV = process.env.NODE_ENV === 'test';

/** Sheet dismiss drag distance threshold. */
const SHEET_DISMISS_DRAG_DISTANCE = 88;

/** Minimum downward velocity that counts as an intentional dismiss fling. */
const DISMISS_DRAG_VELOCITY = 800;

/** Scroll offset still treated as "at the top" for drag-to-dismiss. */
const SCROLL_TOP_TOLERANCE = 12;

/** Extra travel below the viewport when the sheet is hidden. */
const SHEET_HIDDEN_OFFSET = 48;

/**
 * Props required to drive level-up wizard sheet motion and gesture state.
 */
type UseLevelUpWizardSheetMotionArgs = {
    visible: boolean;
    windowHeight: number;
    onRequestClose: () => void;
};

/**
 * Animated state and actions exposed to the sheet shell.
 */
type UseLevelUpWizardSheetMotionResult = {
    isRendered: boolean;
    backdropOpacity: Animated.Value;
    sheetTranslateY: Animated.Value;
    requestSheetClose: () => void;
    handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    sheetDismissGesture: ReturnType<typeof Gesture.Pan>;
};

/**
 * Treats tiny initial scroll offsets as "still at the top" for dismiss gestures.
 */
function normaliseTopOffset(offsetY: number): number {
    if (offsetY <= SCROLL_TOP_TOLERANCE) return 0;
    return offsetY;
}

/**
 * Owns animated values, dismiss choreography, and drag gestures for Level Up Wizard.
 */
export default function useLevelUpWizardSheetMotion({
    visible,
    windowHeight,
    onRequestClose,
}: UseLevelUpWizardSheetMotionArgs): UseLevelUpWizardSheetMotionResult {
    const sheetHiddenTranslateY = windowHeight + SHEET_HIDDEN_OFFSET;
    const [isRendered, setIsRendered] = useState(visible);
    const sheetTranslateY = useRef(new Animated.Value(sheetHiddenTranslateY)).current;
    const sheetHiddenTranslateYRef = useRef(sheetHiddenTranslateY);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const scrollOffsetYRef = useRef(0);
    const sheetCloseInFlightRef = useRef(false);

    useEffect(() => {
        sheetHiddenTranslateYRef.current = sheetHiddenTranslateY;
    }, [sheetHiddenTranslateY]);

    useEffect(() => {
        if (!visible) {
            scrollOffsetYRef.current = 0;
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            sheetCloseInFlightRef.current = false;
            scrollOffsetYRef.current = 0;
            setIsRendered(true);

            if (IS_TEST_ENV) {
                sheetTranslateY.setValue(0);
                backdropOpacity.setValue(1);
                return;
            }

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

        if (IS_TEST_ENV) {
            setIsRendered(false);
            return;
        }

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
    }, [backdropOpacity, isRendered, sheetTranslateY, visible]);

    /**
     * Animates the sheet and backdrop back to their resting position.
     */
    const animateSheetBack = useCallback(() => {
        if (IS_TEST_ENV) {
            sheetTranslateY.setValue(0);
            backdropOpacity.setValue(1);
            return;
        }

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
     * Applies live drag positioning to the sheet.
     */
    const updateSheetDragPosition = useCallback((translationY: number) => {
        sheetTranslateY.setValue(translationY);
        backdropOpacity.setValue(Math.max(0, 1 - (translationY / 420)));
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Requests full sheet dismissal and notifies the parent once the animation ends.
     */
    const requestSheetClose = useCallback(() => {
        if (sheetCloseInFlightRef.current || !isRendered) return;

        sheetCloseInFlightRef.current = true;
        scrollOffsetYRef.current = 0;

        if (IS_TEST_ENV) {
            sheetCloseInFlightRef.current = false;
            setIsRendered(false);
            onRequestClose();
            return;
        }

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
            onRequestClose();
        });
    }, [backdropOpacity, isRendered, onRequestClose, sheetTranslateY]);

    /**
     * Tracks scroll position for top-of-list dismiss gestures.
     */
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);

    /**
     * Native pan gesture for dismissing the level-up wizard sheet.
     */
    const sheetDismissGesture = useMemo(() => Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (sheetCloseInFlightRef.current) return;
            if (scrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateSheetDragPosition(event.translationY);
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
        }), [animateSheetBack, requestSheetClose, updateSheetDragPosition]);

    return {
        isRendered,
        backdropOpacity,
        sheetTranslateY,
        requestSheetClose,
        handleScroll,
        sheetDismissGesture,
    };
}
