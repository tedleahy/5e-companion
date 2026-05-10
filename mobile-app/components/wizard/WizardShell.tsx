import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { usePathname, useRouter } from 'expo-router';
import { useMutation, ApolloError } from '@apollo/client/react';
import useAvailableSubclasses from '@/hooks/useAvailableSubclasses';
import useConfirm from '@/hooks/useConfirm';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { buildCreateCharacterInput } from '@/lib/characterCreation/buildCreateCharacterInput';
import {
    deriveCreateCharacterStepIndex,
    getCreateCharacterStepRoutes,
} from '@/lib/characterCreation/routes';
import { isCreateCharacterStepComplete } from '@/lib/characterCreation/stepCompletion';
import { CREATE_CHARACTER, GET_CURRENT_USER_CHARACTER_ROSTER } from '@/graphql/characterSheet.operations';

type Props = { children: ReactNode };

export default function WizardShell({ children }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { draft, resetDraft, hasDraftData } = useCharacterDraft();
    const { confirm, confirmDialogElement } = useConfirm();
    const { subclassOptionItemsByClassId } = useAvailableSubclasses(
        draft.classes.map((classRow) => classRow.classId),
    );

    const stepRoutes = useMemo(() => getCreateCharacterStepRoutes(draft.level), [draft.level]);
    const totalSteps = stepRoutes.length;
    const currentStep = deriveCreateCharacterStepIndex(pathname, stepRoutes);
    const currentRoute = stepRoutes[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    const [createCharacter, { loading: creating, error: createError }] = useMutation<{
        createCharacter: { id: string; name: string };
    }>(CREATE_CHARACTER, {
        refetchQueries: [{ query: GET_CURRENT_USER_CHARACTER_ROSTER }],
    });

    const [displayError, setDisplayError] = useState<ApolloError | null>(null);

    useEffect(() => {
        setDisplayError(null);
    }, [pathname]);

    useEffect(() => {
        setDisplayError(createError ?? null);
    }, [createError]);

    // Validation: is the current step complete enough to proceed?
    const canContinue = useMemo(
        () => isCreateCharacterStepComplete(currentRoute, draft, subclassOptionItemsByClassId),
        [currentRoute, draft, subclassOptionItemsByClassId],
    );

    const progressWidth = ((currentStep + 1) / totalSteps) * 100;

    function handleBack() {
        if (isFirstStep) return;
        router.back();
    }

    function handleCancel() {
        if (hasDraftData()) {
            confirm({
                title: 'Abandon Character?',
                message: 'Your progress will be lost.',
                cancelLabel: 'Keep Editing',
                confirmLabel: 'Abandon',
                onConfirm: () => {
                    resetDraft();
                    router.replace('/characters');
                },
            });
        } else {
            router.replace('/characters');
        }
    }

    async function handleNext() {
        if (!canContinue) return;

        if (isLastStep) {
            try {
                const input = buildCreateCharacterInput(draft, subclassOptionItemsByClassId);
                const result = await createCharacter({ variables: { input } });
                const newId = result.data?.createCharacter?.id;
                resetDraft();
                if (newId) {
                    router.replace(`/character/${newId}`);
                } else {
                    router.replace('/characters');
                }
            } catch {
                // Error is captured by createError state
            }
            return;
        }

        const nextRoute = stepRoutes[currentStep + 1];
        router.push(nextRoute);
    }

    const ctaLabel = isLastStep ? '\u2726 Create Character \u2726' : 'Continue';

    return (
        <View style={styles.container}>
            {confirmDialogElement}
            {/* Top bar */}
            <View style={styles.header}>
                <View style={styles.nav}>
                    <Pressable
                        onPress={handleBack}
                        style={{ opacity: isFirstStep ? 0 : 1 }}
                        disabled={isFirstStep}
                        hitSlop={8}
                    >
                        <Text style={styles.backBtn}>{'\u25C0'} Back</Text>
                    </Pressable>
                    <Text style={styles.stepIndicator}>Step {currentStep + 1} of {totalSteps}</Text>
                    <Pressable onPress={handleCancel} hitSlop={8}>
                        <Text style={styles.cancelBtn}>Cancel</Text>
                    </Pressable>
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
                </View>

                {/* Step dots */}
                <View style={styles.stepDots}>
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i < currentStep && styles.dotDone,
                                i === currentStep && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>

            {/* Error message */}
            {displayError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Failed to create character. Please try again.
                    </Text>
                </View>
            )}

            {/* Footer CTA */}
            <View style={styles.footer}>
                <Pressable
                    onPress={handleNext}
                    disabled={!canContinue || creating}
                    style={({ pressed }) => [
                        styles.ctaBtn,
                        !canContinue && styles.ctaDisabled,
                        pressed && canContinue && styles.ctaPressed,
                    ]}
                >
                    {creating ? (
                        <ActivityIndicator size="small" color={fantasyTokens.colors.parchment} />
                    ) : (
                        <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
                            {ctaLabel}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.12)',
    },
    nav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backBtn: {
        padding: 10,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.5)',
    },
    stepIndicator: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.4)',
    },
    cancelBtn: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(139,26,26,0.6)',
    },
    progressTrack: {
        height: 3,
        backgroundColor: 'rgba(201,146,42,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: fantasyTokens.colors.gold,
        borderRadius: 2,
    },
    stepDots: {
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
        marginTop: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(201,146,42,0.15)',
    },
    dotDone: {
        backgroundColor: 'rgba(201,146,42,0.45)',
    },
    dotActive: {
        backgroundColor: fantasyTokens.colors.gold,
        width: 18,
        borderRadius: 3,
    },
    content: {
        flex: 1,
    },
    errorContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    errorText: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.12)',
    },
    ctaBtn: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaPressed: {
        backgroundColor: '#a82020',
    },
    ctaDisabled: {
        opacity: 0.4,
    },
    ctaText: {
        fontWeight: 'bold',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.parchment,
    },
    ctaTextDisabled: {
        opacity: 0.6,
    },
});
