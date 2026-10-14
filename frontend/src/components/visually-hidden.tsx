import { StyleSheet, View, type ViewProps } from 'react-native';

/**
 * Content that screen readers read but nobody sees, like the web's visually hidden pattern. Use it
 * for text that only a screen reader needs, such as a status beside a spinner. It takes any
 * `View` prop, such as a `role` that makes it a live region.
 *
 * @param props - The `View` props to pass on. Its own style comes last, so it can't be overridden
 *   into showing.
 */
export function VisuallyHidden({ style, ...props }: ViewProps) {
    return <View {...props} style={[style, styles.hidden]} />;
}

const styles = StyleSheet.create({
    // One point square rather than zero, because some screen readers skip an element with no size.
    hidden: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
});
