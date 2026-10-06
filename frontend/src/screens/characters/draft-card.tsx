import { StyleSheet, Text, View } from 'react-native';

import type { Draft } from '@/api/characters';
import { draftCopy } from '@/characters/display';
import { SecondaryButton } from '@/components/buttons';
import { CharacterToken } from '@/components/character-token';
import { colors, typography } from '@/theme';

type DraftCardProps = {
    draft: Draft;
    /** Reopens the draft where the player left it. Unset until the draft routes exist. */
    onResume?: () => void;
};

/** An unfinished creation or level-up, with its progress and a Resume button. */
export function DraftCard({ draft, onResume }: DraftCardProps) {
    const { title, detail, resumeLabel } = draftCopy(draft, true);

    return (
        <View style={styles.card}>
            <CharacterToken
                name={draft.kind === 'creation' ? draft.name : draft.character_name}
                draft
            />
            <View style={styles.text}>
                <Text style={[typography.namePhone, styles.title]}>{title}</Text>
                <Text style={[typography.subtitle, styles.detail]}>{detail}</Text>
            </View>
            <SecondaryButton
                label={resumeLabel}
                accessibilityLabel={resumeAccessibilityLabel(draft)}
                size="small"
                onPress={onResume}
            />
        </View>
    );
}

/** Names the draft in the button's label, since every Resume button reads the same. */
function resumeAccessibilityLabel(draft: Draft): string {
    if (draft.kind === 'level_up') return `Resume ${draft.character_name}'s level-up`;

    const name = draft.name?.trim();
    return name ? `Resume creating ${name}` : 'Resume creating a new character';
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
