import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@apollo/client/react';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    entryInitials,
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
} from '@/components/compendium/compendium-detail-elements';
import { GET_COMPENDIUM_BACKGROUNDS } from '@/graphql/background.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumBackgroundsQuery } from '@/types/generated_graphql_types';

type Background = CompendiumBackgroundsQuery['compendiumBackgrounds'][number];

function proficienciesOfType(background: Background, type: string) {
    return background.proficiencies
        .filter((proficiency) => proficiency.type.toLocaleUpperCase() === type)
        .map((proficiency) => proficiency.name);
}

function equipmentLines(background: Background) {
    const fixed = background.startingEquipment
        .filter((item) => item.choiceGroup == null)
        .map((item) => `${item.quantity}× ${item.name}`);
    const groups = new Map<number, typeof background.startingEquipment>();

    background.startingEquipment.forEach((item) => {
        if (item.choiceGroup == null) return;
        groups.set(item.choiceGroup, [...(groups.get(item.choiceGroup) ?? []), item]);
    });

    return [
        ...fixed.map((line) => ({ choice: false, text: line })),
        ...[...groups.values()].map((items) => ({
            choice: true,
            text: `Choose ${items[0]?.choiceCount ?? 1}: ${items.map((item) => `${item.quantity}× ${item.name}`).join(' or ')}`,
        })),
    ];
}

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

function BackgroundDetail({ background }: { background: Background }) {
    const [characteristicsExpanded, setCharacteristicsExpanded] = useState(false);
    const skills = proficienciesOfType(background, 'SKILL');
    const tools = proficienciesOfType(background, 'TOOL');
    const languages = [
        ...background.languages.map((language) => language.name),
        ...(background.languageChoiceCount > 0
            ? [`Choose ${background.languageChoiceCount}`]
            : []),
    ];
    const characteristics = background.suggestedCharacteristics;
    const characteristicGroups = [
        { label: 'Personality traits', value: characteristics?.personalityTraits },
        { label: 'Ideals', value: characteristics?.ideals },
        { label: 'Bonds', value: characteristics?.bonds },
        { label: 'Flaws', value: characteristics?.flaws },
    ];
    const characteristicSummary = characteristicGroups
        .map((group) => `${group.value?.options.length ?? 0} ${group.label.toLocaleLowerCase()}`)
        .join(' · ');

    return (
        <>
            <CompendiumDetailHero
                mark={entryInitials(background.name)}
                eyebrow={sourceLabel(background.sourceBook, background.isCustom)}
                title={background.name}
                summary={background.featureDescription[0] ?? 'No overview is listed.'}
                facts={[{ label: 'Characters', value: countLabel(background.characterUsageCount, 'character') }]}
            />
            <CompendiumFactGrid facts={[
                { label: 'Skills', value: listOrFallback(skills) },
                { label: 'Tools', value: listOrFallback(tools) },
                { label: 'Languages', value: listOrFallback(languages) },
            ]} />
            <CompendiumDetailSection title="Starting equipment">
                <CompendiumBodyText>
                    Starting equipment is reference-only and is not automatically added to inventory.
                </CompendiumBodyText>
                <View style={styles.equipmentList}>
                    {equipmentLines(background).map((item) => (
                        <View key={item.text} style={styles.equipmentRow}>
                            <Text style={styles.diamond}>{item.choice ? 'Choose:' : '◆'}</Text>
                            <Text style={styles.equipmentText} selectable>{item.text}</Text>
                        </View>
                    ))}
                    {background.startingEquipment.length === 0 ? (
                        <CompendiumBodyText>No starting equipment is listed.</CompendiumBodyText>
                    ) : null}
                </View>
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Background feature">
                <View style={styles.featureCard}>
                    <Text style={styles.featureLabel}>Defining feature</Text>
                    <Text style={styles.featureTitle} selectable>{background.featureName ?? 'No feature listed'}</Text>
                    {background.featureDescription.map((paragraph, index) => (
                        <CompendiumBodyText key={`${background.value}-feature-${index}`}>
                            {paragraph}
                        </CompendiumBodyText>
                    ))}
                </View>
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Suggested characteristics">
                <CompendiumDisclosure
                    title="Roleplaying prompts"
                    summary={characteristicSummary}
                    expanded={characteristicsExpanded}
                    onToggle={() => setCharacteristicsExpanded((current) => !current)}
                    testID="background-characteristics"
                >
                    {characteristicGroups.map((group) => (
                        <View key={group.label} style={styles.characteristicGroup}>
                            <Text style={styles.characteristicTitle}>{group.label}</Text>
                            {group.value?.options.map((option, index) => (
                                <Text key={`${group.label}-${index}`} style={styles.characteristicOption} selectable>
                                    ◆ {option}
                                </Text>
                            )) ?? <CompendiumBodyText>None listed.</CompendiumBodyText>}
                        </View>
                    ))}
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
    equipmentList: {
        gap: fantasyTokens.spacing.sm,
    },
    equipmentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.sm,
    },
    diamond: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.claret,
    },
    equipmentText: {
        flex: 1,
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    featureCard: {
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    featureLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    featureTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
    characteristicGroup: {
        gap: fantasyTokens.spacing.sm,
    },
    characteristicTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    characteristicOption: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});
