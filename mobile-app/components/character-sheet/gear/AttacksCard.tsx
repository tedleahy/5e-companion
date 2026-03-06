import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Attack } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type AttacksCardProps = {
    attacks: Attack[];
};

function attackIcon(type: string): string {
    const normalizedType = type.trim().toLowerCase();
    if (normalizedType === 'spell') return '✨';
    if (normalizedType === 'ranged') return '🏹';
    return '🗡';
}

function attackTypeLabel(type: string): string {
    if (type.length === 0) return 'Attack';
    return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

export default function AttacksCard({ attacks }: AttacksCardProps) {
    const weapons = attacks.filter((attack) => attack.type.trim().toLowerCase() !== 'spell');

    return (
        <SheetCard index={1}>
            <SectionLabel>Weapons</SectionLabel>

            {weapons.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No weapons recorded.</Text>
                </View>
            ) : (
                <View style={styles.attackList}>
                    {weapons.map((attack, index) => (
                        <View
                            key={attack.id}
                            style={[
                                styles.attackRow,
                                index < weapons.length - 1 && styles.attackRowBorder,
                            ]}
                        >
                            <View style={styles.attackIcon}>
                                <Text style={styles.attackIconText}>{attackIcon(attack.type)}</Text>
                            </View>

                            <View style={styles.attackInfo}>
                                <Text style={styles.attackName}>{attack.name}</Text>
                                <Text style={styles.attackType}>{attackTypeLabel(attack.type)}</Text>
                            </View>

                            <View style={styles.attackStats} testID={`attack-stats-${attack.id}`}>
                                <Text style={styles.attackBonus}>{attack.attackBonus}</Text>
                                <Text style={styles.attackDamage}>{attack.damage}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    attackList: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    attackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
    },
    attackRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,90,43,0.12)',
    },
    attackIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        flexShrink: 0,
        backgroundColor: 'rgba(139,26,26,0.08)',
    },
    attackIconText: {
        fontSize: 18,
        lineHeight: 18,
    },
    attackInfo: {
        flex: 1,
        minWidth: 0,
    },
    attackName: {
        fontFamily: 'serif',
        fontSize: 14,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
    },
    attackType: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        fontStyle: 'italic',
        marginTop: 1,
    },
    attackStats: {
        alignItems: 'flex-end',
        marginLeft: 'auto',
        flexShrink: 0,
    },
    attackBonus: {
        fontFamily: 'serif',
        fontSize: 13,
        fontWeight: '700',
        color: fantasyTokens.colors.crimson,
    },
    attackDamage: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        marginTop: 1,
        textAlign: 'right',
    },
    emptyState: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 16,
    },
    emptyStateText: {
        fontFamily: 'serif',
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
