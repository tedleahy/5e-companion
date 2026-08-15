import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';
import SubraceDetail from '@/components/compendium/subrace-detail';
import { parentMark } from '@/components/compendium/subrace-presentation';
import { GET_COMPENDIUM_SUBRACES } from '@/graphql/subrace.operations';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumSubracesQuery } from '@/types/generated_graphql_types';

/** Browse-only subrace Compendium with an exclusive parent-race filter. */
export default function SubraceCompendium() {
    const protectedRouter = useProtectedNavigation();
    const [searchText, setSearchText] = useState('');
    const [includeSrd, setIncludeSrd] = useState(true);
    const [parentFilter, setParentFilter] = useState(ALL_FILTER_VALUE);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const query = useQuery<CompendiumSubracesQuery>(GET_COMPENDIUM_SUBRACES, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const sourceRows = useMemo(() => (query.data?.compendiumSubraces ?? [])
        .filter((subrace) => includeSrd || subrace.isCustom), [includeSrd, query.data]);
    const parentOptions = useMemo(() => [...new Map(sourceRows.map((subrace) => [
        subrace.parentRace.value,
        { value: subrace.parentRace.value, label: subrace.parentRace.name },
    ])).values()].sort((left, right) => left.label.localeCompare(right.label)), [sourceRows]);
    const subraces = useMemo(() => sourceRows
        .filter((subrace) => parentFilter === ALL_FILTER_VALUE
            || subrace.parentRace.value === parentFilter)
        .filter((subrace) => matchesCompendiumSearch(
            searchText,
            subrace.name,
            subrace.parentRace.name,
            sourceLabel(subrace.sourceBook, subrace.isCustom),
            subrace.description,
            subrace.abilitySummary,
            subrace.traits.map((trait) => trait.name),
        ))
        .sort((left, right) => left.name.localeCompare(right.name)), [parentFilter, searchText, sourceRows]);

    function openParentRace(value: string) {
        void protectedRouter.push({
            pathname: '/(rail)/compendium/races',
            params: { value },
        });
    }

    return (
        <CompendiumCollection
            heading={{ title: 'Subraces', noun: 'subrace' }}
            filters={{
                search: { placeholder: 'Search subraces', value: searchText, onChange: setSearchText },
                includeSrd: { value: includeSrd, onChange: setIncludeSrd },
                category: {
                    content: (
                        <ExclusiveFilterChips
                            options={parentOptions}
                            selectedValue={parentFilter}
                            onSelectedValueChange={setParentFilter}
                            accessibilityLabelPrefix="Filter subraces by parent race"
                            testID="subrace-parent-filter"
                        />
                    ),
                    active: parentFilter !== ALL_FILTER_VALUE,
                    onClear: () => setParentFilter(ALL_FILTER_VALUE),
                },
            }}
            collection={{
                items: subraces,
                selectedValue,
                onSelectedValueChange: setSelectedValue,
                loading: query.loading,
                error: query.error ? {
                    message: query.error.message,
                    onRetry: () => { void query.refetch(); },
                } : undefined,
            }}
            empty={{ title: 'No matching lineages', body: 'Clear the filters to browse every subrace.' }}
            row={{
                mark: (subrace) => <Text style={styles.rowMark}>{parentMark(subrace.parentRace.name)}</Text>,
                meta: (subrace) => `${subrace.parentRace.name} · ${subrace.abilitySummary || 'No additional bonus'} · ${countLabel(subrace.traits.length, 'added trait')}`,
            }}
            renderDetail={(subrace) => (
                <SubraceDetail subrace={subrace} onOpenParentRace={openParentRace} />
            )}
        />
    );
}

const styles = StyleSheet.create({
    rowMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
});
