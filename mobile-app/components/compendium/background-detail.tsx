import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    equipmentLines,
    equipmentMarker,
    proficienciesOfType,
    type Background,
} from '@/components/compendium/background-presentation';
import {
    countLabel,
    entryInitials,
    listOrFallback,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import CompendiumDisclosure from '@/components/compendium/detail/disclosure';
import CompendiumFactGrid from '@/components/compendium/detail/fact-grid';
import { fantasyTokens } from '@/theme/fantasyTheme';

export default function BackgroundDetail({ background }: { background: Background }) {
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
    const hasCharacteristics = characteristicGroups.some((group) => (group.value?.options.length ?? 0) > 0);

    return (
        <>
            <CompendiumDetailHero
                mark={entryInitials(background.name)}
                eyebrow={sourceLabel(background.sourceBook, background.isCustom)}
                title={background.name}
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
                    {equipmentLines(background).map((item, index) => (
                        <View key={`${background.value}-equipment-${index}`} style={styles.equipmentRow}>
                            <Text style={styles.diamond}>{equipmentMarker(item.choose)}</Text>
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
            {hasCharacteristics ? (
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
                                {group.value?.options.length ? group.value.options.map((option, index) => (
                                    <Text key={`${group.label}-${index}`} style={styles.characteristicOption} selectable>
                                        ◆ {option}
                                    </Text>
                                )) : <CompendiumBodyText>None listed.</CompendiumBodyText>}
                            </View>
                        ))}
                    </CompendiumDisclosure>
                </CompendiumDetailSection>
            ) : null}
        </>
    );
}

const styles = StyleSheet.create({
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
