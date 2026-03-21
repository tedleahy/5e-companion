import type { ApolloCache } from '@apollo/client';
import { GET_CHARACTER_SHEET_DETAIL } from '@/graphql/characterSheet.operations';

/**
 * Minimal spellbook row shape required for cache updates.
 */
export type CachedSpellbookEntry = {
    prepared: boolean;
    spell: {
        id: string;
    };
};

type CachedCharacter = {
    id: string;
    spellbook: CachedSpellbookEntry[];
};

type CharacterSheetDetailCache = {
    character: CachedCharacter | null;
    hasCurrentUserCharacters: boolean;
};

/**
 * Mutates the active character spellbook in the character-detail cache query.
 */
function updateCharacterSpellbookInCache(
    cache: ApolloCache,
    characterId: string,
    updateSpellbook: (spellbook: CachedSpellbookEntry[]) => CachedSpellbookEntry[],
) {
    cache.updateQuery<CharacterSheetDetailCache>(
        {
            query: GET_CHARACTER_SHEET_DETAIL,
            variables: { id: characterId },
        },
        (data: CharacterSheetDetailCache | null) => {
            if (!data?.character) return data;

            return {
                ...data,
                character: {
                    ...data.character,
                    spellbook: updateSpellbook(data.character.spellbook),
                },
            };
        },
    );
}

/**
 * Applies a prepared-state update to a single spellbook row in cache.
 */
export function updateSpellPreparedInCache(
    cache: ApolloCache,
    characterId: string,
    spellId: string,
    prepared: boolean,
) {
    updateCharacterSpellbookInCache(cache, characterId, (spellbook) => {
        return spellbook.map((entry) => {
            if (entry.spell.id !== spellId) return entry;
            return { ...entry, prepared };
        });
    });
}

/**
 * Appends a learned spell to cache if the character does not already know it.
 */
export function addSpellToSpellbookInCache(
    cache: ApolloCache,
    characterId: string,
    learnedSpell: CachedSpellbookEntry,
) {
    updateCharacterSpellbookInCache(cache, characterId, (spellbook) => {
        const isAlreadyKnown = spellbook.some((entry) => entry.spell.id === learnedSpell.spell.id);
        if (isAlreadyKnown) return spellbook;

        return [...spellbook, learnedSpell];
    });
}

/**
 * Removes one spell from spellbook cache.
 */
export function removeSpellFromSpellbookInCache(
    cache: ApolloCache,
    characterId: string,
    spellId: string,
) {
    updateCharacterSpellbookInCache(cache, characterId, (spellbook) => {
        return spellbook.filter((entry) => entry.spell.id !== spellId);
    });
}
