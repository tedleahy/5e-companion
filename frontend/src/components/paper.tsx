import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/** Distance between the structural dots, in points. */
const DOT_PITCH = 9;
/** Distance between the accent grid lines: every third dot. */
const LINE_PITCH = 27;

type PaperProps = {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * The page background: paper with a dot grid and a coarser line grid printed on it. Fills its
 * parent. The grid stays put while anything scrollable inside it moves.
 *
 * @param props.children - The page content to render above the fixed paper grid.
 * @param props.style - Additional styles for the paper container.
 */
export function Paper({ children, style }: PaperProps) {
    // Pattern ids are global to the web document, so each Paper needs its own.
    const id = useId();
    const linesId = `${id}-lines`;
    const dotsId = `${id}-dots`;

    return (
        <View style={[styles.paper, style]}>
            {/* Without an explicit size, the web build draws the SVG at its default 300 by 150. */}
            <Svg
                width="100%"
                height="100%"
                style={StyleSheet.absoluteFill}
                aria-hidden
                pointerEvents="none"
                testID="paper-grid"
            >
                <Defs>
                    <Pattern
                        id={linesId}
                        width={LINE_PITCH}
                        height={LINE_PITCH}
                        patternUnits="userSpaceOnUse"
                    >
                        <Rect x={0} y={0} width={LINE_PITCH} height={1} fill={colors.line} />
                        <Rect x={0} y={0} width={1} height={LINE_PITCH} fill={colors.line} />
                    </Pattern>
                    <Pattern
                        id={dotsId}
                        width={DOT_PITCH}
                        height={DOT_PITCH}
                        patternUnits="userSpaceOnUse"
                    >
                        <Circle cx={DOT_PITCH / 2} cy={DOT_PITCH / 2} r={1.1} fill={colors.dot} />
                    </Pattern>
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#${linesId})`} />
                <Rect width="100%" height="100%" fill={`url(#${dotsId})`} />
            </Svg>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    paper: {
        flex: 1,
        backgroundColor: colors.paper,
    },
});
