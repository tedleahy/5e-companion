import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type {
    InvocationPrerequisiteContext,
    LevelUpInvocationState,
    LevelUpMetamagicState,
    LevelUpMysticArcanumState,
    LevelUpWizardSelectedClass,
} from '@/lib/characterLevelUp/types';
import type { ClassResourceChange } from '@/lib/characterLevelUp/classResources';
import { getClassResourceChanges } from '@/lib/characterLevelUp/classResources';
import {
    canSwapInvocation,
    hasInvocationGain,
    hasMetamagicGain,
    hasMysticArcanumGain,
    invocationGainCount,
    metamagicGainCount,
    mysticArcanumSpellLevel,
} from '@/lib/characterLevelUp/advancedClassChoices';
import { fantasyTokens } from '@/theme/fantasyTheme';
import LevelUpInvocationPicker from './LevelUpInvocationPicker';
import LevelUpInvocationSwapSection from './LevelUpInvocationSwapSection';
import LevelUpMetamagicPicker from './LevelUpMetamagicPicker';
import LevelUpMysticArcanumPicker from './LevelUpMysticArcanumPicker';

type LevelUpClassResourcesStepProps = {
    selectedClass: LevelUpWizardSelectedClass;
    invocationPrerequisiteContext: InvocationPrerequisiteContext | null;
    invocationState: LevelUpInvocationState;
    metamagicState: LevelUpMetamagicState;
    mysticArcanumState: LevelUpMysticArcanumState;
    onToggleInvocation: (invocationId: string) => void;
    onChangeCustomInvocation: (custom: { name: string; description: string } | null) => void;
    onChangeInvocationSwapOut: (invocationId: string | null) => void;
    onChangeInvocationSwapIn: (invocation: { id: string; name: string; isCustom: boolean } | null) => void;
    onToggleMetamagic: (metamagicId: string) => void;
    onChangeCustomMetamagic: (custom: { name: string; description: string } | null) => void;
    onChangeMysticArcanumSpell: (spell: { id: string; name: string; level: number } | null) => void;
};

/**
 * Renders the class resource updates step showing before/after values,
 * plus advanced pickers for warlock invocations, sorcerer metamagic,
 * and warlock mystic arcanum.
 */
export default function LevelUpClassResourcesStep({
    selectedClass,
    invocationPrerequisiteContext,
    invocationState,
    metamagicState,
    mysticArcanumState,
    onToggleInvocation,
    onChangeCustomInvocation,
    onChangeInvocationSwapOut,
    onChangeInvocationSwapIn,
    onToggleMetamagic,
    onChangeCustomMetamagic,
    onChangeMysticArcanumSpell,
}: LevelUpClassResourcesStepProps) {
    const changes = getClassResourceChanges(
        selectedClass.classId,
        selectedClass.currentLevel,
        selectedClass.newLevel,
    );
    const changedResources = changes.filter((change) => change.changed);
    const unchangedResources = changes.filter((change) => !change.changed);

    const showInvocationPicker = selectedClass.classId === 'warlock'
        && hasInvocationGain(selectedClass.currentLevel, selectedClass.newLevel);
    const showInvocationSwap = selectedClass.classId === 'warlock'
        && canSwapInvocation(selectedClass.newLevel);
    const showMetamagicPicker = selectedClass.classId === 'sorcerer'
        && hasMetamagicGain(selectedClass.newLevel);
    const showMysticArcanum = selectedClass.classId === 'warlock'
        && hasMysticArcanumGain(selectedClass.newLevel);
    const arcanumSpellLevel = mysticArcanumSpellLevel(selectedClass.newLevel);

    return (
        <View style={styles.section} testID="level-up-step-class_resources">
            <Text style={styles.bodyText}>
                {`${selectedClass.className} resource updates at level ${selectedClass.newLevel}:`}
            </Text>

            {changedResources.length > 0 ? (
                changedResources.map((change) => (
                    <ResourceChangeCard key={change.key} change={change} />
                ))
            ) : (
                <View style={styles.noChangeCard} testID="level-up-no-resource-changes">
                    <Text style={styles.noChangeText}>
                        No resource changes at this level.
                    </Text>
                </View>
            )}

            {unchangedResources.length > 0 ? (
                <View style={styles.unchangedSection}>
                    <Text style={styles.unchangedTitle}>Unchanged</Text>
                    {unchangedResources.map((change) => (
                        <View key={change.key} style={styles.unchangedRow} testID={`level-up-resource-unchanged-${change.key}`}>
                            <Text style={styles.unchangedLabel}>{change.label}</Text>
                            <Text style={styles.unchangedValue}>{change.nextValue}</Text>
                        </View>
                    ))}
                </View>
            ) : null}

            {showInvocationPicker ? (
                <LevelUpInvocationPicker
                    gainCount={invocationGainCount(selectedClass.currentLevel, selectedClass.newLevel)}
                    state={invocationState}
                    prerequisiteContext={invocationPrerequisiteContext}
                    onToggle={onToggleInvocation}
                    onChangeCustom={onChangeCustomInvocation}
                />
            ) : null}

            {showInvocationSwap ? (
                <LevelUpInvocationSwapSection
                    state={invocationState}
                    onChangeSwapOut={onChangeInvocationSwapOut}
                    onChangeSwapIn={onChangeInvocationSwapIn}
                />
            ) : null}

            {showMetamagicPicker ? (
                <LevelUpMetamagicPicker
                    gainCount={metamagicGainCount(selectedClass.newLevel)}
                    state={metamagicState}
                    onToggle={onToggleMetamagic}
                    onChangeCustom={onChangeCustomMetamagic}
                />
            ) : null}

            {showMysticArcanum && arcanumSpellLevel != null ? (
                <LevelUpMysticArcanumPicker
                    spellLevel={arcanumSpellLevel}
                    state={mysticArcanumState}
                    onChange={onChangeMysticArcanumSpell}
                />
            ) : null}
        </View>
    );
}

type ResourceChangeCardProps = {
    change: ClassResourceChange;
};

/**
 * A single resource change card showing old -> new values.
 */
function ResourceChangeCard({ change }: ResourceChangeCardProps) {
    return (
        <View style={styles.resourceCard} testID={`level-up-resource-change-${change.key}`}>
            <Text style={styles.resourceLabel}>{change.label}</Text>
            <View style={styles.resourceValueRow}>
                <Text style={styles.resourceOldValue}>{change.previousValue}</Text>
                <Text style={styles.resourceArrow}>{' \u2192 '}</Text>
                <Text style={styles.resourceNewValue}>{change.nextValue}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    resourceCard: {
        borderLeftWidth: 4,
        borderLeftColor: fantasyTokens.colors.success,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    resourceLabel: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
    },
    resourceValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceOldValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkSoft,
        textDecorationLine: 'line-through',
    },
    resourceArrow: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkLight,
    },
    resourceNewValue: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.success,
        fontFamily: fantasyTokens.fonts.semiBold,
    },
    noChangeCard: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: 'rgba(212,201,180,0.45)',
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    noChangeText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    unchangedSection: {
        gap: fantasyTokens.spacing.xs,
    },
    unchangedTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    unchangedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.xs,
    },
    unchangedLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    unchangedValue: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
});
