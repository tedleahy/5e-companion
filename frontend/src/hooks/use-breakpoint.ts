import { useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export function breakpointForWidth(width: number): Breakpoint {
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

/** The layout for the current window width. Re-renders when the window is resized or rotated. */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return breakpointForWidth(width);
}
