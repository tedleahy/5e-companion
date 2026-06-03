import type { ReactNode } from 'react';
import { Animated, Keyboard, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Portal } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type BottomSheetShellProps = {
    isRendered: boolean;
    backdropOpacity: Animated.Value;
    sheetTranslateY: Animated.Value;
    sheetDismissGesture: ReturnType<typeof Gesture.Pan>;
    closeAccessibilityLabel: string;
    children: ReactNode;
    onRequestClose: () => void;
    testID?: string;
    overlayZIndex?: number;
    sheetStyle?: StyleProp<ViewStyle>;
    backdropStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared Portal-backed bottom-sheet frame with animated backdrop and drag dismiss.
 */
export default function BottomSheetShell({
    isRendered,
    backdropOpacity,
    sheetTranslateY,
    sheetDismissGesture,
    closeAccessibilityLabel,
    children,
    onRequestClose,
    testID,
    overlayZIndex = 20,
    sheetStyle,
    backdropStyle,
}: BottomSheetShellProps) {
    if (!isRendered) return null;

    return (
        <Portal>
            <Animated.View pointerEvents="box-none" style={[styles.overlayContainer, { zIndex: overlayZIndex }]}>
                <Animated.View style={[styles.backdrop, backdropStyle, { opacity: backdropOpacity }]}>
                    <Pressable
                        style={styles.backdropPressable}
                        onPress={onRequestClose}
                        accessibilityRole="button"
                        accessibilityLabel={closeAccessibilityLabel}
                    />
                </Animated.View>

                <GestureDetector gesture={sheetDismissGesture}>
                    <Animated.View
                        testID={testID}
                        style={[
                            styles.sheet,
                            sheetStyle,
                            { transform: [{ translateY: sheetTranslateY }] },
                        ]}
                        onStartShouldSetResponderCapture={() => {
                            Keyboard.dismiss();
                            return false;
                        }}
                    >
                        <Animated.View
                            accessible={false}
                            style={styles.handleWrap}
                        >
                            <Animated.View style={styles.handle} />
                        </Animated.View>
                        {children}
                    </Animated.View>
                </GestureDetector>
            </Animated.View>
        </Portal>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: fantasyTokens.rail.backdrop,
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: '92%',
        backgroundColor: fantasyTokens.colors.night,
        borderTopLeftRadius: fantasyTokens.radii.lg,
        borderTopRightRadius: fantasyTokens.radii.lg,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
        overflow: 'hidden',
        elevation: 20,
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.xs,
    },
    handle: {
        width: 42,
        height: 4,
        borderRadius: 2,
        backgroundColor: fantasyTokens.rail.borderStrong,
    },
});
