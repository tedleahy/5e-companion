import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { AbilityKey } from '@/lib/characterSheetUtils';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import { LEVEL_UP_ABILITY_LABELS } from '@/lib/characterLevelUp/asiOrFeat';
import { spellLevelLabel } from '@/lib/spellPresentation';
import type {
    LevelUpAsiOrFeatState,
    LevelUpFeature,
    LevelUpHitPointsState,
    LevelUpSpellcastingState,
    LevelUpSpellcastingSummary,
    LevelUpWizardSelectedClass,
} from '@/lib/characterLevelUp/types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpSummaryStepProps = {
    currentCharacterLevel: number;
    currentHitPoints: {
        current: number;
        max: number;
        temp: number;
    };
    abilityScores: Record<AbilityKey, number>;
    selectedClass: LevelUpWizardSelectedClass;
    hitPointsState: LevelUpHitPointsState;
    asiOrFeatState: LevelUpAsiOrFeatState | null;
    features: LevelUpFeature[];
    spellcastingState: LevelUpSpellcastingState;
    spellcastingSummary: LevelUpSpellcastingSummary;
};

/**
 * Final review step for the currently implemented level-up data.
 */
export default function LevelUpSummaryStep({
    currentCharacterLevel,
    currentHitPoints,
    abilityScores,
    selectedClass,
    hitPointsState,
    asiOrFeatState,
    features,
    spellcastingState,
    spellcastingSummary,
}: LevelUpSummaryStepProps) {
    const nextMaxHitPoints = currentHitPoints.max + hitPointsState.hpGained;
    const abilityScoreChanges = abilityScoreSummaryRows(abilityScores, asiOrFeatState);

    return (
        <View style={styles.section} testID="level-up-step-summary">
            <View style={styles.banner}>
                <Text style={styles.bannerEyebrow}>Ready to Apply</Text>
                <Text style={styles.bannerTitle}>
                    {`Level ${currentCharacterLevel} -> ${currentCharacterLevel + 1}`}
                </Text>
                <Text style={styles.bannerSubtitle}>
                    {`${selectedClass.className} ${selectedClass.currentLevel} -> ${selectedClass.newLevel}`}
                </Text>
            </View>

            <SummaryCard label="Class Level" testID="level-up-summary-class-level">
                <Text style={styles.summaryValue}>
                    <Text style={styles.summaryOldValue}>
                        {`${selectedClass.className} ${selectedClass.currentLevel}`}
                    </Text>
                    <Text style={styles.summaryArrow}>{' -> '}</Text>
                    <Text style={styles.summaryHighlight}>
                        {`${selectedClass.className} ${selectedClass.newLevel}`}
                    </Text>
                </Text>
            </SummaryCard>

            <SummaryCard label="Hit Points" testID="level-up-summary-hit-points">
                <Text style={styles.summaryValue}>
                    <Text style={styles.summaryOldValue}>{currentHitPoints.max}</Text>
                    <Text style={styles.summaryArrow}>{' -> '}</Text>
                    <Text style={styles.summaryHighlight}>{nextMaxHitPoints}</Text>
                    <Text style={styles.summaryDelta}>{` (${formatSignedNumber(hitPointsState.hpGained)})`}</Text>
                </Text>
            </SummaryCard>

            {asiOrFeatState ? (
                asiOrFeatState.mode === 'asi' ? (
                    <SummaryCard label="Ability Score Improvement" testID="level-up-summary-asi">
                        {abilityScoreChanges.length > 0 ? (
                            abilityScoreChanges.map((change) => (
                                <Text key={change.ability} style={styles.summaryListItem}>
                                    <Text style={styles.summaryValueLabel}>{change.label}</Text>
                                    <Text style={styles.summaryValue}>
                                        <Text style={styles.summaryOldValue}>{change.from}</Text>
                                        <Text style={styles.summaryArrow}>{' -> '}</Text>
                                        <Text style={styles.summaryHighlight}>{change.to}</Text>
                                    </Text>
                                </Text>
                            ))
                        ) : (
                            <Text style={styles.summaryMutedText}>No ability score changes selected.</Text>
                        )}
                    </SummaryCard>
                ) : (
                    <SummaryCard label="Feat" testID="level-up-summary-feat">
                        <Text style={styles.summaryFeatureName}>{asiOrFeatState.feat.name.trim()}</Text>
                        <Text style={styles.summaryBodyText}>{asiOrFeatState.feat.description.trim()}</Text>
                        {asiOrFeatState.feat.abilityIncrease ? (
                            <Text style={styles.summaryDelta}>
                                {`${LEVEL_UP_ABILITY_LABELS[asiOrFeatState.feat.abilityIncrease]} +1`}
                            </Text>
                        ) : null}
                    </SummaryCard>
                )
            ) : null}

            {selectedClass.subclassName ? (
                <SummaryCard label="Subclass" testID="level-up-summary-subclass">
                    <Text style={styles.summaryValue}>
                        <Text style={styles.summaryHighlight}>{selectedClass.subclassName}</Text>
                    </Text>
                </SummaryCard>
            ) : null}

            {features.length > 0 ? (
                <SummaryCard label="New Features" testID="level-up-summary-features">
                    <View style={styles.featureList}>
                        {features.map((feature) => (
                            <Text key={feature.key} style={styles.summaryListItem}>
                                {`\u2022 ${feature.name}`}
                            </Text>
                        ))}
                    </View>
                </SummaryCard>
            ) : null}

            {hasSpellcastingSummary(spellcastingSummary, spellcastingState) ? (
                <SummaryCard label="Spellcasting" testID="level-up-summary-spellcasting">
                    {spellcastingSummary.slotComparisons.filter((comparison) => comparison.changed).map((comparison) => (
                        <Text key={comparison.key} style={styles.summaryListItem}>
                            {`${comparison.kind === 'PACT_MAGIC' ? 'Pact' : 'Slots'} ${spellLevelLabel(comparison.level)}: ${comparison.previousTotal} -> ${comparison.nextTotal}`}
                        </Text>
                    ))}
                    {spellcastingState.learnedSpells.map((spell) => (
                        <Text key={spell.id} style={styles.summaryListItem}>{`\u2022 ${spell.name}`}</Text>
                    ))}
                    {spellcastingState.cantripSpells.map((spell) => (
                        <Text key={spell.id} style={styles.summaryListItem}>{`\u2022 ${spell.name} (Cantrip)`}</Text>
                    ))}
                    {spellcastingState.swapOutSpellId && spellcastingState.swapReplacementSpell ? (
                        <Text style={styles.summaryListItem}>
                            {`Swap: replace one known spell with ${spellcastingState.swapReplacementSpell.name}`}
                        </Text>
                    ) : null}
                    {spellcastingSummary.nextPreparedSpellLimit != null && spellcastingSummary.previousPreparedSpellLimit != null ? (
                        <Text style={styles.summaryListItem}>
                            {`Prepared spells: ${spellcastingSummary.previousPreparedSpellLimit} -> ${spellcastingSummary.nextPreparedSpellLimit}`}
                        </Text>
                    ) : null}
                </SummaryCard>
            ) : null}

            <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Draft First, Then Save</Text>
                <Text style={styles.noteText}>
                    Confirming here updates the current edit session underneath. Use Done afterwards to persist the implemented level-up changes.
                </Text>
            </View>
        </View>
    );
}

/**
 * Returns whether the summary should render a spellcasting section.
 */
function hasSpellcastingSummary(
    spellcastingSummary: LevelUpSpellcastingSummary,
    spellcastingState: LevelUpSpellcastingState,
): boolean {
    return spellcastingSummary.slotComparisons.some((comparison) => comparison.changed)
        || spellcastingState.learnedSpells.length > 0
        || spellcastingState.cantripSpells.length > 0
        || spellcastingState.swapReplacementSpell != null
        || spellcastingSummary.nextPreparedSpellLimit !== spellcastingSummary.previousPreparedSpellLimit;
}

type SummaryCardProps = {
    label: string;
    testID: string;
    children: ReactNode;
};

/**
 * Shared summary card shell used by the review step.
 */
function SummaryCard({ label, testID, children }: SummaryCardProps) {
    return (
        <View style={styles.summaryCard} testID={testID}>
            <Text style={styles.summaryLabel}>{label}</Text>
            {children}
        </View>
    );
}

type AbilityScoreSummaryRow = {
    ability: AbilityKey;
    label: string;
    from: number;
    to: number;
};

/**
 * Builds the visible ability-score changes for the summary card.
 */
function abilityScoreSummaryRows(
    abilityScores: Record<AbilityKey, number>,
    asiOrFeatState: LevelUpAsiOrFeatState | null,
): AbilityScoreSummaryRow[] {
    if (asiOrFeatState == null) {
        return [];
    }

    if (asiOrFeatState.mode === 'asi') {
        return Object.entries(asiOrFeatState.allocations)
            .filter(([, increase]) => increase > 0)
            .map(([ability, increase]) => {
                const key = ability as AbilityKey;

                return {
                    ability: key,
                    label: LEVEL_UP_ABILITY_LABELS[key],
                    from: abilityScores[key],
                    to: abilityScores[key] + increase,
                };
            });
    }

    if (asiOrFeatState.feat.abilityIncrease == null) {
        return [];
    }

    const ability = asiOrFeatState.feat.abilityIncrease;

    return [
        {
            ability,
            label: LEVEL_UP_ABILITY_LABELS[ability],
            from: abilityScores[ability],
            to: abilityScores[ability] + 1,
        },
    ];
}

/**
 * Styles for the level-up summary step.
 */
const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    banner: {
        alignItems: 'center',
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.lg,
    },
    bannerEyebrow: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
        marginBottom: fantasyTokens.spacing.xs,
    },
    bannerTitle: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: 30,
        lineHeight: 36,
        color: fantasyTokens.colors.inkDark,
        textAlign: 'center',
    },
    bannerSubtitle: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkLight,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    summaryLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    summaryValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkDark,
    },
    summaryValueLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    summaryBodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    summaryFeatureName: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
    },
    summaryListItem: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    featureList: {
        gap: 4,
    },
    summaryOldValue: {
        color: fantasyTokens.colors.inkSoft,
        textDecorationLine: 'line-through',
    },
    summaryArrow: {
        color: fantasyTokens.colors.inkLight,
    },
    summaryHighlight: {
        color: fantasyTokens.colors.success,
        fontFamily: fantasyTokens.fonts.semiBold,
    },
    summaryDelta: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.success,
    },
    summaryMutedText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.7,
    },
    noteCard: {
        borderRadius: fantasyTokens.radii.md,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        backgroundColor: 'rgba(45,106,79,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(45,106,79,0.24)',
        gap: fantasyTokens.spacing.xs,
    },
    noteTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.success,
    },
    noteText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});
