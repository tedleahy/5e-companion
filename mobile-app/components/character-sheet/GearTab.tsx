import { ScrollView, StyleSheet, View } from 'react-native';
import type { Attack, Currency, InventoryItem } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import AttacksCard from './gear/AttacksCard';
import CurrencyCard from './gear/CurrencyCard';
import InventoryCard from './gear/InventoryCard';
import SheetAddButton from './SheetAddButton';

type GearTabProps = {
    weapons: Attack[];
    inventory: InventoryItem[];
    currency: Currency;
};

export default function GearTab({
    weapons,
    inventory,
    currency,
}: GearTabProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <CurrencyCard currency={currency} />
                <AttacksCard attacks={weapons} />
                <InventoryCard inventory={inventory} />

                <SheetAddButton
                    label="+ Add Item"
                    accessibilityLabel="Add item"
                    disabled
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
