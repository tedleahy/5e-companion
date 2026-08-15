import { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumPills from '@/components/compendium/detail/pills';
import { GET_COMPENDIUM_RACES } from '@/graphql/race.operations';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import RaceDetail from '@/components/compendium/race-detail';
import {
    raceAbilityPills,
    raceLanguageSummary,
    raceMark,
} from '@/components/compendium/race-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumRacesQuery } from '@/types/generated_graphql_types';

/** Browse-only race Compendium with lineage-rich details. */
export default function RaceCompendium() {
    const { width } = useWindowDimensions();
    const protectedRouter = useProtectedNavigation();
    const [searchText, setSearchText] = useState('');
    const [includeSrd, setIncludeSrd] = useState(true);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const query = useQuery<CompendiumRacesQuery>(GET_COMPENDIUM_RACES, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const races = useMemo(() => (query.data?.compendiumRaces ?? [])
        .filter((race) => includeSrd || race.isCustom)
        .filter((race) => matchesCompendiumSearch(
            searchText,
            race.name,
            sourceLabel(race.sourceBook, race.isCustom),
            race.size,
            race.languages.map((language) => language.name),
            race.traits.map((trait) => trait.name),
        ))
        .sort((left, right) => left.name.localeCompare(right.name)), [includeSrd, query.data, searchText]);

    function openSubrace(value: string) {
        void protectedRouter.push({
            pathname: '/(rail)/compendium/subraces',
            params: { value },
        });
    }

    return (
        <CompendiumCollection
            heading={{ title: 'Races', noun: 'race' }}
            filters={{
                search: { placeholder: 'Search races', value: searchText, onChange: setSearchText },
                includeSrd: { value: includeSrd, onChange: setIncludeSrd },
            }}
            collection={{
                items: races,
                selectedValue,
                onSelectedValueChange: setSelectedValue,
                loading: query.loading,
                error: query.error ? {
                    message: query.error.message,
                    onRetry: () => { void query.refetch(); },
                } : undefined,
            }}
            empty={{ title: 'No lineages found', body: 'Clear the filters to browse every ancestry.' }}
            row={{
                mark: (race) => <Text style={styles.rowMark}>{raceMark(race)}</Text>,
                meta: (race) => `${race.size ?? 'Unknown size'} · ${race.speed ?? '—'} ft. · ${countLabel(race.traits.length, 'trait')} · ${raceLanguageSummary(race)}`,
                extra: width >= fantasyTokens.breakpoints.tablet
                    ? (race) => <CompendiumPills values={raceAbilityPills(race)} />
                    : undefined,
            }}
            renderDetail={(race) => <RaceDetail race={race} onOpenSubrace={openSubrace} />}
        />
    );
}

const styles = StyleSheet.create({
    rowMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
});
