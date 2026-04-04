import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ClassOptionGrid from '@/components/wizard/ClassOptionGrid';
import { levelUpClassOption } from '@/lib/characterLevelUp/chooseClass';
import LevelUpHitPointsStep from './LevelUpHitPointsStep';
import type {
    LevelUpHitPointsState,
    LevelUpClassSelectionMode,
    LevelUpWizardSelectedClass,
    LevelUpWizardStep,
} from '@/lib/characterLevelUp/types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpWizardStepBodyProps = {
    step: LevelUpWizardStep;
    currentClass: LevelUpWizardSelectedClass;
    classSelectionMode: LevelUpClassSelectionMode;
    pickerSelectedClassId: string | null;
    selectedClass: LevelUpWizardSelectedClass;
    prerequisiteWarnings: string[];
    hitPointsState: LevelUpHitPointsState | null;
    onSelectClass: (classId: string) => void;
    onEnterClassPicker: () => void;
    onReturnToCurrentClass: () => void;
    onRollHitPoints: () => void;
    onTakeAverageHitPoints: () => void;
};

/**
 * Body renderer for the level-up wizard steps.
 */
export default function LevelUpWizardStepBody({
    step,
    currentClass,
    classSelectionMode,
    pickerSelectedClassId,
    selectedClass,
    prerequisiteWarnings,
    hitPointsState,
    onSelectClass,
    onEnterClassPicker,
    onReturnToCurrentClass,
    onRollHitPoints,
    onTakeAverageHitPoints,
}: LevelUpWizardStepBodyProps) {
    if (step.id === 'choose_class') {
        const currentClassOption = levelUpClassOption(currentClass.classId);
        const isDefaultCurrentClassView = classSelectionMode === 'current_class';
        const pickerSelectedId = pickerSelectedClassId ?? '';

        return (
            <View style={styles.section} testID={`level-up-step-${step.id}`}>
                {isDefaultCurrentClassView ? (
                    <>
                        <Text style={styles.bodyText}>
                            {"You're adding a level to your current class. Tap Next to continue."}
                        </Text>

                        <View style={styles.currentClassCard} testID="level-up-current-class-card">
                            <Text style={styles.currentClassIcon}>{currentClassOption?.icon ?? '\u2736'}</Text>
                            <Text style={styles.currentClassName}>{currentClass.className}</Text>
                            <Text style={styles.currentClassLevelText}>
                                {`Level ${currentClass.currentLevel} -> ${currentClass.newLevel}`}
                            </Text>
                        </View>

                        <Text style={styles.separatorText}>- or -</Text>
                        <Text style={styles.bodyText}>
                            Want to gain a level in a different class instead?
                        </Text>

                        <View style={styles.multiclassButtonWrap}>
                            <Pressable
                                onPress={onEnterClassPicker}
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
                            onPress={onReturnToCurrentClass}
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
                            onSelect={onSelectClass}
                            tone="parchment"
                            getOptionTestId={(option) => `level-up-class-option-${option.value}`}
                            getOptionAccessibilityLabel={(option) => `Select ${option.label} for level up`}
                        />

                        {prerequisiteWarnings.length > 0 ? (
                            <View style={styles.warningBox} testID="level-up-multiclass-warning">
                                <Text style={styles.warningTitle}>Prerequisite warning</Text>
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

    if (step.id === 'hit_points') {
        return (
            <LevelUpHitPointsStep
                selectedClass={selectedClass}
                hitPointsState={hitPointsState}
                onRollHitPoints={onRollHitPoints}
                onTakeAverageHitPoints={onTakeAverageHitPoints}
            />
        );
    }

    return (
        <View style={styles.section} testID={`level-up-step-${step.id}`}>
            <Text style={styles.sectionTitle}>{step.title}</Text>
            <Text style={styles.bodyText}>{step.description}</Text>

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
