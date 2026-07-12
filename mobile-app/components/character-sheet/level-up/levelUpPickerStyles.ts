import { StyleSheet } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';

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
        color: fantasyTokens.colors.parchmentDeep,
    },
    resourceCard: {
        ...nightFormStyles.card,
        borderLeftWidth: 4,
        borderLeftColor: fantasyTokens.colors.success,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    resourceLabel: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.parchment,
    },
    resourceValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceOldValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.gold,
        textDecorationLine: 'line-through',
    },
    resourceArrow: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.parchmentDeep,
    },
    resourceNewValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.success,
        fontFamily: fantasyTokens.fonts.semiBold,
    },
    noChangeCard: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    noChangeText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    unchangedSection: {
        gap: fantasyTokens.spacing.xs,
    },
    unchangedTitle: {
        ...nightFormStyles.label,
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
        color: fantasyTokens.colors.parchmentDeep,
    },
    unchangedValue: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchment,
    },
    pickerSection: {
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.sheet.form.border,
        paddingTop: fantasyTokens.spacing.md,
    },
    pickerTitle: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.gold,
    },
    addCustomButton: {
        ...nightFormStyles.dashedAddButton,
    },
    addCustomButtonText: {
        ...nightFormStyles.dashedAddButtonText,
    },
});
