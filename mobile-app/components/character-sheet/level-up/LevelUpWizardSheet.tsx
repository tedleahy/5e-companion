import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import LevelUpWizardProgress from './LevelUpWizardProgress';

type LevelUpWizardSheetProps = {
    visible: boolean;
    characterName: string;
    currentLevel: number;
    onClose: () => void;
};

/**
 * Placeholder step title used by the chunk-1 shell implementation.
 */
const PLACEHOLDER_STEP_NAME = 'Choose Class';

/**
 * Temporary step count used until the real wizard controller lands.
 */
const PLACEHOLDER_STEP_TOTAL = 1;

/**
 * Placeholder body copy used to reserve space for the first real step.
 */
const PLACEHOLDER_SECTIONS = [
    {
        title: 'Class Choice',
        body: 'Step 1 will let you continue in your current class or switch into a multiclass level-up flow.',
    },
    {
        title: 'Session Summary',
        body: 'Future chunks will fill this sheet with hit points, ASI or feat choices, subclass decisions, and spellcasting updates.',
    },
] as const;

/**
 * Bottom-sheet shell for the character-sheet level-up flow.
 */
export default function LevelUpWizardSheet({
    visible,
    characterName,
    currentLevel,
    onClose,
}: LevelUpWizardSheetProps) {
    if (!visible) {
        return null;
    }

    const nextLevel = currentLevel + 1;
    const stepLabel = `Step 1 of ${PLACEHOLDER_STEP_TOTAL} - ${PLACEHOLDER_STEP_NAME}`;

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none">
            <View style={styles.backdrop}>
                <Pressable
                    style={styles.backdropPressable}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss level up wizard"
                />
            </View>

            <View style={styles.sheet} testID="level-up-wizard-sheet">
                <View style={styles.handleWrap}>
                    <View style={styles.handle} />
                </View>

                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Level Up</Text>
                        <Pressable
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Close level up wizard"
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.subtitle}>
                        {`Advance ${characterName} to Level ${nextLevel}`}
                    </Text>
                    <Text style={styles.stepLabel}>{stepLabel}</Text>
                    <LevelUpWizardProgress currentStep={1} totalSteps={PLACEHOLDER_STEP_TOTAL} />
                </View>

                <ScrollView
                    style={styles.body}
                    contentContainerStyle={styles.bodyContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.placeholderLead}>
                        The wizard shell is in place. Step content will be wired in the next chunks.
                    </Text>

                    {PLACEHOLDER_SECTIONS.map((section) => (
                        <View key={section.title} style={styles.placeholderCard}>
                            <Text style={styles.placeholderTitle}>{section.title}</Text>
                            <Text style={styles.placeholderBody}>{section.body}</Text>
                            <View style={styles.placeholderBlock} />
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go to previous level up step"
                        disabled
                        style={[styles.footerButton, styles.backButton, styles.backButtonDisabled]}
                    >
                        <Text style={[styles.backButtonText, styles.backButtonTextDisabled]}>Back</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go to next level up step"
                        style={[styles.footerButton, styles.nextButton]}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

/**
 * Styles for the level-up wizard bottom-sheet shell.
 */
const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 30,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20,14,8,0.6)',
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: '82%',
        backgroundColor: fantasyTokens.colors.parchment,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 20,
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: fantasyTokens.colors.sheetDivider,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.sheetDivider,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        marginBottom: 4,
    },
    title: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: 26,
        lineHeight: 32,
        color: fantasyTokens.colors.inkDark,
    },
    closeButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    closeButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    subtitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        marginBottom: 12,
    },
    stepLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
        marginBottom: 10,
    },
    body: {
        flex: 1,
    },
    bodyContent: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: fantasyTokens.spacing.md,
    },
    placeholderLead: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    placeholderCard: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
    },
    placeholderTitle: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.claret,
    },
    placeholderBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    placeholderBlock: {
        height: 64,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: 'rgba(212,201,180,0.55)',
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    footerButton: {
        minWidth: 112,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    backButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: 'transparent',
    },
    backButtonDisabled: {
        opacity: 0.4,
    },
    backButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    backButtonTextDisabled: {
        color: fantasyTokens.colors.inkSoft,
    },
    nextButton: {
        backgroundColor: fantasyTokens.colors.claret,
    },
    nextButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
});
