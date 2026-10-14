import type { TextStyle } from 'react-native';

import { deriveColors, duskBlueDustyRose, type Colors } from './colors';

/**
 * Design tokens. `docs/design-system.html` describes what they are for; once
 * this module and the doc disagree, this module is the source of truth.
 */

export type { Colors };

/** Color tokens for the current palette. */
export const colors = deriveColors(duskBlueDustyRose);

/**
 * Space Grotesk faces, loaded in the root layout. Pick a face by family
 * rather than setting `fontWeight`: Android selects faces by family name and
 * will not synthesize a weight. 700 is the heaviest face there is.
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
    subtitleDesktop: { fontFamily: fonts.regular, fontSize: 13 },
    hitPointLine: { fontFamily: fonts.medium, fontSize: 12 },
    /** Prose under a heading, such as on an empty card or a notice. */
    body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19.5 },
    bodyDesktop: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
    /** A line saying what is happening, such as "Loading characters…". */
    status: { fontFamily: fonts.medium, fontSize: 13 },
    statusDesktop: { fontFamily: fonts.medium, fontSize: 14 },
    columnHeader: { fontFamily: fonts.bold, fontSize: 11.5 },
    mark: { fontFamily: fonts.semiBold, fontSize: 11 },
    ringLabel: { fontFamily: fonts.bold, fontSize: 8 },
    initialPhone: { fontFamily: fonts.bold, fontSize: 20 },
    initialDesktop: { fontFamily: fonts.bold, fontSize: 23 },
    levelNumber: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.78, lineHeight: 26 },
    // Small labels are the only tracked text besides titles and names. Their copy is written in
    // sentence case and uppercased here.
    smallLabel: {
        fontFamily: fonts.bold,
        fontSize: 11,
        letterSpacing: 0.99,
        lineHeight: 11,
        textTransform: 'uppercase',
    },
    smallLabelDesktop: {
        fontFamily: fonts.bold,
        fontSize: 13,
        letterSpacing: 1.17,
        lineHeight: 13,
        textTransform: 'uppercase',
    },
    /** A large primary button. */
    buttonPrimary: { fontFamily: fonts.bold, fontSize: 15 },
    /** A medium primary button. */
    buttonPrimaryCompact: { fontFamily: fonts.bold, fontSize: 14 },
    /** Large and medium secondary buttons. */
    buttonSecondary: { fontFamily: fonts.bold, fontSize: 13 },
    /** A small secondary button. */
    buttonSecondaryCompact: { fontFamily: fonts.bold, fontSize: 12.5 },
} satisfies Record<string, TextStyle>;

/** How far an offset shadow sits below and to the right of its surface, in points. */
export type ShadowDepth = 3 | 4 | 5;

/**
 * A hard print shadow, offset `depth` points down and right with no blur, in the color token
 * `token`. The result is a `boxShadow` style string.
 */
export function offsetShadow(depth: ShadowDepth, token: keyof Colors): string {
    return `${depth}px ${depth}px 0 ${colors[token]}`;
}

/**
 * A hard print shadow straight down, for a surface as wide as the screen, such as the wide header
 * plate. Same shape as `offsetShadow` otherwise.
 */
export function dropShadow(depth: ShadowDepth, token: keyof Colors): string {
    return `0 ${depth}px 0 ${colors[token]}`;
}

/**
 * Minimum window widths for each layout. The mockups are drawn at 390
 * (phone), 820 and 1180 (tablet, portrait and landscape) and 1440 (desktop).
 *
 * Each layout is named for the device that usually has that width, but only the
 * width counts: a narrow desktop window gets the phone layout. `tabletLandscape`
 * is the width of a typical tablet held in landscape, where cards fit in two
 * columns. A large tablet in portrait can be that wide too, and gets it as well.
 */
export const breakpoints = {
    tablet: 720,
    tabletLandscape: 1024,
    desktop: 1280,
} as const;
