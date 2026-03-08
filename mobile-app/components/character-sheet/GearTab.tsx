import { ScrollView, StyleSheet, View } from 'react-native';
import type { Attack, Currency, InventoryItem } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import AttacksCard from './gear/AttacksCard';
import CurrencyCard from './gear/CurrencyCard';
import InventoryCard from './gear/InventoryCard';
import SheetAddButton from './SheetAddButton';

type CurrencyKey = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

type GearTabProps = {
    weapons: Attack[];
    inventory: InventoryItem[];
    currency: Currency;
    editMode: boolean;
    onChangeCurrency: (key: CurrencyKey, value: number) => void;
    onAddWeapon: () => void;
    onChangeWeapon: (weaponId: string, field: 'name' | 'attackBonus' | 'damage', value: string) => void;
    onRemoveWeapon: (weaponId: string) => void;
    onAddInventoryItem: () => void;
    onChangeInventoryItem: (itemId: string, changes: Partial<InventoryItem>) => void;
    onRemoveInventoryItem: (itemId: string) => void;
    onToggleInventoryEquip: (itemId: string) => void;
};

export default function GearTab({
    weapons,
    inventory,
    currency,
    editMode,
    onChangeCurrency,
    onAddWeapon,
    onChangeWeapon,
    onRemoveWeapon,
    onAddInventoryItem,
    onChangeInventoryItem,
    onRemoveInventoryItem,
    onToggleInventoryEquip,
}: GearTabProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <CurrencyCard currency={currency} editMode={editMode} onChangeCurrency={onChangeCurrency} />
                <AttacksCard
                    attacks={weapons}
                    editMode={editMode}
                    onAddWeapon={onAddWeapon}
                    onChangeWeapon={onChangeWeapon}
                    onRemoveWeapon={onRemoveWeapon}
                />
                <InventoryCard
                    inventory={inventory}
                    editMode={editMode}
                    onAddInventoryItem={onAddInventoryItem}
                    onChangeInventoryItem={onChangeInventoryItem}
                    onRemoveInventoryItem={onRemoveInventoryItem}
                    onToggleInventoryEquip={onToggleInventoryEquip}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: fantasyTokens.spacing.md,
        paddingTop: 10,
        paddingBottom: fantasyTokens.spacing.xl * 2,
        gap: 12,
    },
});
