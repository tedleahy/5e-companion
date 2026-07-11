import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { AbilityPicker, Chip, Field, NumberField, fieldStyles } from './fields';
import type { DraftLevel, StageProps } from './types';

type ProgressionStageProps = StageProps & {
    progressionLevel: number;
    onProgressionLevelChange: (level: number) => void;
};

/**
 * Progression stage: spellcasting mode and per-level progression fields.
 */
export default function ProgressionStage({
    draft,
    locked,
    onChange,
    progressionLevel,
    onProgressionLevelChange,
}: ProgressionStageProps) {
    const currentLevel = draft.progression[progressionLevel - 1]!;

    function updateCurrentLevel(patch: Partial<DraftLevel>) {
        if (locked) return;
        onChange({
            progression: draft.progression.map((item) =>
                item.level === progressionLevel ? { ...item, ...patch } : item,
            ),
        });
    }

    return (
        <>
            <Text style={fieldStyles.label}>Spellcasting mode</Text>
            <View style={fieldStyles.chips}>
                {['NONE', 'STANDARD', 'PACT_MAGIC'].map((mode) => (
                    <Chip
                        key={mode}
                        label={mode.replace('_', ' ')}
                        selected={draft.spellcastingMode === mode}
                        disabled={locked}
                        onPress={() =>
                            onChange({
                                spellcastingMode: mode,
                                spellcastingAbility: mode === 'NONE' ? null : draft.spellcastingAbility,
                            })
                        }
                    />
                ))}
            </View>
            {draft.spellcastingMode !== 'NONE' ? (
                <AbilityPicker
                    label="Spellcasting ability"
                    selected={draft.spellcastingAbility ? [draft.spellcastingAbility] : []}
                    disabled={locked}
                    onPress={(value) => onChange({ spellcastingAbility: value })}
                />
            ) : null}
            <View style={styles.levelPicker}>
                <Text style={fieldStyles.label}>Progression level</Text>
                <NumericStepper
                    value={progressionLevel}
                    canDecrease={progressionLevel > 1}
                    canIncrease={progressionLevel < 20}
                    decrementLabel="Previous class level"
                    incrementLabel="Next class level"
                    tone="parchment"
                    onDecrease={() => onProgressionLevelChange(progressionLevel - 1)}
                    onIncrease={() => onProgressionLevelChange(progressionLevel + 1)}
                />
            </View>
            <Pressable
                disabled={locked}
                onPress={() =>
                    updateCurrentLevel({
                        abilityScoreImprovement: !currentLevel.abilityScoreImprovement,
                    })
                }
                style={[
                    fieldStyles.checkbox,
                    currentLevel.abilityScoreImprovement && fieldStyles.checkboxSelected,
                ]}
            >
                <Text style={fieldStyles.checkboxText}>
                    {currentLevel.abilityScoreImprovement ? '✓ ' : ''}
                    Ability Score Improvement
                </Text>
            </Pressable>
            <Field
                label="Spell slots, levels 1–9"
                helper="Nine comma-separated non-negative values."
                editable={!locked && draft.spellcastingMode !== 'NONE'}
                value={currentLevel.spellSlots.join(',')}
                onChangeText={(text) =>
                    updateCurrentLevel({
                        spellSlots: text
                            .split(',')
                            .map((value) => Math.max(0, Number(value.trim()) || 0))
                            .concat(Array(9).fill(0))
                            .slice(0, 9),
                    })
                }
            />
            <View style={styles.fieldGrid}>
                <NumberField
                    label="Cantrips known"
                    value={currentLevel.cantripsKnown}
                    disabled={locked}
                    onChange={(cantripsKnown) => updateCurrentLevel({ cantripsKnown })}
                />
                <NumberField
                    label="Spells known"
                    value={currentLevel.spellsKnown}
                    disabled={locked}
                    onChange={(spellsKnown) => updateCurrentLevel({ spellsKnown })}
                />
                <NumberField
                    label="Prepared base"
                    value={currentLevel.preparedSpellCount}
                    disabled={locked}
                    onChange={(preparedSpellCount) => updateCurrentLevel({ preparedSpellCount })}
                />
            </View>
            <Pressable
                testID="custom-class-add-spellcasting-ability"
                disabled={locked || draft.spellcastingMode === 'NONE'}
                onPress={() =>
                    updateCurrentLevel({
                        addSpellcastingAbility: !currentLevel.addSpellcastingAbility,
                    })
                }
                style={[
                    fieldStyles.checkbox,
                    currentLevel.addSpellcastingAbility && fieldStyles.checkboxSelected,
                    (locked || draft.spellcastingMode === 'NONE') && fieldStyles.disabled,
                ]}
            >
                <Text style={fieldStyles.checkboxText}>
                    {currentLevel.addSpellcastingAbility ? '✓ ' : ''}
                    Add spellcasting ability modifier to prepared spells
                </Text>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    levelPicker: {
        gap: fantasyTokens.spacing.sm,
        alignItems: 'flex-start',
    },
    fieldGrid: { gap: fantasyTokens.spacing.md },
});
