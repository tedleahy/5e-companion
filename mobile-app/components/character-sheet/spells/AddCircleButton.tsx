import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { AddSpellBlockedReason } from './addSpell.types';

type AddCircleButtonProps = {
    known: boolean;
    blockedReason?: AddSpellBlockedReason | null;
    onPress: () => void;
    style?: ViewStyle;
};

const GOLD_BORDER = 'rgba(201,146,42,0.22)';
const GOLD_TEXT = 'rgba(201,146,42,0.38)';
const GOLD_BG = 'rgba(201,146,42,0.08)';
const GREEN_BORDER = 'rgba(42,122,42,0.50)';
const GREEN_TEXT = '#4a9a4a';
const GREEN_BG = 'rgba(42,122,42,0.12)';
const BLOCKED_BORDER = 'rgba(245,230,200,0.12)';
const BLOCKED_TEXT = 'rgba(245,230,200,0.22)';
const BLOCKED_BG = 'rgba(245,230,200,0.04)';

/**
 * Circular add action for the Add Spell list row.
 */
export default function AddCircleButton({ known, blockedReason = null, onPress, style }: AddCircleButtonProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const knownProgress = useRef(new Animated.Value(known ? 1 : 0)).current;
    const previousKnown = useRef(known);
    const blocked = blockedReason != null;

    useEffect(() => {
        if (previousKnown.current === known) return;

        if (known) {
            Animated.parallel([
                Animated.timing(knownProgress, {
                    toValue: 1,
                    duration: fantasyTokens.motion.standard,
                    useNativeDriver: false,
                }),
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.2,
                        duration: fantasyTokens.motion.quick,
                        useNativeDriver: false,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: fantasyTokens.motion.quick,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start();
        } else {
            Animated.timing(knownProgress, {
                toValue: 0,
                duration: fantasyTokens.motion.quick,
                useNativeDriver: false,
            }).start();
        }

        previousKnown.current = known;
    }, [known, knownProgress, scale]);

    const animatedStyle = blocked ? {
        borderColor: BLOCKED_BORDER,
        backgroundColor: BLOCKED_BG,
        transform: [{ scale }],
    } : {
        borderColor: knownProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [GOLD_BORDER, GREEN_BORDER],
        }),
        backgroundColor: knownProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [GOLD_BG, GREEN_BG],
        }),
        transform: [{ scale }],
    };

    const textStyle = blocked ? {
        color: BLOCKED_TEXT,
    } : {
        color: knownProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [GOLD_TEXT, GREEN_TEXT],
        }),
    };

    const icon = blocked ? '\u2014' : known ? '\u2713' : '+';
    const accessibilityLabel = blockedReason === 'selection_limit'
        ? 'Selection limit reached'
        : blocked
            ? 'Spell already known'
            : known
                ? 'Remove spell'
                : 'Add spell';

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            disabled={blocked}
            style={style}
        >
            <Animated.View style={[styles.circle, animatedStyle]}>
                <Animated.Text style={[styles.icon, textStyle]}>{icon}</Animated.Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    circle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});
