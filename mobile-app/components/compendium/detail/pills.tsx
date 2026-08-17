import { StyleSheet, Text, View } from 'react-native';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import { fantasyTokens } from '@/theme/fantasyTheme';

export default function CompendiumPills({
    values,
    emptyLabel,
}: {
    values: string[];
    emptyLabel?: string;
}) {
    if (values.length === 0) {
        return emptyLabel ? <CompendiumBodyText>{emptyLabel}</CompendiumBodyText> : null;
    }

    return (
        <View style={styles.pills}>
            {values.map((value, index) => (
                <View key={`${value}-${index}`} style={styles.pill}>
                    <Text style={styles.text} selectable>{value}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    pill: {
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.lg,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    text: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkDark,
    },
});
