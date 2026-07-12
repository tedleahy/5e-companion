import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import {
    newEquipmentKey,
    nextChoiceGroupId,
    type EquipmentChoiceGroup,
    type EquipmentEntry,
} from './draft';
import EquipmentRow from './EquipmentRow';
import { fieldStyles } from './fields';

type EquipmentEditorProps = {
    fixedItems: EquipmentEntry[];
    choiceGroups: EquipmentChoiceGroup[];
    locked: boolean;
    onChangeFixed: (items: EquipmentEntry[]) => void;
    onChangeChoiceGroups: (groups: EquipmentChoiceGroup[]) => void;
};

/**
 * Editor for starting equipment: fixed grants plus choice groups.
 */
export default function EquipmentEditor({
    fixedItems,
    choiceGroups,
    locked,
    onChangeFixed,
    onChangeChoiceGroups,
}: EquipmentEditorProps) {
    function updateFixed(key: string, item: EquipmentEntry) {
        onChangeFixed(fixedItems.map((entry) => (entry.key === key ? item : entry)));
    }

    function removeFixed(key: string) {
        onChangeFixed(fixedItems.filter((entry) => entry.key !== key));
    }

    function addFixed() {
        onChangeFixed([...fixedItems, { key: newEquipmentKey(), name: '', quantity: 1 }]);
    }

    function updateGroup(choiceGroup: number, patch: Partial<EquipmentChoiceGroup>) {
        onChangeChoiceGroups(
            choiceGroups.map((group) =>
                group.choiceGroup === choiceGroup ? { ...group, ...patch } : group,
            ),
        );
    }

    function removeGroup(choiceGroup: number) {
        onChangeChoiceGroups(choiceGroups.filter((group) => group.choiceGroup !== choiceGroup));
    }

    function updateOption(choiceGroup: number, key: string, item: EquipmentEntry) {
        const group = choiceGroups.find((entry) => entry.choiceGroup === choiceGroup);
        if (!group) return;
        updateGroup(choiceGroup, {
            items: group.items.map((entry) => (entry.key === key ? item : entry)),
        });
    }

    function removeOption(choiceGroup: number, key: string) {
        const group = choiceGroups.find((entry) => entry.choiceGroup === choiceGroup);
        if (!group) return;
        const items = group.items.filter((entry) => entry.key !== key);
        if (items.length === 0) {
            removeGroup(choiceGroup);
            return;
        }
        updateGroup(choiceGroup, {
            items,
            choiceCount: Math.min(group.choiceCount, items.length),
        });
    }

    function addOption(choiceGroup: number) {
        const group = choiceGroups.find((entry) => entry.choiceGroup === choiceGroup);
        if (!group) return;
        updateGroup(choiceGroup, {
            items: [...group.items, { key: newEquipmentKey(), name: '', quantity: 1 }],
        });
    }

    function addChoiceGroup() {
        onChangeChoiceGroups([
            ...choiceGroups,
            {
                choiceGroup: nextChoiceGroupId(choiceGroups),
                choiceCount: 1,
                items: [{ key: newEquipmentKey(), name: '', quantity: 1 }],
            },
        ]);
    }

    return (
        <View style={styles.root} testID="equipment-editor">
            <Text style={fieldStyles.label}>Starting equipment</Text>
            <Text style={fieldStyles.helper}>
                Always-granted gear plus optional choice groups (for example, choose 1 of several weapons).
            </Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Always granted</Text>
                {fixedItems.length === 0 ? (
                    <Text style={fieldStyles.helper}>No fixed equipment yet.</Text>
                ) : null}
                {fixedItems.map((item) => (
                    <EquipmentRow
                        key={item.key}
                        item={item}
                        locked={locked}
                        onChange={(next) => updateFixed(item.key, next)}
                        onRemove={() => removeFixed(item.key)}
                    />
                ))}
                {!locked ? (
                    <Pressable style={styles.addButton} testID="add-fixed-equipment" onPress={addFixed}>
                        <Text style={styles.addLabel}>+ Add equipment</Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choice groups</Text>
                <Text style={fieldStyles.helper}>
                    Players pick N options from each group.
                </Text>
                {choiceGroups.map((group) => (
                    <View key={group.choiceGroup} style={styles.groupCard} testID={`equipment-choice-group-${group.choiceGroup}`}>
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupTitle}>Choice group {group.choiceGroup}</Text>
                            {!locked ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove choice group ${group.choiceGroup}`}
                                    onPress={() => removeGroup(group.choiceGroup)}
                                >
                                    <Text style={styles.remove}>Remove</Text>
                                </Pressable>
                            ) : null}
                        </View>
                        <View style={styles.chooseRow}>
                            <Text style={styles.chooseLabel}>Choose</Text>
                            <NumericStepper
                                value={group.choiceCount}
                                canDecrease={!locked && group.choiceCount > 1}
                                canIncrease={!locked && group.choiceCount < group.items.length}
                                decrementLabel="Decrease choose count"
                                incrementLabel="Increase choose count"
                                tone="night"
                                onDecrease={() =>
                                    updateGroup(group.choiceGroup, {
                                        choiceCount: Math.max(1, group.choiceCount - 1),
                                    })
                                }
                                onIncrease={() =>
                                    updateGroup(group.choiceGroup, {
                                        choiceCount: Math.min(group.items.length, group.choiceCount + 1),
                                    })
                                }
                            />
                        </View>
                        {group.items.map((item) => (
                            <EquipmentRow
                                key={item.key}
                                item={item}
                                locked={locked}
                                nested
                                onChange={(next) => updateOption(group.choiceGroup, item.key, next)}
                                onRemove={() => removeOption(group.choiceGroup, item.key)}
                            />
                        ))}
                        {!locked ? (
                            <Pressable onPress={() => addOption(group.choiceGroup)}>
                                <Text style={styles.link}>+ Add option</Text>
                            </Pressable>
                        ) : null}
                    </View>
                ))}
                {!locked ? (
                    <Pressable
                        style={styles.addButton}
                        testID="add-equipment-choice-group"
                        onPress={addChoiceGroup}
                    >
                        <Text style={styles.addLabel}>+ Add choice group</Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: fantasyTokens.spacing.lg },
    section: { gap: fantasyTokens.spacing.sm },
    sectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
    },
    groupCard: {
        ...nightFormStyles.card,
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    groupTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    chooseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    chooseLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    remove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
    link: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    addButton: {
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.crimson,
        borderRadius: fantasyTokens.radii.sm,
    },
    addLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
});
