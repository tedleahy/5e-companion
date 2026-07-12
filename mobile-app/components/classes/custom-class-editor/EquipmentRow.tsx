import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { FantasyFormTextInput } from '@/components/FantasyFormTextInput';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import type { EquipmentEntry } from './draft';

type EquipmentRowProps = {
    item: EquipmentEntry;
    locked: boolean;
    nested?: boolean;
    onChange: (item: EquipmentEntry) => void;
    onRemove: () => void;
};

/**
 * Single starting-equipment entry: name field, quantity stepper, remove.
 */
export default function EquipmentRow({
    item,
    locked,
    nested,
    onChange,
    onRemove,
}: EquipmentRowProps) {
    return (
        <View style={nested ? styles.nestedItemRow : styles.itemRow}>
            <FantasyFormTextInput
                label="Name"
                value={item.name}
                editable={!locked}
                testID={`equipment-name-${item.key}`}
                onChangeText={(name) => onChange({ ...item, name })}
            />
            <View style={styles.quantityBlock}>
                <Text style={styles.quantityLabel}>Qty</Text>
                <NumericStepper
                    value={item.quantity}
                    canDecrease={!locked && item.quantity > 1}
                    canIncrease={!locked}
                    decrementLabel="Decrease quantity"
                    incrementLabel="Increase quantity"
                    tone="night"
                    incrementTestID={`equipment-qty-inc-${item.key}`}
                    valueTestID={`equipment-qty-${item.key}`}
                    onDecrease={() => onChange({ ...item, quantity: Math.max(1, item.quantity - 1) })}
                    onIncrease={() => onChange({ ...item, quantity: item.quantity + 1 })}
                />
                {!locked ? (
                    <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel="Remove item">
                        <Text style={styles.remove}>Remove</Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemRow: {
        ...nightFormStyles.card,
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
    },
    nestedItemRow: {
        gap: fantasyTokens.spacing.sm,
    },
    quantityBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    quantityLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    remove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
});
