import type { ScrollViewProps } from 'react-native';

/**
 * Shared scroll-view settings for input-heavy screens.
 */
export const keyboardAwareScrollProps: Pick<
    ScrollViewProps,
    'keyboardShouldPersistTaps' | 'keyboardDismissMode' | 'automaticallyAdjustKeyboardInsets'
> = {
    keyboardShouldPersistTaps: 'handled',
    keyboardDismissMode: 'on-drag',
    automaticallyAdjustKeyboardInsets: true,
};

/**
 * Extra spacing to keep between focused input and keyboard top edge.
 */
export const keyboardAwareBottomOffset = 20;
