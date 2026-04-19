import { useCallback } from 'react';
import { Keyboard } from 'react-native';

/**
 * Returns a stable function that dismisses the keyboard before running the supplied action.
 *
 * Use this when a button or gesture should close the soft keyboard before performing
 * its primary effect (e.g., navigating steps, closing a sheet, toggling a selection).
 */
export default function useDismissKeyboardAction() {
    const dismissKeyboardAndRun = useCallback((action: () => void) => {
        Keyboard.dismiss();
        action();
    }, []);

    return dismissKeyboardAndRun;
}