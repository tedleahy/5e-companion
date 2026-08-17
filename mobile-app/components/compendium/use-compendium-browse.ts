import { useQuery } from '@apollo/client/react';
import type { DocumentNode } from 'graphql';
import { useMemo, useState } from 'react';
import {
    matchesCompendiumSearch,
    type SearchValue,
} from '@/components/compendium/compendium-browse-presentation';
import type {
    CompendiumCollectionData,
    CompendiumCollectionFilters,
    CompendiumCollectionItem,
} from '@/components/compendium/compendium-collection.types';

type UseCompendiumBrowseOptions<TData, TItem> = {
    document: DocumentNode;
    /** Singular category noun, e.g. `race`. Drives the search placeholder. */
    noun: string;
    select: (data: TData | undefined) => TItem[];
    /** Values searched for a given row; nested arrays are flattened. */
    searchFields: (item: TItem) => SearchValue[];
};

type UseCompendiumBrowseResult<TItem extends CompendiumCollectionItem> = {
    /** Every row the caller can see, before any filter. */
    allRows: TItem[];
    /** Rows after the Include-SRD switch only — the basis for category options. */
    sourceRows: TItem[];
    search: CompendiumCollectionFilters['search'];
    includeSrd: CompendiumCollectionFilters['includeSrd'];
    collection: CompendiumCollectionData<TItem>;
    /** Opens a row by value, e.g. a same-script peer jump. */
    selectValue: (value: string | null) => void;
};

/**
 * Shared state, query wiring, search, and Include-SRD filtering for a
 * browse-only Compendium category. Rows arrive already ordered by name from the
 * server, so no client-side sort is applied.
 *
 * Category filters (parent race, script, …) stay with the screen that owns their
 * state: layer them over `collection.items` and spread the rest of `collection`.
 * Keeping them out of here avoids a cycle, since a filter's option list is
 * itself derived from `sourceRows`.
 */
export default function useCompendiumBrowse<TData, TItem extends CompendiumCollectionItem>({
    document,
    noun,
    select,
    searchFields,
}: UseCompendiumBrowseOptions<TData, TItem>): UseCompendiumBrowseResult<TItem> {
    const [searchText, setSearchText] = useState('');
    const [includeSrd, setIncludeSrd] = useState(true);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const query = useQuery<TData>(document, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });

    const allRows = useMemo(() => select(query.data), [query.data, select]);
    const sourceRows = useMemo(
        () => allRows.filter((row) => includeSrd || row.isCustom),
        [allRows, includeSrd],
    );
    const rows = useMemo(
        () => sourceRows.filter((row) => matchesCompendiumSearch(searchText, ...searchFields(row))),
        [searchFields, searchText, sourceRows],
    );

    return {
        allRows,
        sourceRows,
        search: {
            placeholder: `Search ${noun}s`,
            value: searchText,
            onChange: setSearchText,
        },
        includeSrd: { value: includeSrd, onChange: setIncludeSrd },
        collection: {
            items: rows,
            allItems: allRows,
            selectedValue,
            onSelectedValueChange: setSelectedValue,
            loading: query.loading,
            error: query.error ? {
                message: query.error.message,
                onRetry: () => { void query.refetch(); },
            } : undefined,
        },
        selectValue: setSelectedValue,
    };
}
