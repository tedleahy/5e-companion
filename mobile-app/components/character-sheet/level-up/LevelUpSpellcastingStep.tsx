import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AddSpellSheet from '@/components/character-sheet/spells/AddSpellSheet';
import { spellLevelLabel } from '@/lib/spellPresentation';
import { classDisplayName } from '@/lib/characterLevelUp/spellcasting';
import type { LevelUpSpellSelection } from '@/lib/characterLevelUp/types';
import type { UseLevelUpWizardResult } from '@/hooks/useLevelUpWizard';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';

type SpellPickerMode = 'learned' | 'cantrip' | 'swap' | null;

type LevelUpSpellcastingStepProps = {
    wizard: UseLevelUpWizardResult;
};

/**
 * Spellcasting-specific wizard step covering slots, learnable spells, and cantrips.
 */
export default function LevelUpSpellcastingStep({
    wizard,
}: LevelUpSpellcastingStepProps) {
    const {
        selectedClass,
        spellcastingState,
        spellcastingSummary,
        addLearnedSpell,
        removeLearnedSpell,
        addCantripSpell,
        removeCantripSpell,
        setSwapOutSpellId,
        setSwapReplacementSpell,
    } = wizard;
    const [pickerMode, setPickerMode] = useState<SpellPickerMode>(null);
    const blockedSpellIds = useMemo(() => {
        // Block every already-known spell plus anything selected in another bucket,
        // so one spell cannot fill the learned, cantrip, and swap grants at once.
        const blockedIds = new Set(spellcastingSummary.currentKnownSpellIds);

        for (const spell of spellcastingState.learnedSpells) {
            blockedIds.add(spell.id);
        }

        for (const spell of spellcastingState.cantripSpells) {
            blockedIds.add(spell.id);
        }

        if (spellcastingState.swapReplacementSpell) {
            blockedIds.add(spellcastingState.swapReplacementSpell.id);
        }

        // Unblock the current picker's own selections so they stay toggleable.
        if (pickerMode === 'learned') {
            for (const spell of spellcastingState.learnedSpells) {
                blockedIds.delete(spell.id);
            }
        } else if (pickerMode === 'cantrip') {
            for (const spell of spellcastingState.cantripSpells) {
                blockedIds.delete(spell.id);
            }
        } else if (pickerMode === 'swap' && spellcastingState.swapReplacementSpell) {
            blockedIds.delete(spellcastingState.swapReplacementSpell.id);
        }

        return [...blockedIds];
    }, [
        pickerMode,
        spellcastingState.cantripSpells,
        spellcastingState.learnedSpells,
        spellcastingState.swapReplacementSpell,
        spellcastingSummary.currentKnownSpellIds,
    ]);
    const selectedSpellIds = useMemo(() => {
        if (pickerMode === 'learned') {
            return spellcastingState.learnedSpells.map((spell) => spell.id);
        }

        if (pickerMode === 'cantrip') {
            return spellcastingState.cantripSpells.map((spell) => spell.id);
        }

        if (pickerMode === 'swap') {
            return spellcastingState.swapReplacementSpell ? [spellcastingState.swapReplacementSpell.id] : [];
        }

        return [];
    }, [pickerMode, spellcastingState.cantripSpells, spellcastingState.learnedSpells, spellcastingState.swapReplacementSpell]);

    const forcedFilters = useMemo(
        () => pickerMode === 'cantrip'
            ? { classes: [selectedClass.classId], levels: [0] }
            : { classes: [selectedClass.classId], levels: spellcastingSummary.eligibleSpellLevels },
        [pickerMode, selectedClass.classId, spellcastingSummary.eligibleSpellLevels],
    );
    const selectionLimit = pickerMode === 'cantrip'
        ? spellcastingSummary.cantripCountGain
        : pickerMode === 'swap'
            ? 1
            : pickerMode === 'learned'
                ? spellcastingSummary.learnedSpellCount
                : undefined;

    return (
        <View style={styles.section} testID="level-up-step-spellcasting-updates">
            {spellcastingSummary.slotComparisons.length > 0 ? (
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Spell Slots</Text>
                    <View style={styles.slotGrid}>
                        {spellcastingSummary.slotComparisons.map((comparison) => (
                            <View
                                key={comparison.key}
                                style={[
                                    styles.slotCard,
                                    comparison.changed && styles.slotCardChanged,
                                ]}
                            >
                                <Text style={styles.slotLevelText}>
                                    {comparison.kind === 'PACT_MAGIC'
                                        ? `Pact ${spellLevelLabel(comparison.level)}`
                                        : spellLevelLabel(comparison.level)}
                                </Text>
                                <Text style={styles.slotValueText}>
                                    {`${comparison.previousTotal} -> ${comparison.nextTotal}`}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : null}

            {spellcastingSummary.mode === 'wizard' ? (
                <SelectionCard
                    title="Wizard Study"
                    body={`Choose ${spellcastingSummary.learnedSpellCount} new ${selectedClass.className.toLowerCase()} spell${spellcastingSummary.learnedSpellCount === 1 ? '' : 's'} to copy into your spellbook. Eligible levels: ${spellcastingSummary.eligibleSpellLevels.map((level) => spellLevelLabel(level)).join(', ')}.`}
                    buttonLabel={`+ Choose ${spellcastingSummary.learnedSpellCount} New Spells`}
                    counterLabel={`${spellcastingState.learnedSpells.length} of ${spellcastingSummary.learnedSpellCount} spells selected`}
                    onPress={() => setPickerMode('learned')}
                    selections={spellcastingState.learnedSpells}
                    onRemoveSelection={removeLearnedSpell}
                />
            ) : null}

            {spellcastingSummary.mode === 'known' && spellcastingSummary.nextKnownSpells != null && spellcastingSummary.previousKnownSpells != null ? (
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Spells Known</Text>
                    <Text style={styles.bodyText}>
                        {`${classDisplayName(selectedClass.classId)} spells known: ${spellcastingSummary.previousKnownSpells} -> ${spellcastingSummary.nextKnownSpells}.`}
                    </Text>

                    {spellcastingSummary.learnedSpellCount > 0 ? (
                        <SelectionCard
                            title="New Known Spells"
                            body={`Choose ${spellcastingSummary.learnedSpellCount} spell${spellcastingSummary.learnedSpellCount === 1 ? '' : 's'} of ${spellcastingSummary.eligibleSpellLevels.map((level) => spellLevelLabel(level)).join(', ')} or lower.`}
                            buttonLabel={`+ Choose ${spellcastingSummary.learnedSpellCount} New Spell${spellcastingSummary.learnedSpellCount === 1 ? '' : 's'}`}
                            counterLabel={`${spellcastingState.learnedSpells.length} of ${spellcastingSummary.learnedSpellCount} spells selected`}
                            onPress={() => setPickerMode('learned')}
                            selections={spellcastingState.learnedSpells}
                            onRemoveSelection={removeLearnedSpell}
                        />
                    ) : null}

                    {spellcastingSummary.currentKnownSpells.some((entry) => entry.spell.level > 0) ? (
                        <View style={styles.swapSection}>
                            <Text style={styles.swapTitle}>Optional Spell Swap</Text>
                            <Text style={styles.bodyText}>
                                Replace one currently known spell with another eligible spell.
                            </Text>

                            <View style={styles.swapList}>
                                {spellcastingSummary.currentKnownSpells.filter((entry) => entry.spell.level > 0).map((entry) => {
                                    const selected = spellcastingState.swapOutSpellId === entry.spell.id;

                                    return (
                                        <Pressable
                                            key={entry.spell.id}
                                            onPress={() => setSwapOutSpellId(entry.spell.id)}
                                            style={[styles.swapRow, selected && styles.swapRowSelected]}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Select ${entry.spell.name} to swap out`}
                                            accessibilityState={{ selected }}
                                        >
                                            <Text style={styles.swapSpellName}>{entry.spell.name}</Text>
                                            <Text style={styles.swapSpellLevel}>{spellLevelLabel(entry.spell.level)}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {spellcastingState.swapOutSpellId ? (
                                <>
                                    <Pressable
                                        onPress={() => setPickerMode('swap')}
                                        style={styles.actionButton}
                                        accessibilityLabel="Choose a replacement spell"
                                    >
                                        <Text style={styles.actionButtonText}>Choose Replacement Spell</Text>
                                    </Pressable>

                                    {spellcastingState.swapReplacementSpell ? (
                                        <SelectionPill
                                            spell={spellcastingState.swapReplacementSpell}
                                            onRemove={() => setSwapReplacementSpell(null)}
                                        />
                                    ) : null}
                                </>
                            ) : null}
                        </View>
                    ) : null}
                </View>
            ) : null}

            {spellcastingSummary.mode === 'prepared' && spellcastingSummary.nextPreparedSpellLimit != null && spellcastingSummary.previousPreparedSpellLimit != null ? (
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Prepared Spells</Text>
                    <Text style={styles.bodyText}>
                        {`Your maximum prepared spells is now ${spellcastingSummary.nextPreparedSpellLimit} (was ${spellcastingSummary.previousPreparedSpellLimit}). You can update prepared spells from the Spells tab after this level-up.`}
                    </Text>
                </View>
            ) : null}

            {spellcastingSummary.cantripCountGain > 0 ? (
                <SelectionCard
                    title="New Cantrips"
                    body={`Choose ${spellcastingSummary.cantripCountGain} new cantrip${spellcastingSummary.cantripCountGain === 1 ? '' : 's'} for ${selectedClass.className}.`}
                    buttonLabel={`+ Choose ${spellcastingSummary.cantripCountGain} New Cantrip${spellcastingSummary.cantripCountGain === 1 ? '' : 's'}`}
                    counterLabel={`${spellcastingState.cantripSpells.length} of ${spellcastingSummary.cantripCountGain} cantrips selected`}
                    onPress={() => setPickerMode('cantrip')}
                    selections={spellcastingState.cantripSpells}
                    onRemoveSelection={removeCantripSpell}
                />
            ) : null}

            <AddSpellSheet
                visible={pickerMode != null}
                onClose={() => setPickerMode(null)}
                characterClassIds={[selectedClass.classId]}
                knownSpellIds={selectedSpellIds}
                blockedSpellIds={blockedSpellIds}
                forcedFilters={forcedFilters}
                selectionLimit={selectionLimit}
                title={pickerMode === 'cantrip' ? 'Choose Cantrip' : 'Choose Spell'}
                subtitle={pickerMode === 'swap'
                    ? 'Select a legal replacement spell for this level-up.'
                    : `Only legal ${selectedClass.className.toLowerCase()} options are shown for this step.`}
                showFilterButton={false}
                onSpellAdded={async (spell) => {
                    if (pickerMode === 'cantrip') {
                        addCantripSpell(spell);
                        return;
                    }

                    if (pickerMode === 'swap') {
                        setSwapReplacementSpell(spell);
                        return;
                    }

                    addLearnedSpell(spell);
                }}
                onSpellRemoved={async (spell) => {
                    if (pickerMode === 'cantrip') {
                        removeCantripSpell(spell.id);
                        return;
                    }

                    if (pickerMode === 'swap') {
                        setSwapReplacementSpell(null);
                        return;
                    }

                    removeLearnedSpell(spell.id);
                }}
            />
        </View>
    );
}

type SelectionCardProps = {
    title: string;
    body: string;
    buttonLabel: string;
    counterLabel: string;
    selections: LevelUpSpellSelection[];
    onPress: () => void;
    onRemoveSelection: (spellId: string) => void;
};

/**
 * Shared selection card for learned spells and cantrips.
 */
function SelectionCard({
    title,
    body,
    buttonLabel,
    counterLabel,
    selections,
    onPress,
    onRemoveSelection,
}: SelectionCardProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardLabel}>{title}</Text>
            <Text style={styles.bodyText}>{body}</Text>
            <Pressable
                onPress={onPress}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={buttonLabel}
            >
                <Text style={styles.actionButtonText}>{buttonLabel}</Text>
            </Pressable>
            <Text style={styles.counterText}>{counterLabel}</Text>
            {selections.length > 0 ? (
                <View style={styles.selectionRow}>
                    {selections.map((spell) => (
                        <SelectionPill
                            key={spell.id}
                            spell={spell}
                            onRemove={() => onRemoveSelection(spell.id)}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

type SelectionPillProps = {
    spell: LevelUpSpellSelection;
    onRemove: () => void;
};

/**
 * Compact removable pill for one selected spell.
 */
function SelectionPill({ spell, onRemove }: SelectionPillProps) {
    return (
        <View style={styles.selectionPill}>
            <Text style={styles.selectionPillText}>{`${spell.name} (${spell.level === 0 ? 'Cantrip' : spellLevelLabel(spell.level)})`}</Text>
            <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${spell.name}`}>
                <Text style={styles.selectionPillRemove}>x</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    card: {
        ...nightFormStyles.card,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.sm,
    },
    cardLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    slotCard: {
        minWidth: 104,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        gap: fantasyTokens.spacing.xs,
    },
    slotCardChanged: {
        borderColor: fantasyTokens.colors.gold,
        boxShadow: fantasyTokens.sheet.form.glow,
    },
    slotLevelText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    slotValueText: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.parchment,
    },
    actionButton: {
        alignSelf: 'flex-start',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    actionButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    counterText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.gold,
    },
    selectionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    selectionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.sm - fantasyTokens.spacing.xs / 2,
    },
    selectionPillText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    selectionPillRemove: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.goldLight,
    },
    swapSection: {
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.sm,
    },
    swapTitle: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.parchment,
    },
    swapList: {
        gap: fantasyTokens.spacing.xs,
    },
    swapRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    swapRowSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    swapSpellName: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchment,
        flexShrink: 1,
        paddingRight: fantasyTokens.spacing.sm,
    },
    swapSpellLevel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentDeep,
    },
});
