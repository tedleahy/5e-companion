import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import {
    nextChoiceGroupId,
    type ProficiencyChoiceGroup,
} from './draft';
import CardRemoveButton from './CardRemoveButton';
import { Chip, fieldStyles } from './fields';
import ProficiencyPickerSheet, { type ProficiencyOption } from './ProficiencyPickerSheet';

type PickerTarget =
    | { kind: 'fixed' }
    | { kind: 'choice'; choiceGroup: number; isNew?: boolean };

type ProficiencyGrantEditorProps = {
    label: string;
    grant: string;
    fixedValues: string[];
    choiceGroups: ProficiencyChoiceGroup[];
    options: ProficiencyOption[];
    locked: boolean;
    onChangeFixed: (values: string[]) => void;
    onChangeChoiceGroups: (groups: ProficiencyChoiceGroup[]) => void;
};

/**
 * Editor for one proficiency grant (STARTING or MULTICLASS): fixed grants plus choice groups.
 */
export default function ProficiencyGrantEditor({
    label,
    grant,
    fixedValues,
    choiceGroups,
    options,
    locked,
    onChangeFixed,
    onChangeChoiceGroups,
}: ProficiencyGrantEditorProps) {
    const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

    const nameByValue = useMemo(() => {
        const map = new Map(options.map((option) => [option.value, option.name]));
        return map;
    }, [options]);

    const usedElsewhere = useMemo(() => {
        if (!pickerTarget) return [] as string[];
        if (pickerTarget.kind === 'fixed') {
            return choiceGroups.flatMap((group) => group.values);
        }
        return [
            ...fixedValues,
            ...choiceGroups
                .filter((group) => group.choiceGroup !== pickerTarget.choiceGroup)
                .flatMap((group) => group.values),
        ];
    }, [choiceGroups, fixedValues, pickerTarget]);

    const pickerSelected = useMemo(() => {
        if (!pickerTarget) return [] as string[];
        if (pickerTarget.kind === 'fixed') return fixedValues;
        if (pickerTarget.isNew) return [];
        return choiceGroups.find((group) => group.choiceGroup === pickerTarget.choiceGroup)?.values ?? [];
    }, [choiceGroups, fixedValues, pickerTarget]);

    function labelFor(value: string) {
        return nameByValue.get(value) ?? value;
    }

    function removeFixed(value: string) {
        onChangeFixed(fixedValues.filter((entry) => entry !== value));
    }

    function updateGroup(choiceGroup: number, patch: Partial<ProficiencyChoiceGroup>) {
        onChangeChoiceGroups(
            choiceGroups.map((group) =>
                group.choiceGroup === choiceGroup ? { ...group, ...patch } : group,
            ),
        );
    }

    function removeGroup(choiceGroup: number) {
        onChangeChoiceGroups(choiceGroups.filter((group) => group.choiceGroup !== choiceGroup));
    }

    function removeOption(choiceGroup: number, value: string) {
        const next = choiceGroups
            .map((group) => {
                if (group.choiceGroup !== choiceGroup) return group;
                const values = group.values.filter((entry) => entry !== value);
                return {
                    ...group,
                    values,
                    choiceCount: Math.min(group.choiceCount, Math.max(1, values.length)),
                };
            })
            .filter((group) => group.values.length > 0);
        onChangeChoiceGroups(next);
    }

    function addChoiceGroup() {
        setPickerTarget({ kind: 'choice', choiceGroup: nextChoiceGroupId(choiceGroups), isNew: true });
    }

    function handlePickerConfirm(values: string[]) {
        if (!pickerTarget) return;
        if (pickerTarget.kind === 'fixed') {
            onChangeFixed(values);
            return;
        }
        if (pickerTarget.isNew) {
            if (values.length === 0) return;
            onChangeChoiceGroups([
                ...choiceGroups,
                { choiceGroup: pickerTarget.choiceGroup, choiceCount: 1, values },
            ]);
            return;
        }
        if (values.length === 0) {
            removeGroup(pickerTarget.choiceGroup);
            return;
        }
        const existing = choiceGroups.find((group) => group.choiceGroup === pickerTarget.choiceGroup);
        updateGroup(pickerTarget.choiceGroup, {
            values,
            choiceCount: Math.min(existing?.choiceCount ?? 1, values.length),
        });
    }

    return (
        <View style={styles.root} testID={`proficiency-grant-${grant}`}>
            <Text style={fieldStyles.label}>{label}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Always granted</Text>
                <View style={fieldStyles.chips}>
                    {fixedValues.map((value) => (
                        <Chip
                            key={value}
                            label={labelFor(value)}
                            selected
                            disabled={locked}
                            onPress={() => {
                                if (!locked) removeFixed(value);
                            }}
                        />
                    ))}
                </View>
                {fixedValues.length === 0 ? (
                    <Text style={fieldStyles.helper}>No fixed proficiencies yet.</Text>
                ) : (
                    <Text style={fieldStyles.helper}>Tap a chip to deselect it.</Text>
                )}
                {!locked ? (
                    <Pressable
                        style={styles.addButton}
                        testID={`add-fixed-${grant}`}
                        onPress={() => setPickerTarget({ kind: 'fixed' })}
                    >
                        <Text style={styles.addLabel}>+ Add proficiencies</Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choice groups</Text>
                <Text style={fieldStyles.helper}>
                    Players pick N options from each group (for example, choose 2 skills).
                </Text>
                {choiceGroups.map((group) => (
                    <View key={group.choiceGroup} style={styles.groupCard}>
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupTitle}>Choice group {group.choiceGroup}</Text>
                            {!locked ? (
                                <CardRemoveButton
                                    accessibilityLabel={`Remove choice group ${group.choiceGroup}`}
                                    onPress={() => removeGroup(group.choiceGroup)}
                                    testID={`remove-proficiency-choice-group-${grant}-${group.choiceGroup}`}
                                />
                            ) : null}
                        </View>
                        <View style={styles.chooseRow}>
                            <Text style={styles.chooseLabel}>Choose</Text>
                            <NumericStepper
                                value={group.choiceCount}
                                canDecrease={!locked && group.choiceCount > 1}
                                canIncrease={!locked && group.choiceCount < group.values.length}
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
                                        choiceCount: Math.min(group.values.length, group.choiceCount + 1),
                                    })
                                }
                            />
                        </View>
                        <View style={fieldStyles.chips}>
                            {group.values.map((value) => (
                                <Chip
                                    key={value}
                                    label={labelFor(value)}
                                    selected
                                    disabled={locked}
                                    onPress={() => {
                                        if (!locked) removeOption(group.choiceGroup, value);
                                    }}
                                />
                            ))}
                        </View>
                        {group.values.length === 0 ? (
                            <Text style={fieldStyles.helper}>Add options for this choice.</Text>
                        ) : null}
                        {!locked ? (
                            <Pressable
                                onPress={() =>
                                    setPickerTarget({ kind: 'choice', choiceGroup: group.choiceGroup })
                                }
                            >
                                <Text style={styles.link}>+ Edit options</Text>
                            </Pressable>
                        ) : null}
                    </View>
                ))}
                {!locked ? (
                    <Pressable
                        style={styles.addButton}
                        testID={`add-choice-group-${grant}`}
                        onPress={addChoiceGroup}
                    >
                        <Text style={styles.addLabel}>+ Add choice group</Text>
                    </Pressable>
                ) : null}
            </View>

            <ProficiencyPickerSheet
                visible={pickerTarget != null}
                title={pickerTarget?.kind === 'fixed' ? `Add ${label.toLowerCase()}` : 'Edit choice options'}
                options={options}
                initiallySelected={pickerSelected}
                excludedValues={usedElsewhere}
                onConfirm={handlePickerConfirm}
                onClose={() => setPickerTarget(null)}
            />
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
