import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { FantasyFormTextInput } from '@/components/FantasyFormTextInput';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import CardRemoveButton from './CardRemoveButton';
import type { EquipmentEntry } from './draft';

type EquipmentRowProps = {
    item: EquipmentEntry;
    locked: boolean;
    nested?: boolean;
    onChange: (item: EquipmentEntry) => void;
    onRemove: () => void;
};

/**
 * Compact starting-equipment entry: name + quantity on one row, with remove.
 */
export default function EquipmentRow({
    item,
    locked,
    nested,
    onChange,
    onRemove,
}: EquipmentRowProps) {
    return (
        <View style={[styles.row, nested ? styles.nestedRow : styles.cardRow]}>
            <View style={styles.nameField}>
                <FantasyFormTextInput
                    dense
                    value={item.name}
                    editable={!locked}
                    placeholder="Item name"
                    accessibilityLabel="Equipment name"
                    testID={`equipment-name-${item.key}`}
                    onChangeText={(name) => onChange({ ...item, name })}
                />
            </View>
            <View style={styles.qtyBlock}>
                <Text style={styles.qtyLabel} accessibilityElementsHidden>
                    ×
                </Text>
                <NumericStepper
                    size="compact"
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
            </View>
            {!locked ? (
                <CardRemoveButton
                    accessibilityLabel={nested ? 'Remove equipment option' : 'Remove equipment item'}
                    onPress={onRemove}
                    testID={`remove-equipment-item-${item.key}`}
                    style={styles.removeButton}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    cardRow: {
        ...nightFormStyles.card,
        paddingVertical: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.sm,
    },
    nestedRow: {
        paddingVertical: fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
    },
    nameField: {
        flex: 1,
        minWidth: 0,
    },
    qtyBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        flexShrink: 0,
    },
    qtyLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        fontSize: fantasyTokens.fontSizes.caption,
    },
    removeButton: {
        width: 36,
        height: 36,
        flexShrink: 0,
    },
});
