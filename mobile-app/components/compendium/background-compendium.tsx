import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useQuery } from '@apollo/client/react';
import BackgroundDetail from '@/components/compendium/background-detail';
import { proficienciesOfType } from '@/components/compendium/background-presentation';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    entryInitials,
    listOrFallback,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import { GET_COMPENDIUM_BACKGROUNDS } from '@/graphql/background.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumBackgroundsQuery } from '@/types/generated_graphql_types';

/** Browse-only background Compendium with grants, equipment, and roleplaying prompts. */
export default function BackgroundCompendium() {
    const [searchText, setSearchText] = useState('');
    const [includeSrd, setIncludeSrd] = useState(true);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const query = useQuery<CompendiumBackgroundsQuery>(GET_COMPENDIUM_BACKGROUNDS, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const backgrounds = useMemo(() => (query.data?.compendiumBackgrounds ?? [])
        .filter((background) => includeSrd || background.isCustom)
        .filter((background) => matchesCompendiumSearch(
            searchText,
            background.name,
            sourceLabel(background.sourceBook, background.isCustom),
            background.proficiencies.map((proficiency) => proficiency.name),
            background.featureName,
            background.featureDescription,
        ))
        .sort((left, right) => left.name.localeCompare(right.name)), [includeSrd, query.data, searchText]);

    return (
        <CompendiumCollection
            heading={{ title: 'Backgrounds', noun: 'background' }}
            filters={{
                search: { placeholder: 'Search backgrounds', value: searchText, onChange: setSearchText },
                includeSrd: { value: includeSrd, onChange: setIncludeSrd },
            }}
            collection={{
                items: backgrounds,
                selectedValue,
                onSelectedValueChange: setSelectedValue,
                loading: query.loading,
                error: query.error ? {
                    message: query.error.message,
                    onRetry: () => { void query.refetch(); },
                } : undefined,
            }}
            empty={{ title: 'No matching backgrounds', body: 'Clear the filters to browse every recorded origin.' }}
            row={{
                mark: (background) => <Text style={styles.rowMark}>{entryInitials(background.name)}</Text>,
                meta: (background) => {
                    const skills = proficienciesOfType(background, 'SKILL');
                    const tools = proficienciesOfType(background, 'TOOL');
                    const languageText = background.languageChoiceCount > 0
                        ? `${countLabel(background.languageChoiceCount, 'language')} of choice`
                        : listOrFallback(background.languages.map((language) => language.name), 'No languages');
                    return `${listOrFallback(skills, 'No skills')} · ${listOrFallback(tools, 'No tools')} · ${languageText} · ${background.featureDescription[0] ?? background.featureName ?? 'No feature listed'}`;
                },
            }}
            renderDetail={(background) => <BackgroundDetail background={background} />}
        />
    );
}

const styles = StyleSheet.create({
    rowMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
});
