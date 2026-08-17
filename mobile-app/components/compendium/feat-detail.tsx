import { StyleSheet, Text, View } from 'react-native';
import { countLabel, entryInitials, sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import CompendiumFactGrid from '@/components/compendium/detail/fact-grid';
import { featDescriptionParts, type Feat } from '@/components/compendium/feat-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';

export default function FeatDetail({ feat }: { feat: Feat }) {
    const parts = featDescriptionParts(feat.description);
    const threshold = feat.prerequisiteSummary ?? 'Open to all';

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
                        {parts.benefits.map((benefit, index) => (
                            <View key={`${feat.value}-benefit-${index}`} style={styles.benefit}>
                                <Text style={styles.diamond}>◆</Text>
                                <View style={styles.benefitText}>
                                    <CompendiumBodyText>{benefit}</CompendiumBodyText>
                                </View>
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
                    { label: 'Characters', value: countLabel(feat.characterUsageCount, 'character') },
                ]} />
            </CompendiumDetailSection>
        </>
    );
}

const styles = StyleSheet.create({
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
    benefitText: {
        flex: 1,
    },
    diamond: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.claret,
    },
});
