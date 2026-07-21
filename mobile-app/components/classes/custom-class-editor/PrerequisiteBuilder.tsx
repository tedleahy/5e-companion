import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import { ABILITIES } from './types';
import CardRemoveButton from './CardRemoveButton';
import { fieldStyles } from './fields';

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

const ABILITY_ROWS = [ABILITIES.slice(0, 3), ABILITIES.slice(3, 6)] as const;

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

    function removeGroup(group: number) {
        onChange(value.filter((item) => item.group !== group));
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
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupTitle}>
                                Group {group}
                                {rows.length > 1 ? ' (any one)' : ''}
                            </Text>
                            {!locked ? (
                                <CardRemoveButton
                                    accessibilityLabel={
                                        rows.length > 1
                                            ? `Remove group ${group}`
                                            : `Remove prerequisite ${group}-1`
                                    }
                                    onPress={() => removeGroup(group)}
                                    testID={
                                        rows.length > 1
                                            ? `remove-prerequisite-group-${group}`
                                            : `remove-prerequisite-${group}-1`
                                    }
                                />
                            ) : null}
                        </View>

                        {rows.map(({ item, index }, rowIndex) => (
                            <View
                                key={`${group}-${index}`}
                                style={[styles.alternative, rowIndex > 0 && styles.alternativeFollowOn]}
                            >
                                {rowIndex > 0 ? (
                                    <View style={styles.orRow}>
                                        <Text style={styles.orLabel}>or</Text>
                                        <View style={styles.orRule} />
                                        {!locked ? (
                                            <CardRemoveButton
                                                accessibilityLabel={`Remove prerequisite ${group}-${rowIndex + 1}`}
                                                onPress={() => removeRow(index)}
                                                testID={`remove-prerequisite-${group}-${rowIndex + 1}`}
                                            />
                                        ) : null}
                                    </View>
                                ) : null}

                                <View style={styles.abilityGrid}>
                                    {ABILITY_ROWS.map((abilityRow) => (
                                        <View key={abilityRow.map((ability) => ability.value).join('-')} style={styles.abilityRow}>
                                            {abilityRow.map((ability) => {
                                                const selected = item.abilityIndex === ability.value;
                                                return (
                                                    <Pressable
                                                        key={ability.value}
                                                        disabled={locked}
                                                        onPress={() => updateRow(index, { abilityIndex: ability.value })}
                                                        style={[
                                                            styles.abilityChip,
                                                            selected && styles.abilityChipSelected,
                                                            locked && fieldStyles.disabled,
                                                        ]}
                                                        accessibilityRole="button"
                                                        accessibilityState={{ selected, disabled: locked }}
                                                        accessibilityLabel={ability.label}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.abilityChipText,
                                                                selected && styles.abilityChipTextSelected,
                                                            ]}
                                                        >
                                                            {ability.label}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.minimumRow}>
                                    <Text style={styles.minimumLabel}>Minimum</Text>
                                    <NumericStepper
                                        value={item.minimum}
                                        canDecrease={!locked && item.minimum > 1}
                                        canIncrease={!locked && item.minimum < 30}
                                        decrementLabel="Decrease minimum"
                                        incrementLabel="Increase minimum"
                                        tone="night"
                                        onDecrease={() =>
                                            updateRow(index, { minimum: Math.max(1, item.minimum - 1) })
                                        }
                                        onIncrease={() =>
                                            updateRow(index, { minimum: Math.min(30, item.minimum + 1) })
                                        }
                                    />
                                </View>
                            </View>
                        ))}

                        {!locked ? (
                            <Pressable
                                style={styles.orAddButton}
                                onPress={() => addOrAlternative(group)}
                                accessibilityRole="button"
                            >
                                <Text style={styles.orAddLabel}>+ Add OR alternative</Text>
                            </Pressable>
                        ) : null}
                    </View>
                );
            })}

            {!locked ? (
                <Pressable
                    style={nightFormStyles.dashedAddButton}
                    onPress={addRequirement}
                    testID="add-prerequisite"
                    accessibilityRole="button"
                >
                    <Text style={nightFormStyles.dashedAddButtonText}>+ Add requirement</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: fantasyTokens.spacing.md },
    groupCard: {
        ...nightFormStyles.card,
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    groupTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        flex: 1,
    },
    alternative: {
        gap: fantasyTokens.spacing.sm,
    },
    alternativeFollowOn: {
        paddingTop: fantasyTokens.spacing.xs,
    },
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    orRule: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: fantasyTokens.sheet.form.border,
    },
    orLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        fontSize: fantasyTokens.fontSizes.caption,
    },
    abilityGrid: {
        gap: fantasyTokens.spacing.sm,
    },
    abilityRow: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
    },
    abilityChip: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        borderRadius: fantasyTokens.radii.sm,
    },
    abilityChipSelected: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderColor: fantasyTokens.colors.gold,
    },
    abilityChipText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    abilityChipTextSelected: {
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    minimumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.xs,
    },
    minimumLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    orAddButton: {
        ...nightFormStyles.dashedAddButton,
        paddingVertical: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.xs,
    },
    orAddLabel: {
        ...nightFormStyles.dashedAddButtonText,
    },
});
