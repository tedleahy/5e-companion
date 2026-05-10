import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import {
    type AssetConfig,
    createPhysicsStates,
    updatePhysics,
    resolveCollisions,
    clampToBounds,
} from './lib/emptyStatePhysics';

const RUNE_ROTATION_DURATION_MS = 60000;
const GLOW_PULSE_DURATION_MS = 4000;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const PARTICLE_FLOAT_DISTANCE = 97;
const FLOATING_ASSET_STAGE_WIDTH = 292;
const FLOATING_ASSET_STAGE_HEIGHT = 292;

type ParticleConfig = {
    key: string;
    left: `${number}%`;
    top: `${number}%`;
    delayMs: number;
    size: number;
};

type ParticleAnimationState = {
    translateY: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
};

export type FloatingAssetAnimationState = {
    translateX: Animated.Value;
    translateY: Animated.Value;
    spin: Animated.Value;
    scale: Animated.Value;
    opacity: Animated.Value;
};

/** Generate roughly uniformly-distributed particles inside a disc using the golden angle. */
function generateParticles(count: number): ParticleConfig[] {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: count }, (_, i) => {
        const theta = i * goldenAngle + (Math.random() - 0.5) * 0.3;
        const r = Math.sqrt((i + 0.5) / count) * 0.34;
        return {
            key: `p${i + 1}`,
            left: `${50 + r * Math.cos(theta) * 100}%`,
            top: `${50 + r * Math.sin(theta) * 100}%`,
            delayMs: Math.floor((i / count) * 4000 + Math.random() * 800),
            size: 2 + Math.floor(Math.random() * 3),
        };
    });
}

function createParticleAnimations(count: number): ParticleAnimationState[] {
    return Array.from({ length: count }, () => ({
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(1),
    }));
}

function createFloatingAssetAnimations(count: number): FloatingAssetAnimationState[] {
    return Array.from({ length: count }, () => ({
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        spin: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(0),
    }));
}

/**
 * Hook that encapsulates all animation setup and teardown for EmptyState.
 * @param assetConfigs - Layout metadata for the floating SVG assets.
 */
export function useEmptyStateAnimations(assetConfigs: readonly AssetConfig[]) {
    const runeRotation = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0.65)).current;

    const particleConfig = useMemo(() => generateParticles(24), []);
    const particlesRef = useRef(createParticleAnimations(24)).current;
    const floatingAssetsRef = useRef(
        createFloatingAssetAnimations(assetConfigs.length)
    ).current;

    const runeSpin = useMemo(
        () =>
            runeRotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
            }),
        [runeRotation]
    );

    const assetSpins = useMemo(
        () =>
            floatingAssetsRef.map((asset, index) =>
                asset.spin.interpolate({
                    inputRange: [0, 1],
                    outputRange:
                        index % 2 === 0 ? ['0deg', '360deg'] : ['0deg', '-360deg'],
                })
            ),
        [floatingAssetsRef]
    );

    useEffect(() => {
        let isRunning = true;
        let animationFrame: number | null = null;
        let previousFrameTime = Date.now();
        const runningAnimations: Array<Pick<Animated.CompositeAnimation, 'stop'>> = [];

        // Rune rotation
        runeRotation.setValue(0);
        const runeAnimation = Animated.loop(
            Animated.timing(runeRotation, {
                toValue: 1,
                duration: RUNE_ROTATION_DURATION_MS,
                easing: Easing.linear,
                useNativeDriver: USE_NATIVE_DRIVER,
            })
        );
        runeAnimation.start();
        runningAnimations.push(runeAnimation);

        // Glow pulse
        const glowAnimation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(glowScale, {
                        toValue: 1.08,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: USE_NATIVE_DRIVER,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 1,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: USE_NATIVE_DRIVER,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(glowScale, {
                        toValue: 1,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: USE_NATIVE_DRIVER,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0.65,
                        duration: GLOW_PULSE_DURATION_MS / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: USE_NATIVE_DRIVER,
                    }),
                ]),
            ])
        );
        glowAnimation.start();
        runningAnimations.push(glowAnimation);

        // Floating particles
        particlesRef.forEach((particle, index) => {
            const config = particleConfig[index];

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
                            useNativeDriver: USE_NATIVE_DRIVER,
                        }),
                        Animated.sequence([
                            Animated.timing(particle.opacity, {
                                toValue: 0.68,
                                duration: 900,
                                useNativeDriver: USE_NATIVE_DRIVER,
                            }),
                            Animated.timing(particle.opacity, {
                                toValue: 0,
                                duration: 3700,
                                useNativeDriver: USE_NATIVE_DRIVER,
                            }),
                        ]),
                        Animated.timing(particle.scale, {
                            toValue: 0.5,
                            duration: 4600,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: USE_NATIVE_DRIVER,
                        }),
                    ]),
                    Animated.timing(particle.translateY, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: USE_NATIVE_DRIVER,
                    }),
                    Animated.timing(particle.scale, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: USE_NATIVE_DRIVER,
                    }),
                ])
            );

            particleAnimation.start();
            runningAnimations.push(particleAnimation);
        });

        // Floating assets fade-in
        floatingAssetsRef.forEach((floatingAsset, index) => {
            const delayMs = assetConfigs[index].delayMs ?? 0;

            floatingAsset.translateX.setValue(0);
            floatingAsset.translateY.setValue(0);
            floatingAsset.spin.setValue(0);
            floatingAsset.scale.setValue(0.94);
            floatingAsset.opacity.setValue(0);

            const opacityAnimation = Animated.sequence([
                Animated.delay(delayMs),
                Animated.timing(floatingAsset.opacity, {
                    toValue: 0.92,
                    duration: 1800,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: USE_NATIVE_DRIVER,
                }),
            ]);

            opacityAnimation.start();
            runningAnimations.push(opacityAnimation);
        });

        // Physics loop
        const physics = createPhysicsStates(assetConfigs);

        const animateFloatingAssets = () => {
            if (!isRunning) return;

            const currentFrameTime = Date.now();
            const deltaTime = Math.min(currentFrameTime - previousFrameTime, 32);
            previousFrameTime = currentFrameTime;

            updatePhysics(
                physics,
                assetConfigs,
                FLOATING_ASSET_STAGE_WIDTH,
                FLOATING_ASSET_STAGE_HEIGHT,
                deltaTime
            );
            resolveCollisions(physics, assetConfigs);
            clampToBounds(
                physics,
                assetConfigs,
                FLOATING_ASSET_STAGE_WIDTH,
                FLOATING_ASSET_STAGE_HEIGHT
            );

            physics.forEach((state, index) => {
                const floatingAsset = floatingAssetsRef[index];
                floatingAsset.translateX.setValue(state.x);
                floatingAsset.translateY.setValue(state.y);
                floatingAsset.spin.setValue(state.spin);
            });

            animationFrame = requestAnimationFrame(animateFloatingAssets);
        };

        animationFrame = requestAnimationFrame(animateFloatingAssets);

        return () => {
            isRunning = false;
            if (animationFrame !== null) cancelAnimationFrame(animationFrame);
            runningAnimations.forEach((animation) => animation.stop());
        };
    }, [glowOpacity, glowScale, runeRotation, assetConfigs, particleConfig, floatingAssetsRef, particlesRef]);

    return {
        runeSpin,
        glowScale,
        glowOpacity,
        particlesRef,
        particleConfig,
        floatingAssetsRef,
        assetSpins,
    };
}
