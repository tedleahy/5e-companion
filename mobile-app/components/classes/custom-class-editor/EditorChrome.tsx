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
    onBack,
    onContinue,
    onSave,
    children,
}: EditorChromeProps) {
    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View style={styles.headerTitle} pointerEvents="none">
                    <Text style={styles.eyebrow}>{title}</Text>
                    <Text style={styles.title}>{STAGES[stage]}</Text>
                </View>
                <View style={styles.stepWrap} pointerEvents="none">
                    <Text style={styles.step}>
                        {stage + 1}/{STAGES.length}
                    </Text>
                </View>
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
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.sheet.form.border,
    },
    headerTitle: {
        alignItems: 'center',
    },
    eyebrow: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.gold,
        textAlign: 'center',
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        textAlign: 'center',
    },
    stepWrap: {
        position: 'absolute',
        right: fantasyTokens.spacing.lg,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    step: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
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
        backgroundColor: fantasyTokens.sheet.form.border,
    },
    progressSegmentActive: { backgroundColor: fantasyTokens.colors.crimson },
    lockBanner: {
        padding: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    lockText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchment,
        textAlign: 'center',
    },
    validationBanner: {
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    validationText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchment,
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
        borderTopColor: fantasyTokens.sheet.form.border,
    },
    primary: {
        minWidth: 124,
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.crimson,
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
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
    },
    secondaryText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    disabled: { opacity: 0.5 },
});
