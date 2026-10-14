import { StyleSheet, Text, View } from 'react-native';

import type { Draft } from '@/api/characters';
import { draftCopy } from '@/characters/display';
import { SecondaryButton } from '@/components/buttons';
import { CharacterToken } from '@/components/character-token';
import { Heading } from '@/components/heading';
import { colors } from '@/theme';

import { useCardScale } from './card-scale';
import { ROW_SPACING } from './character-row';

type DraftCardProps = {
    draft: Draft;
    onResume?: () => void;
};

/**
 * An unfinished creation or level-up, with its progress and a Resume button. Phones get the short
 * copy, and wider screens add the next step and name the kind of draft on the button.
 *
 * @param props.draft - The unfinished creation or level-up whose progress to show.
 * @param props.onResume - Reopens the draft where the player left it. Leave unset until draft routes exist.
 */
export function DraftCard({ draft, onResume }: DraftCardProps) {
    const scale = useCardScale();
    const { title, detail, resumeLabel, resumeAccessibilityLabel } = draftCopy(draft, !scale.wide);
    const token = (
        <CharacterToken
            name={draft.kind === 'creation' ? draft.name : draft.character_name}
            size={scale.tokenSize}
            draft
        />
    );

    return (
        <View style={[styles.card, scale.wide && styles.wideCard]}>
            {scale.wide ? <View style={styles.wideTokenColumn}>{token}</View> : token}
            <View style={styles.text}>
                {/* Under the tray's heading, so a screen reader can step from draft to draft. */}
                <Heading level={3} style={[scale.name, styles.title]}>
                    {title}
                </Heading>
                <Text style={[scale.subtitle, styles.detail]}>{detail}</Text>
            </View>
            <SecondaryButton
                label={resumeLabel}
                accessibilityLabel={resumeAccessibilityLabel}
                size="small"
                onPress={onResume}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 11,
        paddingHorizontal: 12,
        backgroundColor: colors.draftFill,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.structural,
    },
    wideCard: {
        gap: ROW_SPACING.gap,
        paddingVertical: ROW_SPACING.paddingVertical,
        paddingHorizontal: ROW_SPACING.paddingHorizontal,
    },
    wideTokenColumn: {
        width: ROW_SPACING.tokenColumn,
    },
    text: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        color: colors.text,
    },
    detail: {
        marginTop: 2,
        color: colors.dim,
    },
});
