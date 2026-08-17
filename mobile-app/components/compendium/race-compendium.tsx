import { useWindowDimensions } from 'react-native';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumRowMark from '@/components/compendium/compendium-row-mark';
import CompendiumPills from '@/components/compendium/detail/pills';
import useCompendiumBrowse from '@/components/compendium/use-compendium-browse';
import { GET_COMPENDIUM_RACES } from '@/graphql/race.operations';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import RaceDetail from '@/components/compendium/race-detail';
import {
    raceAbilityPills,
    raceLanguageSummary,
    raceMark,
    type Race,
} from '@/components/compendium/race-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumRacesQuery } from '@/types/generated_graphql_types';

const selectRaces = (data: CompendiumRacesQuery | undefined) => data?.compendiumRaces ?? [];

const raceSearchFields = (race: Race) => [
    race.name,
    sourceLabel(race.sourceBook, race.isCustom),
    race.size,
    race.languages.map((language) => language.name),
    race.traits.map((trait) => trait.name),
];

/** Browse-only race Compendium with lineage-rich details. */
export default function RaceCompendium() {
    const { width } = useWindowDimensions();
    const protectedRouter = useProtectedNavigation();
    const browse = useCompendiumBrowse({
        document: GET_COMPENDIUM_RACES,
        noun: 'race',
        select: selectRaces,
        searchFields: raceSearchFields,
    });

    function openSubrace(value: string) {
        void protectedRouter.navigate({
            pathname: '/(rail)/compendium/subraces',
            params: { value },
        });
    }

    return (
        <CompendiumCollection
            heading={{ title: 'Races', noun: 'race' }}
            filters={{ search: browse.search, includeSrd: browse.includeSrd }}
            collection={browse.collection}
            empty={{ title: 'No lineages found', body: 'Clear the filters to browse every ancestry.' }}
            row={{
                mark: (race) => <CompendiumRowMark>{raceMark(race)}</CompendiumRowMark>,
                meta: (race) => `${race.size ?? 'Unknown size'} · ${race.speed ?? '—'} ft. · ${countLabel(race.traits.length, 'trait')} · ${raceLanguageSummary(race)}`,
                extra: width >= fantasyTokens.breakpoints.tablet
                    ? (race) => <CompendiumPills values={raceAbilityPills(race)} />
                    : undefined,
            }}
            renderDetail={(race) => <RaceDetail race={race} onOpenSubrace={openSubrace} />}
        />
    );
}
