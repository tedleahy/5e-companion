export const SPELL_SLOT_LEVELS = 9;
export const MAX_SPELL_SLOT_COUNT = 20;

const ORDINAL_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'] as const;

/**
 * Ordinal label for a 1-based spell slot level.
 */
export function spellSlotLevelLabel(level: number): string {
    return ORDINAL_LABELS[level - 1] ?? `${level}th`;
}

/**
 * Empty nine-slot progression row.
 */
export function emptySpellSlots(): number[] {
    return Array(SPELL_SLOT_LEVELS).fill(0);
}

/**
 * Derive pact slot level + count from a nine-slot array (highest non-zero level wins).
 */
export function pactFromSpellSlots(spellSlots: readonly number[]): { level: number; count: number } {
    let level = 1;
    let count = 0;
    for (let index = 0; index < SPELL_SLOT_LEVELS; index += 1) {
        const total = spellSlots[index] ?? 0;
        if (total > 0) {
            level = index + 1;
            count = total;
        }
    }
    return { level, count };
}

/**
 * Write a single pact slot level + count into a nine-slot array.
 */
export function spellSlotsFromPact(level: number, count: number): number[] {
    const slots = emptySpellSlots();
    const clampedLevel = Math.min(SPELL_SLOT_LEVELS, Math.max(1, level));
    slots[clampedLevel - 1] = Math.max(0, count);
    return slots;
}

/**
 * Update one standard slot level in a nine-slot array.
 */
export function withSpellSlotAt(spellSlots: readonly number[], level: number, count: number): number[] {
    const slots = [...spellSlots];
    while (slots.length < SPELL_SLOT_LEVELS) slots.push(0);
    slots[level - 1] = Math.max(0, count);
    return slots.slice(0, SPELL_SLOT_LEVELS);
}
