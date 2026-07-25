import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumBackSwordProps = {
    color: string;
    pressed?: boolean;
};

/** Glyph box for the sword; the 34:16 viewBox is centred inside it. */
export const COMPENDIUM_BACK_SWORD_WIDTH = fantasyTokens.spacing.xxl - fantasyTokens.spacing.sm;
export const COMPENDIUM_BACK_SWORD_HEIGHT = fantasyTokens.spacing.md;

/** Shortsword glyph (point left) for the Compendium F3 back control. */
export default function CompendiumBackSword({ color, pressed = false }: CompendiumBackSwordProps) {
    return (
        <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={pressed ? styles.pressed : undefined}
        >
            <Svg
                width={COMPENDIUM_BACK_SWORD_WIDTH}
                height={COMPENDIUM_BACK_SWORD_HEIGHT}
                viewBox="0 0 34 16"
            >
                <Path d="M0.5 8 L11 5.5 L18.6 6.2 L18.6 9.8 L11 10.5 Z" fill={color} />
                <Rect x="18.6" y="1.6" width="2.2" height="12.8" rx="1.1" fill={color} />
                <Rect x="20.8" y="7" width="8" height="2" rx="1" fill={color} />
                <Circle cx="30.7" cy="8" r="2.3" fill={color} />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    pressed: {
        transform: [{ translateX: -fantasyTokens.spacing.xs }],
    },
});
