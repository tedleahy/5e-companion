import Svg, { Path } from 'react-native-svg';

/**
 * The × on the search field's clear button, drawn at 14 points. Decorative, because the button
 * carries the name.
 *
 * @param props.color - The ink used to draw the strokes.
 */
export function ClearIcon({ color }: { color: string }) {
    return (
        <Svg
            width={14}
            height={14}
            viewBox="0 0 16 16"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            aria-hidden
            testID="clear-icon"
        >
            <Path d="M4 4l8 8M12 4l-8 8" />
        </Svg>
    );
}
