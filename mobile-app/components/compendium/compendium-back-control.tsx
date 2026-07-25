import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import CompendiumBackSword, {
    COMPENDIUM_BACK_SWORD_HEIGHT,
} from '@/components/compendium/compendium-back-sword';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type CompendiumBackControlTone = 'gold' | 'ink';

/** Fixed width for the F3 control and matching header/detail side slots. */
export const COMPENDIUM_BACK_SLOT_WIDTH = fantasyTokens.spacing.xxl + fantasyTokens.spacing.sm;

type CompendiumBackControlProps = {
    accessibilityLabel: string;
    onPress: () => void;
    tone?: CompendiumBackControlTone;
    testID?: string;
    style?: StyleProp<ViewStyle>;
};

/** Sits just under the eyebrow scale so the caption never competes with the title. */
const CAPTION_SIZE = fantasyTokens.fontSizes.utility - fantasyTokens.spacing.xs / 2;
const CONTROL_PADDING_VERTICAL = fantasyTokens.spacing.xs / 2;
const CONTROL_GAP = fantasyTokens.spacing.xs;

/**
 * Rendered height of the control. Callers that reserve layout space for it
 * (collapsed header slots, absolute overlays) must use this rather than
 * re-deriving the height from type and spacing tokens.
 */
export const COMPENDIUM_BACK_CONTROL_HEIGHT = CONTROL_PADDING_VERTICAL * 2
    + COMPENDIUM_BACK_SWORD_HEIGHT
    + CONTROL_GAP
    + CAPTION_SIZE;

/** Platform minimum for a comfortable press target. */
const MIN_TOUCH_TARGET = 44;

function slopFor(size: number) {
    return Math.max(0, Math.ceil((MIN_TOUCH_TARGET - size) / 2));
}

/**
 * Expands the compact glyph to a ~44pt press target without changing layout,
 * mirroring the compact stepper convention in the theme.
 */
export const COMPENDIUM_BACK_HIT_SLOP = {
    top: slopFor(COMPENDIUM_BACK_CONTROL_HEIGHT),
    bottom: slopFor(COMPENDIUM_BACK_CONTROL_HEIGHT),
    left: slopFor(COMPENDIUM_BACK_SLOT_WIDTH),
    right: slopFor(COMPENDIUM_BACK_SLOT_WIDTH),
} as const;

/** Resolves glyph/caption colour and press wash for a tone in its rest or pressed state. */
export function compendiumBackToneColors(tone: CompendiumBackControlTone, pressed: boolean) {
    const isInk = tone === 'ink';
    if (!pressed) {
        return {
            color: isInk ? fantasyTokens.colors.claret : fantasyTokens.colors.gold,
            background: undefined,
        };
    }
    return {
        color: isInk ? fantasyTokens.colors.claretLight : fantasyTokens.colors.goldLight,
        background: isInk ? fantasyTokens.colors.claretPressed : fantasyTokens.rail.pressed,
    };
}

/**
 * F3 captioned back control: shortsword over a fixed "Back" caption.
 * Gold for night category chrome; ink (claret) for parchment detail chrome.
 */
export default function CompendiumBackControl({
    accessibilityLabel,
    onPress,
    tone = 'gold',
    testID,
    style,
}: CompendiumBackControlProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            testID={testID}
            hitSlop={COMPENDIUM_BACK_HIT_SLOP}
            style={({ pressed }) => [
                styles.control,
                { backgroundColor: compendiumBackToneColors(tone, pressed).background },
                style,
            ]}
        >
            {({ pressed }) => {
                const { color } = compendiumBackToneColors(tone, pressed);
                return (
                    <>
                        <CompendiumBackSword color={color} pressed={pressed} />
                        <Text style={[styles.caption, { color }]}>Back</Text>
                    </>
                );
            }}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    control: {
        width: COMPENDIUM_BACK_SLOT_WIDTH,
        height: COMPENDIUM_BACK_CONTROL_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        gap: CONTROL_GAP,
        paddingVertical: CONTROL_PADDING_VERTICAL,
        borderRadius: fantasyTokens.radii.sm,
    },
    caption: {
        fontFamily: fantasyTokens.fonts.semiBold,
        fontSize: CAPTION_SIZE,
        lineHeight: CAPTION_SIZE,
        letterSpacing: CAPTION_SIZE * 0.16,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
});
