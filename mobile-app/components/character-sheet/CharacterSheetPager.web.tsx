import { Children, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { ComponentType, ForwardedRef, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewProps } from 'react-native';
import type {
    CharacterSheetPagerHandle,
    CharacterSheetPagerProps,
} from './CharacterSheetPager.types';

type WebPagerContainerProps = {
    children: ReactNode;
    scrollEnabled: boolean;
    style?: CharacterSheetPagerProps['style'];
    testID?: string;
};

const PagerContainerView = View as unknown as ComponentType<ViewProps & { scrollEnabled?: boolean }>;

/**
 * Web fallback container that keeps pager-only props available in tests.
 */
function WebPagerContainer({ children, scrollEnabled, style, testID }: WebPagerContainerProps) {
    return (
        <PagerContainerView
            testID={testID}
            style={style}
            scrollEnabled={scrollEnabled}
        >
            {children}
        </PagerContainerView>
    );
}

/**
 * Web-safe pager fallback that swaps visible pages without importing
 * native-only pager code.
 */
function CharacterSheetPager(
    {
        children,
        initialPage = 0,
        scrollEnabled = true,
        style,
        testID,
    }: CharacterSheetPagerProps,
    ref: ForwardedRef<CharacterSheetPagerHandle>,
) {
    const pages = Children.toArray(children);
    const [pageIndex, setPageIndex] = useState(initialPage);

    useEffect(() => {
        setPageIndex((previousPage) => {
            if (pages.length === 0) return 0;
            return Math.min(previousPage, pages.length - 1);
        });
    }, [pages.length]);

    useImperativeHandle(ref, () => ({
        setPage(page: number) {
            setPageIndex(page);
        },
        setPageWithoutAnimation(page: number) {
            setPageIndex(page);
        },
    }), []);

    return (
        <WebPagerContainer
            testID={testID}
            style={style}
            scrollEnabled={scrollEnabled}
        >
            {pages.map((page, index) => (
                <View
                    key={index}
                    style={index === pageIndex ? styles.pageVisible : styles.pageHidden}
                >
                    {page}
                </View>
            ))}
        </WebPagerContainer>
    );
}

/** Styles for the web pager fallback. */
const styles = StyleSheet.create({
    pageVisible: {
        flex: 1,
    },
    pageHidden: {
        display: 'none',
    },
});

export default forwardRef(CharacterSheetPager);
