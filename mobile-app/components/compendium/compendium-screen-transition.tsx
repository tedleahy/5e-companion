import { useCallback, useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Route name of the Compendium hub, the only screen reached by popping. */
const HUB_ROUTE_NAME = 'index';

const SCALE_DURATION = fantasyTokens.motion.standard;
const FADE_DURATION = fantasyTokens.motion.quick;
/** Pushing in grows from just under full size; popping back settles down from just over. */
const SCALE_INWARD = 0.92;
const SCALE_OUTWARD = 1.06;
/** Material's emphasized-decelerate curve: quick off the mark, gentle settle. */
const EMPHASIZED_DECELERATE = Easing.bezier(0.05, 0.7, 0.1, 1);

type CompendiumScreenTransitionProps = {
    children: ReactNode;
};

/**
 * Shared-axis-Z transition for Compendium pages, applied via the stack's
 * `screenLayout` so every route gets it without touching the screen files.
 *
 * The native stack animation is disabled, so depth is expressed here instead:
 * category screens grow in as you push, and the hub settles back down as you pop.
 */
export default function CompendiumScreenTransition({
    children,
}: CompendiumScreenTransitionProps) {
    const route = useRoute();
    const reducedMotion = useReducedMotion();
    const isHub = route.name === HUB_ROUTE_NAME;

    // The hub mounts when the app first reaches the Compendium, which the drawer
    // already covers, so it starts settled and only animates on later pops.
    // Category screens mount exactly when pushed, so they start mid-transition to
    // avoid a frame of full-size content before the effect runs.
    const startsSettled = reducedMotion || isHub;
    const scale = useSharedValue(startsSettled ? 1 : SCALE_INWARD);
    const opacity = useSharedValue(startsSettled ? 1 : 0);
    const hasFocused = useRef(false);

    useFocusEffect(useCallback(() => {
        if (reducedMotion) return;

        if (isHub) {
            if (!hasFocused.current) {
                hasFocused.current = true;
                return;
            }
            scale.value = SCALE_OUTWARD;
        }

        scale.value = withTiming(1, {
            duration: SCALE_DURATION,
            easing: EMPHASIZED_DECELERATE,
        });
        // Popping back reveals the hub over an empty stack, so it keeps full opacity
        // rather than flashing the night background through it.
        opacity.value = withTiming(1, {
            duration: FADE_DURATION,
            easing: EMPHASIZED_DECELERATE,
        });
    }, [isHub, opacity, reducedMotion, scale]));

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[styles.flex, animatedStyle]}
            testID="compendium-screen-transition"
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
});
