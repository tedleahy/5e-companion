import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

import {
    characterListQueryKey,
    clampCharacterSearch,
    fetchCharacterList,
    type CharacterList,
    type CharacterSort,
} from '@/api/characters';

import { useDebouncedValue } from './use-debounced-value';

/** How long typing has to pause before the search is sent. */
export const SEARCH_DEBOUNCE_MS = 250;

/**
 * The query result from `useCharacterList`, plus which search it shows and whether one is
 * loading.
 */
export type CharacterListResult = UseQueryResult<CharacterList> & {
    /** A new search is loading while the previous search's list stays on screen. */
    isSearching: boolean;
    /**
     * The trimmed search that `data` is the result of, or undefined when `data` is the whole list.
     * It lags behind the search text while typing pauses and while the next search loads.
     */
    shownSearch: string | undefined;
};

/**
 * The player's characters and drafts. The search is trimmed, clamped to the API's length limit and
 * debounced, and a blank search asks for everything. The previous list stays in `data` while the
 * next one loads.
 *
 * @param search - The search field's text, as typed. Each change restarts the debounce.
 * @param sort - The order the API returns the characters in.
 */
export function useCharacterList(search: string, sort: CharacterSort): CharacterListResult {
    // Clamped here as well as in the search field, so no caller can send a search the API rejects.
    const q = useDebouncedValue(clampCharacterSearch(search), SEARCH_DEBOUNCE_MS) || undefined;

    const query = useQuery({
        queryKey: characterListQueryKey({ q, sort }),
        queryFn: ({ signal }) => fetchCharacterList({ q, sort }, signal),
        placeholderData: keepPreviousData,
    });

    // The search whose results are on screen. A sort change keeps the same search, so it doesn't
    // count as searching.
    const [shownQ, setShownQ] = useState(q);
    if (query.isSuccess && !query.isPlaceholderData && shownQ !== q) setShownQ(q);

    const isSearching = query.isPlaceholderData && query.isFetching && shownQ !== q;

    return { ...query, isSearching, shownSearch: shownQ };
}
