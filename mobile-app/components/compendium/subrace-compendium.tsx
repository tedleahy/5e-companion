import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    listOrFallback,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import {
    CompendiumBodyText,
    CompendiumDetailHero,
    CompendiumDetailSection,
    CompendiumDisclosure,
    CompendiumFactGrid,
    CompendiumReferenceList,
    CompendiumTraitList,
} from '@/components/compendium/compendium-detail-elements';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';
import { GET_COMPENDIUM_SUBRACES } from '@/graphql/subrace.operations';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import { RACE_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumSubracesQuery } from '@/types/generated_graphql_types';

type Subrace = CompendiumSubracesQuery['compendiumSubraces'][number];

function parentMark(parentName: string) {
    return RACE_OPTIONS.find((option) => option.label.toLocaleLowerCase() === parentName.toLocaleLowerCase())
        ?.icon ?? '✦';
}

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

function SubraceDetail({ subrace, onOpenParentRace }: {
    subrace: Subrace;
    onOpenParentRace: (value: string) => void;
}) {
    const [parentExpanded, setParentExpanded] = useState(false);
    const parent = subrace.parentRace;

    return (
        <>
            <CompendiumDetailHero
                mark={parentMark(parent.name)}
                eyebrow={`${sourceLabel(subrace.sourceBook, subrace.isCustom)} · ${parent.name} lineage`}
                title={subrace.name}
                summary={subrace.description ?? 'No description is recorded.'}
                facts={[{ label: 'Characters', value: countLabel(subrace.characterUsageCount, 'character') }]}
            />
            <CompendiumDetailSection title="Lineage inheritance">
                <CompendiumFactGrid facts={[
                    { label: `${parent.name} grants`, value: parent.abilitySummary || 'No bonus listed' },
                    { label: `${subrace.name} adds`, value: subrace.abilitySummary || 'No additional bonus' },
                    { label: 'Added traits', value: countLabel(subrace.traits.length, 'trait') },
                ]} />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Subrace traits">
                <CompendiumTraitList traits={subrace.traits} emptyLabel="No additional traits are listed." />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Parent race rules">
                <CompendiumReferenceList
                    items={[{ value: parent.value, name: parent.name }]}
                    onSelect={onOpenParentRace}
                />
                <CompendiumDisclosure
                    title={`Inherited from ${parent.name}`}
                    summary={`${parent.speed ?? '—'} ft. · ${parent.size ?? 'Unknown size'} · ${countLabel(parent.traits.length, 'trait')}`}
                    expanded={parentExpanded}
                    onToggle={() => setParentExpanded((current) => !current)}
                    testID="subrace-parent-rules"
                >
                    <CompendiumFactGrid facts={[
                        { label: 'Speed', value: parent.speed == null ? 'Not listed' : `${parent.speed} ft.` },
                        { label: 'Size', value: parent.size ?? 'Not listed' },
                        { label: 'Languages', value: listOrFallback(parent.languages.map((language) => language.name)) },
                    ]} />
                    {parent.languageDescription ? <CompendiumBodyText>{parent.languageDescription}</CompendiumBodyText> : null}
                    <CompendiumTraitList traits={parent.traits} emptyLabel="No inherited traits are listed." />
                </CompendiumDisclosure>
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
