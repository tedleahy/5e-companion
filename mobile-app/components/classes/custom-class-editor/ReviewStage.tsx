import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { fieldStyles } from './fields';
import type { Draft } from './types';

/**
 * Review stage: summary of the draft before save.
 */
export default function ReviewStage({ draft, locked }: { draft: Draft; locked: boolean }) {
    return (
        <View style={styles.review}>
            <Text style={styles.reviewTitle}>{draft.name}</Text>
            <Text selectable style={styles.reviewBody}>
                {draft.description}
            </Text>
            <Text style={styles.reviewLine}>
                d{draft.hitDie} · {draft.primaryAbilityIndexes.join(', ').toUpperCase()}
            </Text>
            <Text style={styles.reviewLine}>
                {draft.features.length} features · {draft.spells.length} spells
            </Text>
            {locked ? (
                <Text style={styles.lockText}>Only descriptive fields will be updated.</Text>
            ) : (
                <Text style={fieldStyles.helper}>Review all stages. Saving is available only here.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    review: { gap: fantasyTokens.spacing.md },
    reviewTitle: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.inkDark,
    },
    reviewBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    reviewLine: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
    lockText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.crimson,
        textAlign: 'center',
    },
});
