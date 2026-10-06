import { StyleSheet, Text, View } from 'react-native';

import type { Draft } from '@/api/characters';
import { colors, typography } from '@/theme';

import { DraftCard } from './draft-card';

/** The drafts waiting above the list, under a small heading and over a dashed accent rule. */
export function DraftTray({ drafts }: { drafts: Draft[] }) {
    return (
        <View style={styles.tray}>
            <Text role="heading" style={[typography.smallLabel, styles.heading]}>
                Waiting to be finished
            </Text>
            <View style={styles.drafts}>
                {drafts.map((draft) => (
                    <DraftCard key={draft.id} draft={draft} />
                ))}
            </View>
            <DashedRule />
        </View>
    );
}

/**
 * A 2 point dashed line. iOS only dashes a border when every side has the same width, so this
 * draws a fully dashed box and clips all but its bottom edge.
 */
function DashedRule() {
    return (
        <View style={styles.rule}>
            <View style={styles.ruleBox} />
        </View>
    );
}

/** The box has to be tall enough for its top and bottom borders. Only the bottom one shows. */
const RULE_BOX_HEIGHT = 6;

const styles = StyleSheet.create({
    tray: {
        marginBottom: 2,
    },
    heading: {
        // The label style sets its line height to its size, for the level block. A heading on its
        // own line takes the font's natural line height instead, as the mockup does.
        lineHeight: 14,
        marginBottom: 9,
        color: colors.dim,
    },
    drafts: {
        gap: 12,
        paddingBottom: 16,
    },
    rule: {
        height: 2,
        overflow: 'hidden',
    },
    ruleBox: {
        height: RULE_BOX_HEIGHT,
        // Pulls the box up so only its bottom border shows. The side borders only reach into the
        // rule at the corners, which the bottom border fills anyway.
        marginTop: 2 - RULE_BOX_HEIGHT,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.accent,
    },
});
