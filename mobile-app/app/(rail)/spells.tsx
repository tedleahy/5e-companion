import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import SpellList, { type SpellListItem } from '@/components/SpellList';
import SpellFilterDrawer, { EMPTY_FILTERS, type SpellFilters } from '@/components/SpellFilterDrawer';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { gql } from '@apollo/client';
import { useRouter } from 'expo-router';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import Ionicons from '@expo/vector-icons/Ionicons';
import SearchBarInput from '@/components/SearchBarInput';

/** Parameters driving the spell search: optional name substring and structured filters. */
type SearchParams = {
    name?: string;
    filters: SpellFilters;
};

/** Number of spells requested per page for the main spell list. */
const SPELLS_PAGE_SIZE = 50;

type SearchSpellsQueryData = {
    spells: {
        id: string;
        name: string;
        level: number;
        schoolIndex: string;
        castingTime: string;
        range?: string | null;
        concentration: boolean;
        ritual: boolean;
    }[];
};

/** GraphQL query that fetches a list of spell ids/names, optionally filtered. */
const SEARCH_SPELLS = gql`
    query Spells($filter: SpellFilter, $pagination: SpellPagination) {
        spells(filter: $filter, pagination: $pagination) {
            id
            name
            level
            schoolIndex
            castingTime
            range
            concentration
            ritual
        }
    }
`;

/**
 * Main spell-browsing screen.
 *
 * Provides a search bar, filter drawer, and a scrollable spell list.
 * Redirects to the sign-in screen when the session expires.
 */
export default function SpellSearch() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        filters: EMPTY_FILTERS,
    });
    const [pendingSearchName, setPendingSearchName] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchParams((prev) => ({
                ...prev,
                name: pendingSearchName.trim() || undefined,
            }));
        }, fantasyTokens.motion.quick);

        return () => clearTimeout(timeoutId);
    }, [pendingSearchName]);

    /**
     * Converts the current {@link SearchParams} into the GraphQL `SpellFilter`
     * input object, omitting empty/unset fields so the API applies no constraint.
     */
    function buildFilterVariable(currentParams: SearchParams) {
        const { name, filters } = currentParams;
        const filter: Record<string, unknown> = {};

        if (name) filter.name = name;
        if (filters.levels.length > 0) filter.levels = filters.levels;
        if (filters.classes.length > 0) filter.classes = filters.classes;
        if (filters.ritual != null) filter.ritual = filters.ritual;
        if (filters.concentration != null) filter.concentration = filters.concentration;
        if (filters.hasHigherLevel != null) filter.hasHigherLevel = filters.hasHigherLevel;
        if (filters.hasMaterial != null) filter.hasMaterial = filters.hasMaterial;
        if (filters.components.length > 0) filter.components = filters.components;
        if (filters.rangeCategories.length > 0) filter.rangeCategories = filters.rangeCategories;
        if (filters.durationCategories.length > 0) filter.durationCategories = filters.durationCategories;
        if (filters.castingTimeCategories.length > 0) filter.castingTimeCategories = filters.castingTimeCategories;

        return Object.keys(filter).length > 0 ? filter : undefined;
    }

    const filterVariable = useMemo(() => buildFilterVariable(searchParams), [searchParams]);

    const queryVariables = useMemo(() => ({
        pagination: { limit: SPELLS_PAGE_SIZE, offset: 0 },
        ...(filterVariable ? { filter: filterVariable } : {}),
    }), [filterVariable]);

    const { data, loading, error, fetchMore } = useQuery<SearchSpellsQueryData>(SEARCH_SPELLS, {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
        returnPartialData: true,
    });
    const isUnauthenticated = isUnauthenticatedError(error);

    useEffect(() => {
        setHasMore(true);
    }, [queryVariables]);

    useEffect(() => {
        if (!data?.spells || isLoadingMore) return;
        if (data.spells.length <= SPELLS_PAGE_SIZE) {
            setHasMore(data.spells.length === SPELLS_PAGE_SIZE);
        }
    }, [data, isLoadingMore]);

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    const spells: SpellListItem[] = (data?.spells ?? []).flatMap((spell) => {
        if (!spell?.id || !spell?.name) return [];
        return [{
            id: spell.id,
            name: spell.name,
            level: spell.level,
            schoolIndex: spell.schoolIndex,
            castingTime: spell.castingTime,
            range: spell.range,
            concentration: spell.concentration,
            ritual: spell.ritual,
        }];
    });

    const activeFilterCount =
        searchParams.filters.classes.length +
        searchParams.filters.levels.length +
        (searchParams.filters.ritual != null ? 1 : 0) +
        (searchParams.filters.concentration != null ? 1 : 0) +
        (searchParams.filters.hasHigherLevel != null ? 1 : 0) +
        (searchParams.filters.hasMaterial != null ? 1 : 0) +
        searchParams.filters.components.length +
        searchParams.filters.rangeCategories.length +
        searchParams.filters.durationCategories.length +
        searchParams.filters.castingTimeCategories.length;

    /**
     * Fetches the next page of spells and merges it into the current list.
     */
    async function loadMoreSpells() {
        if (loading || isLoadingMore || !hasMore) return;

        const currentCount = data?.spells?.length ?? 0;
        let fetchedCount = 0;

        try {
            setIsLoadingMore(true);

            await fetchMore({
                variables: {
                    pagination: { limit: SPELLS_PAGE_SIZE, offset: currentCount },
                    ...(filterVariable ? { filter: filterVariable } : {}),
                },
                updateQuery(previousResult, { fetchMoreResult }) {
                    const nextSpells = fetchMoreResult?.spells ?? [];
                    fetchedCount = nextSpells.length;

                    if (nextSpells.length === 0) return previousResult;

                    const existingSpellIds = new Set(previousResult.spells.map((spell) => spell.id));
                    const deduplicatedNextSpells = nextSpells.filter(
                        (spell) => !existingSpellIds.has(spell.id),
                    );

                    return {
                        spells: [...previousResult.spells, ...deduplicatedNextSpells],
                    };
                },
            });

            setHasMore(fetchedCount === SPELLS_PAGE_SIZE);
        } catch (fetchError) {
            console.error(fetchError);
        } finally {
            setIsLoadingMore(false);
        }
    }

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.codexLabel}>Spell Codex</Text>
                    <Text style={styles.pageTitle}>All Spells</Text>
                </View>
                <View style={styles.topRow}>
                    <View style={styles.searchBarWrapper}>
                        <SearchBarInput
                            placeholder="Search spells"
                            searchText={pendingSearchName}
                            onChangeSearchText={setPendingSearchName}
                        />
                    </View>
                    <Button
                        mode="outlined"
                        onPress={() => setDrawerVisible(true)}
                        style={styles.filterButton}
                        textColor={fantasyTokens.colors.parchment}
                    >
                        <Ionicons name="filter" size={17} color={fantasyTokens.colors.parchment} />
                        {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                    </Button>
                </View>
                <SpellList
                    spells={spells}
                    loading={loading || isUnauthenticated || isLoadingMore}
                    onEndReached={loadMoreSpells}
                />
                <SpellFilterDrawer
                    visible={drawerVisible}
                    filters={searchParams.filters}
                    onClose={() => setDrawerVisible(false)}
                    onChange={(filters) => setSearchParams((prev) => ({ ...prev, filters }))}
                />
            </View>
        </RailScreenShell>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    topRow: {
        gap: 5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: fantasyTokens.spacing.xs,
        marginBottom: fantasyTokens.spacing.sm,
    },
    searchBarWrapper: {
        flex: 1,
        marginLeft: fantasyTokens.spacing.sm
    },
    filterButton: {
        borderColor: fantasyTokens.colors.gold,
        borderRadius: 5,
        paddingHorizontal: 0,
    },
    pageTitle: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 28,
        lineHeight: 32,
        marginTop: 6,
        fontWeight: '700',
        textAlign: 'center',
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.15)',
        paddingHorizontal: 22,
        paddingTop: 8,
        paddingBottom: 14,
        marginBottom: 16,
    },
    codexLabel: {
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});
