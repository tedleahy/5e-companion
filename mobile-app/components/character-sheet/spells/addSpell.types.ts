/**
 * Spell fields used by the Add Spell sheet list.
 */
export type AddSpellListItem = {
    id: string;
    name: string;
    level: number;
    schoolIndex: string;
    classIndexes: string[];
    range?: string | null;
    ritual: boolean;
    concentration: boolean;
    castingTime: string;
};

/**
 * Spell fields required by the Add Spell detail modal.
 */
export type AddSpellDetail = AddSpellListItem & {
    description: string[];
    higherLevel: string[];
    components: string[];
    material?: string | null;
    duration?: string | null;
};

/**
 * Level-grouped spell section shape for section list rendering.
 */
export type AddSpellSection = {
    title: string;
    data: AddSpellListItem[];
};

/**
 * Reasons a spell can be visible but unavailable for selection.
 */
export type AddSpellBlockedReason = 'known' | 'selection_limit';
