import { fantasyTokens } from '@/theme/fantasyTheme';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * Props for edit mode guidance banner.
 */
export type EditModeBannerProps = {
    visible: boolean;
};

/**
 * Banner shown while edit mode is active.
 */
export default function EditModeBanner({ visible }: EditModeBannerProps) {
    const pulse = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (!visible) return;

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0.4,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [pulse, visible]);

    if (!visible) return null;

    return (
        <View style={styles.banner}>
            <Animated.View style={[styles.dot, { opacity: pulse }]} />
            <Text style={styles.text}>Editing — tap any highlighted field to change it</Text>
        </View>
    );
}

/** Styles for edit mode banner content. */
const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: 'rgba(201,146,42,0.08)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.18)',
        marginTop: 5,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: fantasyTokens.colors.gold,
    },
    text: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.7)',
    },
});
