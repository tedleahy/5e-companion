import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Searchbar } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import SpellList, { type SpellListItem } from '@/components/SpellList';
import SpellFilterDrawer, { EMPTY_FILTERS, type SpellFilters } from '@/components/SpellFilterDrawer';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { gql } from '@apollo/client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import RailScreenShell from '@/components/navigation/RailScreenShell';

/** Parameters driving the spell search: optional name substring and structured filters. */
type SearchParams = {
    name?: string;
    filters: SpellFilters;
};

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
    query Spells($filter: SpellFilter) {
        spells(filter: $filter) {
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
    function buildFilterVariable() {
        const { name, filters } = searchParams;
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

    const { data, loading, error } = useQuery<SearchSpellsQueryData>(SEARCH_SPELLS, {
        variables: { filter: buildFilterVariable() },
        notifyOnNetworkStatusChange: true,
        returnPartialData: true,
    });
    const isUnauthenticated = isUnauthenticatedError(error);

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

    /** Signs the user out via Supabase and redirects to the sign-in screen. */
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
        router.replace('/(auth)/sign-in');
    }

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Searchbar
                        style={styles.searchBar}
                        inputStyle={{ color: fantasyTokens.colors.inkDark, fontFamily: 'serif' }}
                        iconColor={fantasyTokens.colors.ember}
                        placeholderTextColor={fantasyTokens.colors.inkSoft}
                        placeholder="Search spells..."
                        onChangeText={setPendingSearchName}
                        value={pendingSearchName}
                    />
                    <IconButton
                        icon="logout"
                        iconColor={fantasyTokens.colors.inkSoft}
                        size={20}
                        onPress={signOut}
                    />
                </View>
                <Button
                    icon="filter"
                    mode="outlined"
                    onPress={() => setDrawerVisible(true)}
                    style={styles.filterButton}
                    textColor={fantasyTokens.colors.parchment}
                >
                    {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
                </Button>
                <SpellList spells={spells} loading={loading || isUnauthenticated} />
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: fantasyTokens.spacing.xs,
    },
    searchBar: {
        flex: 1,
        margin: fantasyTokens.spacing.md,
        marginBottom: 0,
        backgroundColor: fantasyTokens.colors.parchment,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
    },
    filterButton: {
        margin: fantasyTokens.spacing.md,
        borderColor: fantasyTokens.colors.gold,
    },
});
