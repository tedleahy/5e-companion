/**
 * Flat spell row data consumed by spell list UIs.
 */
export type SpellListItem = {
    id: string;
    name: string;
    level?: number | null;
    schoolIndex?: string | null;
    castingTime?: string | null;
    range?: string | null;
    concentration?: boolean | null;
    ritual?: boolean | null;
    prepared?: boolean | null;
};

/**
 * Action context exposed to accordion action renderers.
 */
export type SpellAccordionActionContext = {
    spell: SpellListItem;
    isPrepared: boolean;
    isRemoving: boolean;
    openSpellDetails: () => void;
    closeAccordion: () => void;
    togglePrepared?: () => void;
    removeSpell?: () => Promise<void>;
};
