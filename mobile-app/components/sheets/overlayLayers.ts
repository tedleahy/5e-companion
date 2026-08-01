/**
 * Shared Portal overlay stacking for BottomSheetShell hosts.
 * Nested pickers must use a layer above their parent sheet.
 */
export const OVERLAY_LAYER = {
    /** Default standalone sheet (e.g. Add Spell on the Spells tab). */
    base: 20,
    /** Primary editor / wizard sheets that host nested pickers. */
    sheet: 30,
    /** Child pickers opened above a sheet-layer parent. */
    nestedSheet: 40,
} as const;

export type OverlayLayer = (typeof OVERLAY_LAYER)[keyof typeof OVERLAY_LAYER];
