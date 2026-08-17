type FocusListener = (focused: boolean) => void;

const listeners = new Set<FocusListener>();

/** Registers a mounted screen's focus setter. Returns an unregister function. */
export function registerFocusListener(listener: FocusListener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

/**
 * Blurs every mounted screen, as expo-router does when navigating away to a
 * sibling that stays in the stack. Screens are not unmounted.
 */
export function blurFocusedScreens() {
    for (const listener of listeners) listener(false);
}

/** Refocuses every mounted screen, as popping back to it does. */
export function focusScreens() {
    for (const listener of listeners) listener(true);
}
