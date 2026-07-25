import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';
import CompendiumBackControl, {
    COMPENDIUM_BACK_CONTROL_HEIGHT,
    COMPENDIUM_BACK_HIT_SLOP,
    COMPENDIUM_BACK_SLOT_WIDTH,
    compendiumBackToneColors,
} from '@/components/compendium/compendium-back-control';

const MIN_TOUCH_TARGET = 44;

/** Alpha channel of an `rgba(...)` token, used to prove a press wash is visible. */
function alphaOf(color: unknown) {
    return Number(/rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(String(color))?.[1]);
}

function renderControl() {
    const onPress = jest.fn();
    render(
        <CompendiumBackControl
            accessibilityLabel="Back to all classes"
            tone="ink"
            onPress={onPress}
        />,
    );
    return { onPress, button: screen.getByRole('button', { name: 'Back to all classes' }) };
}

describe('CompendiumBackControl', () => {
    it('exposes a fixed Back caption with the provided accessibility label', () => {
        const { onPress, button } = renderControl();

        expect(screen.getByText('Back')).toBeTruthy();
        fireEvent.press(button);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders at the exported height so callers can reserve layout space', () => {
        const { button } = renderControl();

        const style = StyleSheet.flatten(button.props.style);
        expect(style.height).toBe(COMPENDIUM_BACK_CONTROL_HEIGHT);
        expect(style.width).toBe(COMPENDIUM_BACK_SLOT_WIDTH);
    });

    it('expands to at least a 44dp press target via hit slop', () => {
        const { button } = renderControl();

        const hitSlop = button.props.hitSlop;
        expect(hitSlop).toEqual(COMPENDIUM_BACK_HIT_SLOP);
        expect(COMPENDIUM_BACK_CONTROL_HEIGHT + hitSlop.top + hitSlop.bottom)
            .toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        expect(COMPENDIUM_BACK_SLOT_WIDTH + hitSlop.left + hitSlop.right)
            .toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    });

    it('washes each tone with a visible press background', () => {
        expect(compendiumBackToneColors('ink', false).background).toBeUndefined();

        const inkPressed = compendiumBackToneColors('ink', true);
        expect(inkPressed.background).toBe(fantasyTokens.colors.claretPressed);
        expect(alphaOf(inkPressed.background)).toBeGreaterThanOrEqual(0.08);

        const goldPressed = compendiumBackToneColors('gold', true);
        expect(goldPressed.background).toBe(fantasyTokens.rail.pressed);
        expect(goldPressed.color).toBe(fantasyTokens.colors.goldLight);
    });

    it('keeps the caption legible at device scale', () => {
        renderControl();

        const caption = StyleSheet.flatten(screen.getByText('Back').props.style);
        expect(caption.fontSize).toBeGreaterThanOrEqual(10);
    });
});
