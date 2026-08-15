import { StyleSheet, Text, View } from 'react-native';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import { fantasyTokens } from '@/theme/fantasyTheme';

type Trait = {
    value: string;
    name: string;
    description: string[];
};

export default function CompendiumTraitList({
    traits,
    emptyLabel = 'No traits are listed.',
}: {
    traits: Trait[];
    emptyLabel?: string;
}) {
    if (traits.length === 0) return <CompendiumBodyText>{emptyLabel}</CompendiumBodyText>;

    return (
        <View style={styles.list}>
            {traits.map((trait) => (
                <View key={trait.value} style={styles.card}>
                    <Text style={styles.title} selectable>{trait.name}</Text>
                    {trait.description.map((paragraph, index) => (
                        <Text key={`${trait.value}-${index}`} style={styles.body} selectable>
                            {paragraph}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: fantasyTokens.spacing.sm,
    },
    card: {
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    body: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});
