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
  /** How far the offset shadow sits from the surface, and how far a press moves it. */
  depth: ShadowDepth;
  /** The shadow's colour token. Accent unless the surface is itself accent. */
  shadowToken?: keyof Colors;
  /** Sits on the structural plate, so the focus ring is drawn in `onStructural` to show against it. */
  onPlate?: boolean;
  /** How far, in points, presses still count past each edge. Works on web as well as native. */
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
          style={[styles.hitArea, hitAreaInsets(hitSlop, StyleSheet.flatten(style)?.borderWidth)]}
        />
      ) : null}
      {children}
    </Pressable>
  );
}

/**
 * Insets for the web hit area. An absolute child is placed from inside the border, so the border's
 * width is added to reach `hitSlop` past the outer edge.
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
