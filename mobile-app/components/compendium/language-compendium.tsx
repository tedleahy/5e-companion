import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumSelectFilter from '@/components/compendium/compendium-select-filter';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';
import { GET_COMPENDIUM_LANGUAGES } from '@/graphql/language.operations';
import LanguageDetail from '@/components/compendium/language-detail';
import {
    displayLanguageType,
    languageScriptMark,
} from '@/components/compendium/language-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumLanguagesQuery } from '@/types/generated_graphql_types';

const UNWRITTEN_FILTER_VALUE = 'unwritten';
const TYPE_OPTIONS = [
    { value: 'standard', label: 'Standard' },
    { value: 'exotic', label: 'Exotic' },
];

/** Browse-only language Compendium with type and script filters. */
export default function LanguageCompendium() {
    const [searchText, setSearchText] = useState('');
    const [includeSrd, setIncludeSrd] = useState(true);
    const [typeFilter, setTypeFilter] = useState(ALL_FILTER_VALUE);
    const [scriptFilter, setScriptFilter] = useState(ALL_FILTER_VALUE);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const query = useQuery<CompendiumLanguagesQuery>(GET_COMPENDIUM_LANGUAGES, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const allLanguages = useMemo(() => query.data?.compendiumLanguages ?? [], [query.data]);
    const scriptOptions = useMemo(() => {
        const scripts = new Set(allLanguages.map((language) => language.script).filter(Boolean) as string[]);
        return [
            { value: ALL_FILTER_VALUE, label: 'All scripts' },
            ...[...scripts].sort((left, right) => left.localeCompare(right)).map((script) => ({
                value: script,
                label: script,
            })),
            { value: UNWRITTEN_FILTER_VALUE, label: 'Unwritten' },
        ];
    }, [allLanguages]);
    const languages = useMemo(() => allLanguages
        .filter((language) => includeSrd || language.isCustom)
        .filter((language) => typeFilter === ALL_FILTER_VALUE
            || language.type?.toLocaleLowerCase() === typeFilter)
        .filter((language) => scriptFilter === ALL_FILTER_VALUE
            || (scriptFilter === UNWRITTEN_FILTER_VALUE ? !language.script : language.script === scriptFilter))
        .filter((language) => matchesCompendiumSearch(
            searchText,
            language.name,
            language.type,
            language.script,
            language.typicalSpeakers,
            language.description,
            sourceLabel(language.sourceBook, language.isCustom),
        ))
        .sort((left, right) => left.name.localeCompare(right.name)), [
        allLanguages,
        includeSrd,
        scriptFilter,
        searchText,
        typeFilter,
    ]);

    function clearCategoryFilters() {
        setTypeFilter(ALL_FILTER_VALUE);
        setScriptFilter(ALL_FILTER_VALUE);
    }

    function selectPeer(value: string) {
        setSearchText('');
        setIncludeSrd(true);
        clearCategoryFilters();
        setSelectedValue(value);
    }

    return (
        <CompendiumCollection
            heading={{ title: 'Languages', noun: 'language' }}
            filters={{
                search: { placeholder: 'Search languages', value: searchText, onChange: setSearchText },
                includeSrd: { value: includeSrd, onChange: setIncludeSrd },
                category: {
                    content: (
                        <View style={styles.filters}>
                            <ExclusiveFilterChips
                                options={TYPE_OPTIONS}
                                selectedValue={typeFilter}
                                onSelectedValueChange={setTypeFilter}
                                accessibilityLabelPrefix="Filter languages by type"
                                testID="language-type-filter"
                            />
                            <CompendiumSelectFilter
                                label="Script"
                                value={scriptFilter}
                                options={scriptOptions}
                                onChange={setScriptFilter}
                                testID="language-script-filter"
                            />
                        </View>
                    ),
                    active: typeFilter !== ALL_FILTER_VALUE || scriptFilter !== ALL_FILTER_VALUE,
                    onClear: clearCategoryFilters,
                },
            }}
            collection={{
                items: languages,
                selectedValue,
                onSelectedValueChange: setSelectedValue,
                loading: query.loading,
                error: query.error ? {
                    message: query.error.message,
                    onRetry: () => { void query.refetch(); },
                } : undefined,
            }}
            empty={{ title: 'No matching languages', body: 'Clear the filters to browse every recorded tongue.' }}
            row={{
                mark: (language) => <Text style={styles.scriptMark}>{languageScriptMark(language.script)}</Text>,
                meta: (language) => `${displayLanguageType(language.type)} · ${language.script ? `${language.script} script` : 'Unwritten / unknown'} · ${language.typicalSpeakers.join(', ') || language.description || 'No typical speakers listed'}`,
            }}
            renderDetail={(language) => (
                <LanguageDetail language={language} onSelectPeer={selectPeer} />
            )}
        />
    );
}

const styles = StyleSheet.create({
    filters: {
        gap: fantasyTokens.spacing.sm,
    },
    scriptMark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
        fontStyle: 'italic',
    },
});
