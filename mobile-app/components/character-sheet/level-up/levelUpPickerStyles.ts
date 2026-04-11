import { StyleSheet } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Shared styles for level-up picker components.
 * Used by invocation, metamagic, and mystic arcanum pickers.
 */
export const levelUpPickerStyles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    resourceCard: {
        borderLeftWidth: 4,
        borderLeftColor: fantasyTokens.colors.success,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    resourceLabel: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
    },
    resourceValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceOldValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkSoft,
        textDecorationLine: 'line-through',
    },
    resourceArrow: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkLight,
    },
    resourceNewValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.success,
        fontFamily: fantasyTokens.fonts.semiBold,
    },
    noChangeCard: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: 'rgba(212,201,180,0.45)',
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    noChangeText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    unchangedSection: {
        gap: fantasyTokens.spacing.xs,
    },
    unchangedTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    unchangedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.xs,
    },
    unchangedLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    unchangedValue: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    pickerSection: {
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.sheetDivider,
        paddingTop: fantasyTokens.spacing.md,
    },
    pickerTitle: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.claret,
    },
    textInput: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    addCustomButton: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderStyle: 'dashed',
        borderRadius: fantasyTokens.radii.md,
        paddingVertical: fantasyTokens.spacing.md,
    },
    addCustomButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
