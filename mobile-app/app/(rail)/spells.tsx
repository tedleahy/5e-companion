import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import SpellList, { type SpellListItem } from '@/components/SpellList';
import SpellFilterDrawer from '@/components/SpellFilterDrawer';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { gql } from '@apollo/client';
import { useRouter } from 'expo-router';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import Ionicons from '@expo/vector-icons/Ionicons';
import SearchBarInput from '@/components/SearchBarInput';
import {
    buildSpellFilterInput,
    countActiveSpellFilters,
    EMPTY_SPELL_FILTERS,
    type SpellFilterState,
} from '@/lib/spellFilters';
import { SPELL_LIST_FIELDS_FRAGMENT } from '@/graphql/spell.fragments';
import type { SpellsQuery } from '@/types/generated_graphql_types';

/** Parameters driving the spell search: optional name substring and structured filters. */
type SearchParams = {
    name?: string;
    filters: SpellFilterState;
};

/** Number of spells requested per page for the main spell list. */
const SPELLS_PAGE_SIZE = 50;

/** GraphQL query that fetches a list of spell ids/names, optionally filtered. */
export const SEARCH_SPELLS = gql`
    query Spells($filter: SpellFilter, $pagination: SpellPagination) {
        spells(filter: $filter, pagination: $pagination) {
            ...SpellListFields
        }
    }
    ${SPELL_LIST_FIELDS_FRAGMENT}
`;

/**
 * Main spell-browsing screen.
 *
 * Provides a search bar, filter drawer, and a scrollable spell list.
 * Redirects to the sign-in screen when the session expires.
 */
export default function SpellSearch() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        filters: EMPTY_SPELL_FILTERS,
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

    const filterVariable = useMemo(() => {
        return buildSpellFilterInput(searchParams.filters, searchParams.name);
    }, [searchParams.filters, searchParams.name]);

    const queryVariables = useMemo(() => ({
        pagination: { limit: SPELLS_PAGE_SIZE, offset: 0 },
        ...(filterVariable ? { filter: filterVariable } : {}),
    }), [filterVariable]);

    const { data, loading, error, fetchMore } = useQuery<SpellsQuery>(SEARCH_SPELLS, {
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

    const activeFilterCount = countActiveSpellFilters(searchParams.filters);

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
        fontFamily: fantasyTokens.fonts.regular,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});
