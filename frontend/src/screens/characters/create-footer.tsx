import { useId } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { PrimaryButton } from '@/components/buttons';
import { colors } from '@/theme';

type CreateFooterProps = {
    onCreate?: () => void;
    onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * The Create character button, pinned to the bottom of the screen above the safe area. The list
 * fades into paper behind it. Taps on the clear part of the fade reach the list underneath.
 *
 * @param props.onCreate - Starts creating a character. Leave unset until the creation route exists.
 * @param props.onLayout - Reports the footer layout so the list can scroll clear of its height.
 */
export function CreateFooter({ onCreate, onLayout }: CreateFooterProps) {
    // Gradient ids are global to the web document, so each footer needs its own.
    const fadeId = `${useId()}-fade`;

    return (
        <View testID="create-footer" style={styles.footer} onLayout={onLayout}>
            <Svg
                aria-hidden
                pointerEvents="none"
                width="100%"
                height="100%"
                style={StyleSheet.absoluteFill}
            >
                <Defs>
                    <LinearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors.paper} stopOpacity={0} />
                        <Stop offset="0.45" stopColor={colors.paper} stopOpacity={1} />
                    </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#${fadeId})`} />
            </Svg>
            <SafeAreaView edges={['bottom']} style={styles.passThrough}>
                <View style={styles.inner}>
                    <PrimaryButton label="Create character" onPress={onCreate} />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
    },
    passThrough: {
        pointerEvents: 'box-none',
    },
    inner: {
        paddingTop: 14,
        paddingHorizontal: 12,
        paddingBottom: 24,
        pointerEvents: 'box-none',
    },
});
