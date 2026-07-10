import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { STAGES } from './types';

type EditorChromeProps = {
    title: string;
    stage: number;
    locked: boolean;
    lockReason?: string | null;
    pending: boolean;
    validationMessage?: string | null;
    onCancel: () => void;
    onBack: () => void;
    onContinue: () => void;
    onSave: () => void;
    children: ReactNode;
};

/**
 * Shared header, progress bar, lock banner, and footer for the custom class editor sheet.
 */
export default function EditorChrome({
    title,
    stage,
    locked,
    lockReason,
    pending,
    validationMessage,
    onCancel,
    onBack,
    onContinue,
    onSave,
    children,
}: EditorChromeProps) {
    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable
                    testID="custom-class-cancel"
                    onPress={onCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel custom class editor"
                >
                    <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <View style={styles.headerTitle}>
                    <Text style={styles.eyebrow}>{title}</Text>
                    <Text style={styles.title}>{STAGES[stage]}</Text>
                </View>
                <Text style={styles.step}>
                    {stage + 1}/{STAGES.length}
                </Text>
            </View>

            <View style={styles.progress}>
                {STAGES.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.progressSegment, index <= stage && styles.progressSegmentActive]}
                    />
                ))}
            </View>

            {locked ? (
                <View style={styles.lockBanner}>
                    <Text style={styles.lockText}>{lockReason}</Text>
                </View>
            ) : null}

            <View style={styles.body}>{children}</View>

            {validationMessage ? (
                <View style={styles.validationBanner} accessibilityRole="alert">
                    <Text style={styles.validationText}>{validationMessage}</Text>
                </View>
            ) : null}

            <View style={styles.footer}>
                {stage > 0 ? (
                    <Pressable
                        style={styles.secondary}
                        onPress={onBack}
                        accessibilityRole="button"
                        accessibilityLabel="Go to previous custom class stage"
                    >
                        <Text style={styles.secondaryText}>Back</Text>
                    </Pressable>
                ) : (
                    <View />
                )}
                {stage < STAGES.length - 1 ? (
                    <Pressable
                        style={styles.primary}
                        onPress={onContinue}
                        accessibilityRole="button"
                        accessibilityLabel="Go to next custom class stage"
                    >
                        <Text style={styles.primaryText}>Continue</Text>
                    </Pressable>
                ) : (
                    <Pressable
                        disabled={pending}
                        style={[styles.primary, pending && styles.disabled]}
                        onPress={onSave}
                        accessibilityRole="button"
                        accessibilityLabel="Save custom class"
                        accessibilityState={{ disabled: pending }}
                    >
                        {pending ? (
                            <ActivityIndicator color={fantasyTokens.colors.parchment} />
                        ) : (
                            <Text style={styles.primaryText}>Save class</Text>
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    body: { flex: 1 },
    header: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        paddingHorizontal: fantasyTokens.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    headerTitle: { flex: 1, alignItems: 'center' },
    eyebrow: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.inkSoft,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    cancel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    step: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    progress: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.sm,
    },
    progressSegment: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: fantasyTokens.colors.accordionBorder,
    },
    progressSegmentActive: { backgroundColor: fantasyTokens.colors.claret },
    lockBanner: {
        padding: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    lockText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.crimson,
        textAlign: 'center',
    },
    validationBanner: {
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    validationText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.crimson,
        textAlign: 'center',
    },
    footer: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    primary: {
        minWidth: 124,
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
    },
    primaryText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    secondary: {
        minWidth: 100,
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
    },
    secondaryText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    disabled: { opacity: 0.5 },
});
