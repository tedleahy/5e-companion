import { useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme';

/** The layouts the app switches between, narrowest first. */
export type Breakpoint = 'phone' | 'tablet' | 'tabletLandscape' | 'desktop';

/** The layout for a window `width` in points. `breakpoints` sets where each one starts. */
export function breakpointForWidth(width: number): Breakpoint {
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tabletLandscape) return 'tabletLandscape';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'phone';
}

/** The layout for the current window width. Re-renders when the window is resized or rotated. */
export function useBreakpoint(): Breakpoint {
    const { width } = useWindowDimensions();
    return breakpointForWidth(width);
}
