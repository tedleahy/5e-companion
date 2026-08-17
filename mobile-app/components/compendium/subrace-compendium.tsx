import { useMemo, useState } from 'react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumRowMark from '@/components/compendium/compendium-row-mark';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';
import SubraceDetail from '@/components/compendium/subrace-detail';
import { parentMark, type Subrace } from '@/components/compendium/subrace-presentation';
import useCompendiumBrowse from '@/components/compendium/use-compendium-browse';
import { GET_COMPENDIUM_SUBRACES } from '@/graphql/subrace.operations';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import type { CompendiumSubracesQuery } from '@/types/generated_graphql_types';

const selectSubraces = (data: CompendiumSubracesQuery | undefined) => data?.compendiumSubraces ?? [];

const subraceSearchFields = (subrace: Subrace) => [
    subrace.name,
    subrace.parentRace.name,
    sourceLabel(subrace.sourceBook, subrace.isCustom),
    subrace.description,
    subrace.abilitySummary,
    subrace.traits.map((trait) => trait.name),
];

/** Browse-only subrace Compendium with an exclusive parent-race filter. */
export default function SubraceCompendium() {
    const protectedRouter = useProtectedNavigation();
    const [parentFilter, setParentFilter] = useState(ALL_FILTER_VALUE);
    const browse = useCompendiumBrowse({
        document: GET_COMPENDIUM_SUBRACES,
        noun: 'subrace',
        select: selectSubraces,
        searchFields: subraceSearchFields,
    });
    const parentOptions = useMemo(() => [...new Map(browse.sourceRows.map((subrace) => [
        subrace.parentRace.value,
        { value: subrace.parentRace.value, label: subrace.parentRace.name },
    ])).values()].sort((left, right) => left.label.localeCompare(right.label)), [browse.sourceRows]);
    // A parent with no visible subraces (its rows hidden by the SRD switch) falls
    // back to All, rather than stranding the user on an empty list with no cause.
    const activeParent = parentOptions.some((option) => option.value === parentFilter)
        ? parentFilter
        : ALL_FILTER_VALUE;
    const items = useMemo(
        () => (activeParent === ALL_FILTER_VALUE
            ? browse.collection.items
            : browse.collection.items.filter((subrace) => subrace.parentRace.value === activeParent)),
        [activeParent, browse.collection.items],
    );

    function openParentRace(value: string) {
        void protectedRouter.navigate({
            pathname: '/(rail)/compendium/races',
            params: { value },
        });
    }

    return (
        <CompendiumCollection
            heading={{ title: 'Subraces', noun: 'subrace' }}
            filters={{
                search: browse.search,
                includeSrd: browse.includeSrd,
                category: {
                    content: (
                        <ExclusiveFilterChips
                            options={parentOptions}
                            selectedValue={activeParent}
                            onSelectedValueChange={setParentFilter}
                            accessibilityLabelPrefix="Filter subraces by parent race"
                            testID="subrace-parent-filter"
                        />
                    ),
                    active: activeParent !== ALL_FILTER_VALUE,
                    onClear: () => setParentFilter(ALL_FILTER_VALUE),
                },
            }}
            collection={{ ...browse.collection, items }}
            empty={{ title: 'No matching lineages', body: 'Clear the filters to browse every subrace.' }}
            row={{
                mark: (subrace) => <CompendiumRowMark>{parentMark(subrace.parentRace.value)}</CompendiumRowMark>,
                meta: (subrace) => `${subrace.parentRace.name} · ${subrace.abilitySummary ?? 'No additional bonus'} · ${countLabel(subrace.traits.length, 'added trait')}`,
            }}
            renderDetail={(subrace) => (
                <SubraceDetail subrace={subrace} onOpenParentRace={openParentRace} />
            )}
        />
    );
}
