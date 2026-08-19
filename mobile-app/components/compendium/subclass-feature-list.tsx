import { StyleSheet, Text, View } from 'react-native';
import type { SubclassFeature } from '@/components/compendium/subclass-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SubclassFeatureListProps = {
    features: SubclassFeature[];
};

/** Level-badged subclass features, ordered by when they unlock. */
export default function SubclassFeatureList({ features }: SubclassFeatureListProps) {
    return (
        <View style={styles.list}>
            {features.map((feature) => (
                <View key={feature.id} style={styles.card}>
                    <View style={styles.heading}>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelLabel}>{`Level ${feature.level}`}</Text>
                        </View>
                        <Text style={styles.title} selectable>{feature.name}</Text>
                    </View>
                    <Text style={styles.body} selectable>{feature.description}</Text>
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
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    levelBadge: {
        paddingHorizontal: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.lg,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    levelLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    title: {
        flexShrink: 1,
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    body: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});
