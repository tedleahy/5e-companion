import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Height used for the inline spell-action drawer.
 */
export const SPELL_ACCORDION_HEIGHT = 52;

/**
 * Transition duration for opening or closing the drawer.
 */
export const SPELL_ACCORDION_DURATION_MS = 260;

/**
 * Props for the animated accordion drawer wrapper.
 */
type AccordionDrawerProps = {
    open: boolean;
    children: ReactNode;
};

/**
 * Animated fixed-height drawer used under spell rows.
 */
export default function AccordionDrawer({ open, children }: AccordionDrawerProps) {
    const animatedHeight = useSharedValue(0);
    const [shouldRenderChildren, setShouldRenderChildren] = useState(open);

    useEffect(() => {
        if (open) {
            setShouldRenderChildren(true);
        }

        animatedHeight.value = withTiming(open ? SPELL_ACCORDION_HEIGHT : 0, {
            duration: SPELL_ACCORDION_DURATION_MS,
            easing: Easing.out(Easing.cubic),
        });

        if (open) return;

        const timeoutId = setTimeout(() => {
            setShouldRenderChildren(false);
        }, SPELL_ACCORDION_DURATION_MS);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [animatedHeight, open]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.value,
        overflow: 'hidden',
    }));

    return (
        <Animated.View style={[styles.container, open && styles.containerOpen, animatedStyle]}>
            {shouldRenderChildren && <Animated.View style={styles.inner}>{children}</Animated.View>}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: fantasyTokens.colors.accordionBg,
        borderTopWidth: 0,
        borderTopColor: 'transparent',
    },
    containerOpen: {
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
