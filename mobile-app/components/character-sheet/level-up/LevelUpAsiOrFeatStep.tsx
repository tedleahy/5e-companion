import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Menu, Text, TextInput } from 'react-native-paper';
import NumericStepper from '@/components/wizard/NumericStepper';
import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import {
    canDecreaseLevelUpAbilityScore,
    canIncreaseLevelUpAbilityScore,
    LEVEL_UP_ABILITY_LABELS,
    remainingLevelUpAsiPoints,
} from '@/lib/characterLevelUp/asiOrFeat';
import type { LevelUpAsiOrFeatState } from '@/lib/characterLevelUp/types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpAsiOrFeatStepProps = {
    abilityScores: Record<AbilityKey, number>;
    asiOrFeatState: LevelUpAsiOrFeatState;
    onSelectMode: (mode: 'asi' | 'feat') => void;
    onIncrementAbility: (ability: AbilityKey) => void;
    onDecrementAbility: (ability: AbilityKey) => void;
    onChangeFeatName: (value: string) => void;
    onChangeFeatDescription: (value: string) => void;
    onChangeFeatAbilityIncrease: (value: AbilityKey | null) => void;
};

/**
 * Renders the ASI / feat step for one level-up flow.
 */
export default function LevelUpAsiOrFeatStep({
    abilityScores,
    asiOrFeatState,
    onSelectMode,
    onIncrementAbility,
    onDecrementAbility,
    onChangeFeatName,
    onChangeFeatDescription,
    onChangeFeatAbilityIncrease,
}: LevelUpAsiOrFeatStepProps) {
    const [abilityIncreaseMenuVisible, setAbilityIncreaseMenuVisible] = useState(false);
    const pointsRemaining = remainingLevelUpAsiPoints(asiOrFeatState.allocations);

    return (
        <View style={styles.section} testID="level-up-step-asi_or_feat">
            <Text style={styles.bodyText}>
                At this level you gain an Ability Score Improvement. You can increase your ability scores or take a feat.
            </Text>

            <View style={styles.choiceCards}>
                <Pressable
                    onPress={() => onSelectMode('asi')}
                    style={[
                        styles.choiceCard,
                        asiOrFeatState.mode === 'asi' && styles.choiceCardSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Choose ability score improvements"
                    accessibilityState={{ selected: asiOrFeatState.mode === 'asi' }}
                    testID="level-up-asi-choice"
                >
                    <Text style={styles.choiceIcon}>{'\u{1F4CA}'}</Text>
                    <Text style={styles.choiceTitle}>Ability Scores</Text>
                    <Text style={styles.choiceDescription}>+2 to one score, or +1 to two scores</Text>
                </Pressable>

                <Pressable
                    onPress={() => onSelectMode('feat')}
                    style={[
                        styles.choiceCard,
                        asiOrFeatState.mode === 'feat' && styles.choiceCardSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Choose a feat"
                    accessibilityState={{ selected: asiOrFeatState.mode === 'feat' }}
                    testID="level-up-feat-choice"
                >
                    <Text style={styles.choiceIcon}>{'\u2B50'}</Text>
                    <Text style={styles.choiceTitle}>Feat</Text>
                    <Text style={styles.choiceDescription}>Gain a new feat and its benefits</Text>
                </Pressable>
            </View>

            {asiOrFeatState.mode === 'asi' ? (
                <View style={styles.panel} testID="level-up-asi-panel">
                    <View style={styles.remainingCard} testID="level-up-asi-points-remaining">
                        <Text style={styles.remainingCount}>{pointsRemaining}</Text>
                        <Text style={styles.remainingLabel}>
                            {`${pointsRemaining} point${pointsRemaining === 1 ? '' : 's'} remaining`}
                        </Text>
                    </View>

                    <View style={styles.asiList}>
                        {ABILITY_KEYS.map((ability) => {
                            const assignedIncrease = asiOrFeatState.allocations[ability];
                            const canIncrease = canIncreaseLevelUpAbilityScore(
                                asiOrFeatState.allocations,
                                ability,
                                abilityScores[ability],
                            );
                            const canDecrease = canDecreaseLevelUpAbilityScore(
                                asiOrFeatState.allocations,
                                ability,
                            );

                            return (
                                <View
                                    key={ability}
                                    style={styles.asiRow}
                                    testID={`level-up-asi-row-${ability}`}
                                >
                                    <Text style={styles.asiAbilityName}>{LEVEL_UP_ABILITY_LABELS[ability]}</Text>
                                    <Text style={styles.asiCurrentScore}>{abilityScores[ability]}</Text>

                                    <NumericStepper
                                        value={assignedIncrease > 0 ? `+${assignedIncrease}` : ''}
                                        canDecrease={canDecrease}
                                        canIncrease={canIncrease}
                                        decrementLabel={`Decrease ${LEVEL_UP_ABILITY_LABELS[ability]}`}
                                        incrementLabel={`Increase ${LEVEL_UP_ABILITY_LABELS[ability]}`}
                                        decrementTestID={`level-up-asi-decrement-${ability}`}
                                        incrementTestID={`level-up-asi-increment-${ability}`}
                                        valueTestID={`level-up-asi-increase-${ability}`}
                                        onDecrease={() => onDecrementAbility(ability)}
                                        onIncrease={() => onIncrementAbility(ability)}
                                    />
                                </View>
                            );
                        })}
                    </View>
                </View>
            ) : (
                <View style={styles.panel} testID="level-up-feat-panel">
                    <TextInput
                        mode="outlined"
                        label="Feat Name"
                        placeholder="Feat name (e.g. War Caster)"
                        value={asiOrFeatState.feat.name}
                        onChangeText={onChangeFeatName}
                        outlineColor={fantasyTokens.colors.gold}
                        activeOutlineColor={fantasyTokens.colors.claret}
                        textColor={fantasyTokens.colors.inkDark}
                        style={styles.input}
                        testID="level-up-feat-name-input"
                    />

                    <TextInput
                        mode="outlined"
                        label="Description"
                        placeholder="Describe the feat's benefits..."
                        value={asiOrFeatState.feat.description}
                        onChangeText={onChangeFeatDescription}
                        outlineColor={fantasyTokens.colors.gold}
                        activeOutlineColor={fantasyTokens.colors.claret}
                        textColor={fantasyTokens.colors.inkDark}
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                        testID="level-up-feat-description-input"
                    />

                    <Text style={styles.fieldLabel}>Optional Ability Increase</Text>
                    <Text style={styles.helperText}>
                        Some feats include an ability score increase:
                    </Text>

                    <Menu
                        visible={abilityIncreaseMenuVisible}
                        onDismiss={() => setAbilityIncreaseMenuVisible(false)}
                        anchor={(
                            <Pressable
                                onPress={() => setAbilityIncreaseMenuVisible(true)}
                                style={styles.menuButton}
                                accessibilityRole="button"
                                accessibilityLabel="Select optional feat ability increase"
                                testID="level-up-feat-ability-increase-button"
                            >
                                <Text style={styles.menuButtonText}>
                                    {formatFeatAbilityIncreaseLabel(asiOrFeatState.feat.abilityIncrease)}
                                </Text>
                            </Pressable>
                        )}
                    >
                        <Menu.Item
                            onPress={() => {
                                onChangeFeatAbilityIncrease(null);
                                setAbilityIncreaseMenuVisible(false);
                            }}
                            title="No ability increase"
                            testID="level-up-feat-ability-increase-none"
                        />
                        {ABILITY_KEYS.map((ability) => (
                            <Menu.Item
                                key={ability}
                                onPress={() => {
                                    onChangeFeatAbilityIncrease(ability);
                                    setAbilityIncreaseMenuVisible(false);
                                }}
                                title={`${LEVEL_UP_ABILITY_LABELS[ability]} +1`}
                                testID={`level-up-feat-ability-increase-${ability}`}
                            />
                        ))}
                    </Menu>
                </View>
            )}
        </View>
    );
}

/**
 * Formats the current feat ability-increase selection for the menu button.
 */
function formatFeatAbilityIncreaseLabel(
    ability: AbilityKey | null,
): string {
    if (ability == null) {
        return 'No ability increase';
    }

    return `${LEVEL_UP_ABILITY_LABELS[ability]} +1`;
}

/**
 * Styles for the ASI / feat step.
 */
const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.lg,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    choiceCards: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
    },
    choiceCard: {
        flex: 1,
        borderWidth: 2,
        borderColor: fantasyTokens.colors.sheetDivider,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.lg,
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
    },
    choiceCardSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: '#faf0e8',
    },
    choiceIcon: {
        fontSize: 28,
    },
    choiceTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkDark,
        textAlign: 'center',
    },
    choiceDescription: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
        textAlign: 'center',
    },
    panel: {
        gap: fantasyTokens.spacing.md,
    },
    remainingCard: {
        alignItems: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.md,
        gap: 2,
    },
    remainingCount: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: 22,
        lineHeight: 28,
        color: fantasyTokens.colors.claret,
    },
    remainingLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
        textAlign: 'center',
    },
    asiList: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        overflow: 'hidden',
    },
    asiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.sheetDivider,
    },
    asiAbilityName: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkDark,
        flex: 1,
    },
    asiCurrentScore: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: 22,
        lineHeight: 26,
        color: fantasyTokens.colors.inkLight,
        minWidth: 34,
        textAlign: 'center',
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    textArea: {
        minHeight: 108,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    fieldLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkDark,
    },
    helperText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
        marginTop: -fantasyTokens.spacing.sm,
    },
    menuButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.md,
    },
    menuButtonText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
});
