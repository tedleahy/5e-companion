import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ClassOptionGrid from '@/components/wizard/ClassOptionGrid';
import type { LevelUpWizardSelectedClass, LevelUpWizardStep } from '@/lib/characterLevelUp/types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpWizardStepBodyProps = {
    step: LevelUpWizardStep;
    selectedClassId: string;
    selectedClass: LevelUpWizardSelectedClass;
    onSelectClass: (classId: string) => void;
};

/**
 * Body renderer for placeholder chunk-2 level-up wizard steps.
 */
export default function LevelUpWizardStepBody({
    step,
    selectedClassId,
    selectedClass,
    onSelectClass,
}: LevelUpWizardStepBodyProps) {
    if (step.id === 'choose_class') {
        return (
            <View style={styles.section} testID={`level-up-step-${step.id}`}>
                <Text style={styles.sectionTitle}>Wizard Scaffold</Text>
                <Text style={styles.bodyText}>{step.description}</Text>

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

                <Text style={styles.sectionTitle}>Placeholder Class Picker</Text>
                <Text style={styles.bodyText}>
                    Choose a class below to force the step registry to recalculate. The polished chooser lands in chunk 3.
                </Text>
                <ClassOptionGrid
                    selected={selectedClassId}
                    onSelect={onSelectClass}
                    tone="parchment"
                    getOptionTestId={(option) => `level-up-class-option-${option.value}`}
                    getOptionAccessibilityLabel={(option) => `Select ${option.label} for level up`}
                />
            </View>
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
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
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
