import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
    SHEET_HIDDEN_OFFSET,
    normaliseTopOffset,
    animateSheetShow,
    animateSheetHide,
    animateSheetBack as coreAnimateSheetBack,
    updateSheetDragPosition as coreUpdateSheetDragPosition,
    createSheetDismissGesture,
} from '@/hooks/useSheetMotionCore';

/**
 * Props required to drive level-up wizard sheet motion and gesture state.
 */
type UseLevelUpWizardSheetMotionArgs = {
    visible: boolean;
    windowHeight: number;
    /**
     * Called when user requests to close. Return false to prevent closing
     * (e.g., to show a dirty confirmation dialog).
     */
    onRequestClose: () => boolean | void;
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
    const isClosingRef = useRef(false);

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
            isClosingRef.current = false;
            scrollOffsetYRef.current = 0;
            setIsRendered(true);
            animateSheetShow(backdropOpacity, sheetTranslateY, sheetHiddenTranslateYRef.current);
            return;
        }

        if (!isRendered) return;
        
        animateSheetHide(
            backdropOpacity,
            sheetTranslateY,
            sheetHiddenTranslateYRef.current,
            () => setIsRendered(false),
        );
    }, [backdropOpacity, isRendered, sheetTranslateY, visible]);

    /**
     * Animates the sheet and backdrop back to their resting position.
     */
    const animateSheetBack = useCallback(() => {
        coreAnimateSheetBack(backdropOpacity, sheetTranslateY);
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Applies live drag positioning to the sheet.
     */
    const updateSheetDragPosition = useCallback((translationY: number) => {
        coreUpdateSheetDragPosition(sheetTranslateY, backdropOpacity, translationY);
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Requests full sheet dismissal and notifies the parent once the animation ends.
     * If onRequestClose returns false, the close is cancelled and animation won't run.
     */
    const requestSheetClose = useCallback(() => {
        if (isClosingRef.current || !isRendered) return;

        // Check with parent before starting close animation
        const shouldClose = onRequestClose();
        if (shouldClose === false) {
            // Parent cancelled the close (e.g., showing dirty confirmation)
            isClosingRef.current = false;
            return;
        }

        isClosingRef.current = true;
        scrollOffsetYRef.current = 0;

        animateSheetHide(
            backdropOpacity,
            sheetTranslateY,
            sheetHiddenTranslateYRef.current,
            () => {
            isClosingRef.current = false;
                setIsRendered(false);
            },
        );
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
    const sheetDismissGesture = useMemo(() => createSheetDismissGesture({
        scrollOffsetYRef,
        isClosingRef,
        updateDragPosition: updateSheetDragPosition,
        requestSheetClose,
        animateSheetBack,
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
