import type { ReactNode } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Portal } from 'react-native-paper';
import {
    getBottomSheetSlotStyle,
    getMainContentFrameStyle,
} from '@/components/layout/mainContentFrameStyle';
import { fantasyTokens } from '@/theme/fantasyTheme';

type ParchmentWizardSheetShellProps = {
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
};

/**
 * Portal-backed parchment bottom-sheet frame for multi-step wizard overlays.
 */
export default function ParchmentWizardSheetShell({
    isRendered,
    backdropOpacity,
    sheetTranslateY,
    sheetDismissGesture,
    closeAccessibilityLabel,
    children,
    onRequestClose,
    testID,
    overlayZIndex = 30,
    sheetStyle,
}: ParchmentWizardSheetShellProps) {
    const { width } = useWindowDimensions();

    if (!isRendered) return null;

    return (
        <Portal>
            <View
                pointerEvents="box-none"
                style={[styles.overlayContainer, { zIndex: overlayZIndex }]}
            >
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <Pressable
                        style={styles.backdropPressable}
                        onPress={onRequestClose}
                        accessibilityRole="button"
                        accessibilityLabel={closeAccessibilityLabel}
                    />
                </Animated.View>

                <View pointerEvents="box-none" style={getBottomSheetSlotStyle(width)}>
                    <Animated.View
                        testID={testID}
                        style={[
                            styles.sheet,
                            getMainContentFrameStyle(width),
                            sheetStyle,
                            { transform: [{ translateY: sheetTranslateY }] },
                        ]}
                    >
                        <GestureDetector gesture={sheetDismissGesture}>
                            <View style={styles.handleWrap}>
                                <View style={styles.handle} />
                            </View>
                        </GestureDetector>
                        {children}
                    </Animated.View>
                </View>
            </View>
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
        backgroundColor: fantasyTokens.sheet.backdrop,
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        width: '100%',
        minWidth: 0,
        height: fantasyTokens.sheet.defaultHeight,
        backgroundColor: fantasyTokens.colors.parchment,
        borderTopLeftRadius: fantasyTokens.radii.lg,
        borderTopRightRadius: fantasyTokens.radii.lg,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        overflow: 'hidden',
        boxShadow: fantasyTokens.sheet.shadow,
        elevation: fantasyTokens.sheet.elevation,
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        paddingBottom: fantasyTokens.spacing.sm,
    },
    handle: {
        width: fantasyTokens.sheet.handleWidth,
        height: fantasyTokens.sheet.handleHeight,
        borderRadius: fantasyTokens.spacing.xs / 2,
        backgroundColor: fantasyTokens.colors.sheetDivider,
    },
});
