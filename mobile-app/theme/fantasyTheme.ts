import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

/**
 * Shared design tokens used across the mobile UI.
 */
export const fantasyTokens = {
    colors: {
        parchment: '#f6e9cf',
        parchmentDeep: '#f0e0c0',
        cardBg: '#f0e0bc',
        inkDark: '#2b1c11',
        inkLight: '#3d2b1f',
        inkSoft: '#6e513084',
        ember: '#5f4325',
        gold: '#c4a470',
        goldLight: '#e8b84b',
        crimson: '#7b1e1e',
        crimsonSoft: 'rgba(123, 30, 30, 0.2)',
        night: '#1f1711',
        divider: 'rgba(139,90,43,0.3)',
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
        fontFamily: 'serif',
        fontSize: 8.5,
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
};

/**
 * Builds the React Native Paper theme from the current colour scheme.
 */
export function buildFantasyTheme(colorScheme: string | null | undefined): MD3Theme {
    const base = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return {
        ...base,
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
