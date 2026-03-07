import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { InventoryItem } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import CardDivider from '../CardDivider';
import InlineField from '../edit-mode/InlineField';
import RemoveButton from '../edit-mode/RemoveButton';
import SheetCard from '../SheetCard';

type InventoryCardProps = {
    inventory: InventoryItem[];
    editMode: boolean;
    onAddInventoryItem: () => void;
    onChangeInventoryItem: (itemId: string, changes: Partial<InventoryItem>) => void;
    onRemoveInventoryItem: (itemId: string) => void;
    onToggleInventoryEquip: (itemId: string) => void;
};

type InventoryGroupKey = 'equipped' | 'backpack' | 'other';

type InventoryGroup = {
    key: InventoryGroupKey;
    label: string;
    items: InventoryItem[];
};

function inventoryIcon(name: string): string {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('staff') || normalizedName.includes('wand')) return '🪄';
    if (normalizedName.includes('book')) return '📚';
    if (normalizedName.includes('dagger') || normalizedName.includes('sword')) return '🗡';
    if (normalizedName.includes('scroll')) return '📜';
    if (normalizedName.includes('potion')) return '🧪';
    if (normalizedName.includes('ring')) return '💍';
    if (normalizedName.includes('robe') || normalizedName.includes('armor')) return '👘';
    if (normalizedName.includes('orb') || normalizedName.includes('focus')) return '🔮';

    return '🎒';
}

function formatWeight(weight: number | null | undefined): string {
    if (weight === null || weight === undefined) return '—';

    if (Number.isInteger(weight)) {
        if (weight === 1) return '1 lb';
        return `${weight} lbs`;
    }

    return `${weight} lbs`;
}

function inventoryDescription(item: InventoryItem): string {
    if (item.description && item.description.trim().length > 0) return item.description;
    if (item.magical) return 'Magical item';
    if (item.equipped) return 'Equipped item';
    return 'Stored in backpack';
}

function groupInventory(inventory: InventoryItem[]): InventoryGroup[] {
    const equipped = inventory.filter((item) => item.equipped);
    const backpack = inventory.filter((item) => !item.equipped && item.quantity > 0);
    const other = inventory.filter((item) => !item.equipped && item.quantity <= 0);

    const groups: InventoryGroup[] = [
        { key: 'equipped', label: 'Equipped', items: equipped },
        { key: 'backpack', label: 'Backpack', items: backpack },
        { key: 'other', label: 'Other', items: other },
    ];

    return groups.filter((group) => group.items.length > 0);
}

export default function InventoryCard({
    inventory,
    editMode,
    onAddInventoryItem,
    onChangeInventoryItem,
    onRemoveInventoryItem,
    onToggleInventoryEquip,
}: InventoryCardProps) {
    const groups = groupInventory(inventory);

    /** Whether any visible group already has the backpack add control. */
    const hasBackpackGroup = groups.some((group) => group.key === 'backpack');

    return (
        <SheetCard index={2}>
            {editMode && !hasBackpackGroup && (
                <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>Inventory</Text>
                    <View style={styles.groupLine} />
                    <Pressable onPress={onAddInventoryItem} accessibilityRole="button" accessibilityLabel="Add backpack item">
                        <Text style={styles.groupAddButton}>+ Add</Text>
                    </Pressable>
                </View>
            )}
            {groups.length === 0 && !editMode ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No inventory items yet.</Text>
                </View>
            ) : (
                groups.map((group, groupIndex) => (
                    <View key={group.key} testID={`inventory-group-${group.key}`}>
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupTitle}>{group.label}</Text>
                            <View style={styles.groupLine} />
                            {editMode && group.key === 'backpack' && (
                                <Pressable onPress={onAddInventoryItem} accessibilityRole="button" accessibilityLabel="Add backpack item">
                                    <Text style={styles.groupAddButton}>+ Add</Text>
                                </Pressable>
                            )}
                            <Text style={styles.groupCount}>{group.items.length}</Text>
                        </View>

                        <View style={styles.inventoryList}>
                            {group.items.map((item, itemIndex) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.inventoryRow,
                                        itemIndex < group.items.length - 1 && styles.inventoryRowBorder,
                                    ]}
                                    testID={`inventory-row-${item.id}`}
                                >
                                    <View style={styles.inventoryIconWrap}>
                                        <View style={styles.inventoryIcon}>
                                            <Text style={styles.inventoryIconText}>
                                                {inventoryIcon(item.name)}
                                            </Text>
                                        </View>
                                        {item.magical && <View style={styles.magicalDot} />}
                                    </View>

                                    <View style={styles.inventoryInfo}>
                                        <InlineField
                                            value={item.name}
                                            onChangeText={(value: string) => onChangeInventoryItem(item.id, { name: value })}
                                            editMode={editMode && !item.equipped}
                                            style={[
                                                styles.inventoryName,
                                                item.equipped && styles.inventoryNameEquipped,
                                            ]}
                                            placeholder="Item name"
                                        />
                                        <InlineField
                                            value={item.description ?? ''}
                                            onChangeText={(value: string) => onChangeInventoryItem(item.id, { description: value })}
                                            editMode={editMode && !item.equipped}
                                            style={styles.inventoryDescription}
                                            placeholder={inventoryDescription(item)}
                                        />
                                    </View>

                                    <View style={styles.inventoryRight}>
                                        {editMode ? (
                                            <Pressable onPress={() => onToggleInventoryEquip(item.id)}>
                                                <Text style={styles.equippedBadge}>{item.equipped ? 'Unequip' : 'Equip'}</Text>
                                            </Pressable>
                                        ) : item.equipped ? (
                                            <Text style={styles.equippedBadge}>Equipped</Text>
                                        ) : (
                                            <Text style={styles.quantityText}>x{item.quantity}</Text>
                                        )}
                                        <Text style={styles.weightText}>{formatWeight(item.weight)}</Text>
                                    </View>

                                    <RemoveButton
                                        editMode={editMode && !item.equipped}
                                        accessibilityLabel={`Remove ${item.name || 'item'}`}
                                        onPress={() => onRemoveInventoryItem(item.id)}
                                    />
                                </View>
                            ))}
                        </View>

                        {groupIndex < groups.length - 1 && <CardDivider />}
                    </View>
                ))
            )}
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 4,
    },
    groupTitle: {
        fontFamily: 'serif',
        fontSize: 8.5,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
    },
    groupLine: {
        flex: 1,
        height: 1,
        backgroundColor: fantasyTokens.colors.divider,
    },
    groupCount: {
        fontFamily: 'serif',
        fontSize: 8,
        color: fantasyTokens.colors.gold,
        opacity: 0.6,
        backgroundColor: 'rgba(201,146,42,0.12)',
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 2,
        overflow: 'hidden',
    },
    groupAddButton: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.75,
        marginRight: 8,
    },
    inventoryList: {
        paddingHorizontal: 18,
    },
    inventoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
    },
    inventoryRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,90,43,0.12)',
    },
    inventoryIconWrap: {
        position: 'relative',
        flexShrink: 0,
    },
    inventoryIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    inventoryIconText: {
        fontSize: 18,
        lineHeight: 18,
    },
    magicalDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: fantasyTokens.colors.gold,
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.cardBg,
    },
    inventoryInfo: {
        flex: 1,
        minWidth: 0,
    },
    inventoryName: {
        fontFamily: 'serif',
        fontSize: 14,
        color: fantasyTokens.colors.inkDark,
        lineHeight: 17,
    },
    inventoryNameEquipped: {
        fontWeight: '600',
    },
    inventoryDescription: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        fontStyle: 'italic',
        marginTop: 1,
    },
    inventoryRight: {
        alignItems: 'flex-end',
        gap: 3,
        flexShrink: 0,
    },
    quantityText: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
    },
    weightText: {
        fontFamily: 'serif',
        fontSize: 10,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.4,
    },
    equippedBadge: {
        fontFamily: 'serif',
        fontSize: 7,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: 'rgba(26,74,26,0.12)',
        color: fantasyTokens.colors.greenDark,
        overflow: 'hidden',
    },
    emptyState: {
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    emptyStateText: {
        fontFamily: 'serif',
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
