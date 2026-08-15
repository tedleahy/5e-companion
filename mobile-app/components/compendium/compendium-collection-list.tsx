import { Pressable, StyleSheet, Text, View } from 'react-native';
import FilterSwitch from '@/components/FilterSwitch';
import SearchBarInput from '@/components/SearchBarInput';
import CompendiumCollectionResults from '@/components/compendium/compendium-collection-results';
import type {
    CompendiumCollectionData,
    CompendiumCollectionFilters,
    CompendiumCollectionItem,
    CompendiumCollectionRowRenderers,
} from '@/components/compendium/compendium-collection.types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumCollectionListProps<T extends CompendiumCollectionItem> = {
    noun: string;
    filters: CompendiumCollectionFilters;
    collection: CompendiumCollectionData<T>;
    empty: {
        title: string;
        body: string;
    };
    row: CompendiumCollectionRowRenderers<T>;
};

/** Search controls and virtualized result states for a Compendium collection. */
export default function CompendiumCollectionList<T extends CompendiumCollectionItem>({
    noun,
    filters,
    collection,
    empty,
    row,
}: CompendiumCollectionListProps<T>) {
    const { items } = collection;
    const filtersActive = filters.search.value.trim().length > 0
        || !filters.includeSrd.value
        || filters.category?.active === true;
    const pluralNoun = items.length === 1 ? noun : `${noun}s`;

    function clearFilters() {
        if (filters.search.value !== '') filters.search.onChange('');
        if (!filters.includeSrd.value) filters.includeSrd.onChange(true);
        filters.category?.onClear();
    }

    return (
        <>
            <View style={styles.controls}>
                <SearchBarInput
                    placeholder={filters.search.placeholder}
                    searchText={filters.search.value}
                    onChangeSearchText={filters.search.onChange}
                />
                <FilterSwitch
                    label={`Include SRD ${noun}s`}
                    value={filters.includeSrd.value}
                    onToggle={() => filters.includeSrd.onChange(!filters.includeSrd.value)}
                />
                {filters.category?.content}
                <View style={styles.resultsBar}>
                    <Text style={styles.resultsText}>{items.length} {pluralNoun} · A–Z</Text>
                    {filtersActive ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Clear ${noun} filters`}
                            onPress={clearFilters}
                            hitSlop={fantasyTokens.spacing.sm}
                            testID="compendium-clear-filters"
                        >
                            <Text style={styles.clearLabel}>Clear filters</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
            <CompendiumCollectionResults
                noun={noun}
                collection={collection}
                empty={empty}
                row={row}
                onReset={clearFilters}
            />
        </>
    );
}

const styles = StyleSheet.create({
    controls: {
        padding: fantasyTokens.spacing.md,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    resultsBar: {
        minHeight: fantasyTokens.spacing.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    resultsText: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    clearLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
