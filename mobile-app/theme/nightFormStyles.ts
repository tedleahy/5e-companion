import type { TextStyle, ViewStyle } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Shared style fragments for night BottomSheetShell forms.
 * Plain objects so callers can safely spread them into local StyleSheet.create maps.
 * Prefer these (or `fantasyTokens.sheet.form`) over ad-hoc rail/rgba copies.
 *
 * Text fragments bundle the typography that matches the majority of night-form
 * call sites (`buttonLabel` for titles/labels, `bodySmall` for body/error).
 * Sites that use a different type scale should keep their longhand styles.
 */
export const nightFormStyles = {
    card: {
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
    } satisfies ViewStyle,
    cardSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: fantasyTokens.colors.crimson,
    } satisfies ViewStyle,
    cardTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    } satisfies TextStyle,
    cardBody: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentDeep,
    } satisfies TextStyle,
    label: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    } satisfies TextStyle,
    errorText: {
        ...fantasyTokens.typography.bodySmall,
        // Crimson is too dark on night surfaces; goldLight keeps errors readable.
        color: fantasyTokens.colors.goldLight,
    } satisfies TextStyle,
    dashedAddButton: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.crimson,
        borderStyle: 'dashed',
        borderRadius: fantasyTokens.radii.md,
        paddingVertical: fantasyTokens.spacing.md,
    } satisfies ViewStyle,
    dashedAddButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    } satisfies TextStyle,
    positiveBadge: {
        borderRadius: 999,
        backgroundColor: fantasyTokens.sheet.form.positiveSoft,
        paddingHorizontal: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        paddingVertical: fantasyTokens.spacing.xs,
    } satisfies ViewStyle,
    positiveBadgeText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.success,
    } satisfies TextStyle,
    positiveNoteCard: {
        borderRadius: fantasyTokens.radii.md,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.sheet.form.positiveSoftSubtle,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.positiveBorder,
        gap: fantasyTokens.spacing.xs,
    } satisfies ViewStyle,
    warningBox: {
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.warningBorder,
        backgroundColor: fantasyTokens.sheet.form.warningSoft,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
    } satisfies ViewStyle,
} as const;
