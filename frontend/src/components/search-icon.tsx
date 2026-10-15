import Svg, { Circle, Path } from 'react-native-svg';

/**
 * The magnifying glass in the search field, drawn at 15 points. Decorative, so screen readers skip it.
 *
 * @param props.color - The ink used to draw the magnifying glass stroke.
 */
export function SearchIcon({ color }: { color: string }) {
    return (
        <Svg
            width={15}
            height={15}
            viewBox="0 0 16 16"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            aria-hidden
            testID="search-icon"
        >
            <Circle cx={7} cy={7} r={4.6} />
            <Path d="M10.5 10.5 14 14" />
        </Svg>
    );
}
