import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CharacterSummary } from '@/api/characters';
import { hitPoints, subtitle } from '@/characters/display';
import { CharacterToken } from '@/components/character-token';
import { HitPoints } from '@/components/hit-points';
import { LevelBlock } from '@/components/level-block';
import { PrintPressable } from '@/components/print-pressable';
import { colors } from '@/theme';

import { useCardScale } from './card-scale';

type CharacterCardProps = {
    character: CharacterSummary;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
};

/**
 * One character in the list. The whole card is a single link named by the character: the token
 * beside the name, the level block at the top right, and the hit points across the bottom.
 *
 * @param props.character - The character whose identity, level, and hit points to show.
 * @param props.onPress - Opens the character sheet. Leave unset until the sheet route exists.
 * @param props.style - Additional styles for the card surface and its layout.
 */
export function CharacterCard({ character, onPress, style }: CharacterCardProps) {
    const scale = useCardScale();

    return (
        <PrintPressable
            depth={5}
            role="link"
            accessibilityLabel={character.name}
            onPress={onPress}
            style={[styles.card, scale.wide && styles.wideCard, style]}
        >
            <CharacterToken name={character.name} size={scale.tokenSize} />
            <View style={styles.details}>
                <View style={styles.summary}>
                    <View style={styles.identity}>
                        <Text style={[scale.name, styles.name]}>{character.name}</Text>
                        <Text style={[scale.subtitle, styles.subtitle]}>{subtitle(character)}</Text>
                    </View>
                    <View style={styles.level}>
                        <LevelBlock level={character.total_level} large={scale.largeLevelLabel} />
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
    wideCard: {
        gap: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
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
