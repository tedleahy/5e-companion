import { StyleSheet, Text, View } from 'react-native';
import CompendiumFactGrid, {
    type DetailFact,
} from '@/components/compendium/detail/fact-grid';
import { fantasyTokens } from '@/theme/fantasyTheme';

type DetailHeroProps = {
    mark: string;
    eyebrow: string;
    title: string;
    summary?: string | null;
    facts?: DetailFact[];
};

export default function CompendiumDetailHero({
    mark,
    eyebrow,
    title,
    summary,
    facts = [],
}: DetailHeroProps) {
    return (
        <View style={styles.hero}>
            <View style={styles.mark}><Text style={styles.markText}>{mark}</Text></View>
            <View style={styles.copy}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title} selectable>{title}</Text>
                {summary ? <Text style={styles.summary} selectable>{summary}</Text> : null}
            </View>
            {facts.length > 0 ? <CompendiumFactGrid facts={facts} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        gap: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    mark: {
        width: fantasyTokens.spacing.xxl + fantasyTokens.spacing.xl,
        height: fantasyTokens.spacing.xxl + fantasyTokens.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    markText: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.claret,
    },
    copy: {
        gap: fantasyTokens.spacing.xs,
    },
    eyebrow: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    title: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.inkDark,
    },
    summary: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});
