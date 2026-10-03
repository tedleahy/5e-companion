import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

/** One full turn takes this long. */
const TURN_MS = 900;

/**
 * A structural arc turning on an empty track. It holds still when the system asks for reduced
 * motion. Screen readers skip it, so put the text it stands for beside it.
 */
export function Spinner({ size }: { size: 16 | 36 | 44 }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    rotation.set(withRepeat(withTiming(360, { duration: TURN_MS, easing: Easing.linear }), -1));

    return () => {
      cancelAnimation(rotation);
      rotation.set(0);
    };
  }, [reduceMotion, rotation]);

  const turning = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Animated.View aria-hidden testID="spinner" style={[{ width: size, height: size }, turning]}>
      {/* The small size is drawn with a thicker stroke so the arc still reads at 16 points. */}
      <Svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        strokeWidth={size === 16 ? 6 : 4}
      >
        <Circle cx={18} cy={18} r={15} stroke={colors.track} />
        <Path d="M18 3a15 15 0 0 1 15 15" stroke={colors.structural} />
      </Svg>
    </Animated.View>
  );
}
