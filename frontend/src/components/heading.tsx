import { Text, type TextProps } from 'react-native';

/** Where a heading sits in the screen's outline: 1 for the screen title, then each level under it. */
export type HeadingLevel = 1 | 2 | 3;

type HeadingProps = Omit<TextProps, 'role'> & {
    level: HeadingLevel;
};

/**
 * Text that screen readers treat as a heading at `level`. It only sets semantics, so style it as
 * any other text.
 *
 * React Native Web renders a heading without a level as an `h1`, which would make every heading on
 * a screen top level. React Native's types leave out `aria-level`, which only the web reads, so it
 * is passed outside the typed props. Native screen readers have no heading levels and ignore it.
 *
 * @param props.level - The heading's depth, which becomes `h1` to `h3` on the web.
 * @param props - Any other `Text` props, such as `style` and the heading's text as `children`.
 */
export function Heading({ level, ...props }: HeadingProps) {
    const webLevel: Record<string, number> = { 'aria-level': level };

    return <Text role="heading" {...webLevel} {...props} />;
}
