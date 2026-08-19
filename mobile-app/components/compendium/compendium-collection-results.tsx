import { FlatList, StyleSheet, View } from 'react-native';
import ListSkeletonRows from '@/components/ListSkeletonRows';
import CompendiumCollectionRow from '@/components/compendium/compendium-collection-row';
import CompendiumCollectionState from '@/components/compendium/compendium-collection-state';
import type {
    CompendiumCollectionData,
    CompendiumCollectionItem,
    CompendiumCollectionRowRenderers,
} from '@/components/compendium/compendium-collection.types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumCollectionResultsProps<T extends CompendiumCollectionItem> = {
    noun: string;
    collection: CompendiumCollectionData<T>;
    empty: {
        title: string;
        body: string;
    };
    row: CompendiumCollectionRowRenderers<T>;
    onReset: () => void;
};

/** Virtualized results plus loading, error, and empty collection states. */
export default function CompendiumCollectionResults<T extends CompendiumCollectionItem>({
    noun,
    collection,
    empty,
    row,
    onReset,
}: CompendiumCollectionResultsProps<T>) {
    if (collection.loading && collection.items.length === 0) {
        return (
            <View style={styles.flex} testID="compendium-collection-loading">
                <ListSkeletonRows />
            </View>
        );
    }

    if (collection.error != null && collection.items.length === 0) {
        return (
            <CompendiumCollectionState
                title={`Unable to load ${noun}s`}
                body={collection.error.message}
                action={collection.error.onRetry == null ? undefined : {
                    label: 'Retry',
                    onPress: collection.error.onRetry,
                }}
                testID="compendium-collection-error"
            />
        );
    }

    if (collection.items.length === 0) {
        return (
            <CompendiumCollectionState
                title={empty.title}
                body={empty.body}
                action={{ label: 'Reset filters', onPress: onReset }}
                testID="compendium-collection-empty"
            />
        );
    }

    return (
        <FlatList
            data={collection.items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
                <CompendiumCollectionRow
                    value={item.value}
                    name={item.name}
                    isCustom={item.isCustom}
                    mark={row.mark(item)}
                    meta={row.meta(item)}
                    extra={row.extra?.(item)}
                    actions={row.actions?.(item)}
                    onSelect={collection.onSelectedValueChange}
                    testID={`compendium-row-${item.value}`}
                />
            )}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.listContent}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            testID="compendium-collection-list"
        />
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
});
