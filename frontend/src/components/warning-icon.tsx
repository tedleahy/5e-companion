import Svg, { Path } from 'react-native-svg';

/**
 * The outlined warning triangle on a notice. Decorative, so screen readers skip it.
 *
 * @param props.color - The stroke's ink.
 * @param props.size - The width and height in points: 18 on phones, 20 from tablet up.
 */
export function WarningIcon({ color, size }: { color: string; size: 18 | 20 }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            aria-hidden
            testID="warning-icon"
        >
            <Path d="M8 2.2 14.4 13.6H1.6z" />
            <Path d="M8 6.4v3.4M8 11.1v1.1" />
        </Svg>
    );
}
