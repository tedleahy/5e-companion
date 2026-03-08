import { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SheetCardProps = {
    children: ReactNode;
    index?: number;
    style?: StyleProp<ViewStyle>;
};

/**
 * Parchment-style card container.
 *
 * The `FadeInDown` animation from react-native-reanimated gives each card a
 * staggered entrance animation
 */
export default function SheetCard({ children, index = 0, style }: SheetCardProps) {
    return (
        <Animated.View
            entering={FadeInDown
                .duration(fantasyTokens.motion.standard)
                .delay(Math.min(index, 5) * fantasyTokens.motion.stagger)
                .springify()}
            style={[styles.card, style]}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: fantasyTokens.colors.cardBg,
        borderRadius: 14,
    },
});
