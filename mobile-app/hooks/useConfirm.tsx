import { useCallback, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

type ConfirmOptions = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
};

type UseConfirmResult = {
    /**
     * Opens the confirmation dialog with the given options.
     * Calls `onConfirm` if the user confirms, or `onCancel` if they dismiss.
     */
    confirm: (options: ConfirmOptions) => void;
    /** Render this element at the top level of your component tree. */
    confirmDialogElement: React.ReactElement | null;
};

/**
 * Cross-platform alternative to `Alert.alert` for confirmation dialogs.
 * Returns a `confirm` function and a `confirmDialogElement` to render in JSX.
 *
 * @example
 * const { confirm, confirmDialogElement } = useConfirm();
 *
 * function handleClose() {
 *     confirm({
 *         title: 'Discard changes?',
 *         message: 'Your changes will be lost.',
 *         confirmLabel: 'Discard',
 *         cancelLabel: 'Keep Editing',
 *         onConfirm: () => closeSheet(),
 *     });
 * }
 *
 * return (
 *     <>
 *         {confirmDialogElement}
 *         <MyComponent onClose={handleClose} />
 *     </>
 * );
 */
export default function useConfirm(): UseConfirmResult {
    const [dialogState, setDialogState] = useState<ConfirmOptions | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        setDialogState(options);
    }, []);

    function handleConfirm() {
        dialogState?.onConfirm();
        setDialogState(null);
    }

    function handleCancel() {
        dialogState?.onCancel?.();
        setDialogState(null);
    }

    const confirmDialogElement = dialogState ? (
        <ConfirmDialog
            visible={true}
            title={dialogState.title}
            message={dialogState.message}
            confirmLabel={dialogState.confirmLabel}
            cancelLabel={dialogState.cancelLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    ) : null;

    return { confirm, confirmDialogElement };
}
