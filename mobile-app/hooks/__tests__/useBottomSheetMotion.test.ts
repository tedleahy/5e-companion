import { act, renderHook } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import useBottomSheetMotion from '../useBottomSheetMotion';

/** Fires the most recently registered `hardwareBackPress` listener, mirroring the native LIFO dispatch order. */
function pressHardwareBack(): boolean | void {
    const calls = (BackHandler.addEventListener as jest.Mock).mock.calls;
    const topListener = calls.at(-1)?.[1] as (() => boolean) | undefined;
    return topListener?.();
}

describe('useBottomSheetMotion back-stack', () => {
    beforeEach(() => {
        (BackHandler.addEventListener as jest.Mock).mockClear();
    });

    it('registers a hardware back listener while rendered and removes it once dismissed', () => {
        const onClose = jest.fn();
        const { rerender } = renderHook(
            ({ visible }: { visible: boolean }) => useBottomSheetMotion({ visible, windowHeight: 800, onClose }),
            { initialProps: { visible: true } },
        );

        expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
        const subscription = (BackHandler.addEventListener as jest.Mock).mock.results[0]?.value;

        act(() => {
            rerender({ visible: false });
        });

        expect(subscription.remove).toHaveBeenCalled();
    });

    it('closes only the topmost sheet when two sheets are rendered, leaving the parent open', () => {
        const onCloseParent = jest.fn();
        const onCloseChild = jest.fn();

        renderHook(() => useBottomSheetMotion({ visible: true, windowHeight: 800, onClose: onCloseParent }));
        // The child sheet mounts after the parent, so its listener registers later and is called first.
        renderHook(() => useBottomSheetMotion({ visible: true, windowHeight: 800, onClose: onCloseChild }));

        act(() => {
            expect(pressHardwareBack()).toBe(true);
        });

        expect(onCloseChild).toHaveBeenCalledTimes(1);
        expect(onCloseParent).not.toHaveBeenCalled();
    });

    it('lets onRequestClose veto the dismiss without invoking onClose', () => {
        const onClose = jest.fn();
        const onRequestClose = jest.fn(() => false);

        renderHook(() => useBottomSheetMotion({ visible: true, windowHeight: 800, onRequestClose, onClose }));

        act(() => {
            pressHardwareBack();
        });

        expect(onRequestClose).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });
});
