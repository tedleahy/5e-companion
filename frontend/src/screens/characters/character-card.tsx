import { StyleSheet, Text, View } from 'react-native';

import type { CharacterSummary } from '@/api/characters';
import { hitPoints, subtitle } from '@/characters/display';
import { CharacterToken } from '@/components/character-token';
import { HitPoints } from '@/components/hit-points';
import { LevelBlock } from '@/components/level-block';
import { PrintPressable } from '@/components/print-pressable';
import { colors, typography } from '@/theme';

type CharacterCardProps = {
    character: CharacterSummary;
    /** Opens the character's sheet. Unset until the sheet route exists. */
    onPress?: () => void;
};

/**
 * One character in the list. The whole card is a single link named by the character: the token
 * beside the name, the level block at the top right, and the hit points across the bottom.
 */
export function CharacterCard({ character, onPress }: CharacterCardProps) {
    return (
        <PrintPressable
            depth={5}
            role="link"
            accessibilityLabel={character.name}
            onPress={onPress}
            style={styles.card}
        >
            <CharacterToken name={character.name} />
            <View style={styles.details}>
                <View style={styles.summary}>
                    <View style={styles.identity}>
                        <Text style={[typography.namePhone, styles.name]}>{character.name}</Text>
                        <Text style={[typography.subtitle, styles.subtitle]}>
                            {subtitle(character)}
                        </Text>
                    </View>
                    <View style={styles.level}>
                        <LevelBlock level={character.total_level} />
                    </View>
                </View>
                <HitPoints display={hitPoints(character.hit_points)} />
            </View>
        </PrintPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 11,
        paddingHorizontal: 12,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
    },
    details: {
        flex: 1,
        minWidth: 0,
    },
    summary: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 13,
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
        marginBottom: 8,
        color: colors.dim,
    },
    level: {
        marginBottom: 8,
    },
});
