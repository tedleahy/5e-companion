import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Duration for one full rune-circle rotation. */
const RUNE_ROTATION_DURATION_MS = 60000;
/** Duration for a single glow pulse cycle. */
const GLOW_PULSE_DURATION_MS = 4000;
/** Vertical rise distance used by floating particles. */
const PARTICLE_FLOAT_DISTANCE = 84;
/** Wizard illustration width in the empty-state scene. */
const WIZARD_ILLUSTRATION_WIDTH = 200;
/** Wizard illustration height in the empty-state scene. */
const WIZARD_ILLUSTRATION_HEIGHT = 220;

/**
 * Static particle layout metadata used for the atmospheric background effect.
 */
const PARTICLE_CONFIG = [
    { key: 'p1', left: '42%', top: '55%', delayMs: 0, size: 2 },
    { key: 'p2', left: '55%', top: '48%', delayMs: 1200, size: 3 },
    { key: 'p3', left: '38%', top: '42%', delayMs: 2400, size: 2 },
    { key: 'p4', left: '60%', top: '52%', delayMs: 800, size: 2 },
    { key: 'p5', left: '48%', top: '60%', delayMs: 3000, size: 3 },
    { key: 'p6', left: '35%', top: '50%', delayMs: 1800, size: 2 },
] as const;

/**
 * Animated values backing each floating particle.
 */
type ParticleAnimationState = {
    translateY: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
};

/**
 * Full-screen characters empty state shown when the signed-in user has no characters yet.
 */
export default function EmptyState() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const runeRotation = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0.65)).current;
    const particlesRef = useRef<ParticleAnimationState[]>(
        PARTICLE_CONFIG.map(() => ({
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(0),
            scale: new Animated.Value(1),
        }))
    );

    useEffect(() => {
        const runningAnimations: Animated.CompositeAnimation[] = [];

        runeRotation.setValue(0);
        const runeAnimation = Animated.loop(
            Animated.timing(runeRotation, {
                toValue: 1,
                duration: RUNE_ROTATION_DURATION_MS,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        runeAnimation.start();
        runningAnimations.push(runeAnimation);

        const glowAnimation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(glowScale, {
                        toValue: 1.08,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 1,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(glowScale, {
                        toValue: 1,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0.65,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );
        glowAnimation.start();
        runningAnimations.push(glowAnimation);

        particlesRef.current.forEach((particle, index) => {
            const config = PARTICLE_CONFIG[index];

            particle.translateY.setValue(0);
            particle.opacity.setValue(0);
            particle.scale.setValue(1);

            const particleAnimation = Animated.loop(
                Animated.sequence([
                    Animated.delay(config.delayMs),
                    Animated.parallel([
                        Animated.timing(particle.translateY, {
                            toValue: -PARTICLE_FLOAT_DISTANCE,
                            duration: 4600,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.sequence([
                            Animated.timing(particle.opacity, {
                                toValue: 0.68,
                                duration: 900,
                                useNativeDriver: true,
                            }),
                            Animated.timing(particle.opacity, {
                                toValue: 0,
                                duration: 3700,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.timing(particle.scale, {
                            toValue: 0.5,
                            duration: 4600,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(particle.translateY, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.scale, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );

            particleAnimation.start();
            runningAnimations.push(particleAnimation);
        });

        return () => {
            runningAnimations.forEach((animation) => animation.stop());
        };
    }, [glowOpacity, glowScale, runeRotation]);

    const runeSpin = runeRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.scene,
                    {
                        paddingTop: Math.max(insets.top, fantasyTokens.spacing.md),
                        paddingBottom: Math.max(insets.bottom, fantasyTokens.spacing.xl),
                    },
                ]}
            >
                <View style={styles.illustrationArea}>
                    <Animated.View
                        style={[
                            styles.glow,
                            {
                                opacity: glowOpacity,
                                transform: [{ scale: glowScale }],
                            },
                        ]}
                    />

                    {PARTICLE_CONFIG.map((particle, index) => {
                        const animatedParticle = particlesRef.current[index];

                        return (
                            <Animated.View
                                key={particle.key}
                                style={[
                                    styles.particle,
                                    {
                                        left: particle.left,
                                        top: particle.top,
                                        width: particle.size,
                                        height: particle.size,
                                        opacity: animatedParticle.opacity,
                                        transform: [
                                            { translateY: animatedParticle.translateY },
                                            { scale: animatedParticle.scale },
                                        ],
                                    },
                                ]}
                            />
                        );
                    })}

                    <Animated.View
                        style={[
                            styles.runeCircle,
                            {
                                transform: [{ rotate: runeSpin }],
                            },
                        ]}
                    >
                        <View style={styles.outerRuneRing} />
                        <View style={styles.innerRuneRing} />
                        <Text style={styles.runeText}>✦ · CODEX ARCANUM · ✦ · NOMEN EST OMEN ·</Text>
                    </Animated.View>

                    <View style={styles.figureContainer}>
                        <Image
                            source={require('../../assets/illustrations/wizard.svg')}
                            style={styles.figureImage}
                            contentFit="contain"
                            accessible={false}
                        />
                    </View>
                </View>

                <View style={styles.bottomContent}>
                    <View style={styles.ornamentRow}>
                        <View style={styles.ornamentLineLeft} />
                        <View style={styles.ornamentDiamond} />
                        <View style={styles.ornamentLineRight} />
                    </View>

                    <Text style={styles.heading}>Your campaign{`\n`}is about to begin.</Text>
                    <Text style={styles.flavour}>
                        Every great tale starts with a single{`\n`}character scratched into the pages of fate.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Create your first character"
                        onPress={() => router.push('/characters/create')}
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
                        testID="characters-empty-state-create"
                    >
                        <Text style={styles.ctaIcon}>✦</Text>
                        <Text style={styles.ctaText}>Create your first character</Text>
                        <Text style={styles.ctaIcon}>✦</Text>
                    </Pressable>

                    <Text style={styles.hint}>Character Codex · Ready when you are</Text>
                </View>
            </View>
        </View>
    );
}

/** Screen styles for the immersive characters empty state. */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060403',
    },
    scene: {
        flex: 1,
        justifyContent: 'space-between',
    },
    illustrationArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 999,
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    runeCircle: {
        position: 'absolute',
        width: 300,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.17,
    },
    outerRuneRing: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.75)',
        borderStyle: 'dashed',
    },
    innerRuneRing: {
        position: 'absolute',
        width: 238,
        height: 238,
        borderRadius: 119,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.55)',
        borderStyle: 'dashed',
    },
    runeText: {
        color: 'rgba(201,146,42,0.8)',
        fontSize: 10,
        letterSpacing: 1.2,
        fontFamily: 'serif',
        textAlign: 'center',
        maxWidth: 240,
        transform: [{ rotate: '-8deg' }],
    },
    particle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.gold,
    },
    figureContainer: {
        width: WIZARD_ILLUSTRATION_WIDTH,
        height: WIZARD_ILLUSTRATION_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    figureImage: {
        width: WIZARD_ILLUSTRATION_WIDTH,
        height: WIZARD_ILLUSTRATION_HEIGHT,
    },
    bottomContent: {
        alignItems: 'center',
        paddingHorizontal: 28,
        gap: fantasyTokens.spacing.sm,
    },
    ornamentRow: {
        width: '100%',
        maxWidth: 232,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    ornamentLineLeft: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.35)',
    },
    ornamentDiamond: {
        width: 6,
        height: 6,
        backgroundColor: 'rgba(201,146,42,0.5)',
        transform: [{ rotate: '45deg' }],
    },
    ornamentLineRight: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.35)',
    },
    heading: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 30,
        lineHeight: 38,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    flavour: {
        color: 'rgba(245,230,200,0.62)',
        fontFamily: 'serif',
        fontSize: 18,
        lineHeight: 28,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    ctaButton: {
        marginTop: fantasyTokens.spacing.md,
        minHeight: 56,
        borderRadius: 14,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        shadowColor: fantasyTokens.colors.crimson,
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: {
            width: 0,
            height: 6,
        },
    },
    ctaButtonPressed: {
        backgroundColor: '#9f2121',
    },
    ctaIcon: {
        color: fantasyTokens.colors.parchment,
        fontSize: 17,
        lineHeight: 18,
    },
    ctaText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    hint: {
        marginTop: fantasyTokens.spacing.xs,
        marginBottom: fantasyTokens.spacing.xs,
        color: 'rgba(201,146,42,0.35)',
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});
