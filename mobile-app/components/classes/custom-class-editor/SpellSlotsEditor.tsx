import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { fieldStyles } from './fields';
import {
    MAX_SPELL_SLOT_COUNT,
    SPELL_SLOT_LEVELS,
    pactFromSpellSlots,
    spellSlotLevelLabel,
    spellSlotsFromPact,
    withSpellSlotAt,
} from './spellSlots';
import { StepperCard, StepperCardField } from './StepperCard';

type SpellSlotsEditorProps = {
    mode: 'STANDARD' | 'PACT_MAGIC';
    spellSlots: readonly number[];
    locked: boolean;
    onChange: (spellSlots: number[]) => void;
};

/**
 * Mode-aware spell slot editor: nine-level grid for STANDARD, level+count for PACT_MAGIC.
 */
export default function SpellSlotsEditor({
    mode,
    spellSlots,
    locked,
    onChange,
}: SpellSlotsEditorProps) {
    if (mode === 'PACT_MAGIC') {
        return (
            <PactMagicSlots
                spellSlots={spellSlots}
                locked={locked}
                onChange={onChange}
            />
        );
    }

    return (
        <View style={styles.section} testID="spell-slots-standard">
            <Text style={fieldStyles.label}>Spell slots by level</Text>
            <View style={styles.grid}>
                {Array.from({ length: SPELL_SLOT_LEVELS }, (_, index) => {
                    const level = index + 1;
                    const total = spellSlots[index] ?? 0;
                    return (
                        <View key={level} style={styles.cell}>
                            <Text style={styles.slotLabel}>{spellSlotLevelLabel(level)}</Text>
                            <NumericStepper
                                value={total}
                                canDecrease={!locked && total > 0}
                                canIncrease={!locked && total < MAX_SPELL_SLOT_COUNT}
                                decrementLabel={`Decrease ${spellSlotLevelLabel(level)} spell slots`}
                                incrementLabel={`Increase ${spellSlotLevelLabel(level)} spell slots`}
                                tone="night"
                                valueTestID={`spell-slot-level-${level}`}
                                onDecrease={() => onChange(withSpellSlotAt(spellSlots, level, total - 1))}
                                onIncrease={() => onChange(withSpellSlotAt(spellSlots, level, total + 1))}
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

/**
 * Pact magic uses a single slot level + count. Level is kept in local state so it
 * survives a zero count (an all-zero array cannot encode which level was selected).
 * Remount via key when the progression level or mode changes.
 */
function PactMagicSlots({
    spellSlots,
    locked,
    onChange,
}: Omit<SpellSlotsEditorProps, 'mode'>) {
    const derived = pactFromSpellSlots(spellSlots);
    const [level, setLevel] = useState(derived.level);
    const count = derived.count;

    function update(nextLevel: number, nextCount: number) {
        setLevel(nextLevel);
        onChange(spellSlotsFromPact(nextLevel, nextCount));
    }

    return (
        <View style={styles.section} testID="spell-slots-pact">
            <Text style={fieldStyles.label}>Pact magic slots</Text>
            <StepperCard>
                <StepperCardField label="Slot level">
                    <NumericStepper
                        value={level}
                        canDecrease={!locked && level > 1}
                        canIncrease={!locked && level < SPELL_SLOT_LEVELS}
                        decrementLabel="Decrease pact slot level"
                        incrementLabel="Increase pact slot level"
                        tone="night"
                        valueTestID="pact-slot-level"
                        onDecrease={() => update(level - 1, count)}
                        onIncrease={() => update(level + 1, count)}
                    />
                </StepperCardField>
                <StepperCardField label="Slot count">
                    <NumericStepper
                        value={count}
                        canDecrease={!locked && count > 0}
                        canIncrease={!locked && count < MAX_SPELL_SLOT_COUNT}
                        decrementLabel="Decrease pact slot count"
                        incrementLabel="Increase pact slot count"
                        tone="night"
                        valueTestID="pact-slot-count"
                        onDecrease={() => update(level, count - 1)}
                        onIncrease={() => update(level, count + 1)}
                    />
                </StepperCardField>
            </StepperCard>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { gap: fantasyTokens.spacing.sm },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    cell: {
        width: '31%',
        margin: 'auto',
        minWidth: 96,
        gap: fantasyTokens.spacing.xs,
        alignItems: 'center',
        paddingVertical: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.xs,
        backgroundColor: fantasyTokens.sheet.form.card,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
    },
    slotLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        fontSize: fantasyTokens.fontSizes.caption,
    },
});
