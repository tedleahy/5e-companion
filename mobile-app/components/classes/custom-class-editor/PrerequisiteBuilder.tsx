import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { ABILITIES } from './types';
import { Chip, fieldStyles } from './fields';

export type PrerequisiteRow = {
    abilityIndex: string;
    minimum: number;
    group: number;
};

type PrerequisiteBuilderProps = {
    value: PrerequisiteRow[];
    locked: boolean;
    onChange: (value: PrerequisiteRow[]) => void;
};

/**
 * Structured multiclass prerequisite editor: OR within a group, AND across groups.
 */
export default function PrerequisiteBuilder({ value, locked, onChange }: PrerequisiteBuilderProps) {
    const groups = [...new Set(value.map((item) => item.group))].sort((left, right) => left - right);

    function nextGroupId() {
        return value.reduce((max, item) => Math.max(max, item.group), 0) + 1;
    }

    function updateRow(index: number, patch: Partial<PrerequisiteRow>) {
        onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
    }

    function removeRow(index: number) {
        onChange(value.filter((_, itemIndex) => itemIndex !== index));
    }

    function addRequirement() {
        onChange([
            ...value,
            { abilityIndex: 'str', minimum: 13, group: nextGroupId() },
        ]);
    }

    function addOrAlternative(group: number) {
        onChange([
            ...value,
            { abilityIndex: 'dex', minimum: 13, group },
        ]);
    }

    return (
        <View style={styles.root}>
            <Text style={fieldStyles.label}>Multiclass prerequisites</Text>
            <Text style={fieldStyles.helper}>
                Same group = OR. Different groups = AND. Example: STR 13 or DEX 13 share a group.
            </Text>

            {groups.map((group) => {
                const rows = value
                    .map((item, index) => ({ item, index }))
                    .filter(({ item }) => item.group === group);

                return (
                    <View key={group} style={styles.groupCard} testID={`prerequisite-group-${group}`}>
                        <Text style={styles.groupTitle}>
                            Group {group}
                            {rows.length > 1 ? ' (any one)' : ''}
                        </Text>
                        {rows.map(({ item, index }, rowIndex) => (
                            <View key={`${group}-${index}`} style={styles.row}>
                                {rowIndex > 0 ? <Text style={styles.orLabel}>or</Text> : null}
                                <View style={fieldStyles.chips}>
                                    {ABILITIES.map((ability) => (
                                        <Chip
                                            key={ability.value}
                                            label={ability.label}
                                            selected={item.abilityIndex === ability.value}
                                            disabled={locked}
                                            onPress={() => updateRow(index, { abilityIndex: ability.value })}
                                        />
                                    ))}
                                </View>
                                <View style={styles.minimumRow}>
                                    <Text style={styles.minimumLabel}>Minimum</Text>
                                    <View style={styles.stepper}>
                                        <Pressable
                                            disabled={locked || item.minimum <= 1}
                                            onPress={() => updateRow(index, { minimum: Math.max(1, item.minimum - 1) })}
                                            style={[styles.stepperButton, locked && fieldStyles.disabled]}
                                            accessibilityRole="button"
                                            accessibilityLabel="Decrease minimum"
                                        >
                                            <Text style={styles.stepperText}>−</Text>
                                        </Pressable>
                                        <Text style={styles.minimumValue}>{item.minimum}</Text>
                                        <Pressable
                                            disabled={locked || item.minimum >= 30}
                                            onPress={() => updateRow(index, { minimum: Math.min(30, item.minimum + 1) })}
                                            style={[styles.stepperButton, locked && fieldStyles.disabled]}
                                            accessibilityRole="button"
                                            accessibilityLabel="Increase minimum"
                                        >
                                            <Text style={styles.stepperText}>+</Text>
                                        </Pressable>
                                    </View>
                                    {!locked ? (
                                        <Pressable onPress={() => removeRow(index)}>
                                            <Text style={styles.remove}>Remove</Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            </View>
                        ))}
                        {!locked ? (
                            <Pressable onPress={() => addOrAlternative(group)}>
                                <Text style={styles.link}>+ Add OR alternative</Text>
                            </Pressable>
                        ) : null}
                    </View>
                );
            })}

            {!locked ? (
                <Pressable style={styles.addButton} onPress={addRequirement} testID="add-prerequisite">
                    <Text style={styles.addLabel}>+ Add requirement</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: fantasyTokens.spacing.md },
    groupCard: {
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    groupTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    row: { gap: fantasyTokens.spacing.sm },
    orLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
        textTransform: 'uppercase',
    },
    minimumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    minimumLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    stepperButton: {
        width: fantasyTokens.spacing.xl + fantasyTokens.spacing.sm,
        height: fantasyTokens.spacing.xl + fantasyTokens.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
    },
    stepperText: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    minimumValue: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        minWidth: fantasyTokens.spacing.lg,
        textAlign: 'center',
    },
    remove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
    },
    link: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    addButton: {
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
    },
    addLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
