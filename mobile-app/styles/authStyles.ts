import { StyleSheet } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export const styles = StyleSheet.create({
    page: {
        flexGrow: 1,
        padding: fantasyTokens.spacing.lg,
        backgroundColor: fantasyTokens.colors.night,
    },
    header: {
        marginBottom: fantasyTokens.spacing.lg,
    },
    title: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        marginBottom: fantasyTokens.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        opacity: 0.85,
    },
    card: {
        backgroundColor: fantasyTokens.colors.parchmentDeep,
        borderColor: fantasyTokens.colors.gold,
        borderRadius: fantasyTokens.radii.lg,
    },
    sectionTitle: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.md,
        marginBottom: fantasyTokens.spacing.sm,
        textAlign: 'center',
    },
    divider: {
        backgroundColor: fantasyTokens.colors.gold,
        marginBottom: fantasyTokens.spacing.md,
    },
    input: {
        marginBottom: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.parchment,
    },
    primaryButton: {
        marginTop: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.md,
    },
    primaryButtonContent: {
        paddingVertical: fantasyTokens.spacing.sm,
    },
    secondaryButton: {
        marginTop: fantasyTokens.spacing.sm,
        borderColor: fantasyTokens.colors.gold,
    },
    errorText: {
        color: fantasyTokens.colors.crimson,
    },
    snackbarWrapper: {
        flex: 1,
        alignSelf: 'center',
    },
});
