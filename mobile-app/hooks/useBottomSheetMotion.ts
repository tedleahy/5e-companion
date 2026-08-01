import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
    SHEET_HIDDEN_OFFSET,
    animateSheetBack as coreAnimateSheetBack,
    animateSheetHide,
    animateSheetShow,
    createSheetDismissGesture,
    normaliseTopOffset,
    updateSheetDragPosition as coreUpdateSheetDragPosition,
} from '@/hooks/useSheetMotionCore';

type UseBottomSheetMotionArgs = {
    visible: boolean;
    windowHeight: number;
    /**
     * Called before the dismiss animation. Return false to abort (e.g. while saving).
     */
    onRequestClose?: () => boolean | void;
    /**
     * Called after a user-initiated dismiss animation completes.
     */
    onClose?: () => void;
};

type UseBottomSheetMotionResult = {
    isRendered: boolean;
    backdropOpacity: Animated.Value;
    sheetTranslateY: Animated.Value;
    requestSheetClose: () => void;
    handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    sheetDismissGesture: ReturnType<typeof Gesture.Pan>;
};

/**
 * Shared motion and dismiss state for simple app bottom sheets.
 */
export default function useBottomSheetMotion({
    visible,
    windowHeight,
    onRequestClose,
    onClose,
}: UseBottomSheetMotionArgs): UseBottomSheetMotionResult {
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

    const animateSheetBack = useCallback(() => {
        coreAnimateSheetBack(backdropOpacity, sheetTranslateY);
    }, [backdropOpacity, sheetTranslateY]);

    const updateSheetDragPosition = useCallback((translationY: number) => {
        coreUpdateSheetDragPosition(sheetTranslateY, backdropOpacity, translationY);
    }, [backdropOpacity, sheetTranslateY]);

    const requestSheetClose = useCallback(() => {
        if (isClosingRef.current || !isRendered) return;

        if (onRequestClose?.() === false) {
            animateSheetBack();
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
                onClose?.();
            },
        );
    }, [animateSheetBack, backdropOpacity, isRendered, onClose, onRequestClose, sheetTranslateY]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);

    // Hardware back closes the topmost rendered sheet first. React Native's
    // BackHandler invokes listeners in reverse registration order and stops at
    // the first one that returns true, so a nested sheet's listener (added
    // after its parent's, since it can only render once the parent is open)
    // naturally takes priority — no separate overlay stack is needed. Each
    // sheet only needs to register itself here; this hook is shared by every
    // BottomSheetShell consumer, including nested pickers.
    useEffect(() => {
        if (!isRendered) return undefined;

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            requestSheetClose();
            return true;
        });

        return () => subscription.remove();
    }, [isRendered, requestSheetClose]);

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

