import type { ApolloCache } from '@apollo/client';
import { GET_CURRENT_USER_CHARACTER_SHEETS } from '@/graphql/characterSheet.operations';

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

type CurrentUserCharactersCache = {
    currentUserCharacters: CachedCharacter[];
};

/**
 * Mutates one character's spellbook in the current-user cache query.
 */
function updateCharacterSpellbookInCache(
    cache: ApolloCache,
    characterId: string,
    updateSpellbook: (spellbook: CachedSpellbookEntry[]) => CachedSpellbookEntry[],
) {
    cache.updateQuery<CurrentUserCharactersCache>(
        { query: GET_CURRENT_USER_CHARACTER_SHEETS },
        (data: CurrentUserCharactersCache | null) => {
            if (!data) return data;

            return {
                ...data,
                currentUserCharacters: data.currentUserCharacters.map((currentCharacter) => {
                    if (currentCharacter.id !== characterId) return currentCharacter;

                    return {
                        ...currentCharacter,
                        spellbook: updateSpellbook(currentCharacter.spellbook),
                    };
                }),
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
