import { StyleSheet, Text, View } from 'react-native';

import type { CharacterSummary } from '@/api/characters';
import { hitPoints, subtitle } from '@/characters/display';
import { SecondaryButton } from '@/components/buttons';
import { CharacterToken } from '@/components/character-token';
import { Heading } from '@/components/heading';
import { HitPoints } from '@/components/hit-points';
import { LevelBlock } from '@/components/level-block';
import { colors, offsetShadow } from '@/theme';

import { useCardScale } from './card-scale';

/**
 * The row's spacing. The wide draft card uses it too, so on desktop a draft's token and name line
 * up with the rows below it.
 */
export const ROW_SPACING = {
    tokenColumn: 74,
    gap: 22,
    paddingVertical: 16,
    paddingHorizontal: 22,
} as const;

type CharacterRowProps = {
    character: CharacterSummary;
    onOpen?: () => void;
};

/**
 * One character on the desktop list, in columns: token, name and subtitle, level, hit points, then
 * an Open sheet link. Only the link is pressable, not the row.
 *
 * @param props.character - The character whose summary to show in the desktop columns.
 * @param props.onOpen - Opens the character sheet. Leave unset until the sheet route exists.
 */
export function CharacterRow({ character, onOpen }: CharacterRowProps) {
    const scale = useCardScale();

    return (
        <View style={styles.row}>
            <View style={styles.tokenColumn}>
                <CharacterToken name={character.name} size={scale.tokenSize} />
            </View>
            <View style={styles.identity}>
                {/* The row isn't a link as phone and tablet cards are, so its name is a heading to
                    give a screen reader a way to step from character to character. */}
                <Heading level={2} style={[scale.name, styles.name]}>
                    {character.name}
                </Heading>
                <Text style={[scale.subtitle, styles.subtitle]}>{subtitle(character)}</Text>
            </View>
            <View style={styles.levelColumn}>
                <LevelBlock level={character.total_level} large={scale.largeLevelLabel} />
            </View>
            <View style={styles.hitPointColumn}>
                <HitPoints display={hitPoints(character.hit_points)} />
            </View>
            <SecondaryButton
                label="Open sheet"
                aria-label={`Open ${character.name}'s sheet`}
                size="medium"
                role="link"
                onPress={onOpen}
                style={styles.open}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ROW_SPACING.gap,
        paddingVertical: ROW_SPACING.paddingVertical,
        paddingHorizontal: ROW_SPACING.paddingHorizontal,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
        boxShadow: offsetShadow(5, 'accent'),
    },
    tokenColumn: {
        width: ROW_SPACING.tokenColumn,
    },
    identity: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        color: colors.text,
    },
    subtitle: {
        marginTop: 2,
        color: colors.dim,
    },
    levelColumn: {
        width: 84,
    },
    hitPointColumn: {
        width: 240,
    },
    open: {
        width: 128,
    },
});
