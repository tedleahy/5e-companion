import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import type {
    AddSpellSheetSpellDetailQuery,
    AddSpellSheetSpellDetailQueryVariables,
    AddSpellSheetSpellsQuery,
    AddSpellSheetSpellsQueryVariables,
} from '@/types/generated_graphql_types';
import {
    buildActiveFilterChips,
    buildAddSpellSections,
    removeActiveFilterChip,
    type ActiveFilterChip,
} from './addSpellSheetFilters';
import { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET } from './addSpellSheetQueries';
import useAddSpellSelection from './useAddSpellSelection';
import {
    buildAddSpellFilterInput,
    countActiveFilters,
    defaultFilterForClasses,
    type AddSpellFilterState,
} from '../SpellFilterState';
import type { AddSpellListItem } from '../addSpell.types';
import type { AddSpellBlockedReason } from '../addSpell.types';

/**
 * Props required to drive the add-sheet controller.
 */
type UseAddSpellSheetControllerArgs = {
    visible: boolean;
    characterClassIds: string[];
    knownSpellIds: string[];
    blockedSpellIds?: string[];
    forcedFilters?: Partial<AddSpellFilterState>;
    selectionLimit?: number;
    onSpellAdded: (spell: AddSpellListItem) => Promise<void>;
    onSpellRemoved: (spell: AddSpellListItem) => Promise<void>;
};

/**
 * State and actions exposed by the add-sheet controller.
 */
type UseAddSpellSheetControllerResult = {
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    draftFilters: AddSpellFilterState;
    setDraftFilters: Dispatch<SetStateAction<AddSpellFilterState>>;
    filterPanelOpen: boolean;
    activeFilterCount: number;
    activeFilterChips: ActiveFilterChip[];
    sections: ReturnType<typeof buildAddSpellSections>;
    loading: boolean;
    errorMessage?: string;
    pendingSpellIds: Set<string>;
    sessionChangesCount: number;
    actionErrorMessage: string | null;
    selectedSpell: AddSpellListItem | null;
    selectedSpellDetail: AddSpellSheetSpellDetailQuery['spell'] | null;
    selectedSpellDetailLoading: boolean;
    selectedSpellDetailErrorMessage?: string;
    isKnownSpell: (spellId: string) => boolean;
    blockedReasonForSpell: (spellId: string) => AddSpellBlockedReason | null;
    isBlockedSpell: (spellId: string) => boolean;
    clearActionErrorMessage: () => void;
    toggleSpellSelection: (spell: AddSpellListItem) => Promise<void>;
    openFilterPanel: () => void;
    closeFilterPanel: () => void;
    applyFilters: () => void;
    clearDraftFilters: () => void;
    removeAppliedFilterChip: (chip: ActiveFilterChip) => void;
    prefetchSpellDetail: (spellId: string) => void;
    openSpellDetail: (spell: AddSpellListItem) => void;
    clearSelectedSpell: () => void;
    retrySelectedSpellDetail: () => void;
};

/** Search debounce delay for spell list queries. */
const SEARCH_DEBOUNCE_MS = 300;

/** Maximum number of spells fetched into the add-sheet list. */
const MAX_SHEET_RESULTS = 500;

/**
 * Applies forced class/level filters without allowing the caller to override them.
 */
function mergeForcedFilters(
    filters: AddSpellFilterState,
    forcedFilters?: Partial<AddSpellFilterState>,
): AddSpellFilterState {
    if (!forcedFilters) {
        return filters;
    }

    return {
        ...filters,
        ...forcedFilters,
        classes: forcedFilters.classes ?? filters.classes,
        levels: forcedFilters.levels ?? filters.levels,
        schools: forcedFilters.schools ?? filters.schools,
        components: forcedFilters.components ?? filters.components,
        rangeCategories: forcedFilters.rangeCategories ?? filters.rangeCategories,
        durationCategories: forcedFilters.durationCategories ?? filters.durationCategories,
        castingTimeCategories: forcedFilters.castingTimeCategories ?? filters.castingTimeCategories,
        ritual: forcedFilters.ritual ?? filters.ritual,
        concentration: forcedFilters.concentration ?? filters.concentration,
        hasHigherLevel: forcedFilters.hasHigherLevel ?? filters.hasHigherLevel,
        hasMaterial: forcedFilters.hasMaterial ?? filters.hasMaterial,
    };
}

/**
 * Owns add-sheet search, filters, queries, and optimistic spell-selection state.
 *
 * This keeps data and mutation logic out of the animated sheet shell so the
 * UI component can focus on gestures and layout.
 */
export default function useAddSpellSheetController({
    visible,
    characterClassIds,
    knownSpellIds,
    blockedSpellIds = [],
    forcedFilters,
    selectionLimit,
    onSpellAdded,
    onSpellRemoved,
}: UseAddSpellSheetControllerArgs): UseAddSpellSheetControllerResult {
    const apolloClient = useApolloClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<AddSpellFilterState>(() => defaultFilterForClasses(characterClassIds));
    const [draftFilters, setDraftFilters] = useState<AddSpellFilterState>(() => defaultFilterForClasses(characterClassIds));
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [selectedSpell, setSelectedSpell] = useState<AddSpellListItem | null>(null);
    const prefetchedSpellDetailIdsRef = useRef<Set<string>>(new Set());
    const {
        pendingSpellIds,
        sessionChangesCount,
        actionErrorMessage,
        isKnownSpell,
        blockedReasonForSpell,
        isBlockedSpell,
        clearActionErrorMessage,
        toggleSpellSelection,
    } = useAddSpellSelection({
        knownSpellIds,
        blockedSpellIds,
        selectionLimit,
        onSpellAdded,
        onSpellRemoved,
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        if (visible) return;
        prefetchedSpellDetailIdsRef.current.clear();
    }, [visible]);

    const effectiveFilters = useMemo(
        () => mergeForcedFilters(appliedFilters, forcedFilters),
        [appliedFilters, forcedFilters],
    );
    const activeFilterCount = useMemo(() => countActiveFilters(effectiveFilters), [effectiveFilters]);
    const activeFilterChips = useMemo(() => buildActiveFilterChips(effectiveFilters), [effectiveFilters]);

    const filterInput = useMemo(() => {
        return buildAddSpellFilterInput(effectiveFilters, debouncedSearchQuery);
    }, [debouncedSearchQuery, effectiveFilters]);

    const queryVariables = useMemo<AddSpellSheetSpellsQueryVariables>(() => ({
        pagination: {
            limit: MAX_SHEET_RESULTS,
            offset: 0,
        },
        ...(filterInput ? { filter: filterInput } : {}),
    }), [filterInput]);

    const { data, loading, error } = useQuery<AddSpellSheetSpellsQuery, AddSpellSheetSpellsQueryVariables>(
        SEARCH_SPELLS_FOR_SHEET,
        {
            variables: queryVariables,
            skip: !visible,
            notifyOnNetworkStatusChange: true,
        },
    );

    const {
        data: selectedSpellDetailData,
        loading: selectedSpellDetailLoading,
        error: selectedSpellDetailError,
        refetch: refetchSelectedSpellDetail,
    } = useQuery<AddSpellSheetSpellDetailQuery, AddSpellSheetSpellDetailQueryVariables>(GET_SPELL_DETAIL_FOR_SHEET, {
        variables: {
            id: selectedSpell?.id ?? '',
        },
        skip: selectedSpell == null,
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
    });

    const selectedSpellDetail = useMemo(() => {
        if (!selectedSpell) return null;

        const detailSpell = selectedSpellDetailData?.spell;
        if (!detailSpell) return null;
        if (detailSpell.id !== selectedSpell.id) return null;

        return detailSpell;
    }, [selectedSpell, selectedSpellDetailData?.spell]);

    const sections = useMemo(() => buildAddSpellSections(data?.spells ?? []), [data?.spells]);

    /**
     * Opens the draft-filter panel using the latest applied filters as a base.
     */
    const openFilterPanel = useCallback(() => {
        setDraftFilters(appliedFilters);
        setFilterPanelOpen(true);
    }, [appliedFilters]);

    /**
     * Closes the draft-filter panel without applying draft changes.
     */
    const closeFilterPanel = useCallback(() => {
        setFilterPanelOpen(false);
    }, []);

    /**
     * Applies the current draft filters to the active list query.
     */
    const applyFilters = useCallback(() => {
        setAppliedFilters(draftFilters);
        setFilterPanelOpen(false);
    }, [draftFilters]);

    /**
     * Resets the draft filter UI to the class-based defaults.
     */
    const clearDraftFilters = useCallback(() => {
        setDraftFilters(defaultFilterForClasses(characterClassIds));
    }, [characterClassIds]);

    /**
     * Removes one already-applied filter chip from the active query state.
     */
    const removeAppliedFilterChip = useCallback((chip: ActiveFilterChip) => {
        setAppliedFilters((previousFilters) => removeActiveFilterChip(previousFilters, chip));
    }, []);

    /**
     * Warms Apollo cache for spell details before the full press completes.
     */
    const prefetchSpellDetail = useCallback((spellId: string) => {
        if (prefetchedSpellDetailIdsRef.current.has(spellId)) return;

        prefetchedSpellDetailIdsRef.current.add(spellId);

        void apolloClient.query<AddSpellSheetSpellDetailQuery, AddSpellSheetSpellDetailQueryVariables>({
            query: GET_SPELL_DETAIL_FOR_SHEET,
            variables: { id: spellId },
            fetchPolicy: 'cache-first',
        }).catch(() => {
            prefetchedSpellDetailIdsRef.current.delete(spellId);
        });
    }, [apolloClient]);

    /**
     * Marks one spell as selected so its details can be shown.
     */
    const openSpellDetail = useCallback((spell: AddSpellListItem) => {
        setSelectedSpell(spell);
    }, []);

    /**
     * Clears the currently selected detail spell.
     */
    const clearSelectedSpell = useCallback(() => {
        setSelectedSpell(null);
    }, []);

    /**
     * Retries the currently open spell-detail query.
     */
    const retrySelectedSpellDetail = useCallback(() => {
        if (!selectedSpell) return;
        void refetchSelectedSpellDetail({ id: selectedSpell.id });
    }, [refetchSelectedSpellDetail, selectedSpell]);

    return {
        searchQuery,
        setSearchQuery,
        draftFilters,
        setDraftFilters,
        filterPanelOpen,
        activeFilterCount,
        activeFilterChips,
        sections,
        loading,
        errorMessage: error?.message,
        pendingSpellIds,
        sessionChangesCount,
        actionErrorMessage,
        selectedSpell,
        selectedSpellDetail,
        selectedSpellDetailLoading,
        selectedSpellDetailErrorMessage: selectedSpellDetailError?.message,
        isKnownSpell,
        blockedReasonForSpell,
        isBlockedSpell,
        clearActionErrorMessage,
        toggleSpellSelection,
        openFilterPanel,
        closeFilterPanel,
        applyFilters,
        clearDraftFilters,
        removeAppliedFilterChip,
        prefetchSpellDetail,
        openSpellDetail,
        clearSelectedSpell,
        retrySelectedSpellDetail,
    };
}
