import { type ReactNode, useMemo } from 'react';
import {
    Alert,
    Animated,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { usePathname, useRouter } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { buildCreateCharacterInput } from '@/lib/dndHelpers';
import { CREATE_CHARACTER, GET_CURRENT_USER_CHARACTERS } from '@/graphql/characterSheet.operations';

const STEP_ROUTES = [
    '/characters/create',
    '/characters/create/race',
    '/characters/create/class',
    '/characters/create/abilities',
    '/characters/create/background',
    '/characters/create/skills',
    '/characters/create/review',
];

const TOTAL_STEPS = STEP_ROUTES.length;

function deriveStepIndex(pathname: string): number {
    // Normalize: remove trailing slash
    const normalized = pathname.replace(/\/$/, '');
    const idx = STEP_ROUTES.indexOf(normalized);
    return idx >= 0 ? idx : 0;
}

type Props = { children: ReactNode };

export default function WizardShell({ children }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { draft, resetDraft, hasDraftData } = useCharacterDraft();

    const currentStep = deriveStepIndex(pathname);
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === TOTAL_STEPS - 1;

    const [createCharacter, { loading: creating, error: createError }] = useMutation<{
        createCharacter: { id: string; name: string };
    }>(CREATE_CHARACTER, {
        refetchQueries: [{ query: GET_CURRENT_USER_CHARACTERS }],
    });

    // Validation: is the current step complete enough to proceed?
    const canContinue = useMemo(() => {
        switch (currentStep) {
            case 0:
                return draft.name.trim().length > 0;
            case 1:
                return draft.race !== '';
            case 2:
                return draft.class !== '';
            case 4:
                return draft.background !== '';
            default:
                return true;
        }
    }, [currentStep, draft.name, draft.race, draft.class, draft.background]);

    const progressWidth = ((currentStep + 1) / TOTAL_STEPS) * 100;

    function handleBack() {
        if (isFirstStep) return;
        router.back();
    }

    function handleCancel() {
        if (hasDraftData()) {
            Alert.alert(
                'Abandon Character?',
                'Your progress will be lost.',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    {
                        text: 'Abandon',
                        style: 'destructive',
                        onPress: () => {
                            resetDraft();
                            router.replace('/characters');
                        },
                    },
                ],
            );
        } else {
            router.replace('/characters');
        }
    }

    async function handleNext() {
        if (!canContinue) return;

        if (isLastStep) {
            try {
                const input = buildCreateCharacterInput(draft);
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

        const nextRoute = STEP_ROUTES[currentStep + 1];
        router.push(nextRoute as any);
    }

    const ctaLabel = isLastStep ? '\u2726 Create Character \u2726' : 'Continue';

    return (
        <View style={styles.container}>
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
                    <Text style={styles.stepIndicator}>Step {currentStep + 1} of {TOTAL_STEPS}</Text>
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
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
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
            {createError && (
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
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.5)',
    },
    stepIndicator: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.4)',
    },
    cancelBtn: {
        fontFamily: 'serif',
        fontSize: 9,
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
        fontFamily: 'serif',
        fontSize: 13,
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
        fontFamily: 'serif',
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.parchment,
    },
    ctaTextDisabled: {
        opacity: 0.6,
    },
});
