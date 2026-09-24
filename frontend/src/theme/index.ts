import type { TextStyle } from 'react-native';

import { deriveColors, duskBlueDustyRose } from './colors';

/**
 * Design tokens. `docs/design-system.html` describes what they are for; once
 * this module and the doc disagree, this module is the source of truth.
 */

export const colors = deriveColors(duskBlueDustyRose);

/**
 * Space Grotesk faces, loaded in the root layout. Pick a face by family
 * rather than setting `fontWeight`: Android selects faces by family name and
 * will not synthesise a weight. 700 is the heaviest face there is.
 */
export const fonts = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

/** Type scale from the design system. Letter spacing is in points, not ems. */
export const typography = {
  titleDesktop: { fontFamily: fonts.bold, fontSize: 30, letterSpacing: -0.9 },
  titlePhone: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.63 },
  nameDesktop: { fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.38 },
  namePhone: { fontFamily: fonts.bold, fontSize: 16.5, letterSpacing: -0.33 },
  input: { fontFamily: fonts.regular, fontSize: 14 },
  subtitle: { fontFamily: fonts.regular, fontSize: 12.5 },
  hitPointLine: { fontFamily: fonts.medium, fontSize: 12 },
  columnHeader: { fontFamily: fonts.bold, fontSize: 11.5 },
  mark: { fontFamily: fonts.semiBold, fontSize: 11 },
  ringLabel: { fontFamily: fonts.bold, fontSize: 8 },
} satisfies Record<string, TextStyle>;

/**
 * Minimum window widths for each layout. The mockups are drawn at 390
 * (phone), 820 and 1180 (tablet, portrait and landscape) and 1440 (desktop).
 */
export const breakpoints = {
  tablet: 720,
  desktop: 1280,
} as const;
