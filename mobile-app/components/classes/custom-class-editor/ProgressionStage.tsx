import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { withPrefillOnLevelAdvance } from './draft';
import { AbilityPicker, Chip, fieldStyles } from './fields';
import SpellSlotsEditor from './SpellSlotsEditor';
import { StepperCard, StepperCardField } from './StepperCard';
import type { DraftLevel, StageProps } from './types';

/** Upper bound for cantrips known / spells known / prepared base steppers. */
const MAX_SPELLCASTING_COUNT = 20;

type ProgressionStageProps = StageProps & {
    progressionLevel: number;
    onProgressionLevelChange: (level: number) => void;
};

type CountStepperProps = {
    label: string;
    value: number | null | undefined;
    locked: boolean;
    valueTestID: string;
    onChange: (value: number) => void;
};

/**
 * Count stepper for spellcasting progression. Unset (null) displays as 0.
 */
function CountStepper({
    label,
    value,
    locked,
    valueTestID,
    onChange,
}: CountStepperProps) {
    const count = value ?? 0;

    return (
        <StepperCardField label={label}>
            <NumericStepper
                value={count}
                canDecrease={!locked && count > 0}
                canIncrease={!locked && count < MAX_SPELLCASTING_COUNT}
                decrementLabel={`Decrease ${label.toLowerCase()}`}
                incrementLabel={`Increase ${label.toLowerCase()}`}
                tone="parchment"
                valueTestID={valueTestID}
                onDecrease={() => onChange(count - 1)}
                onIncrease={() => onChange(count + 1)}
            />
        </StepperCardField>
    );
}

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

    function goToPreviousLevel() {
        onProgressionLevelChange(progressionLevel - 1);
    }

    function goToNextLevel() {
        const nextLevel = progressionLevel + 1;
        if (!locked) {
            onChange({
                progression: withPrefillOnLevelAdvance(draft.progression, progressionLevel, nextLevel),
            });
        }
        onProgressionLevelChange(nextLevel);
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
                    onDecrease={goToPreviousLevel}
                    onIncrease={goToNextLevel}
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
            {draft.spellcastingMode !== 'NONE' ? (
                <>
                    <SpellSlotsEditor
                        key={`${progressionLevel}-${draft.spellcastingMode}`}
                        mode={draft.spellcastingMode === 'PACT_MAGIC' ? 'PACT_MAGIC' : 'STANDARD'}
                        spellSlots={currentLevel.spellSlots}
                        locked={locked}
                        onChange={(spellSlots) => updateCurrentLevel({ spellSlots })}
                    />
                    <View style={styles.section} testID="spells-known-at-level">
                        <Text style={fieldStyles.label}>Spells known at this level</Text>
                        <StepperCard>
                            <CountStepper
                                label="Cantrips known"
                                value={currentLevel.cantripsKnown}
                                locked={locked}
                                valueTestID="cantrips-known"
                                onChange={(cantripsKnown) => updateCurrentLevel({ cantripsKnown })}
                            />
                            <CountStepper
                                label="Spells known"
                                value={currentLevel.spellsKnown}
                                locked={locked}
                                valueTestID="spells-known"
                                onChange={(spellsKnown) => updateCurrentLevel({ spellsKnown })}
                            />
                            <CountStepper
                                label="Prepared base"
                                value={currentLevel.preparedSpellCount}
                                locked={locked}
                                valueTestID="prepared-base"
                                onChange={(preparedSpellCount) =>
                                    updateCurrentLevel({ preparedSpellCount })
                                }
                            />
                        </StepperCard>
                    </View>
                    <Pressable
                        testID="custom-class-add-spellcasting-ability"
                        disabled={locked}
                        onPress={() =>
                            updateCurrentLevel({
                                addSpellcastingAbility: !currentLevel.addSpellcastingAbility,
                            })
                        }
                        style={[
                            fieldStyles.checkbox,
                            currentLevel.addSpellcastingAbility && fieldStyles.checkboxSelected,
                            locked && fieldStyles.disabled,
                        ]}
                    >
                        <Text style={fieldStyles.checkboxText}>
                            {currentLevel.addSpellcastingAbility ? '✓ ' : ''}
                            Add spellcasting ability modifier to prepared spells
                        </Text>
                    </Pressable>
                </>
            ) : null}
        </>
    );
}

const styles = StyleSheet.create({
    levelPicker: {
        gap: fantasyTokens.spacing.sm,
        alignItems: 'flex-start',
    },
    section: { gap: fantasyTokens.spacing.sm },
});
