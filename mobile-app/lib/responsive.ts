import { useWindowDimensions } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Scale factor applied to font sizes on tablet-width screens. */
const TABLET_SCALE = 1.25;

/**
 * Returns a multiplier for font sizes based on the current screen width.
 * On screens wider than the tablet breakpoint, fonts are scaled up by 25%.
 */
export function useResponsiveScale(): number {
    const { width } = useWindowDimensions();
    return width >= fantasyTokens.breakpoints.tablet ? TABLET_SCALE : 1;
}

/**
 * Scales a base font size for the current screen.
 * Use inside a component that calls `useResponsiveScale()` first, then pass
 * the returned scale to this helper.
 *
 * @example
 * const scale = useResponsiveScale();
 * const titleSize = scaledFont(22, scale);
 */
export function scaledFont(base: number, scale: number): number {
    return Math.round(base * scale * 10) / 10;
}
