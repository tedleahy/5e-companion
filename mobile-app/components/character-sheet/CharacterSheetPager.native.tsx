import { Children, forwardRef, useImperativeHandle, useRef } from 'react';
import type { ForwardedRef } from 'react';
import PagerView from 'react-native-pager-view';
import type {
    CharacterSheetPagerHandle,
    CharacterSheetPagerProps,
} from './CharacterSheetPager.types';

/**
 * Native pager implementation backed by react-native-pager-view.
 */
function CharacterSheetPager(
    { children, ...props }: CharacterSheetPagerProps,
    ref: ForwardedRef<CharacterSheetPagerHandle>,
) {
    const pagerRef = useRef<PagerView>(null);
    const pages = Children.toArray(children);

    useImperativeHandle(ref, () => ({
        setPage(page: number) {
            pagerRef.current?.setPage(page);
        },
        setPageWithoutAnimation(page: number) {
            pagerRef.current?.setPageWithoutAnimation(page);
        },
    }), []);

    return (
        <PagerView
            ref={pagerRef}
            {...props}
        >
            {pages}
        </PagerView>
    );
}

export default forwardRef(CharacterSheetPager);
