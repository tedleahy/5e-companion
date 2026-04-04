import { StyleSheet, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpWizardProgressProps = {
    currentStep: number;
    totalSteps: number;
};

/**
 * Segmented progress bar used by the level-up wizard shell.
 */
export default function LevelUpWizardProgress({
    currentStep,
    totalSteps,
}: LevelUpWizardProgressProps) {
    return (
        <View style={styles.progressBar}>
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                    <View
                        key={stepNumber}
                        style={[
                            styles.progressSegment,
                            isCompleted && styles.progressSegmentCompleted,
                            isCurrent && styles.progressSegmentCurrent,
                        ]}
                    />
                );
            })}
        </View>
    );
}

/**
 * Styles for the level-up wizard segmented progress bar.
 */
const styles = StyleSheet.create({
    progressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
    },
    progressSegment: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: fantasyTokens.colors.sheetDivider,
    },
    progressSegmentCompleted: {
        backgroundColor: fantasyTokens.colors.claret,
    },
    progressSegmentCurrent: {
        backgroundColor: fantasyTokens.colors.gold,
    },
});
