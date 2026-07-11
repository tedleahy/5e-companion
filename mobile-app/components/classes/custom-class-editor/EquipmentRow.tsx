import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
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
            <TextInput
                mode="outlined"
                label="Name"
                value={item.name}
                editable={!locked}
                outlineColor={fantasyTokens.colors.accordionBorder}
                activeOutlineColor={fantasyTokens.colors.claret}
                textColor={fantasyTokens.colors.inkDark}
                style={styles.nameInput}
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
                    tone="parchment"
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
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    nestedItemRow: {
        gap: fantasyTokens.spacing.sm,
    },
    nameInput: { backgroundColor: fantasyTokens.colors.parchmentLight },
    quantityBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    quantityLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
    remove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
    },
});
