import { Animated, Easing } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Duration for the primary expand/collapse transition. */
export const SUBCLASS_EXPAND_DURATION_MS = 350;

/** Duration for fading secondary chrome such as filters. */
export const SUBCLASS_FADE_DURATION_MS = 200;

/** Maximum row height used for collapsed rows. */
export const SUBCLASS_ROW_MAX_HEIGHT = 200;

/** Maximum row height used when a row is fully expanded. */
export const SUBCLASS_ROW_EXPANDED_MAX_HEIGHT = 2000;

/** Collapsed class icon badge size. */
export const SUBCLASS_BADGE_SIZE_COLLAPSED = 42;

/** Expanded class icon badge size. */
export const SUBCLASS_BADGE_SIZE_EXPANDED = 52;

/** Collapsed subclass title size. */
export const SUBCLASS_NAME_SIZE_COLLAPSED = fantasyTokens.fontSizes.bodyLarge;

/** Expanded subclass title size. */
export const SUBCLASS_NAME_SIZE_EXPANDED = fantasyTokens.fontSizes.title;

/** Collapsed parent class label size. */
export const SUBCLASS_CLASS_SIZE_COLLAPSED = fantasyTokens.fontSizes.utility;

/** Expanded parent class label size. */
export const SUBCLASS_CLASS_SIZE_EXPANDED = fantasyTokens.fontSizes.caption;

/**
 * Runs a timed animation using the shared Animated mock in tests.
 */
export function animateSubclassValue(
    value: Animated.Value,
    toValue: number,
    duration: number,
    delay = 0,
) {
    Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
            toValue,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }),
    ]).start();
}
