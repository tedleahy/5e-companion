import { useEffect, useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import BottomSheetShell from '@/components/sheets/BottomSheetShell';
import { OVERLAY_LAYER } from '@/components/sheets/overlayLayers';
import type { UseLevelUpWizardResult } from '@/hooks/useLevelUpWizard';
import useBottomSheetMotion from '@/hooks/useBottomSheetMotion';
import useDismissKeyboardAction from '@/hooks/useDismissKeyboardAction';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import type { AvailableSubclassOption } from '@/lib/subclasses';
import { fantasyTokens } from '@/theme/fantasyTheme';
import LevelUpWizardProgress from './LevelUpWizardProgress';
import LevelUpWizardStepBody from './LevelUpWizardStepBody';

type LevelUpWizardSheetProps = {
    visible: boolean;
    characterName: string;
    nextCharacterLevel: number;
    wizard: UseLevelUpWizardResult;
    availableSubclasses: AvailableSubclassOption[];
    onConfirm: () => void;
    /**
     * Called before dismiss animation. Return false to abort (e.g. dirty confirmation).
     */
    onRequestClose?: () => boolean | void;
    /**
     * Called after a user-initiated dismiss animation completes.
     */
    onClose: () => void;
};

/**
 * Bottom-sheet shell for the character-sheet level-up flow.
 */
export default function LevelUpWizardSheet({
    visible,
    characterName,
    nextCharacterLevel,
    wizard,
    availableSubclasses,
    onConfirm,
    onRequestClose,
    onClose,
}: LevelUpWizardSheetProps) {
    const scrollViewRef = useRef<ComponentRef<typeof KeyboardAwareScrollView>>(null);
    const { height: windowHeight } = useWindowDimensions();
    const {
        isRendered,
        backdropOpacity,
        sheetTranslateY,
        requestSheetClose,
        handleScroll,
        sheetDismissGesture,
    } = useBottomSheetMotion({
        visible,
        windowHeight,
        onRequestClose,
        onClose,
    });

    /**
     * Dismisses the active keyboard before running the supplied wizard action.
     */
    const dismissKeyboardAndRun = useDismissKeyboardAction();

    useEffect(() => {
        if (!visible) {
            return;
        }

        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [visible, wizard.currentStep.id]);

    return (
        <BottomSheetShell
            isRendered={isRendered}
            backdropOpacity={backdropOpacity}
            sheetTranslateY={sheetTranslateY}
            sheetDismissGesture={sheetDismissGesture}
            closeAccessibilityLabel="Dismiss level up wizard"
            testID="level-up-wizard-sheet"
            overlayZIndex={OVERLAY_LAYER.sheet}
            sheetStyle={styles.sheet}
            onRequestClose={() => dismissKeyboardAndRun(requestSheetClose)}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Level Up</Text>
                    <Pressable
                        onPress={() => dismissKeyboardAndRun(requestSheetClose)}
                        accessibilityRole="button"
                        accessibilityLabel="Close level up wizard"
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                </View>

                <Text style={styles.subtitle}>
                    {`Advance ${characterName} to Level ${nextCharacterLevel}`}
                </Text>
                <Text style={styles.stepLabel}>{wizard.stepLabel}</Text>
                <LevelUpWizardProgress
                    currentStep={wizard.currentStepIndex + 1}
                    totalSteps={wizard.steps.length}
                />
            </View>

            <KeyboardAwareScrollView
                {...keyboardAwareScrollProps}
                ref={scrollViewRef}
                bottomOffset={keyboardAwareBottomOffset}
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <LevelUpWizardStepBody
                    wizard={wizard}
                    availableSubclasses={availableSubclasses}
                />
            </KeyboardAwareScrollView>

            <View style={styles.footer}>
                <Pressable
                    onPress={() => dismissKeyboardAndRun(wizard.goToPreviousStep)}
                    accessibilityRole="button"
                    accessibilityLabel="Go to previous level up step"
                    accessibilityState={{ disabled: wizard.isFirstStep }}
                    disabled={wizard.isFirstStep}
                    style={[
                        styles.footerButton,
                        styles.backButton,
                        wizard.isFirstStep && styles.backButtonDisabled,
                    ]}
                    testID="level-up-back-button"
                >
                    <Text
                        style={[
                            styles.backButtonText,
                            wizard.isFirstStep && styles.backButtonTextDisabled,
                        ]}
                    >
                        Back
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => dismissKeyboardAndRun(wizard.isLastStep ? onConfirm : wizard.goToNextStep)}
                    accessibilityRole="button"
                    accessibilityLabel={wizard.isLastStep ? 'Confirm level up changes' : 'Go to next level up step'}
                    accessibilityState={{ disabled: wizard.nextButtonDisabled }}
                    disabled={wizard.nextButtonDisabled}
                    style={[
                        styles.footerButton,
                        styles.nextButton,
                        wizard.isLastStep && styles.confirmButton,
                        wizard.nextButtonDisabled && styles.nextButtonDisabled,
                    ]}
                    testID="level-up-next-button"
                >
                    <Text style={styles.nextButtonText}>{wizard.nextButtonLabel}</Text>
                </Pressable>
            </View>
        </BottomSheetShell>
    );
}

/**
 * Styles for the level-up wizard bottom-sheet shell.
 */
const styles = StyleSheet.create({
    sheet: {
        height: fantasyTokens.sheet.defaultHeight,
    },
    header: {
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingBottom: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.sheet.form.border,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        marginBottom: fantasyTokens.spacing.xs,
    },
    title: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: 26,
        lineHeight: 32,
        color: fantasyTokens.colors.parchment,
    },
    closeButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        borderRadius: fantasyTokens.radii.sm - fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.md - 2,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    closeButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    subtitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
        marginBottom: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
    },
    stepLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        marginBottom: fantasyTokens.spacing.sm + 2,
    },
    body: {
        flex: 1,
    },
    bodyContent: {
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingVertical: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
    },
    footer: {
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingVertical: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.sheet.form.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    footerButton: {
        minWidth: 112,
        borderRadius: fantasyTokens.radii.sm - fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingVertical: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        alignItems: 'center',
    },
    backButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: 'transparent',
    },
    backButtonDisabled: {
        opacity: 0.4,
    },
    backButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    backButtonTextDisabled: {
        color: fantasyTokens.colors.gold,
    },
    nextButton: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
    confirmButton: {
        backgroundColor: fantasyTokens.colors.success,
    },
    nextButtonDisabled: {
        opacity: 0.45,
    },
    nextButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
});
