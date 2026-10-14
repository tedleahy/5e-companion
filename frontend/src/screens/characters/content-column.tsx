import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/** The widest the content gets, in points. */
const MAX_CONTENT_WIDTH = 1020;
/** The least space left at each side of the content when the window is narrower. */
const GUTTER = 24;

type ContentColumnProps = {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * Centers its children in the column the wide layouts share, `min(1020, width - 48)` wide, so the
 * plate, the toolbar and the list line up without measuring the window.
 */
export function ContentColumn({ children, style }: ContentColumnProps) {
    return <View style={[styles.column, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    column: {
        width: '100%',
        maxWidth: MAX_CONTENT_WIDTH + GUTTER * 2,
        alignSelf: 'center',
        paddingHorizontal: GUTTER,
    },
});
