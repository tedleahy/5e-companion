import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import { sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumRowMark from '@/components/compendium/compendium-row-mark';
import CompendiumSelectFilter from '@/components/compendium/compendium-select-filter';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';
import useCompendiumBrowse from '@/components/compendium/use-compendium-browse';
import { GET_COMPENDIUM_LANGUAGES } from '@/graphql/language.operations';
import LanguageDetail from '@/components/compendium/language-detail';
import {
    displayLanguageType,
    hasRecordedScript,
    languageScriptMark,
    scriptLabel,
    type Language,
} from '@/components/compendium/language-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumLanguagesQuery } from '@/types/generated_graphql_types';

const UNWRITTEN_FILTER_VALUE = 'unwritten';
const TYPE_OPTIONS = [
    { value: 'standard', label: 'Standard' },
    { value: 'exotic', label: 'Exotic' },
];

const selectLanguages = (data: CompendiumLanguagesQuery | undefined) => data?.compendiumLanguages ?? [];

const languageSearchFields = (language: Language) => [
    language.name,
    language.type,
    language.script,
    language.typicalSpeakers,
    language.description,
    sourceLabel(language.sourceBook, language.isCustom),
];

/** Browse-only language Compendium with type and script filters. */
export default function LanguageCompendium() {
    const [typeFilter, setTypeFilter] = useState(ALL_FILTER_VALUE);
    const [scriptFilter, setScriptFilter] = useState(ALL_FILTER_VALUE);
    const browse = useCompendiumBrowse({
        document: GET_COMPENDIUM_LANGUAGES,
        noun: 'language',
        select: selectLanguages,
        searchFields: languageSearchFields,
    });
    const scriptOptions = useMemo(() => {
        const scripts = new Set(
            browse.allRows.map((language) => language.script).filter(hasRecordedScript),
        );
        return [
            { value: ALL_FILTER_VALUE, label: 'All scripts' },
            ...[...scripts].sort((left, right) => left.localeCompare(right)).map((script) => ({
                value: script,
                label: script,
            })),
            { value: UNWRITTEN_FILTER_VALUE, label: 'Unwritten' },
        ];
    }, [browse.allRows]);
    const items = useMemo(() => browse.collection.items
        .filter((language) => typeFilter === ALL_FILTER_VALUE
            || language.type?.toLocaleLowerCase() === typeFilter)
        .filter((language) => scriptFilter === ALL_FILTER_VALUE
            || (scriptFilter === UNWRITTEN_FILTER_VALUE
                ? !hasRecordedScript(language.script)
                : language.script === scriptFilter)),
    [browse.collection.items, scriptFilter, typeFilter]);

    function clearCategoryFilters() {
        setTypeFilter(ALL_FILTER_VALUE);
        setScriptFilter(ALL_FILTER_VALUE);
    }

    return (
        <CompendiumCollection
            heading={{ title: 'Languages', noun: 'language' }}
            filters={{
                search: browse.search,
                includeSrd: browse.includeSrd,
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
            collection={{ ...browse.collection, items }}
            empty={{ title: 'No matching languages', body: 'Clear the filters to browse every recorded tongue.' }}
            row={{
                mark: (language) => (
                    <CompendiumRowMark italic>{languageScriptMark(language.script)}</CompendiumRowMark>
                ),
                meta: (language) => `${displayLanguageType(language.type)} · ${scriptLabel(language.script)} · ${language.typicalSpeakers.join(', ') || language.description || 'No typical speakers listed'}`,
            }}
            renderDetail={(language) => (
                <LanguageDetail language={language} onSelectPeer={browse.selectValue} />
            )}
        />
    );
}

const styles = StyleSheet.create({
    filters: {
        gap: fantasyTokens.spacing.sm,
    },
});
