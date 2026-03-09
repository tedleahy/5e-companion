import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AddSpellListItem } from '../addSpell.types';

type UseAddSpellSelectionParams = {
    knownSpellIds: string[];
    onSpellAdded: (spellId: string) => Promise<void>;
    onSpellRemoved: (spellId: string) => Promise<void>;
};

type UseAddSpellSelectionResult = {
    knownSpellIdSet: Set<string>;
    pendingSpellIds: Set<string>;
    sessionChangesCount: number;
    actionErrorMessage: string | null;
    isKnownSpell: (spellId: string) => boolean;
    clearActionErrorMessage: () => void;
    toggleSpellSelection: (spell: AddSpellListItem) => Promise<void>;
};

/**
 * Manages optimistic add/remove selection state for the Add Spell sheet.
 */
export default function useAddSpellSelection({
    knownSpellIds,
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
     * Clears any displayed add/remove action error state.
     */
    const clearActionErrorMessage = useCallback(() => {
        setActionErrorMessage(null);
    }, []);

    /**
     * Optimistically toggles one spell between known and unknown states.
     */
    const toggleSpellSelection = useCallback(async (spell: AddSpellListItem) => {
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
                await onSpellAdded(spell.id);
            } else {
                await onSpellRemoved(spell.id);
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
    }, [knownOverrides, knownSpellIdSet, onSpellAdded, onSpellRemoved]);

    return {
        knownSpellIdSet,
        pendingSpellIds,
        sessionChangesCount: knownOverrides.size,
        actionErrorMessage,
        isKnownSpell,
        clearActionErrorMessage,
        toggleSpellSelection,
    };
}
