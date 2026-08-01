import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    hasSpellSlots,
    MAX_CLASS_LEVEL,
    shortSpellSlots,
    withCopyFromPreviousLevel,
    withPrefillOnLevelAdvance,
} from './draft';
import { AbilityPicker, Chip, fieldStyles } from './fields';
import SpellSlotsEditor from './SpellSlotsEditor';
import type { DraftLevel, StageProps } from './types';

/** Upper bound for cantrips known / spells known / prepared base steppers. */
const MAX_SPELLCASTING_COUNT = 20;

/** Leaves rounding slack while retaining five level-map cells per row. */
const LEVEL_MAP_CELL_WIDTH = '18%';

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

type ToggleRowProps = {
    label: string;
    value: boolean;
    locked: boolean;
    testID?: string;
    onValueChange: (next: boolean) => void;
};

type CopyToast = {
    fromLevel: number;
    snapshot: DraftLevel;
};

type LevelMapProps = {
    progression: DraftLevel[];
    selectedLevel: number;
    mapOpen: boolean;
    showSpellcasting: boolean;
    onOpen: () => void;
    onClose: () => void;
    onSelectLevel: (level: number) => void;
};

/**
 * Count stepper row: label on the left, night stepper on the right.
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
        <View style={styles.countRow}>
            <Text style={styles.countLabel}>{label}</Text>
            <NumericStepper
                value={count}
                canDecrease={!locked && count > 0}
                canIncrease={!locked && count < MAX_SPELLCASTING_COUNT}
                decrementLabel={`Decrease ${label.toLowerCase()}`}
                incrementLabel={`Increase ${label.toLowerCase()}`}
                tone="night"
                valueTestID={valueTestID}
                onDecrease={() => onChange(count - 1)}
                onIncrease={() => onChange(count + 1)}
            />
        </View>
    );
}

/**
 * Labelled Paper Switch row matching the D1 toggle pattern.
 */
function ToggleRow({ label, value, locked, testID, onValueChange }: ToggleRowProps) {
    return (
        <Pressable
            disabled={locked}
            onPress={() => onValueChange(!value)}
            style={[styles.toggleRow, locked && fieldStyles.disabled]}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled: locked }}
            accessibilityLabel={label}
            testID={testID}
        >
            <Text style={[styles.toggleLabel, value && styles.toggleLabelOn]}>{label}</Text>
            <Switch
                value={value}
                color={fantasyTokens.colors.crimson}
                style={styles.nonInteractiveSwitch}
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
            />
        </Pressable>
    );
}

/**
 * Collapsed summary + expandable 1–20 heatmap for jumping between class levels.
 */
function LevelMap({
    progression,
    selectedLevel,
    mapOpen,
    showSpellcasting,
    onOpen,
    onClose,
    onSelectLevel,
}: LevelMapProps) {
    const current = progression[selectedLevel - 1]!;
    const metaParts = [
        current.abilityScoreImprovement ? 'ASI' : null,
        showSpellcasting && hasSpellSlots(current)
            ? `slots ${shortSpellSlots(current.spellSlots)}`
            : null,
        showSpellcasting ? `cantrips ${current.cantripsKnown ?? 0}` : null,
        showSpellcasting ? `known ${current.spellsKnown ?? 0}` : null,
    ].filter(Boolean);

    return (
        <View style={styles.levelMap} testID="progression-level-map">
            {!mapOpen ? (
                <Pressable
                    onPress={onOpen}
                    style={({ pressed }) => [styles.summaryHit, pressed && styles.summaryHitPressed]}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: false }}
                    accessibilityLabel={`Level ${selectedLevel} summary`}
                    accessibilityHint="Opens the level map"
                    testID="progression-level-summary"
                >
                    <View style={styles.summaryLevel}>
                        <Text style={styles.summaryLevelText}>{selectedLevel}</Text>
                        {current.abilityScoreImprovement ? (
                            <Text style={styles.miniBadge}>ASI</Text>
                        ) : showSpellcasting && hasSpellSlots(current) ? (
                            <Text style={styles.miniBadge}>{'\u25CF'}</Text>
                        ) : null}
                    </View>
                    <View style={styles.summaryMeta}>
                        <Text style={styles.summaryTitle}>Level {selectedLevel}</Text>
                        <Text style={styles.summaryDetail}>
                            {metaParts.length > 0 ? metaParts.join(' · ') : 'No progression set'}
                        </Text>
                        <Text style={styles.summaryCue}>Tap to open level map</Text>
                    </View>
                </Pressable>
            ) : (
                <View style={styles.drawer}>
                    <Text style={fieldStyles.label}>Jump to level</Text>
                    <View style={styles.overviewGrid}>
                        {progression.map((level) => {
                            const slots = showSpellcasting && hasSpellSlots(level);
                            const sparse = !level.abilityScoreImprovement && !slots;
                            const selected = level.level === selectedLevel;
                            return (
                                <Pressable
                                    key={level.level}
                                    onPress={() => onSelectLevel(level.level)}
                                    style={({ pressed }) => [
                                        styles.ovCell,
                                        selected && styles.ovCellSelected,
                                        sparse && styles.ovCellSparse,
                                        slots && styles.ovCellHasSlots,
                                        pressed && styles.ovCellPressed,
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Go to level ${level.level}`}
                                    accessibilityState={{ selected }}
                                    testID={`progression-level-${level.level}`}
                                >
                                    <Text style={[styles.ovCellText, selected && styles.ovCellTextSelected]}>
                                        {level.level}
                                    </Text>
                                    {level.abilityScoreImprovement ? (
                                        <Text style={styles.ovBadge}>ASI</Text>
                                    ) : slots ? (
                                        <Text style={styles.ovBadge}>{'\u25CF'}</Text>
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </View>
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendSwatch, styles.legendAsi]} />
                            <Text style={styles.legendText}>ASI</Text>
                        </View>
                        {showSpellcasting ? (
                            <View style={styles.legendItem}>
                                <View style={[styles.legendSwatch, styles.legendSlots]} />
                                <Text style={styles.legendText}>Has slots</Text>
                            </View>
                        ) : null}
                        <View style={styles.legendItem}>
                            <View style={[styles.legendSwatch, styles.legendSparse]} />
                            <Text style={styles.legendText}>Unset</Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => [styles.drawerClose, pressed && styles.copyBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel="Close level map"
                        testID="progression-level-map-close"
                    >
                        <Text style={styles.drawerCloseText}>Close map</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

/**
 * Progression stage: spellcasting mode, level heatmap jump, and per-level editors.
 */
export default function ProgressionStage({
    draft,
    locked,
    onChange,
    progressionLevel,
    onProgressionLevelChange,
}: ProgressionStageProps) {
    const [mapOpen, setMapOpen] = useState(false);
    const [copyToast, setCopyToast] = useState<CopyToast | null>(null);

    const currentLevel = draft.progression[progressionLevel - 1]!;
    const showSpellcasting = draft.spellcastingMode !== 'NONE';

    function updateCurrentLevel(patch: Partial<DraftLevel>) {
        if (locked) return;
        setCopyToast(null);
        onChange({
            progression: draft.progression.map((item) =>
                item.level === progressionLevel ? { ...item, ...patch } : item,
            ),
        });
    }

    function selectLevel(nextLevel: number) {
        if (nextLevel < 1 || nextLevel > MAX_CLASS_LEVEL) return;

        if (!locked && showSpellcasting && nextLevel === progressionLevel + 1) {
            const target = draft.progression[nextLevel - 1]!;
            const nextProgression = withPrefillOnLevelAdvance(
                draft.progression,
                progressionLevel,
                nextLevel,
            );
            if (nextProgression !== draft.progression) {
                onChange({
                    progression: nextProgression,
                });
                setCopyToast({
                    fromLevel: progressionLevel,
                    snapshot: snapshotLevel(target),
                });
            } else {
                setCopyToast(null);
            }
        } else {
            setCopyToast(null);
        }

        onProgressionLevelChange(nextLevel);
        setMapOpen(false);
    }

    function copyFromPrevious() {
        if (locked || progressionLevel <= 1) return;
        onChange({
            progression: withCopyFromPreviousLevel(draft.progression, progressionLevel),
        });
        setCopyToast({
            fromLevel: progressionLevel - 1,
            snapshot: snapshotLevel(currentLevel),
        });
    }

    function undoCopy() {
        if (!copyToast) return;
        const restored = copyToast.snapshot;
        onChange({
            progression: draft.progression.map((item) =>
                item.level === restored.level ? restored : item,
            ),
        });
        setCopyToast(null);
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
                                addSpellcastingAbility:
                                    mode === 'NONE' ? false : draft.addSpellcastingAbility,
                            })
                        }
                    />
                ))}
            </View>
            {showSpellcasting ? (
                <AbilityPicker
                    label="Spellcasting ability"
                    selected={draft.spellcastingAbility ? [draft.spellcastingAbility] : []}
                    disabled={locked}
                    onPress={(value) => onChange({ spellcastingAbility: value })}
                />
            ) : null}
            {showSpellcasting ? (
                <ToggleRow
                    label="Add spellcasting ability modifier to prepared spells"
                    value={draft.addSpellcastingAbility}
                    locked={locked}
                    testID="custom-class-add-spellcasting-ability"
                    onValueChange={(addSpellcastingAbility) => onChange({ addSpellcastingAbility })}
                />
            ) : null}

            <LevelMap
                progression={draft.progression}
                selectedLevel={progressionLevel}
                mapOpen={mapOpen}
                showSpellcasting={showSpellcasting}
                onOpen={() => setMapOpen(true)}
                onClose={() => setMapOpen(false)}
                onSelectLevel={selectLevel}
            />

            <View style={styles.detailPanel} testID="progression-level-detail">
                <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>Level {progressionLevel}</Text>
                    <Text style={styles.detailOf}>of {MAX_CLASS_LEVEL}</Text>
                </View>

                {copyToast ? (
                    <View style={styles.banner} testID="progression-copy-toast">
                        <Text style={styles.bannerText}>
                            Copied from level {copyToast.fromLevel}
                        </Text>
                        <Pressable
                            onPress={undoCopy}
                            style={styles.bannerUndo}
                            accessibilityRole="button"
                            accessibilityLabel="Undo copy"
                            testID="progression-copy-undo"
                        >
                            <Text style={styles.bannerUndoText}>Undo</Text>
                        </Pressable>
                    </View>
                ) : null}

                <ToggleRow
                    label="Ability Score Improvement"
                    value={currentLevel.abilityScoreImprovement}
                    locked={locked}
                    testID="progression-asi"
                    onValueChange={(abilityScoreImprovement) =>
                        updateCurrentLevel({ abilityScoreImprovement })
                    }
                />

                {showSpellcasting ? (
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
                            <View style={styles.countsColumn}>
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
                            </View>
                        </View>
                        {progressionLevel > 1 ? (
                            <Pressable
                                disabled={locked}
                                onPress={copyFromPrevious}
                                style={({ pressed }) => [
                                    styles.copyBtn,
                                    pressed && !locked && styles.copyBtnPressed,
                                    locked && fieldStyles.disabled,
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel="Copy from previous level"
                                testID="progression-copy-previous"
                            >
                                <Text style={styles.copyBtnText}>Copy from previous level</Text>
                            </Pressable>
                        ) : null}
                    </>
                ) : null}
            </View>
        </>
    );
}

/** Clone mutable level fields before retaining them for Undo. */
function snapshotLevel(level: DraftLevel): DraftLevel {
    return {
        ...level,
        spellSlots: [...level.spellSlots],
        displayValues: level.displayValues.map((value) => ({ ...value })),
    };
}

const styles = StyleSheet.create({
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
        paddingVertical: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.md - fantasyTokens.spacing.xs,
        backgroundColor: fantasyTokens.colors.nightOverlay,
    },
    toggleLabel: {
        ...fantasyTokens.typography.body,
        flex: 1,
        color: fantasyTokens.colors.parchmentDeep,
        fontSize: fantasyTokens.fontSizes.body - 1,
        lineHeight: fantasyTokens.fontSizes.body + fantasyTokens.spacing.xs,
    },
    toggleLabelOn: {
        color: fantasyTokens.colors.parchment,
    },
    nonInteractiveSwitch: {
        pointerEvents: 'none',
    },
    levelMap: {
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm + 2,
        backgroundColor: fantasyTokens.colors.nightOverlay,
        padding: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        overflow: 'hidden',
    },
    summaryHit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        padding: fantasyTokens.spacing.xs / 2,
        borderRadius: fantasyTokens.radii.sm,
    },
    summaryHitPressed: {
        backgroundColor: fantasyTokens.sheet.form.card,
    },
    summaryLevel: {
        width: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        height: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 2,
        borderColor: fantasyTokens.colors.goldLight,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    summaryLevelText: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
        fontSize: fantasyTokens.fontSizes.bodyLarge + 2,
    },
    miniBadge: {
        position: 'absolute',
        top: fantasyTokens.spacing.xs,
        right: fantasyTokens.spacing.xs + 1,
        fontSize: fantasyTokens.fontSizes.utility - 4,
        color: fantasyTokens.colors.goldLight,
        fontWeight: '700',
    },
    summaryMeta: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    summaryTitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.goldLight,
        fontWeight: '600',
        fontSize: fantasyTokens.fontSizes.caption + 1,
    },
    summaryDetail: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentDeep,
        fontSize: fantasyTokens.fontSizes.caption - 1,
        lineHeight: fantasyTokens.fontSizes.body,
    },
    summaryCue: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentMuted,
        fontSize: fantasyTokens.fontSizes.caption - 2,
    },
    drawer: {
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.xs / 2,
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    ovCell: {
        width: LEVEL_MAP_CELL_WIDTH,
        marginHorizontal: '0.75%',
        marginBottom: fantasyTokens.spacing.sm - 2,
        aspectRatio: 1,
        minHeight: fantasyTokens.spacing.xxl + fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm - 2,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.colors.nightOverlayStrong,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ovCellSelected: {
        borderWidth: 2,
        borderColor: fantasyTokens.colors.goldLight,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    ovCellSparse: {
        opacity: 0.4,
    },
    ovCellHasSlots: {
        borderBottomWidth: 3,
        borderBottomColor: fantasyTokens.colors.blue,
    },
    ovCellPressed: {
        transform: [{ scale: 0.94 }],
    },
    ovCellText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
        fontWeight: '700',
        fontSize: fantasyTokens.fontSizes.caption,
    },
    ovCellTextSelected: {
        color: fantasyTokens.colors.parchment,
    },
    ovBadge: {
        position: 'absolute',
        top: fantasyTokens.spacing.xs - 1,
        right: fantasyTokens.spacing.xs,
        fontSize: fantasyTokens.fontSizes.utility - 4,
        color: fantasyTokens.colors.goldLight,
        lineHeight: fantasyTokens.fontSizes.utility - 2,
        fontWeight: '700',
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs + 1,
    },
    legendSwatch: {
        width: fantasyTokens.spacing.sm,
        height: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.spacing.sm / 2,
    },
    legendAsi: {
        backgroundColor: fantasyTokens.colors.goldLight,
    },
    legendSlots: {
        width: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        height: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.spacing.xs / 2,
        backgroundColor: fantasyTokens.colors.blue,
    },
    legendSparse: {
        backgroundColor: fantasyTokens.colors.parchmentFaint,
    },
    legendText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentMuted,
        fontSize: fantasyTokens.fontSizes.utility,
    },
    drawerClose: {
        width: '100%',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm - 2,
        padding: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        alignItems: 'center',
    },
    drawerCloseText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
        fontWeight: '600',
        fontSize: fantasyTokens.fontSizes.caption - 1,
    },
    detailPanel: {
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
        padding: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        backgroundColor: fantasyTokens.colors.nightOverlayStrong,
        gap: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    detailTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.goldLight,
        fontSize: fantasyTokens.fontSizes.label,
    },
    detailOf: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentMuted,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm - 2,
        paddingVertical: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        paddingHorizontal: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        backgroundColor: fantasyTokens.colors.successSoft,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.successBorder,
    },
    bannerText: {
        ...fantasyTokens.typography.body,
        flex: 1,
        color: fantasyTokens.colors.successBannerText,
        fontSize: fantasyTokens.fontSizes.caption,
    },
    bannerUndo: {
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.colors.nightOverlayDeep,
        borderRadius: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs + 2,
        paddingHorizontal: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
    },
    bannerUndoText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
        fontSize: fantasyTokens.fontSizes.utility,
    },
    section: { gap: fantasyTokens.spacing.sm },
    countsColumn: {
        gap: fantasyTokens.spacing.sm,
    },
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        paddingVertical: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm - 2,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
    },
    countLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
        fontSize: fantasyTokens.fontSizes.caption,
        flexShrink: 1,
    },
    copyBtn: {
        width: '100%',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
        padding: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        alignItems: 'center',
    },
    copyBtnPressed: {
        backgroundColor: fantasyTokens.sheet.form.card,
    },
    copyBtnText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
        fontWeight: '600',
        fontSize: fantasyTokens.fontSizes.caption,
    },
});
