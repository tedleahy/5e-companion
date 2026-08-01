/**
 * Pure editor-session helpers for CustomClassEditor open/reset/dirty tracking.
 */

/**
 * True when the sheet transitions from closed to open — the only time an editor
 * session should re-seed its draft from `initial`.
 */
export function isEditorSessionOpenChange(visible: boolean, wasVisible: boolean): boolean {
    return visible && !wasVisible;
}

/**
 * Applies a draft patch and marks the editor dirty. Extracted so UI update handlers
 * stay thin and dirty tracking does not rely on serialising the full draft each render.
 */
export function applyDraftPatch<T extends object>(
    current: T,
    patch: Partial<T>,
): { next: T; dirty: true } {
    return { next: { ...current, ...patch }, dirty: true };
}
