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
import CardRemoveButton from './CardRemoveButton';
import EquipmentRow from './EquipmentRow';
import { fieldStyles } from './fields';
import { canAddEquipmentEntry, STARTING_EQUIPMENT_REFERENCE_COPY } from './limits';

type EquipmentEditorProps = {
    fixedItems: EquipmentEntry[];
    choiceGroups: EquipmentChoiceGroup[];
    locked: boolean;
    onChangeFixed: (items: EquipmentEntry[]) => void;
    onChangeChoiceGroups: (groups: EquipmentChoiceGroup[]) => void;
};

/**
 * Editor for starting equipment: fixed grants plus choice groups.
 * Definitions are reference metadata only — they are not written to inventory.
 */
export default function EquipmentEditor({
    fixedItems,
    choiceGroups,
    locked,
    onChangeFixed,
    onChangeChoiceGroups,
}: EquipmentEditorProps) {
    const equipmentCount = fixedItems.length
        + choiceGroups.reduce((total, group) => total + group.items.length, 0);
    const canAddEquipment = !locked && canAddEquipmentEntry(equipmentCount);

    function updateFixed(key: string, item: EquipmentEntry) {
        onChangeFixed(fixedItems.map((entry) => (entry.key === key ? item : entry)));
    }

    function removeFixed(key: string) {
        onChangeFixed(fixedItems.filter((entry) => entry.key !== key));
    }

    function addFixed() {
        if (!canAddEquipment) return;
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
        if (!canAddEquipment) return;
        const group = choiceGroups.find((entry) => entry.choiceGroup === choiceGroup);
        if (!group) return;
        updateGroup(choiceGroup, {
            items: [...group.items, { key: newEquipmentKey(), name: '', quantity: 1 }],
        });
    }

    function addChoiceGroup() {
        if (!canAddEquipment) return;
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
            <View style={styles.intro}>
                <Text style={fieldStyles.label}>Starting equipment</Text>
                <Text style={fieldStyles.helper} testID="equipment-reference-copy">
                    {STARTING_EQUIPMENT_REFERENCE_COPY}
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Always granted</Text>
                    {fixedItems.length > 0 ? (
                        <Text style={styles.countBadge}>{fixedItems.length}</Text>
                    ) : null}
                </View>
                {fixedItems.length === 0 ? (
                    <View style={styles.emptyHint}>
                        <Text style={styles.emptyHintText}>No fixed gear yet.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {fixedItems.map((item) => (
                            <EquipmentRow
                                key={item.key}
                                item={item}
                                locked={locked}
                                onChange={(next) => updateFixed(item.key, next)}
                                onRemove={() => removeFixed(item.key)}
                            />
                        ))}
                    </View>
                )}
                {canAddEquipment ? (
                    <Pressable
                        style={styles.addButton}
                        testID="add-fixed-equipment"
                        onPress={addFixed}
                    >
                        <Text style={styles.addLabel}>+ Add equipment</Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Choice groups</Text>
                    {choiceGroups.length > 0 ? (
                        <Text style={styles.countBadge}>{choiceGroups.length}</Text>
                    ) : null}
                </View>
                <Text style={styles.sectionHelper}>Players pick N options from each group.</Text>
                {choiceGroups.map((group) => (
                    <View
                        key={group.choiceGroup}
                        style={styles.groupCard}
                        testID={`equipment-choice-group-${group.choiceGroup}`}
                    >
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupTitle}>Group {group.choiceGroup}</Text>
                            {!locked ? (
                                <CardRemoveButton
                                    accessibilityLabel={`Remove choice group ${group.choiceGroup}`}
                                    onPress={() => removeGroup(group.choiceGroup)}
                                    testID={`remove-equipment-choice-group-${group.choiceGroup}`}
                                    style={styles.groupRemove}
                                />
                            ) : null}
                        </View>
                        <View style={styles.chooseRow}>
                            <Text style={styles.chooseLabel}>Choose</Text>
                            <NumericStepper
                                size="compact"
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
                            <Text style={styles.chooseOf}>
                                of {group.items.length} option{group.items.length === 1 ? '' : 's'}
                            </Text>
                        </View>
                        <View style={styles.list}>
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
                        </View>
                        {canAddEquipment ? (
                            <Pressable
                                style={styles.ghostAdd}
                                onPress={() => addOption(group.choiceGroup)}
                            >
                                <Text style={styles.ghostAddLabel}>+ Add option</Text>
                            </Pressable>
                        ) : null}
                    </View>
                ))}
                {canAddEquipment ? (
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
    intro: { gap: fantasyTokens.spacing.xs },
    section: { gap: fantasyTokens.spacing.sm },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    sectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontSize: 18,
    },
    countBadge: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: 3,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        color: fantasyTokens.colors.goldLight,
    },
    sectionHelper: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        marginTop: -fantasyTokens.spacing.xs,
    },
    list: { gap: fantasyTokens.spacing.sm },
    emptyHint: {
        paddingVertical: fantasyTokens.spacing.md,
        paddingHorizontal: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
    },
    emptyHintText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        fontStyle: 'italic',
        opacity: 0.85,
        textAlign: 'center',
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
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: 11,
    },
    groupRemove: {
        width: 36,
        height: 36,
    },
    chooseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
    },
    chooseLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    chooseOf: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    ghostAdd: {
        alignSelf: 'flex-start',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
    },
    ghostAddLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
    addButton: {
        ...nightFormStyles.dashedAddButton,
    },
    addLabel: {
        ...nightFormStyles.dashedAddButtonText,
    },
});
