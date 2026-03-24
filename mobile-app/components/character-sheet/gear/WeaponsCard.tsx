import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Weapon } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import InlineField from '../edit-mode/InlineField';
import RemoveButton from '../edit-mode/RemoveButton';
import SectionHeader from '../edit-mode/SectionHeader';
import SheetCard from '../SheetCard';

type WeaponsCardProps = {
    weapons: Weapon[];
    editMode: boolean;
    onAddWeapon: () => void;
    onChangeWeapon: (weaponId: string, field: 'name' | 'attackBonus' | 'damage', value: string) => void;
    onRemoveWeapon: (weaponId: string) => void;
};

/**
 * Resolves the decorative icon for one weapon row.
 */
function weaponIcon(type: string): string {
    const normalizedType = type.trim().toLowerCase();
    if (normalizedType === 'spell') return '✨';
    if (normalizedType === 'ranged') return '🏹';
    return '🗡';
}

/**
 * Formats the weapon type label shown in the row metadata.
 */
function weaponTypeLabel(type: string): string {
    if (type.length === 0) return 'Weapon';
    return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

/**
 * Renders the editable weapons card within the gear tab.
 */
export default function WeaponsCard({
    weapons,
    editMode,
    onAddWeapon,
    onChangeWeapon,
    onRemoveWeapon,
}: WeaponsCardProps) {
    const visibleWeapons = weapons.filter((weapon) => weapon.type.trim().toLowerCase() !== 'spell');

    return (
        <SheetCard index={1}>
            <SectionHeader title="Weapons" editMode={editMode} onAdd={onAddWeapon} addLabel="+ Add" />

            {visibleWeapons.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No weapons recorded.</Text>
                </View>
            ) : (
                <View style={styles.weaponList}>
                    {visibleWeapons.map((weapon, index) => (
                        <View
                            key={weapon.id}
                            style={[
                                styles.weaponRow,
                                index < visibleWeapons.length - 1 && styles.weaponRowBorder,
                            ]}
                        >
                            <View style={styles.weaponIcon}>
                                <Text style={styles.weaponIconText}>{weaponIcon(weapon.type)}</Text>
                            </View>

                            <View style={styles.weaponInfo}>
                                <InlineField
                                    value={weapon.name}
                                    onChangeText={(value: string) => onChangeWeapon(weapon.id, 'name', value)}
                                    editMode={editMode}
                                    style={styles.weaponName}
                                    placeholder="Weapon name"
                                />
                                <InlineField
                                    value={weapon.damage}
                                    onChangeText={(value: string) => onChangeWeapon(weapon.id, 'damage', value)}
                                    editMode={editMode}
                                    style={styles.weaponType}
                                    placeholder={weaponTypeLabel(weapon.type)}
                                />
                            </View>

                            <View style={styles.weaponStats} testID={`weapon-stats-${weapon.id}`}>
                                <InlineField
                                    value={weapon.attackBonus}
                                    onChangeText={(value: string) => onChangeWeapon(weapon.id, 'attackBonus', value)}
                                    editMode={editMode}
                                    style={styles.weaponAttackBonus}
                                    placeholder="+0"
                                    align="right"
                                />
                                <Text style={styles.weaponTypeLabel}>{weaponTypeLabel(weapon.type)}</Text>
                            </View>

                            <RemoveButton
                                editMode={editMode}
                                accessibilityLabel={`Remove ${weapon.name || 'weapon'}`}
                                onPress={() => onRemoveWeapon(weapon.id)}
                            />
                        </View>
                    ))}
                </View>
            )}
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    weaponList: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    weaponRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
    },
    weaponRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,90,43,0.12)',
    },
    weaponIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        flexShrink: 0,
        backgroundColor: 'rgba(139,26,26,0.08)',
    },
    weaponIconText: {
        fontSize: fantasyTokens.fontSizes.title,
        lineHeight: 18,
    },
    weaponInfo: {
        flex: 1,
        minWidth: 0,
    },
    weaponName: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
    },
    weaponType: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        fontStyle: 'italic',
        marginTop: 1,
    },
    weaponStats: {
        alignItems: 'flex-end',
        marginLeft: 'auto',
        flexShrink: 0,
    },
    weaponAttackBonus: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontWeight: '700',
        color: fantasyTokens.colors.crimson,
    },
    weaponTypeLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
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
        fontSize: fantasyTokens.fontSizes.label,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
