import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

import {
  characterListQueryKey,
  fetchCharacterList,
  type CharacterList,
  type CharacterSort,
} from '@/api/characters';

import { useDebouncedValue } from './use-debounced-value';

/** How long typing has to pause before the search is sent. */
export const SEARCH_DEBOUNCE_MS = 250;

/** The query result from `useCharacterList`, plus whether a search is loading. */
export type CharacterListResult = UseQueryResult<CharacterList> & {
  /** A new search is loading while the previous search's list stays on screen. */
  isSearching: boolean;
};

/**
 * The player's characters and drafts. The search is trimmed and debounced, and a blank search asks
 * for everything. The previous list stays in `data` while the next one loads.
 */
export function useCharacterList(search: string, sort: CharacterSort): CharacterListResult {
  const q = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS) || undefined;

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

  return { ...query, isSearching };
}
