import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import type { MD3Elevation } from 'react-native-paper';
import { fantasyTokens } from '../theme/fantasyTheme';

type ParchmentPanelProps = {
    children: ReactNode;
    variant?: 'light' | 'deep';
    style?: StyleProp<ViewStyle>;
    elevation?: MD3Elevation;
};

export function ParchmentPanel({ children, variant = 'deep', style, elevation = 1 }: ParchmentPanelProps) {
    return (
        <Surface
            elevation={elevation}
            style={[
                styles.panelBase,
                variant === 'light' ? styles.panelLight : styles.panelDeep,
                style,
            ]}
        >
            {children}
        </Surface>
    );
}

type RuneDividerProps = {
    style?: StyleProp<ViewStyle>;
};

export function RuneDivider({ style }: RuneDividerProps) {
    return (
        <View style={[styles.runeRow, style]}>
            <Text style={styles.runes}>✶ ✧ ✶</Text>
        </View>
    );
}

type DetailRowProps = {
    label: string;
    value: string;
};

export function DetailRow({ label, value }: DetailRowProps) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    panelBase: {
        padding: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
    },
    panelLight: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    panelDeep: {
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    runeRow: {
        alignItems: 'center',
        marginVertical: fantasyTokens.spacing.sm,
    },
    runes: {
        color: fantasyTokens.colors.crimson,
        fontSize: 18,
        letterSpacing: 6,
        fontFamily: fantasyTokens.fonts.regular,
    },
    detailRow: {
        paddingVertical: fantasyTokens.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(196, 164, 112, 0.35)',
    },
    detailLabel: {
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkSoft,
        marginBottom: fantasyTokens.spacing.xs,
        fontFamily: fantasyTokens.fonts.regular,
    },
    detailValue: {
        fontSize: 16,
        color: fantasyTokens.colors.inkDark,
        fontFamily: fantasyTokens.fonts.regular,
    },
});
