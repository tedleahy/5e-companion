import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Attack } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import InlineField from '../edit-mode/InlineField';
import RemoveButton from '../edit-mode/RemoveButton';
import SectionHeader from '../edit-mode/SectionHeader';
import SheetCard from '../SheetCard';

type AttacksCardProps = {
    attacks: Attack[];
    editMode: boolean;
    onAddWeapon: () => void;
    onChangeWeapon: (weaponId: string, field: 'name' | 'attackBonus' | 'damage', value: string) => void;
    onRemoveWeapon: (weaponId: string) => void;
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

export default function AttacksCard({
    attacks,
    editMode,
    onAddWeapon,
    onChangeWeapon,
    onRemoveWeapon,
}: AttacksCardProps) {
    const weapons = attacks.filter((attack) => attack.type.trim().toLowerCase() !== 'spell');

    return (
        <SheetCard index={1}>
            <SectionHeader title="Weapons" editMode={editMode} onAdd={onAddWeapon} addLabel="+ Add" />

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
                                <InlineField
                                    value={attack.name}
                                    onChangeText={(value: string) => onChangeWeapon(attack.id, 'name', value)}
                                    editMode={editMode}
                                    style={styles.attackName}
                                    placeholder="Weapon name"
                                />
                                <InlineField
                                    value={attack.damage}
                                    onChangeText={(value: string) => onChangeWeapon(attack.id, 'damage', value)}
                                    editMode={editMode}
                                    style={styles.attackType}
                                    placeholder={attackTypeLabel(attack.type)}
                                />
                            </View>

                            <View style={styles.attackStats} testID={`attack-stats-${attack.id}`}>
                                <InlineField
                                    value={attack.attackBonus}
                                    onChangeText={(value: string) => onChangeWeapon(attack.id, 'attackBonus', value)}
                                    editMode={editMode}
                                    style={styles.attackBonus}
                                    placeholder="+0"
                                    align="right"
                                />
                                <Text style={styles.attackDamage}>{attackTypeLabel(attack.type)}</Text>
                            </View>

                            <RemoveButton
                                editMode={editMode}
                                accessibilityLabel={`Remove ${attack.name || 'weapon'}`}
                                onPress={() => onRemoveWeapon(attack.id)}
                            />
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
    },
    attackType: {
        fontFamily: fantasyTokens.fonts.regular,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
        fontWeight: '700',
        color: fantasyTokens.colors.crimson,
    },
    attackDamage: {
        fontFamily: fantasyTokens.fonts.regular,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
