import { StyleSheet } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export const sharedStyles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    heading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 26,
        marginBottom: 4,
    },
    sub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    modeToggle: {
        flexDirection: 'row',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.25)',
        overflow: 'hidden',
        marginBottom: 14,
    },
    modeTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modeTabActive: {
        backgroundColor: 'rgba(201,146,42,0.15)',
    },
    modeTabText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.4)',
    },
    modeTabTextActive: {
        color: fantasyTokens.colors.gold,
        opacity: 1,
    },
    grid: {
        gap: 8,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 8,
    },
    gridItem: {
        flex: 1,
    },
    asiSection: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.15)',
        paddingTop: 16,
    },
    asiHeading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    asiSub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 14,
    },
    asiGrid: {
        gap: 8,
    },
    asiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    asiLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.6)',
        width: 40,
    },
    asiControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    asiBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: 'rgba(201,146,42,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    asiBtnPressed: {
        backgroundColor: 'rgba(201,146,42,0.18)',
    },
    asiBtnDisabled: {
        opacity: 0.3,
    },
    asiBtnText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        color: 'rgba(201,146,42,0.6)',
    },
    asiValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        width: 30,
        textAlign: 'center',
    },
});
