import { StyleSheet, Text, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type DetailFact = {
    label: string;
    value: string;
};

export default function CompendiumFactGrid({ facts }: { facts: DetailFact[] }) {
    return (
        <View style={styles.grid}>
            {facts.map((fact) => (
                <View key={fact.label} style={styles.fact}>
                    <Text style={styles.label}>{fact.label}</Text>
                    <Text style={styles.value} selectable>{fact.value}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    fact: {
        flexGrow: 1,
        minWidth: fantasyTokens.spacing.xxl * 2,
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    label: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    value: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
});
