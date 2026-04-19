import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ClassOptionGrid from '@/components/wizard/ClassOptionGrid';
import type {
    LevelUpAsiOrFeatState,
    LevelUpWizardStep,
} from '@/lib/characterLevelUp/types';
import { levelUpClassOption, levelUpHitDieLabel } from '@/lib/characterLevelUp/chooseClass';
import { mapCustomFeatureDrafts } from '@/lib/characterLevelUp/subclassFeatures';
import type { AvailableSubclassOption } from '@/lib/subclasses';
import LevelUpAsiOrFeatStep from './LevelUpAsiOrFeatStep';
import LevelUpClassResourcesStep from './LevelUpClassResourcesStep';
import LevelUpHitPointsStep from './LevelUpHitPointsStep';
import LevelUpMulticlassProficienciesStep from './LevelUpMulticlassProficienciesStep';
import LevelUpNewFeaturesStep from './LevelUpNewFeaturesStep';
import LevelUpSpellcastingStep from './LevelUpSpellcastingStep';
import LevelUpSubclassSelectionStep from './LevelUpSubclassSelectionStep';
import LevelUpSummaryStep from './LevelUpSummaryStep';
import type { UseLevelUpWizardResult } from '@/hooks/useLevelUpWizard';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpWizardStepBodyProps = {
    wizard: UseLevelUpWizardResult;
    availableSubclasses: AvailableSubclassOption[];
};

/**
 * Body renderer for the level-up wizard steps.
 */
export default function LevelUpWizardStepBody({
    wizard,
    availableSubclasses,
}: LevelUpWizardStepBodyProps) {
    const {
        currentCharacterLevel,
        currentClass,
        selectedClass,
        classSelectionMode,
        pickerSelectedClassId,
        prerequisiteWarnings,
        abilityScores,
        currentHitPoints,
        hitPointsState,
        asiOrFeatState,
        subclassSelectionState,
        spellcastingState,
        spellcastingSummary,
        multiclassProficiencyState,
        existingSkillProficiencies,
        invocationPrerequisiteContext,
        existingInvocations,
        invocationState,
        metamagicState,
        mysticArcanumState,
        newFeatures,
        customFeatures,
        currentStep,
        selectClass,
        enterClassPicker,
        returnToCurrentClass,
        selectExistingSubclass,
        selectCustomSubclass,
        changeCustomSubclassName,
        changeCustomSubclassDescription,
        addCustomFeature,
        changeCustomFeature,
        removeCustomFeature,
        toggleMulticlassSkill,
        toggleInvocation,
        changeCustomInvocation,
        changeInvocationSwapOut,
        changeInvocationSwapIn,
        toggleMetamagic,
        changeCustomMetamagic,
        changeMysticArcanumSpell,
    } = wizard;
    if (currentStep.id === 'choose_class') {
        const currentClassOption = levelUpClassOption(currentClass.classId);
        const isDefaultCurrentClassView = classSelectionMode === 'current_class';
        const pickerSelectedId = pickerSelectedClassId ?? '';

        return (
            <View style={styles.section} testID={`level-up-step-${currentStep.id}`}>
                {isDefaultCurrentClassView ? (
                    <>
                        <Text style={styles.bodyText}>
                            {"You're adding a level to your current class. Tap Next to continue."}
                        </Text>

                        <View style={styles.currentClassCard} testID="level-up-current-class-card">
                            <Text style={styles.currentClassIcon}>{currentClassOption?.icon ?? '\u2736'}</Text>
                            <Text style={styles.currentClassName}>{currentClass.className}</Text>
                            <Text style={styles.currentClassLevelText}>
                                {`Level ${currentClass.currentLevel} -> ${currentClass.newLevel} · ${levelUpHitDieLabel(currentClass.classId)} Hit Die`}
                            </Text>
                        </View>

                        <Text style={styles.separatorText}>- or -</Text>
                        <Text style={styles.bodyText}>
                            Want to gain a level in a different class instead?
                        </Text>

                        <View style={styles.multiclassButtonWrap}>
                            <Pressable
                                onPress={enterClassPicker}
                                style={styles.multiclassButton}
                                accessibilityLabel="Choose a class to multiclass"
                                testID="level-up-open-class-picker"
                            >
                                <Text style={styles.multiclassButtonText}>Choose a Class to Multiclass</Text>
                            </Pressable>
                        </View>
                    </>
                ) : (
                    <>
                        <Pressable
                            onPress={returnToCurrentClass}
                            accessibilityLabel="Back to current class level up"
                            testID="level-up-back-to-current-class"
                        >
                            <Text style={styles.backLinkText}>{'<'} Back to Wizard</Text>
                        </Pressable>

                        <Text style={styles.bodyText}>
                            {`Choose a new class to multiclass into. This will add a level in the selected class instead of ${currentClass.className}.`}
                        </Text>

                        <ClassOptionGrid
                            selected={pickerSelectedId}
                            onSelect={selectClass}
                            tone="parchment"
                            getOptionTestId={(option) => `level-up-class-option-${option.value}`}
                            getOptionAccessibilityLabel={(option) => `Select ${option.label} for level up`}
                        />

                        {prerequisiteWarnings.length > 0 ? (
                            <View
                                style={styles.warningBox}
                                testID="level-up-multiclass-warning"
                                accessibilityRole="alert"
                                accessibilityLabel={`Prerequisite warning: ${prerequisiteWarnings.join(', ')}`}
                            >
                                <View style={styles.warningHeader}>
                                    <Text style={styles.warningIcon}>⚠</Text>
                                    <Text style={styles.warningTitle}>Prerequisite warning</Text>
                                </View>
                                {prerequisiteWarnings.map((warning) => (
                                    <Text key={warning} style={styles.warningText}>
                                        {warning}
                                    </Text>
                                ))}
                            </View>
                        ) : null}

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Current selection</Text>
                            <Text style={styles.summaryValue}>
                                {`${selectedClass.className} ${selectedClass.currentLevel} -> ${selectedClass.newLevel}`}
                            </Text>
                            <Text style={styles.summaryHint}>
                                {selectedClass.isExistingClass
                                    ? 'Existing class progression'
                                    : 'New multiclass branch'}
                            </Text>
                        </View>
                    </>
                )}
            </View>
        );
    }

    if (currentStep.id === 'hit_points') {
        return <LevelUpHitPointsStep wizard={wizard} />;
    }

    if (currentStep.id === 'asi_or_feat') {
        return <LevelUpAsiOrFeatStep wizard={wizard} />;
    }

    if (currentStep.id === 'subclass_selection') {
        return (
            <LevelUpSubclassSelectionStep
                selectedClass={selectedClass}
                availableSubclasses={availableSubclasses}
                selectedSubclassId={subclassSelectionState.selectedSubclassId}
                customSubclassName={subclassSelectionState.customSubclassName}
                customSubclassDescription={subclassSelectionState.customSubclassDescription}
                selectedMode={subclassSelectionState.mode}
                onSelectExistingSubclass={selectExistingSubclass}
                onSelectCustomSubclass={selectCustomSubclass}
                onChangeCustomSubclassName={changeCustomSubclassName}
                onChangeCustomSubclassDescription={changeCustomSubclassDescription}
            />
        );
    }

    if (currentStep.id === 'new_features') {
        return (
            <LevelUpNewFeaturesStep
                selectedClass={selectedClass}
                features={newFeatures}
                customFeatures={customFeatures}
                onAddCustomFeature={addCustomFeature}
                onChangeCustomFeature={changeCustomFeature}
                onRemoveCustomFeature={removeCustomFeature}
            />
        );
    }

    if (currentStep.id === 'spellcasting_updates') {
        return <LevelUpSpellcastingStep wizard={wizard} />;
    }

    if (currentStep.id === 'multiclass_proficiencies') {
        return (
            <LevelUpMulticlassProficienciesStep
                selectedClass={selectedClass}
                proficiencyState={multiclassProficiencyState}
                existingSkillProficiencies={existingSkillProficiencies}
                onToggleSkill={toggleMulticlassSkill}
            />
        );
    }

    if (currentStep.id === 'class_resources') {
        return (
            <LevelUpClassResourcesStep
                selectedClass={selectedClass}
                invocationPrerequisiteContext={invocationPrerequisiteContext}
                invocationState={invocationState}
                metamagicState={metamagicState}
                mysticArcanumState={mysticArcanumState}
                existingInvocations={existingInvocations}
                onToggleInvocation={toggleInvocation}
                onChangeCustomInvocation={changeCustomInvocation}
                onChangeInvocationSwapOut={changeInvocationSwapOut}
                onChangeInvocationSwapIn={changeInvocationSwapIn}
                onToggleMetamagic={toggleMetamagic}
                onChangeCustomMetamagic={changeCustomMetamagic}
                onChangeMysticArcanumSpell={changeMysticArcanumSpell}
            />
        );
    }

    if (currentStep.id === 'summary' && hitPointsState) {
        return (
            <LevelUpSummaryStep
                currentCharacterLevel={currentCharacterLevel}
                currentHitPoints={currentHitPoints}
                abilityScores={abilityScores}
                selectedClass={selectedClass}
                hitPointsState={hitPointsState}
                asiOrFeatState={stepRequiresAsiOrFeat(currentStep, asiOrFeatState)}
                features={[
                    ...newFeatures,
                    ...mapCustomFeatureDrafts(selectedClass, customFeatures),
                ]}
                spellcastingState={spellcastingState}
                spellcastingSummary={spellcastingSummary}
                multiclassProficiencyState={multiclassProficiencyState}
                invocationState={invocationState}
                metamagicState={metamagicState}
                mysticArcanumState={mysticArcanumState}
            />
        );
    }

    return (
        <View style={styles.section} testID={`level-up-step-${currentStep.id}`}>
            <Text style={styles.sectionTitle}>{currentStep.title}</Text>
            <Text style={styles.bodyText}>{currentStep.description}</Text>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Selected class</Text>
                <Text style={styles.summaryValue}>
                    {`${selectedClass.className} ${selectedClass.currentLevel} -> ${selectedClass.newLevel}`}
                </Text>
                <Text style={styles.summaryHint}>
                    Placeholder content for chunk 2. Real UI arrives in later chunks.
                </Text>
            </View>

            <View style={styles.placeholderPanel}>
                <Text style={styles.placeholderPanelTitle}>Step wiring verified</Text>
                <Text style={styles.placeholderPanelBody}>
                    This placeholder is here so navigation, dynamic step counts, and progress state can be tested before the real inputs are built.
                </Text>
            </View>
        </View>
    );
}

/**
 * Styles for placeholder level-up wizard step content.
 */
const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    sectionTitle: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.claret,
    },
    backLinkText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    currentClassCard: {
        alignItems: 'center',
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.md,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.xl,
        gap: fantasyTokens.spacing.xs,
    },
    currentClassIcon: {
        fontSize: 28,
    },
    currentClassName: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
    },
    currentClassLevelText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    separatorText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
        textAlign: 'center',
    },
    multiclassButtonWrap: {
        alignItems: 'center',
    },
    multiclassButton: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.md,
        minWidth: 240,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    multiclassButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        borderRadius: fantasyTokens.radii.md,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.xs,
    },
    summaryLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    summaryValue: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    summaryHint: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
    },
    warningBox: {
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: 'rgba(184,92,31,0.4)',
        backgroundColor: 'rgba(184,92,31,0.14)',
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    warningIcon: {
        fontSize: 18,
    },
    warningTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
    warningText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkDark,
    },
    placeholderPanel: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: 'rgba(212,201,180,0.4)',
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
    },
    placeholderPanelTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    placeholderPanelBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});

/**
 * Returns the ASI / feat state for summary rendering when that step was active.
 */
function stepRequiresAsiOrFeat(
    _step: LevelUpWizardStep,
    asiOrFeatState: LevelUpAsiOrFeatState,
): LevelUpAsiOrFeatState | null {
    return canRenderAsiOrFeatSummary(asiOrFeatState) ? asiOrFeatState : null;
}

/**
 * Returns whether the ASI / feat state contains meaningful summary data.
 */
function canRenderAsiOrFeatSummary(
    asiOrFeatState: LevelUpAsiOrFeatState,
): boolean {
    if (asiOrFeatState.mode === 'asi') {
        return Object.values(asiOrFeatState.allocations).some((value) => value > 0);
    }

    return asiOrFeatState.feat.name.trim().length > 0 && asiOrFeatState.feat.description.trim().length > 0;
}
