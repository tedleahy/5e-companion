import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Event payload emitted when the visible pager page changes.
 */
export type CharacterSheetPagerPageSelectedEvent = {
    nativeEvent: {
        position: number;
    };
};

/**
 * Imperative methods exposed by the character-sheet pager.
 */
export type CharacterSheetPagerHandle = {
    setPage: (page: number) => void;
    setPageWithoutAnimation: (page: number) => void;
};

/**
 * Cross-platform props shared by native and web pager implementations.
 */
export type CharacterSheetPagerProps = {
    children: ReactNode;
    initialPage?: number;
    onPageSelected?: (event: CharacterSheetPagerPageSelectedEvent) => void;
    scrollEnabled?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
};
