import { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    entryInitials,
    listOrFallback,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import {
    CompendiumBodyText,
    CompendiumDetailHero,
    CompendiumDetailSection,
    CompendiumFactGrid,
    CompendiumPills,
    CompendiumReferenceList,
    CompendiumTraitList,
} from '@/components/compendium/compendium-detail-elements';
import { GET_COMPENDIUM_RACES } from '@/graphql/race.operations';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import { RACE_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumRacesQuery } from '@/types/generated_graphql_types';

type Race = CompendiumRacesQuery['compendiumRaces'][number];

function raceMark(race: Pick<Race, 'name' | 'isCustom'>) {
    if (race.isCustom) return entryInitials(race.name);
    return RACE_OPTIONS.find((option) => option.label.toLocaleLowerCase() === race.name.toLocaleLowerCase())
        ?.icon ?? entryInitials(race.name);
}

function abilityPills(race: Pick<Race, 'abilityBonuses'>) {
    if (race.abilityBonuses.length === 6 && race.abilityBonuses.every((bonus) => bonus.bonus === 1)) {
        return ['All +1'];
    }
    return race.abilityBonuses.map((bonus) => `${bonus.abilityIndex.toLocaleUpperCase()} +${bonus.bonus}`);
}

function languageSummary(race: Pick<Race, 'languages' | 'languageChoiceCount'>) {
    const fixed = countLabel(race.languages.length, 'fixed language');
    if (race.languageChoiceCount === 0) return fixed;
    return `${fixed} + ${countLabel(race.languageChoiceCount, 'choice')}`;
}

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
                meta: (race) => `${race.size ?? 'Unknown size'} · ${race.speed ?? '—'} ft. · ${countLabel(race.traits.length, 'trait')} · ${languageSummary(race)}`,
                extra: width >= fantasyTokens.breakpoints.tablet
                    ? (race) => <CompendiumPills values={abilityPills(race)} />
                    : undefined,
            }}
            renderDetail={(race) => <RaceDetail race={race} onOpenSubrace={openSubrace} />}
        />
    );
}

function RaceDetail({ race, onOpenSubrace }: { race: Race; onOpenSubrace: (value: string) => void }) {
    const languageChoices = race.languageChoiceCount > 0
        ? `Choose ${race.languageChoiceCount} additional ${race.languageChoiceCount === 1 ? 'language' : 'languages'}.`
        : 'No additional language choices.';

    return (
        <>
            <CompendiumDetailHero
                mark={raceMark(race)}
                eyebrow={sourceLabel(race.sourceBook, race.isCustom)}
                title={race.name}
                summary={race.abilitySummary}
                facts={[
                    { label: 'Speed', value: race.speed == null ? 'Not listed' : `${race.speed} ft.` },
                    { label: 'Size', value: race.size ?? 'Not listed' },
                    { label: 'Characters', value: countLabel(race.characterUsageCount, 'character') },
                    { label: 'Subraces', value: countLabel(race.subraces.length, 'available subrace') },
                ]}
            />
            <CompendiumPills values={[
                `Traits · ${race.traits.length}`,
                `Languages · ${race.languages.length + race.languageChoiceCount}`,
                'Life & build',
                `Subraces · ${race.subraces.length}`,
            ]} />
            <CompendiumDetailSection title="Lineage ledger">
                <CompendiumFactGrid facts={[
                    { label: 'Ability scores', value: race.abilitySummary || 'No bonus listed' },
                    { label: 'Languages', value: languageSummary(race) },
                    { label: 'Racial traits', value: countLabel(race.traits.length, 'trait') },
                ]} />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Racial traits">
                <CompendiumTraitList traits={race.traits} />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Languages">
                <CompendiumFactGrid facts={[
                    { label: 'Always known', value: listOrFallback(race.languages.map((language) => language.name)) },
                    { label: 'Additional choices', value: languageChoices },
                ]} />
                {race.languageDescription ? <CompendiumBodyText>{race.languageDescription}</CompendiumBodyText> : null}
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Life & build">
                <CompendiumFactGrid facts={[
                    { label: 'Age', value: race.age ?? 'Not listed' },
                    { label: 'Size', value: race.sizeDescription ?? race.size ?? 'Not listed' },
                    { label: 'Alignment', value: race.alignment ?? 'Not listed' },
                ]} />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Subraces">
                <CompendiumReferenceList
                    items={race.subraces}
                    emptyLabel="No subraces are listed."
                    onSelect={onOpenSubrace}
                />
            </CompendiumDetailSection>
        </>
    );
}

const styles = StyleSheet.create({
    rowMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
});
