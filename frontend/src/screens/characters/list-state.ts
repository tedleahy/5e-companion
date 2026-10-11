import { ApiError } from '@/api/client';
import type { CharacterList, Draft } from '@/api/characters';

/** What the list area shows. The header and the controls around it follow from this. */
export type ListState =
    /** No list yet: the first load, or Try again while it runs. */
    | { kind: 'loading' }
    /** The API rejected the development token. */
    | { kind: 'signedOut' }
    /** Any other error, with Try again. */
    | { kind: 'failed' }
    /** No search, no characters and no drafts. */
    | { kind: 'empty' }
    /** No search and no characters, but drafts to finish. */
    | { kind: 'draftsOnly'; drafts: Draft[] }
    /** A search that matched no characters. Drafts ignore the search, so they still show. */
    | { kind: 'noResults'; search: string; drafts: Draft[] }
    /** Characters to show, with any drafts above them. */
    | { kind: 'list'; list: CharacterList };

/** What `listState` decides from. */
export type ListStateInput = {
    data: CharacterList | undefined;
    error: Error | null;
    shownSearch: string | undefined;
    retrying: boolean;
};

/**
 * Chooses what the list shows. Either error replaces the list, even one already on screen, and
 * Try again shows the first-load spinner in place of the notice until it settles.
 *
 * @param input.data - The list on screen, which may be the previous search's while the next loads.
 * @param input.error - The query's error, which wins over any list on screen.
 * @param input.shownSearch - The search `data` came from. Deciding by the typed text instead would
 *   show the wrong state while a new search waits to send or loads.
 * @param input.retrying - Whether Try again's request is still running.
 */
export function listState({ data, error, shownSearch, retrying }: ListStateInput): ListState {
    if (retrying) return { kind: 'loading' };

    if (error) {
        return error instanceof ApiError && error.status === 401
            ? { kind: 'signedOut' }
            : { kind: 'failed' };
    }

    if (!data) return { kind: 'loading' };

    if (data.characters.length > 0) return { kind: 'list', list: data };

    if (shownSearch) return { kind: 'noResults', search: shownSearch, drafts: data.drafts };

    return data.drafts.length > 0 ? { kind: 'draftsOnly', drafts: data.drafts } : { kind: 'empty' };
}

/**
 * Whether search and sort show. They are hidden when there is nothing to search, and always when
 * signed out.
 *
 * @param state - What the list is showing.
 * @param search - The search field's text, as typed. Once the player has typed something the field
 *   stays, even while the list on screen is an earlier, unsearched one with nothing in it, so it
 *   never disappears while it's being typed in.
 */
export function showsSearch(state: ListState, search: string): boolean {
    if (state.kind === 'signedOut') return false;

    if (search.trim() !== '') return true;

    return (
        state.kind === 'loading' ||
        state.kind === 'failed' ||
        state.kind === 'list' ||
        state.kind === 'noResults'
    );
}

/**
 * Whether Create character shows. Creating can't work until the token does.
 *
 * @param state - What the list is showing.
 */
export function showsCreate(state: ListState): boolean {
    return state.kind !== 'signedOut';
}
