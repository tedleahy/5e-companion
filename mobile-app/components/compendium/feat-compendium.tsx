import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    CompendiumBodyText,
    CompendiumDetailHero,
    CompendiumDetailSection,
    CompendiumFactGrid,
} from '@/components/compendium/compendium-detail-elements';
import {
    countLabel,
    entryInitials,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import { GET_COMPENDIUM_FEATS } from '@/graphql/feat.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumFeatsQuery } from '@/types/generated_graphql_types';

type Feat = CompendiumFeatsQuery['compendiumFeats'][number];

function descriptionParts(description: string[]) {
    const lines = description.flatMap((paragraph) => paragraph.split('\n'))
        .map((line) => line.trim())
        .filter(Boolean);
    const lead = lines.find((line) => !line.startsWith('- ')) ?? '';

    return {
        lead,
        supporting: lines.filter((line) => line !== lead && !line.startsWith('- ')),
        benefits: lines.filter((line) => line.startsWith('- ')).map((line) => line.slice(2).trim()),
    };
}

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
                meta: (feat) => `${feat.prerequisiteSummary || 'Open to all'} · ${descriptionParts(feat.description).lead || 'No description listed'}`,
            }}
            renderDetail={(feat) => <FeatDetail feat={feat} />}
        />
    );
}

function FeatDetail({ feat }: { feat: Feat }) {
    const parts = descriptionParts(feat.description);
    const threshold = feat.prerequisites.length > 0
        ? feat.prerequisiteSummary
        : 'None — open to all';

    return (
        <>
            <CompendiumDetailHero
                mark={entryInitials(feat.name)}
                eyebrow={sourceLabel(feat.sourceBook, feat.isCustom)}
                title={feat.name}
                summary={parts.lead || 'No overview is listed.'}
            />
            <View style={styles.threshold}>
                <Text style={styles.thresholdLabel}>Prerequisite</Text>
                <Text style={styles.thresholdValue} selectable>{threshold}</Text>
            </View>
            <CompendiumDetailSection title="What it grants">
                {parts.supporting.map((paragraph, index) => (
                    <CompendiumBodyText key={`${feat.value}-support-${index}`}>{paragraph}</CompendiumBodyText>
                ))}
                {parts.benefits.length > 0 ? (
                    <View style={styles.benefits}>
                        {parts.benefits.map((benefit) => (
                            <View key={benefit} style={styles.benefit}>
                                <Text style={styles.diamond}>◆</Text>
                                <CompendiumBodyText>{benefit}</CompendiumBodyText>
                            </View>
                        ))}
                    </View>
                ) : null}
                {parts.supporting.length === 0 && parts.benefits.length === 0 && !parts.lead ? (
                    <CompendiumBodyText>No benefits are listed.</CompendiumBodyText>
                ) : null}
            </CompendiumDetailSection>
            <CompendiumDetailSection title="At a glance">
                <CompendiumFactGrid facts={[
                    { label: 'Source', value: sourceLabel(feat.sourceBook, feat.isCustom) },
                    { label: 'Ownership', value: feat.isCustom ? 'Custom' : 'SRD' },
                    { label: 'Characters', value: countLabel(feat.characterUsageCount, 'character') },
                ]} />
            </CompendiumDetailSection>
        </>
    );
}

const styles = StyleSheet.create({
    rowMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
    threshold: {
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.md,
        borderLeftWidth: fantasyTokens.spacing.xs,
        borderLeftColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    thresholdLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    thresholdValue: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    benefits: {
        gap: fantasyTokens.spacing.sm,
    },
    benefit: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.sm,
    },
    diamond: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.claret,
    },
});
