import type { TextStyle } from 'react-native';
import { configureFonts, MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import type { MD3TypescaleKey } from 'react-native-paper';

/**
 * MD3-compatible font weight type (string literals only, not numeric).
 */
type MD3FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;

type FantasyPaperType = {
    fontFamily: string;
    letterSpacing: number;
    fontWeight?: MD3FontWeight;
    lineHeight: number;
    fontSize: number;
    fontStyle?: TextStyle['fontStyle'];
};

/**
 * Font family names loaded via expo-font / @expo-google-fonts/spectral.
 * We use Regular for body text and Bold for headings.
 */
export const fantasyFonts = {
    /** Standard body text weight. */
    regular: 'Spectral_400Regular',
    /** Medium weight for emphasis. */
    medium: 'Spectral_500Medium',
    /** Semi-bold for sub-headings. */
    semiBold: 'Spectral_600SemiBold',
    /** Bold for headings and prominent labels. */
    bold: 'Spectral_700Bold',
} as const;

/**
 * Shared font-size scale used across the mobile UI.
 */
export const fantasyFontSizes = {
    utility: 12,
    caption: 14,
    label: 15,
    body: 16,
    bodyLarge: 18,
    title: 20,
    titleLarge: 22,
    headline: 26,
    display: 32,
    stat: 34,
} as const;

/**
 * Builds a React Native Paper type entry for the fantasy type scale.
 */
function createFantasyType(
    fontFamily: string,
    fontWeight: FantasyPaperType['fontWeight'],
    fontSize: number,
    lineHeight: number,
    letterSpacing = 0,
    fontStyle: TextStyle['fontStyle'] = 'normal',
): FantasyPaperType {
    return {
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing,
        fontStyle,
    };
}

/**
 * Shared React Native Paper typescale overrides for the fantasy UI.
 */
export const fantasyTypescaleConfig = {
    displayLarge: createFantasyType(fantasyFonts.bold, '700', 32, 38, 0.1),
    displayMedium: createFantasyType(fantasyFonts.bold, '700', fantasyFontSizes.display, 36, 0.1),
    displaySmall: createFantasyType(fantasyFonts.semiBold, '600', 26, 32, 0.1),
    headlineLarge: createFantasyType(fantasyFonts.semiBold, '600', fantasyFontSizes.headline, 30, 0.2),
    headlineMedium: createFantasyType(fantasyFonts.semiBold, '600', 22, 28, 0.2),
    headlineSmall: createFantasyType(fantasyFonts.semiBold, '600', fantasyFontSizes.titleLarge, 26, 0.2),
    titleLarge: createFantasyType(fantasyFonts.semiBold, '600', fantasyFontSizes.titleLarge, 26, 0.15),
    titleMedium: createFantasyType(fantasyFonts.medium, '500', fantasyFontSizes.title, 24, 0.15),
    titleSmall: createFantasyType(fantasyFonts.medium, '500', fantasyFontSizes.bodyLarge, 22, 0.1),
    labelLarge: createFantasyType(fantasyFonts.medium, '500', fantasyFontSizes.body, 20, 0.25),
    labelMedium: createFantasyType(fantasyFonts.medium, '500', fantasyFontSizes.label, 18, 0.4),
    labelSmall: createFantasyType(fantasyFonts.medium, '500', fantasyFontSizes.utility, 16, 0.6),
    bodyLarge: createFantasyType(fantasyFonts.regular, '400', fantasyFontSizes.bodyLarge, 24, 0.2),
    bodyMedium: createFantasyType(fantasyFonts.regular, '400', fantasyFontSizes.body, 22, 0.15),
    bodySmall: createFantasyType(fantasyFonts.regular, '400', fantasyFontSizes.caption, 18, 0.2),
} as const satisfies Partial<Record<MD3TypescaleKey, Partial<FantasyPaperType>>>;

/**
 * Shared React Native Paper typescale with fantasy font families and sizes.
 */
export const fantasyTypescale = configureFonts({
    isV3: true,
    config: fantasyTypescaleConfig,
});

/**
 * Converts a Paper type entry into a plain React Native text style.
 */
function textStyleFromType(type: FantasyPaperType): TextStyle {
    return {
        fontFamily: type.fontFamily,
        fontWeight: type.fontWeight,
        fontStyle: type.fontStyle,
        fontSize: type.fontSize,
        lineHeight: type.lineHeight,
        letterSpacing: type.letterSpacing,
    };
}

/**
 * Shared typography presets used in custom style sheets.
 */
export const fantasyTypography = {
    body: textStyleFromType(fantasyTypescale.bodyMedium),
    bodySmall: textStyleFromType(fantasyTypescale.bodySmall),
    bodyLarge: textStyleFromType(fantasyTypescale.bodyLarge),
    cardTitle: textStyleFromType(fantasyTypescale.titleLarge),
    sectionTitle: textStyleFromType(fantasyTypescale.titleMedium),
    pageTitle: textStyleFromType(fantasyTypescale.displayMedium),
    pageSubtitle: {
        ...textStyleFromType(fantasyTypescale.bodyLarge),
        fontStyle: 'italic',
    },
    sectionLabel: {
        ...textStyleFromType(fantasyTypescale.labelLarge),
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
    eyebrow: {
        ...textStyleFromType(fantasyTypescale.labelSmall),
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
    buttonLabel: {
        ...textStyleFromType(fantasyTypescale.labelSmall),
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    statLabel: {
        ...textStyleFromType(fantasyTypescale.labelSmall),
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    statValue: textStyleFromType(fantasyTypescale.displayLarge),
} as const satisfies Record<string, TextStyle>;

/**
 * Shared design tokens used across the mobile UI.
 */
export const fantasyTokens = {
    fonts: fantasyFonts,
    fontSizes: fantasyFontSizes,
    typography: fantasyTypography,
    colors: {
        parchment: '#f6e9cf',
        parchmentLight: '#f5eedc',
        parchmentDeep: '#f0e0c0',
        cardBg: '#f0e0bc',
        inkDark: '#2b1c11',
        inkLight: '#3d2b1f',
        inkSoft: '#6e513084',
        ember: '#5f4325',
        gold: '#c4a470',
        goldLight: '#e8b84b',
        goldDark: '#9e845b',
        claret: '#8c1d38',
        claretLight: '#a62b4a',
        crimson: '#7b1e1e',
        crimsonSoft: 'rgba(123, 30, 30, 0.2)',
        success: '#2d6a4f',
        night: '#1f1711',
        divider: 'rgba(139,90,43,0.3)',
        sheetDivider: '#d4c9b4',
        accordionBg: '#e8d4a8',
        accordionBorder: 'rgba(139,90,43,0.22)',
        rowOpenBg: 'rgba(139,90,43,0.06)',
        greenDark: '#1a4a1a',
        blueDark: '#1a2a4a',
        inspired: '#8b1a1a',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 40,
    },
    radii: {
        sm: 12,
        md: 16,
        lg: 18,
    },
    motion: {
        quick: 160,
        standard: 240,
        gentle: 320,
        stagger: 36,
    },
    breakpoints: {
        tablet: 768,
    },
    rail: {
        collapsedWidth: 48,
        expandedWidth: 210,
        background: '#110b07',
        border: 'rgba(201,146,42,0.15)',
        borderStrong: 'rgba(201,146,42,0.22)',
        icon: 'rgba(201,146,42,0.5)',
        iconActive: '#c4a470',
        label: 'rgba(201,146,42,0.55)',
        labelActive: '#c4a470',
        pressed: 'rgba(201,146,42,0.07)',
        muted: 'rgba(201,146,42,0.3)',
        backdrop: 'rgba(0,0,0,0.58)',
    },
    editableField: {
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.55)',
        backgroundColor: 'rgba(201,146,42,0.07)',
        borderRadius: 6,
        shadowColor: 'rgba(201,146,42,0.18)',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 4,
        shadowOpacity: 1,
        elevation: 0,
    },
    addButton: {
        fontFamily: fantasyFonts.regular,
        fontSize: fantasyFontSizes.utility,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: '#8b1a1a',
        backgroundColor: 'rgba(139,26,26,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.28)',
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    text: {
        formLabel: {
            fontFamily: fantasyFonts.regular,
            fontSize: fantasyFontSizes.caption,
            letterSpacing: 2,
            textTransform: 'uppercase' as 'uppercase',
            color: 'rgba(201,146,42,0.6)',
            marginBottom: 6,
        }
    },
};

/**
 * Builds the React Native Paper theme from the current colour scheme.
 */
export function buildFantasyTheme(colorScheme: string | null | undefined): MD3Theme {
    const base = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return {
        ...base,
        fonts: fantasyTypescale,
        colors: {
            ...base.colors,
            primary: fantasyTokens.colors.crimson,
            secondary: fantasyTokens.colors.gold,
            background: fantasyTokens.colors.night,
            surface: fantasyTokens.colors.parchmentDeep,
            surfaceVariant: fantasyTokens.colors.parchment,
            onBackground: fantasyTokens.colors.parchment,
            onSurface: fantasyTokens.colors.inkDark,
            onSurfaceVariant: fantasyTokens.colors.inkSoft,
            outline: fantasyTokens.colors.gold,
            outlineVariant: '#8e744b',
        },
    };
}
