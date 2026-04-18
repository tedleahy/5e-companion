import { useEffect, useRef, type ComponentRef } from 'react';
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { GestureDetector } from 'react-native-gesture-handler';
import type { UseLevelUpWizardResult } from '@/hooks/useLevelUpWizard';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import type { AvailableSubclassOption } from '@/lib/subclasses';
import { fantasyTokens } from '@/theme/fantasyTheme';
import useDismissKeyboardAction from '@/hooks/useDismissKeyboardAction';
import LevelUpWizardProgress from './LevelUpWizardProgress';
import LevelUpWizardStepBody from './LevelUpWizardStepBody';
import useLevelUpWizardSheetMotion from './useLevelUpWizardSheetMotion';

type LevelUpWizardSheetProps = {
    visible: boolean;
    characterName: string;
    nextCharacterLevel: number;
    wizard: UseLevelUpWizardResult;
    availableSubclasses: AvailableSubclassOption[];
    onConfirm: () => void;
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
    } = useLevelUpWizardSheetMotion({
        visible,
        windowHeight,
        onRequestClose: onClose,
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

    if (!isRendered) {
        return null;
    }

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none">
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <Pressable
                    style={styles.backdropPressable}
                    onPress={() => dismissKeyboardAndRun(requestSheetClose)}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss level up wizard"
                />
            </Animated.View>

            <GestureDetector gesture={sheetDismissGesture}>
                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
                    testID="level-up-wizard-sheet"
                >
                    <View style={styles.handleWrap}>
                        <View style={styles.handle} />
                    </View>

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
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

/**
 * Styles for the level-up wizard bottom-sheet shell.
 */
const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 30,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20,14,8,0.6)',
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: '82%',
        backgroundColor: fantasyTokens.colors.parchment,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 20,
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: fantasyTokens.colors.sheetDivider,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.sheetDivider,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        marginBottom: 4,
    },
    title: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: 26,
        lineHeight: 32,
        color: fantasyTokens.colors.inkDark,
    },
    closeButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    closeButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    subtitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        marginBottom: 12,
    },
    stepLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
        marginBottom: 10,
    },
    body: {
        flex: 1,
    },
    bodyContent: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: fantasyTokens.spacing.md,
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    footerButton: {
        minWidth: 112,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    backButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: 'transparent',
    },
    backButtonDisabled: {
        opacity: 0.4,
    },
    backButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    backButtonTextDisabled: {
        color: fantasyTokens.colors.inkSoft,
    },
    nextButton: {
        backgroundColor: fantasyTokens.colors.claret,
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
