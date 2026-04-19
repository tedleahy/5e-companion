/**
 * Global registry for unsaved changes across the app.
 * Used to intercept navigation when there are unsaved edits.
 */

type UnsavedChangesHandler = {
    /** Returns true when the current screen has unsaved changes. */
    getIsDirty: () => boolean;
    /** Callback to discard the unsaved changes (e.g., clear draft). */
    discardChanges: () => void;
};

let currentHandler: UnsavedChangesHandler | null = null;

/**
 * Registers a handler for the currently focused screen.
 * Only one handler can be active at a time (the currently focused screen).
 */
export function registerUnsavedChanges(handler: UnsavedChangesHandler): void {
    currentHandler = handler;
}

/**
 * Unregisters the current unsaved changes handler.
 */
export function unregisterUnsavedChanges(): void {
    currentHandler = null;
}

/**
 * Returns true if the currently focused screen has unsaved changes.
 */
export function hasUnsavedChanges(): boolean {
    return currentHandler?.getIsDirty() ?? false;
}

/**
 * Discards any unsaved changes for the currently focused screen.
 * Should be called after user confirms they want to discard changes.
 */
export function discardUnsavedChanges(): void {
    currentHandler?.discardChanges();
}