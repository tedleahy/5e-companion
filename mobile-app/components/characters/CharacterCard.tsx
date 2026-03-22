import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Card-ready character data consumed by the characters list.
 */
export type CharacterCardData = {
    id: string;
    name: string;
    race: string;
    className: string;
    classSummary: string;
    level: number;
    conditions: string[];
    hpCurrent: number;
    hpMax: number;
    ac: number;
    attackBonusLabel: string;
    initiative: number;
};

/**
 * Character card props.
 */
type CharacterCardProps = {
    character: CharacterCardData;
    onPress: (characterId: string) => void;
};

/**
 * Class-colour gradient bands used at the top of each character card.
 */
const CLASS_BAND_COLOURS: Record<string, readonly [string, string, string]> = {
    wizard: ['#4a1a6b', '#8b3ab4', '#c9922a'],
    fighter: ['#6b1a1a', '#b43a3a', '#c9922a'],
    rogue: ['#1a2a1a', '#2a4a2a', '#5a8a3a'],
    cleric: ['#1a1a4a', '#3a3ab4', '#c9922a'],
    barbarian: ['#5a1710', '#8e2f24', '#c9922a'],
    bard: ['#4a1a3a', '#944f7f', '#c9922a'],
    druid: ['#16371e', '#2e6b3a', '#b5a453'],
    monk: ['#3b2014', '#8b5636', '#d1a14b'],
    paladin: ['#2a234d', '#5e57a2', '#d4b05c'],
    ranger: ['#1c3a28', '#2d6a49', '#c0a15a'],
    sorcerer: ['#4d142f', '#8d2f5a', '#d1a44e'],
    warlock: ['#24163b', '#5d3a8f', '#b892db'],
    default: ['#2a1a08', '#6b4a1a', '#c9922a'],
};

/**
 * Class-to-avatar emoji map used as a temporary portrait placeholder.
 */
const CLASS_AVATARS: Record<string, string> = {
    wizard: '🧙',
    fighter: '⚔',
    rogue: '🗡',
    cleric: '✚',
    barbarian: '🪓',
    bard: '🎵',
    druid: '🌿',
    monk: '👊',
    paladin: '🛡',
    ranger: '🏹',
    sorcerer: '✨',
    warlock: '☽',
    default: '👤',
};

/**
 * Converts a class label to a normalised key for maps.
 */
function normaliseClassKey(className: string): string {
    return className.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Returns the class gradient colours, with a safe fallback.
 */
function classBandColours(className: string): readonly [string, string, string] {
    const classKey = normaliseClassKey(className);
    return CLASS_BAND_COLOURS[classKey] ?? CLASS_BAND_COLOURS.default;
}

/**
 * Returns the avatar emoji for the given class name.
 */
function classAvatar(className: string): string {
    const classKey = normaliseClassKey(className);
    return CLASS_AVATARS[classKey] ?? CLASS_AVATARS.default;
}

/**
 * Formats signed values using `+` for positive numbers.
 */
function formatSignedValue(value: number): string {
    if (value > 0) return `+${value}`;
    return `${value}`;
}

/**
 * Ensures HP ratio stays within [0, 1] and avoids divide-by-zero issues.
 */
function healthRatio(currentHp: number, maxHp: number): number {
    if (maxHp <= 0) return 0;
    const ratio = currentHp / maxHp;
    return Math.max(0, Math.min(1, ratio));
}

/**
 * Character roster card styled to match the step-3 "My Characters" design.
 */
export default function CharacterCard({ character, onPress }: CharacterCardProps) {
    const identityClassText = `${character.race} · ${character.classSummary}`;
    const hpRatio = healthRatio(character.hpCurrent, character.hpMax);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${character.name}`}
            onPress={() => onPress(character.id)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            testID={`character-card-${character.id}`}
        >
            <LinearGradient
                colors={classBandColours(character.className)}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.cardBand}
            />

            <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarEmoji}>{classAvatar(character.className)}</Text>
                    </View>
                    <View style={styles.identity}>
                        <Text style={styles.name} numberOfLines={1}>{character.name}</Text>
                        <Text style={styles.identityClass} numberOfLines={1}>{identityClassText}</Text>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelBadgeText}>Level {character.level}</Text>
                        </View>
                    </View>
                </View>

                {character.conditions.length > 0 && (
                    <View style={styles.conditionsRow}>
                        {character.conditions.map((condition) => (
                            <View key={condition} style={styles.conditionChip}>
                                <Text style={styles.conditionChipText}>{condition}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.statsRow}>
                    <View style={styles.statCell}>
                        <Text style={[styles.statValue, styles.hpValue]}>{character.hpCurrent}<Text style={styles.hpMax}>/{character.hpMax}</Text></Text>
                        <Text style={styles.statLabel}>HP</Text>
                    </View>
                    <View style={styles.statDivider} />

                    <View style={styles.statCell}>
                        <Text style={[styles.statValue, styles.acValue]}>{character.ac}</Text>
                        <Text style={styles.statLabel}>AC</Text>
                    </View>
                    <View style={styles.statDivider} />

                    <View style={styles.statCell}>
                        <Text style={styles.statValue}>{character.attackBonusLabel}</Text>
                        <Text style={styles.statLabel}>Atk Bonus</Text>
                    </View>
                    <View style={styles.statDivider} />

                    <View style={styles.statCell}>
                        <Text style={styles.statValue}>{formatSignedValue(character.initiative)}</Text>
                        <Text style={styles.statLabel}>Init</Text>
                    </View>
                </View>

                <View style={styles.hpBarWrap}>
                    <View style={styles.hpBarTrack}>
                        <View style={[styles.hpBarFill, { width: `${hpRatio * 100}%` }]} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.viewSheetText}>View Sheet →</Text>
                </View>
            </View>
        </Pressable>
    );
}

/**
 * Styles for the fantasy character roster card.
 */
const styles = StyleSheet.create({
    card: {
        backgroundColor: fantasyTokens.colors.cardBg,
        borderRadius: fantasyTokens.radii.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(43,28,17,0.08)',
    },
    cardPressed: {
        opacity: 0.92,
    },
    cardBand: {
        width: '100%',
        height: 6,
    },
    cardBody: {
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 18,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: 'rgba(0,0,0,0.12)',
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 26,
    },
    identity: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        color: fantasyTokens.colors.inkDark,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 18,
        lineHeight: 21,
        fontWeight: '700',
    },
    identityClass: {
        color: 'rgba(61,43,31,0.74)',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        lineHeight: 18,
        fontStyle: 'italic',
        marginTop: 1,
    },
    levelBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.22)',
        backgroundColor: 'rgba(139,26,26,0.12)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 5,
    },
    levelBadgeText: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 10,
        lineHeight: 11,
        fontWeight: '700',
    },
    conditionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginTop: 8,
    },
    conditionChip: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.crimson,
        backgroundColor: 'rgba(139,26,26,0.07)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    conditionChipText: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 7,
        lineHeight: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statsRow: {
        marginTop: 14,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.06)',
        flexDirection: 'row',
    },
    statCell: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    statDivider: {
        width: 1,
        backgroundColor: fantasyTokens.colors.divider,
    },
    statValue: {
        color: fantasyTokens.colors.inkDark,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '700',
    },
    hpValue: {
        color: fantasyTokens.colors.crimson,
    },
    hpMax: {
        color: 'rgba(61,43,31,0.52)',
        fontSize: 10,
    },
    acValue: {
        color: fantasyTokens.colors.greenDark,
    },
    statLabel: {
        color: 'rgba(61,43,31,0.53)',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 7,
        lineHeight: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    hpBarWrap: {
        marginTop: 12,
    },
    hpBarTrack: {
        height: 5,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: 'rgba(139,26,26,0.12)',
    },
    hpBarFill: {
        height: 5,
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    footer: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.divider,
        alignItems: 'flex-end',
    },
    viewSheetText: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontSize: 8,
        lineHeight: 11,
    },
});
