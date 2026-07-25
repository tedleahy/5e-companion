import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
    formatGroupedChoiceLines,
    formatGroupedEquipmentLines,
} from '@/components/classes/class-detail-presentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import { fieldStyles } from './fields';
import { ABILITIES, STAGES, type Draft, type EditableStageIndex } from './types';

export type ReviewStageProps = {
    draft: Draft;
    locked: boolean;
    onJumpToStage: (stage: EditableStageIndex) => void;
};

type ReviewSectionProps = {
    title: string;
    stageIndex: EditableStageIndex;
    onJumpToStage: (stage: EditableStageIndex) => void;
    children: ReactNode;
};

type ReviewRowProps = {
    label: string;
    value: string;
    /** When true, omit the divider under this row (last in a card). */
    last?: boolean;
    numberOfLines?: number;
};

/** Display label for an ability index (`str` → `STR`). */
function abilityLabel(value: string): string {
    return ABILITIES.find((ability) => ability.value === value)?.label ?? value.toUpperCase();
}

/** Uppercase ability labels for review rows (falls back to the raw index). */
export function formatAbilityList(indexes: string[]): string {
    if (indexes.length === 0) return 'None';
    return indexes.map(abilityLabel).join(', ');
}

/** Compact multiclass prerequisite summary, e.g. "STR 13 · DEX 13". */
export function formatMulticlassPrerequisites(draft: Draft): string {
    if (draft.multiclassPrerequisites.length === 0) return 'None';
    return draft.multiclassPrerequisites
        .map((item) => `${abilityLabel(item.abilityIndex)} ${item.minimum}`)
        .join(' · ');
}

/** Grouped proficiency lines for one grant, using the shared class-detail formatter. */
export function formatProficiencyGrantSummary(draft: Draft, grant: 'STARTING' | 'MULTICLASS'): string {
    const lines = formatGroupedChoiceLines(
        draft.proficiencies
            .filter((item) => item.grant === grant)
            .map((item) => ({
                label: item.value,
                choiceGroup: item.choiceGroup,
                choiceCount: item.choiceCount,
            })),
        `review-${grant}`,
    );
    return lines.length > 0 ? lines.map((line) => line.text).join(' · ') : 'None';
}

/** Grouped equipment lines using the shared class-detail formatter. */
export function formatEquipmentSummary(draft: Draft): string {
    const lines = formatGroupedEquipmentLines(
        draft.equipment.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            choiceGroup: item.choiceGroup,
            choiceCount: item.choiceCount,
        })),
    );
    return lines.length > 0 ? lines.map((line) => line.text).join(' · ') : 'None';
}

/** Levels marked for Ability Score Improvement. */
export function formatAsiLevels(draft: Draft): string {
    const levels = draft.progression
        .filter((level) => level.abilityScoreImprovement)
        .map((level) => level.level);
    return levels.length > 0 ? levels.join(', ') : 'None';
}

/** Spellcasting mode as shown on the Progression stage today. */
export function formatSpellcastingMode(mode: string): string {
    return mode.replaceAll('_', ' ');
}

/** Count plus names, e.g. "2 · Ward, Smite". */
export function formatNamedCountList(names: string[]): string {
    if (names.length === 0) return 'None';
    return `${names.length} · ${names.join(', ')}`;
}

/** Label/value row inside a review card. */
function ReviewRow({ label, value, last = false, numberOfLines }: ReviewRowProps) {
    return (
        <View style={[styles.row, last && styles.rowLast]}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text selectable numberOfLines={numberOfLines} style={styles.rowValue}>{value}</Text>
        </View>
    );
}

/** Section header with Edit › jump-back plus summary card. */
function ReviewSection({ title, stageIndex, onJumpToStage, children }: ReviewSectionProps) {
    return (
        <View style={styles.section}>
            <Pressable
                testID={`custom-class-review-jump-${stageIndex}`}
                onPress={() => onJumpToStage(stageIndex)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${title}`}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.editHint}>Edit {'\u203A'}</Text>
                </View>
            </Pressable>
            <View style={styles.card}>{children}</View>
        </View>
    );
}

/**
 * Review stage: sectioned draft summary with Edit jump-backs to prior stages.
 */
export default function ReviewStage({ draft, locked, onJumpToStage }: ReviewStageProps) {
    const descriptionPreview = draft.description.trim() || 'No description';
    const spellAbility = draft.spellcastingAbility
        ? formatAbilityList([draft.spellcastingAbility])
        : 'None';
    const featureNames = draft.features.map((feature) => feature.name.trim() || 'Untitled');
    const spellNames = draft.spells.map((spell) => spell.name);

    return (
        <View style={styles.review} testID="custom-class-review">
            <ReviewSection title={STAGES[0]} stageIndex={0} onJumpToStage={onJumpToStage}>
                <ReviewRow label="Name" value={draft.name.trim() || 'Untitled'} />
                <ReviewRow label="Emoji" value={draft.emoji.trim() || '⚔️'} />
                <ReviewRow label="Description" value={descriptionPreview} numberOfLines={4} />
                <ReviewRow label="Hit die" value={`d${draft.hitDie}`} />
                <ReviewRow label="Primary abilities" value={formatAbilityList(draft.primaryAbilityIndexes)} />
                <ReviewRow label="Saving throws" value={formatAbilityList(draft.savingThrowIndexes)} last />
            </ReviewSection>

            <ReviewSection title={STAGES[1]} stageIndex={1} onJumpToStage={onJumpToStage}>
                <ReviewRow label="Multiclass prerequisites" value={formatMulticlassPrerequisites(draft)} />
                <ReviewRow label="Starting" value={formatProficiencyGrantSummary(draft, 'STARTING')} />
                <ReviewRow label="Multiclass" value={formatProficiencyGrantSummary(draft, 'MULTICLASS')} last />
            </ReviewSection>

            <ReviewSection title={STAGES[2]} stageIndex={2} onJumpToStage={onJumpToStage}>
                <ReviewRow label="Starting equipment" value={formatEquipmentSummary(draft)} last />
            </ReviewSection>

            <ReviewSection title={STAGES[3]} stageIndex={3} onJumpToStage={onJumpToStage}>
                <ReviewRow label="Spellcasting" value={formatSpellcastingMode(draft.spellcastingMode)} />
                {draft.spellcastingMode !== 'NONE' ? (
                    <ReviewRow label="Spellcasting ability" value={spellAbility} />
                ) : null}
                <ReviewRow label="ASI levels" value={formatAsiLevels(draft)} last />
            </ReviewSection>

            <ReviewSection title="Features / Spells" stageIndex={4} onJumpToStage={onJumpToStage}>
                <ReviewRow label="Features" value={formatNamedCountList(featureNames)} />
                <ReviewRow label="Class spells" value={formatNamedCountList(spellNames)} last />
            </ReviewSection>

            {locked ? (
                <Text style={styles.lockText}>Only descriptive fields will be updated.</Text>
            ) : (
                <Text style={fieldStyles.helper}>Review all stages. Saving is available only here.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    review: { gap: fantasyTokens.spacing.lg },
    section: { gap: fantasyTokens.spacing.sm },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    sectionTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    editHint: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.goldLight,
        letterSpacing: 1,
    },
    card: {
        ...nightFormStyles.card,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    row: {
        paddingVertical: fantasyTokens.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.sheet.form.border,
        gap: fantasyTokens.spacing.xs / 2,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    rowLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    rowValue: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchment,
    },
    lockText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.goldLight,
        textAlign: 'center',
    },
});
