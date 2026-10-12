import { useState, type ReactNode } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View,
    type FocusEvent,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { colors, offsetShadow, type Colors, type ShadowDepth } from '@/theme';

type PrintPressableProps = Omit<PressableProps, 'style' | 'children' | 'hitSlop'> & {
    depth: ShadowDepth;
    shadowToken?: keyof Colors;
    onPlate?: boolean;
    hitSlop?: number;
    style?: StyleProp<ViewStyle>;
    children?: ReactNode;
};

/**
 * A pressable printed surface with an offset shadow. Pressing it sinks it onto its shadow: it moves
 * by the shadow's offset and the shadow goes. On web, focusing it from the keyboard draws an
 * outline around it.
 *
 * React Native Web ignores `hitSlop` on `Pressable`, so on web an invisible view reaches past the
 * edges instead. Presses on it count as presses on this.
 *
 * @param props - The surface appearance, content, and remaining Pressable options to forward.
 * @param props.depth - The shadow offset in points, also used as the distance the surface moves when pressed.
 * @param props.shadowToken - The shadow color token. Defaults to accent.
 * @param props.onPlate - Whether the surface sits on the structural plate and needs a light focus ring.
 * @param props.style - Styles for the surface, including any border used to size the web hit area.
 * @param props.onPressIn - Receives the press event after the surface sinks onto its shadow.
 * @param props.onPressOut - Receives the release event after the surface returns to its resting position.
 * @param props.onFocus - Receives the focus event after keyboard focus visibility is updated.
 * @param props.onBlur - Receives the blur event after the focus ring is hidden.
 * @param props.hitSlop - The distance in points that presses count beyond each edge on web and native.
 * @param props.children - The content printed on the pressable surface.
 */
export function PrintPressable({
    depth,
    shadowToken = 'accent',
    onPlate = false,
    style,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
    hitSlop,
    children,
    ...props
}: PrintPressableProps) {
    const [pressed, setPressed] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);

    return (
        <Pressable
            {...props}
            hitSlop={hitSlop}
            onPressIn={(event) => {
                setPressed(true);
                onPressIn?.(event);
            }}
            onPressOut={(event) => {
                setPressed(false);
                onPressOut?.(event);
            }}
            onFocus={(event) => {
                setFocusVisible(isFocusVisible(event));
                onFocus?.(event);
            }}
            onBlur={(event) => {
                setFocusVisible(false);
                onBlur?.(event);
            }}
            style={[
                style,
                pressed
                    ? { transform: [{ translateX: depth }, { translateY: depth }] }
                    : { boxShadow: offsetShadow(depth, shadowToken) },
                focusVisible && [
                    styles.focusRing,
                    { outlineColor: onPlate ? colors.onStructural : colors.structural },
                ],
            ]}
        >
            {Platform.OS === 'web' && hitSlop ? (
                <View
                    aria-hidden
                    testID="hit-area"
                    style={[
                        styles.hitArea,
                        hitAreaInsets(hitSlop, StyleSheet.flatten(style)?.borderWidth),
                    ]}
                />
            ) : null}
            {children}
        </Pressable>
    );
}

/**
 * Insets for the web hit area. An absolute child is placed from inside the border, so the border's
 * width is added to reach `hitSlop` past the outer edge.
 *
 * @param hitSlop - The touch-target extension beyond each outer edge, in points.
 * @param borderWidth - The surface border width to cross before reaching the outer edge.
 */
function hitAreaInsets(hitSlop: number, borderWidth = 0): ViewStyle {
    const inset = -(hitSlop + borderWidth);
    return { top: inset, right: inset, bottom: inset, left: inset };
}

/**
 * Whether a focus should show the ring. Only on web, and only where the browser would show its
 * own focus indicator: a click focuses the element too, but shouldn't leave a ring behind.
 */
function isFocusVisible(event: FocusEvent): boolean {
    if (Platform.OS !== 'web') return false;

    // On web, React Native Web hands over the DOM event, so the target is the element itself.
    const target = event.currentTarget as unknown as Partial<Pick<Element, 'matches'>>;
    return target.matches?.(':focus-visible') ?? true;
}

const styles = StyleSheet.create({
    hitArea: {
        position: 'absolute',
    },
    focusRing: {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 3,
    },
});
