import { StyleSheet, Text, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumScreenHeaderProps = {
    eyebrow: string;
    title: string;
};

/** Shared title treatment for the Compendium hub and category screens. */
export default function CompendiumScreenHeader({
    eyebrow,
    title,
}: CompendiumScreenHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.rail.border,
    },
    eyebrow: {
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
        ...fantasyTokens.typography.eyebrow,
        textAlign: 'center',
    },
    title: {
        color: fantasyTokens.colors.parchment,
        ...fantasyTokens.typography.pageTitle,
        marginTop: fantasyTokens.spacing.xs,
        fontWeight: '700',
        textAlign: 'center',
    },
});
