import {
    Animated,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useEmptyStateAnimations } from './useEmptyStateAnimations';

/** Floating asset stage width in the empty-state scene. */
const FLOATING_ASSET_STAGE_WIDTH = 292;
/** Floating asset stage height in the empty-state scene. */
const FLOATING_ASSET_STAGE_HEIGHT = 292;

const FIRST_CHARACTER_ANIMATION_ASSETS = [
    {
        key: 'arrow',
        source: require('../../assets/images/first-character-create-animation/archery-arrow-svgrepo-com.svg'),
        left: 25,
        top: 69,
        size: 58,
        driftX: 92,
        driftY: 82,
        delayMs: 0,
        durationMs: 2800,
    },
    {
        key: 'axe',
        source: require('../../assets/images/first-character-create-animation/axe-hatchet-svgrepo-com.svg'),
        left: 194,
        top: 41,
        size: 62,
        driftX: 76,
        driftY: 96,
        delayMs: 900,
        durationMs: 3200,
    },
    {
        key: 'crystal-ball',
        source: require('../../assets/images/first-character-create-animation/culture-glass-ball-looking-svgrepo-com.svg'),
        left: 110,
        top: 96,
        size: 74,
        driftX: 66,
        driftY: 62,
        delayMs: 400,
        durationMs: 3000,
    },
    {
        key: 'spell-dust',
        source: require('../../assets/images/first-character-create-animation/dust-spell-witchcraft-wizard-halloween-svgrepo-com.svg'),
        left: 48,
        top: 178,
        size: 65,
        driftX: 86,
        driftY: 72,
        delayMs: 1300,
        durationMs: 3400,
    },
    {
        key: 'magic-flame',
        source: require('../../assets/images/first-character-create-animation/fantasy-fire-flame-show-magic-svgrepo-com.svg'),
        left: 202,
        top: 169,
        size: 66,
        driftX: 80,
        driftY: 86,
        delayMs: 700,
        durationMs: 3100,
    },
    {
        key: 'sword',
        source: require('../../assets/images/first-character-create-animation/sword-svgrepo-com.svg'),
        left: 135,
        top: 10,
        size: 72,
        driftX: 64,
        driftY: 90,
        delayMs: 1700,
        durationMs: 3500,
    },
    {
        key: 'spell-book',
        source: require('../../assets/images/first-character-create-animation/weapon-fantasy-spell-book-magig-svgrepo-com.svg'),
        left: 122,
        top: 208,
        size: 78,
        driftX: 72,
        driftY: 66,
        delayMs: 1100,
        durationMs: 3300,
    },
] as const;

/**
 * Full-screen characters empty state shown when the signed-in user has no characters yet.
 */
export default function EmptyState() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        runeSpin,
        glowScale,
        glowOpacity,
        particlesRef,
        particleConfig,
        floatingAssetsRef,
        assetSpins,
    } = useEmptyStateAnimations(FIRST_CHARACTER_ANIMATION_ASSETS);

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

                    {particleConfig.map((particle, index) => {
                        const animatedParticle = particlesRef[index];

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

                    <View style={styles.figureContainer} pointerEvents="none">
                        {FIRST_CHARACTER_ANIMATION_ASSETS.map((asset, index) => {
                            const animatedAsset = floatingAssetsRef[index];

                            return (
                                <Animated.View
                                    key={asset.key}
                                    collapsable={false}
                                    needsOffscreenAlphaCompositing
                                    style={[
                                        styles.floatingAsset,
                                        {
                                            left: asset.left,
                                            top: asset.top,
                                            width: asset.size,
                                            height: asset.size,
                                            opacity: animatedAsset.opacity,
                                            transform: [
                                                { translateX: animatedAsset.translateX },
                                                { translateY: animatedAsset.translateY },
                                                { rotate: assetSpins[index] },
                                                { scale: animatedAsset.scale },
                                            ],
                                        },
                                    ]}
                                >
                                    <Image
                                        source={asset.source}
                                        style={styles.floatingAssetImage}
                                        contentFit="contain"
                                        tintColor={fantasyTokens.colors.gold}
                                        cachePolicy="none"
                                        transition={null}
                                        accessible={false}
                                    />
                                </Animated.View>
                            );
                        })}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationArea: {
        width: 387,
        height: 387,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: 347,
        height: 347,
        borderRadius: 999,
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    runeCircle: {
        position: 'absolute',
        width: 347,
        height: 347,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.17,
    },
    outerRuneRing: {
        position: 'absolute',
        width: 324,
        height: 324,
        borderRadius: 162,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.75)',
        borderStyle: 'dashed',
    },
    innerRuneRing: {
        position: 'absolute',
        width: 276,
        height: 276,
        borderRadius: 138,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.55)',
        borderStyle: 'dashed',
    },
    runeText: {
        color: 'rgba(201,146,42,0.8)',
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.2,
        fontFamily: fantasyTokens.fonts.regular,
        textAlign: 'center',
        maxWidth: 278,
        transform: [{ rotate: '-8deg' }],
    },
    particle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.gold,
    },
    figureContainer: {
        width: FLOATING_ASSET_STAGE_WIDTH,
        height: FLOATING_ASSET_STAGE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingAsset: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    floatingAssetImage: {
        width: '100%',
        height: '100%',
    },
    bottomContent: {
        alignItems: 'center',
        paddingHorizontal: 28,
        gap: fantasyTokens.spacing.sm,
        marginTop: 20,
    },
    ornamentRow: {
        width: '100%',
        maxWidth: 268,
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
        ...fantasyTokens.typography.pageTitle,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    flavour: {
        color: 'rgba(245,230,200,0.62)',
        ...fantasyTokens.typography.sectionTitle,
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
        fontSize: fantasyTokens.fontSizes.title,
    },
    ctaText: {
        color: fantasyTokens.colors.parchment,
        ...fantasyTokens.typography.buttonLabel,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    hint: {
        marginTop: fantasyTokens.spacing.xs,
        marginBottom: fantasyTokens.spacing.xs,
        color: 'rgba(201,146,42,0.35)',
        ...fantasyTokens.typography.eyebrow,
        letterSpacing: 2,
        textAlign: 'center',
    },
});
