import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AddSpellBlockedReason, AddSpellListItem } from '../addSpell.types';

type UseAddSpellSelectionParams = {
    knownSpellIds: string[];
    blockedSpellIds?: string[];
    selectionLimit?: number;
    onSpellAdded: (spell: AddSpellListItem) => Promise<void>;
    onSpellRemoved: (spell: AddSpellListItem) => Promise<void>;
};

type UseAddSpellSelectionResult = {
    knownSpellIdSet: Set<string>;
    pendingSpellIds: Set<string>;
    sessionChangesCount: number;
    actionErrorMessage: string | null;
    isKnownSpell: (spellId: string) => boolean;
    blockedReasonForSpell: (spellId: string) => AddSpellBlockedReason | null;
    isBlockedSpell: (spellId: string) => boolean;
    clearActionErrorMessage: () => void;
    toggleSpellSelection: (spell: AddSpellListItem) => Promise<void>;
};

/**
 * Manages optimistic add/remove selection state for the Add Spell sheet.
 */
export default function useAddSpellSelection({
    knownSpellIds,
    blockedSpellIds = [],
    selectionLimit,
    onSpellAdded,
    onSpellRemoved,
}: UseAddSpellSelectionParams): UseAddSpellSelectionResult {
    const [knownOverrides, setKnownOverrides] = useState<Map<string, boolean>>(new Map());
    const [pendingSpellIds, setPendingSpellIds] = useState<Set<string>>(new Set());
    const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
    const inFlightSpellIdsRef = useRef<Set<string>>(new Set());

    const knownSpellIdSet = useMemo(() => {
        const ids = new Set(knownSpellIds);

        for (const [spellId, isKnown] of knownOverrides.entries()) {
            if (isKnown) {
                ids.add(spellId);
                continue;
            }

            ids.delete(spellId);
        }

        return ids;
    }, [knownOverrides, knownSpellIds]);
    const blockedSpellIdSet = useMemo(() => new Set(blockedSpellIds), [blockedSpellIds]);
    const selectionLimitReached = useMemo(() => {
        if (selectionLimit == null || selectionLimit < 1) {
            return false;
        }

        return knownSpellIdSet.size >= selectionLimit;
    }, [knownSpellIdSet.size, selectionLimit]);

    useEffect(() => {
        const knownIds = new Set(knownSpellIds);

        setKnownOverrides((previousOverrides) => {
            const nextOverrides = new Map(previousOverrides);
            let hasChanged = false;

            for (const [spellId, overrideKnown] of previousOverrides.entries()) {
                const baseKnown = knownIds.has(spellId);
                if (baseKnown === overrideKnown) {
                    nextOverrides.delete(spellId);
                    hasChanged = true;
                }
            }

            return hasChanged ? nextOverrides : previousOverrides;
        });
    }, [knownSpellIds]);

    /**
     * Returns whether a spell is currently selected as known.
     */
    const isKnownSpell = useCallback((spellId: string) => {
        return knownSpellIdSet.has(spellId);
    }, [knownSpellIdSet]);

    /**
     * Returns why a spell is blocked from selection in the current flow.
     */
    const blockedReasonForSpell = useCallback((spellId: string): AddSpellBlockedReason | null => {
        if (knownSpellIdSet.has(spellId)) {
            return null;
        }

        if (blockedSpellIdSet.has(spellId)) {
            return 'known';
        }

        if (selectionLimitReached) {
            return 'selection_limit';
        }

        return null;
    }, [blockedSpellIdSet, knownSpellIdSet, selectionLimitReached]);

    /**
     * Returns whether a spell is blocked from selection in the current flow.
     */
    const isBlockedSpell = useCallback((spellId: string) => {
        return blockedReasonForSpell(spellId) != null;
    }, [blockedReasonForSpell]);

    /**
     * Clears any displayed add/remove action error state.
     */
    const clearActionErrorMessage = useCallback(() => {
        setActionErrorMessage(null);
    }, []);

    /**
     * Optimistically toggles one spell between known and unknown states.
     */
    const toggleSpellSelection = useCallback(async (spell: AddSpellListItem) => {
        if (blockedReasonForSpell(spell.id) != null) {
            return;
        }

        if (inFlightSpellIdsRef.current.has(spell.id)) return;
        inFlightSpellIdsRef.current.add(spell.id);

        const currentlyKnown = knownSpellIdSet.has(spell.id);
        const nextKnown = !currentlyKnown;
        const previousOverride = knownOverrides.get(spell.id);

        setKnownOverrides((previousOverrides) => {
            const nextOverrides = new Map(previousOverrides);
            nextOverrides.set(spell.id, nextKnown);
            return nextOverrides;
        });
        setPendingSpellIds((previousIds) => {
            const nextIds = new Set(previousIds);
            nextIds.add(spell.id);
            return nextIds;
        });
        setActionErrorMessage(null);

        try {
            if (nextKnown) {
                await onSpellAdded(spell);
            } else {
                await onSpellRemoved(spell);
            }
        } catch (mutationError) {
            console.error('Failed to toggle spell selection', {
                spellId: spell.id,
                nextKnown,
                error: mutationError,
            });

            setKnownOverrides((previousOverrides) => {
                const nextOverrides = new Map(previousOverrides);

                if (previousOverride == null) {
                    nextOverrides.delete(spell.id);
                } else {
                    nextOverrides.set(spell.id, previousOverride);
                }

                return nextOverrides;
            });

            setActionErrorMessage(
                nextKnown
                    ? 'Failed to add spell. Please try again.'
                    : 'Failed to remove spell. Please try again.',
            );
        } finally {
            inFlightSpellIdsRef.current.delete(spell.id);
            setPendingSpellIds((previousIds) => {
                const nextIds = new Set(previousIds);
                nextIds.delete(spell.id);
                return nextIds;
            });
        }
    }, [blockedReasonForSpell, knownOverrides, knownSpellIdSet, onSpellAdded, onSpellRemoved]);

    return {
        knownSpellIdSet,
        pendingSpellIds,
        sessionChangesCount: knownOverrides.size,
        actionErrorMessage,
        isKnownSpell,
        blockedReasonForSpell,
        isBlockedSpell,
        clearActionErrorMessage,
        toggleSpellSelection,
    };
}
