import { StyleSheet } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Common layout and text styles shared across character-creation wizard steps.
 */
export const wizardStepStyles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.headline,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    sub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.12)',
        marginVertical: 16,
    },
    sectionLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.75,
        marginBottom: 8,
    },
    field: {
        marginBottom: 16,
    },
});
