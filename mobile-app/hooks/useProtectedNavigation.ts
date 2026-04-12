import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { hasUnsavedChanges, discardUnsavedChanges } from '@/lib/unsavedChanges';

/**
 * Shows a confirmation dialog when there are unsaved changes.
 * Returns a promise that resolves to true if the user chooses to discard,
 * false if they choose to keep editing.
 */
async function confirmDiscardChanges(): Promise<boolean> {
    return new Promise((resolve) => {
        Alert.alert(
            'Discard changes?',
            'You have unsaved changes to your character sheet. Are you sure you want to discard them?',
            [
                { text: 'Keep Editing', style: 'cancel', onPress: () => resolve(false) },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                        discardUnsavedChanges();
                        resolve(true);
                    },
                },
            ],
        );
    });
}

/**
 * Provides navigation functions that intercept navigation when there are unsaved changes.
 * Use this hook in place of `useRouter()` for any navigation that could lose unsaved edits.
 */
export default function useProtectedNavigation() {
    const router = useRouter();

    const push = useCallback(async (href: string) => {
        if (hasUnsavedChanges()) {
            const shouldDiscard = await confirmDiscardChanges();
            if (!shouldDiscard) {
                // User chose to keep editing, do not navigate
                return;
            }
        }
        router.push(href);
    }, [router]);

    const replace = useCallback(async (href: string) => {
        if (hasUnsavedChanges()) {
            const shouldDiscard = await confirmDiscardChanges();
            if (!shouldDiscard) {
                return;
            }
        }
        router.replace(href);
    }, [router]);

    const back = useCallback(async () => {
        if (hasUnsavedChanges()) {
            const shouldDiscard = await confirmDiscardChanges();
            if (!shouldDiscard) {
                return;
            }
        }
        router.back();
    }, [router]);

    return { push, replace, back };
}