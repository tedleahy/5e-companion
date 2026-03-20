import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { InventoryItem } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import CardDivider from '../CardDivider';
import InlineField from '../edit-mode/InlineField';
import RemoveButton from '../edit-mode/RemoveButton';
import SheetCard from '../SheetCard';
import SectionHeader from '../edit-mode/SectionHeader';

type InventoryCardProps = {
    inventory: InventoryItem[];
    editMode: boolean;
    onAddInventoryItem: () => void;
    onChangeInventoryItem: (itemId: string, changes: Partial<InventoryItem>) => void;
    onRemoveInventoryItem: (itemId: string) => void;
    onToggleInventoryEquip: (itemId: string) => void;
};

type InventoryGroupKey = 'equipped' | 'backpack';

type InventoryGroup = {
    key: InventoryGroupKey;
    label: string;
    items: InventoryItem[];
};

/**
 * Chooses a small fantasy-themed icon based on the item name.
 */
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

/**
 * Formats item weight for compact row display.
 */
function formatWeight(weight: number | null | undefined): string {
    if (weight === null || weight === undefined) return '—';

    if (Number.isInteger(weight)) {
        if (weight === 1) return '1 lb';
        return `${weight} lbs`;
    }

    return `${weight} lbs`;
}

/**
 * Builds a fallback inventory description when the item has no custom copy.
 */
function inventoryDescription(item: InventoryItem): string {
    if (item.description && item.description.trim().length > 0) return item.description;
    if (item.magical) return 'Magical item';
    if (item.equipped) return 'Equipped item';
    return 'Stored in backpack';
}

/**
 * Returns only the inventory groups that should be rendered for the current mode.
 */
function visibleInventoryGroups(inventory: InventoryItem[], editMode: boolean): InventoryGroup[] {
    const equipped = inventory.filter((item) => item.equipped);
    const backpack = inventory.filter((item) => !item.equipped && item.quantity > 0);
    const groups: InventoryGroup[] = [];

    if (equipped.length > 0) {
        groups.push({ key: 'equipped', label: 'Equipped', items: equipped });
    }

    if (backpack.length > 0 || editMode) {
        groups.push({ key: 'backpack', label: 'Backpack', items: backpack });
    }

    return groups;
}

/**
 * Renders the character inventory card with equipped and backpack groupings.
 */
export default function InventoryCard({
    inventory,
    editMode,
    onAddInventoryItem,
    onChangeInventoryItem,
    onRemoveInventoryItem,
    onToggleInventoryEquip,
}: InventoryCardProps) {
    const groups = visibleInventoryGroups(inventory, editMode);

    return (
        <SheetCard index={2}>
            {inventory.length === 0 && !editMode ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No inventory items yet.</Text>
                </View>
            ) : (
                groups.map((group, groupIndex) => (
                    <View key={group.key} testID={`inventory-group-${group.key}`}>
                        <SectionHeader
                            editMode={editMode}
                            title={group.label}
                            onAdd={group.key === 'backpack' ? onAddInventoryItem : undefined}
                        />

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
                                        <Pressable onPress={() => onToggleInventoryEquip(item.id)}>
                                            <Text style={styles.equippedBadge}>
                                                {item.equipped ? 'Unequip' : 'Equip'}
                                            </Text>
                                        </Pressable>
                                        {!item.equipped && (
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        color: fantasyTokens.colors.inkDark,
        lineHeight: 17,
    },
    inventoryNameEquipped: {
        fontWeight: '600',
    },
    inventoryDescription: {
        fontFamily: fantasyTokens.fonts.regular,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
    },
    weightText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.4,
    },
    equippedBadge: {
        fontFamily: fantasyTokens.fonts.regular,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
