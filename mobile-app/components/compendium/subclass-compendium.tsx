import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import { sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumRowMark from '@/components/compendium/compendium-row-mark';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';
import SubclassDetail from '@/components/compendium/subclass-detail';
import SubclassManagerOverlay from '@/components/compendium/subclass-manager-overlay';
import {
    classMark,
    subclassDescription,
    subclassMeta,
    type Subclass,
} from '@/components/compendium/subclass-presentation';
import useCompendiumBrowse from '@/components/compendium/use-compendium-browse';
import useCustomSubclassManager from '@/components/compendium/use-custom-subclass-manager';
import { GET_COMPENDIUM_SUBCLASSES } from '@/graphql/subclass.operations';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type { CompendiumSubclassesQuery } from '@/types/generated_graphql_types';

const selectSubclasses = (data: CompendiumSubclassesQuery | undefined) => data?.compendiumSubclasses ?? [];

const subclassSearchFields = (subclass: Subclass) => [
    subclass.name,
    subclass.className,
    sourceLabel(subclass.sourceBook, subclass.isCustom),
    subclassDescription(subclass),
    subclass.features.map((feature) => feature.name),
];

/** Subclass Compendium: browse SRD and custom rows, and manage the custom ones. */
export default function SubclassCompendium() {
    const router = useRouter();
    const [classFilter, setClassFilter] = useState(ALL_FILTER_VALUE);
    const browse = useCompendiumBrowse({
        document: GET_COMPENDIUM_SUBCLASSES,
        noun: 'subclass',
        select: selectSubclasses,
        searchFields: subclassSearchFields,
    });
    const manager = useCustomSubclassManager();

    const isUnauthenticated = isUnauthenticatedError(browse.error);
    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    const classOptions = useMemo(() => [...new Map(browse.sourceRows.map((subclass) => [
        subclass.classId,
        { value: subclass.classId, label: subclass.className },
    ])).values()].sort((left, right) => left.label.localeCompare(right.label)), [browse.sourceRows]);
    // A class whose rows are all hidden by the SRD switch falls back to All,
    // rather than stranding the user on an empty list with no visible cause.
    const activeClass = classOptions.some((option) => option.value === classFilter)
        ? classFilter
        : ALL_FILTER_VALUE;
    const items = useMemo(
        () => (activeClass === ALL_FILTER_VALUE
            ? browse.collection.items
            : browse.collection.items.filter((subclass) => subclass.classId === activeClass)),
        [activeClass, browse.collection.items],
    );

    return (
        <CompendiumCollection
            heading={{ title: 'Subclasses', noun: 'subclass' }}
            filters={{
                search: browse.search,
                includeSrd: browse.includeSrd,
                category: {
                    content: (
                        <ExclusiveFilterChips
                            options={classOptions}
                            selectedValue={activeClass}
                            onSelectedValueChange={setClassFilter}
                            accessibilityLabelPrefix="Filter subclasses by class"
                            testID="subclass-class-filter"
                        />
                    ),
                    active: activeClass !== ALL_FILTER_VALUE,
                    onClear: () => setClassFilter(ALL_FILTER_VALUE),
                },
            }}
            collection={{ ...browse.collection, items }}
            empty={{
                title: 'No matching subclasses',
                body: 'Clear the filters to browse every subclass.',
            }}
            row={{
                mark: (subclass) => <CompendiumRowMark>{classMark(subclass.classId)}</CompendiumRowMark>,
                meta: subclassMeta,
                actions: (subclass) => (subclass.isCustom
                    ? [
                        {
                            icon: 'create-outline',
                            accessibilityLabel: `Edit ${subclass.name}`,
                            onPress: () => manager.openEditForm(subclass),
                            testID: `edit-custom-subclass-${subclass.id}`,
                        },
                        {
                            icon: 'trash-outline',
                            accessibilityLabel: `Delete ${subclass.name}`,
                            onPress: () => manager.requestArchive(subclass),
                            destructive: true,
                            testID: `delete-custom-subclass-${subclass.id}`,
                        },
                    ]
                    : []),
            }}
            renderDetail={(subclass) => <SubclassDetail subclass={subclass} />}
            floatingAction={{
                accessibilityLabel: 'Add custom subclass',
                onPress: manager.openCreateForm,
                testID: 'add-custom-subclass',
            }}
            overlay={<SubclassManagerOverlay manager={manager} />}
        />
    );
}
