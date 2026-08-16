import { StyleSheet, Text, View } from 'react-native';
import { countLabel, sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import CompendiumPills from '@/components/compendium/detail/pills';
import CompendiumReferenceList from '@/components/compendium/detail/reference-list';
import {
    displayLanguageType,
    hasRecordedScript,
    languageScriptMark,
    type Language,
} from '@/components/compendium/language-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Language detail with speakers, learning sources, and same-script peer jumps. */
export default function LanguageDetail({
    language,
    onSelectPeer,
}: {
    language: Language;
    onSelectPeer: (value: string) => void;
}) {
    const learningGroups = [
        { label: 'Races', items: language.grantingRaces },
        { label: 'Backgrounds', items: language.grantingBackgrounds },
        { label: 'Traits', items: language.grantingTraits },
    ];

    return (
        <>
            <CompendiumDetailHero
                mark={languageScriptMark(language.script)}
                eyebrow={sourceLabel(language.sourceBook, language.isCustom)}
                title={language.name}
                summary={language.description ?? 'No description is recorded.'}
                facts={[{ label: 'Known by', value: countLabel(language.characterUsageCount, 'character') }]}
            />
            <CompendiumPills values={[
                displayLanguageType(language.type),
                hasRecordedScript(language.script) ? `${language.script} script` : 'Unwritten / unknown',
            ]} />
            <CompendiumDetailSection title="About the language">
                <CompendiumBodyText>{language.description ?? 'No description is recorded.'}</CompendiumBodyText>
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Typical speakers">
                <CompendiumPills
                    values={language.typicalSpeakers}
                    emptyLabel="No typical speakers are listed."
                />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Learning this language">
                <View style={styles.learningGroups}>
                    {learningGroups.map((group) => (
                        <View key={group.label} style={styles.learningGroup}>
                            <Text style={styles.groupLabel}>{group.label}</Text>
                            <CompendiumReferenceList items={group.items} />
                        </View>
                    ))}
                </View>
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Shares this script">
                <CompendiumReferenceList
                    items={language.sameScriptLanguages}
                    emptyLabel={hasRecordedScript(language.script)
                        ? 'No other languages share this script.'
                        : 'No recorded script to share with other languages.'}
                    onSelect={onSelectPeer}
                />
            </CompendiumDetailSection>
        </>
    );
}

const styles = StyleSheet.create({
    learningGroups: {
        gap: fantasyTokens.spacing.md,
    },
    learningGroup: {
        gap: fantasyTokens.spacing.sm,
    },
    groupLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
});
