import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    entryInitials,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import FeatDetail from '@/components/compendium/feat-detail';
import { featDescriptionParts } from '@/components/compendium/feat-presentation';
import { GET_COMPENDIUM_FEATS } from '@/graphql/feat.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumFeatsQuery } from '@/types/generated_graphql_types';

/** Browse-only feat Compendium backed by the typed aggregate query. */
export default function FeatCompendium() {
    const [searchText, setSearchText] = useState('');
    const [includeSrd, setIncludeSrd] = useState(true);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const query = useQuery<CompendiumFeatsQuery>(GET_COMPENDIUM_FEATS, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const feats = useMemo(() => (query.data?.compendiumFeats ?? [])
        .filter((feat) => includeSrd || feat.isCustom)
        .filter((feat) => matchesCompendiumSearch(
            searchText,
            feat.name,
            feat.description,
            sourceLabel(feat.sourceBook, feat.isCustom),
            feat.prerequisiteSummary,
        ))
        .sort((left, right) => left.name.localeCompare(right.name)), [includeSrd, query.data, searchText]);

    return (
        <CompendiumCollection
            heading={{ title: 'Feats', noun: 'feat' }}
            filters={{
                search: { placeholder: 'Search feats', value: searchText, onChange: setSearchText },
                includeSrd: { value: includeSrd, onChange: setIncludeSrd },
            }}
            collection={{
                items: feats,
                selectedValue,
                onSelectedValueChange: setSelectedValue,
                loading: query.loading,
                error: query.error ? {
                    message: query.error.message,
                    onRetry: () => { void query.refetch(); },
                } : undefined,
            }}
            empty={{ title: 'No matching feats', body: 'Clear the filters to reopen the feat ledger.' }}
            row={{
                mark: (feat) => <Text style={styles.rowMark}>{entryInitials(feat.name)}</Text>,
                meta: (feat) => `${feat.prerequisiteSummary || 'Open to all'} · ${featDescriptionParts(feat.description).lead || 'No description listed'}`,
            }}
            renderDetail={(feat) => <FeatDetail feat={feat} />}
        />
    );
}

const styles = StyleSheet.create({
    rowMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
});
