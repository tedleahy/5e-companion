import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Draft } from '@/api/characters';
import { colors, typography } from '@/theme';

import { useCardScale } from './card-scale';
import { DraftCard } from './draft-card';

type DraftTrayProps = {
    drafts: Draft[];
    alone?: boolean;
    style?: StyleProp<ViewStyle>;
};

/**
 * The drafts waiting above the list, under a small heading and over a dashed accent rule.
 *
 * @param props.drafts - The drafts to show, in the API's order.
 * @param props.alone - Set when the player has drafts but no characters, so the tray is the only
 *   thing on the list. It then leaves out the dashed rule, which only exists to separate the tray
 *   from the characters below it.
 * @param props.style - Overrides for the tray's outer spacing, such as in the two-column layout.
 */
export function DraftTray({ drafts, alone = false, style }: DraftTrayProps) {
    const { wide } = useCardScale();

    return (
        <View style={[styles.tray, wide && styles.wideTray, style]}>
            <Text role="heading" style={[typography.smallLabel, styles.heading]}>
                Waiting to be finished
            </Text>
            <View style={[styles.drafts, !alone && styles.draftsAboveRule]}>
                {drafts.map((draft) => (
                    <DraftCard key={draft.id} draft={draft} />
                ))}
            </View>
            {!alone && <DashedRule />}
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
    wideTray: {
        marginBottom: 4,
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
    },
    draftsAboveRule: {
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
