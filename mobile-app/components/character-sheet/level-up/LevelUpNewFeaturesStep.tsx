import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import type {
    LevelUpCustomFeatureDraft,
    LevelUpFeatureChoiceGroup,
    LevelUpFeature,
    LevelUpWizardSelectedClass,
} from '@/lib/characterLevelUp/types';
import { hasNoSubclassFeatureAtLevel } from '@/lib/characterLevelUp/subclassFeatures';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpNewFeaturesStepProps = {
    selectedClass: LevelUpWizardSelectedClass;
    features: LevelUpFeature[];
    featureChoiceGroups: LevelUpFeatureChoiceGroup[];
    selectedFeatureChoices: Record<string, string>;
    customFeatures: LevelUpCustomFeatureDraft[];
    onSelectFeatureChoice: (parentSrdIndex: string, chosenChildSrdIndex: string) => void;
    onAddCustomFeature: () => void;
    onChangeCustomFeature: (featureId: string, changes: Partial<LevelUpCustomFeatureDraft>) => void;
    onRemoveCustomFeature: (featureId: string) => void;
};

/**
 * Renders the new-features review step for class and subclass gains.
 */
export default function LevelUpNewFeaturesStep({
    selectedClass,
    features,
    featureChoiceGroups,
    selectedFeatureChoices,
    customFeatures,
    onSelectFeatureChoice,
    onAddCustomFeature,
    onChangeCustomFeature,
    onRemoveCustomFeature,
}: LevelUpNewFeaturesStepProps) {
    const showSubclassInfoNote = hasNoSubclassFeatureAtLevel(selectedClass) && features.length > 0;

    return (
        <View style={styles.section} testID="level-up-step-new_features">
            <Text style={styles.bodyText}>
                {`The following features are gained at ${selectedClass.className} level ${selectedClass.newLevel}. These will be added to your Features tab.`}
            </Text>

            {features.map((feature) => (
                <View key={feature.key} style={styles.featureCard} testID={`level-up-feature-card-${feature.key}`}>
                    <View style={styles.featureHeader}>
                        <Text style={styles.featureName}>{feature.name}</Text>
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>New</Text>
                        </View>
                    </View>
                    <Text style={styles.featureSource}>{feature.source}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>

                    {feature.srdIndex ? (
                        renderFeatureChoiceGroup(
                            featureChoiceGroups.find((group) => group.parentSrdIndex === feature.srdIndex) ?? null,
                            selectedFeatureChoices,
                            onSelectFeatureChoice,
                        )
                    ) : null}
                </View>
            ))}

            {showSubclassInfoNote ? (
                <View style={styles.infoNote}>
                    <Text style={styles.infoNoteText}>
                        {`No additional ${selectedClass.subclassName} features unlock at this level.`}
                    </Text>
                </View>
            ) : null}

            {selectedClass.subclassIsCustom ? (
                <View style={styles.customSection} testID="level-up-custom-feature-section">
                    <View style={styles.customSectionHeader}>
                        <View style={styles.customSectionCopy}>
                            <Text style={styles.customSectionTitle}>Custom Subclass Features</Text>
                            <Text style={styles.customSectionBody}>
                                Add any features granted by your subclass at this level.
                            </Text>
                        </View>

                        <Pressable
                            onPress={onAddCustomFeature}
                            accessibilityRole="button"
                            accessibilityLabel="Add a custom subclass feature"
                            style={styles.addButton}
                            testID="level-up-add-custom-feature"
                        >
                            <Text style={styles.addButtonText}>+ Add Feature</Text>
                        </Pressable>
                    </View>

                    {customFeatures.length === 0 ? (
                        <Text style={styles.emptyState}>
                            No custom subclass features added yet.
                        </Text>
                    ) : (
                        customFeatures.map((feature, index) => (
                            <View key={feature.id} style={styles.customFeatureCard} testID={`level-up-custom-feature-${index}`}>
                                <View style={styles.customFeatureHeader}>
                                    <Text style={styles.customFeatureTitle}>{`Feature ${index + 1}`}</Text>
                                    <Pressable
                                        onPress={() => onRemoveCustomFeature(feature.id)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Remove custom feature ${index + 1}`}
                                        testID={`level-up-remove-custom-feature-${index}`}
                                    >
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </Pressable>
                                </View>

                                <TextInput
                                    mode="outlined"
                                    label="Feature Name"
                                    value={feature.name}
                                    onChangeText={(value) => onChangeCustomFeature(feature.id, { name: value })}
                                    outlineColor={fantasyTokens.colors.gold}
                                    activeOutlineColor={fantasyTokens.colors.claret}
                                    textColor={fantasyTokens.colors.inkDark}
                                    style={styles.input}
                                    testID={`level-up-custom-feature-name-${index}`}
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Description"
                                    value={feature.description}
                                    onChangeText={(value) => onChangeCustomFeature(feature.id, { description: value })}
                                    outlineColor={fantasyTokens.colors.gold}
                                    activeOutlineColor={fantasyTokens.colors.claret}
                                    textColor={fantasyTokens.colors.inkDark}
                                    multiline
                                    numberOfLines={4}
                                    style={styles.textArea}
                                    testID={`level-up-custom-feature-description-${index}`}
                                />
                            </View>
                        ))
                    )}
                </View>
            ) : null}
        </View>
    );
}

/**
 * Renders the inline picker for one parent/child feature-choice group.
 */
function renderFeatureChoiceGroup(
    group: LevelUpFeatureChoiceGroup | null,
    selectedFeatureChoices: Readonly<Record<string, string>>,
    onSelectFeatureChoice: (parentSrdIndex: string, chosenChildSrdIndex: string) => void,
) {
    if (!group) {
        return null;
    }

    const selectedChildSrdIndex = selectedFeatureChoices[group.parentSrdIndex] ?? null;
    const selectedOption = group.options.find((option) => option.childSrdIndex === selectedChildSrdIndex) ?? null;

    return (
        <View style={styles.choiceSection}>
            <Text style={styles.choicePrompt}>
                Choose {group.chooseCount === 1 ? 'one option' : `${group.chooseCount} options`}:
            </Text>

            <View style={styles.choiceOptionList}>
                {group.options.map((option) => {
                    const selected = option.childSrdIndex === selectedChildSrdIndex;

                    return (
                        <Pressable
                            key={option.childSrdIndex}
                            onPress={() => onSelectFeatureChoice(group.parentSrdIndex, option.childSrdIndex)}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selected }}
                            style={[
                                styles.choiceOptionCard,
                                selected && styles.choiceOptionCardSelected,
                            ]}
                            testID={`level-up-feature-choice-${group.parentSrdIndex}-${option.childSrdIndex}`}
                        >
                            <View style={styles.choiceOptionHeader}>
                                <View style={[styles.choiceRadioDot, selected && styles.choiceRadioDotSelected]} />
                                <Text style={styles.choiceOptionName}>{option.name}</Text>
                            </View>
                            <Text style={styles.choiceOptionDescription}>{option.description}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {selectedOption ? (
                <View style={styles.choicePreview}>
                    <Text style={styles.choicePreviewTitle}>Chosen Feature</Text>
                    <Text style={styles.choicePreviewName}>{selectedOption.name}</Text>
                    <Text style={styles.choicePreviewDescription}>{selectedOption.description}</Text>
                </View>
            ) : null}
        </View>
    );
}

/**
 * Styles for the new-features step.
 */
const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    featureCard: {
        borderLeftWidth: 4,
        borderLeftColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    featureName: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
        flex: 1,
    },
    newBadge: {
        borderRadius: 999,
        backgroundColor: 'rgba(45,106,79,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    newBadgeText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.success,
    },
    featureSource: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    featureDescription: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    choiceSection: {
        marginTop: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.sm,
    },
    choicePrompt: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    choiceOptionList: {
        gap: fantasyTokens.spacing.sm,
    },
    choiceOptionCard: {
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: 'rgba(212,201,180,0.22)',
        padding: fantasyTokens.spacing.md,
    },
    choiceOptionCardSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: 'rgba(140,29,56,0.08)',
    },
    choiceOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    choiceRadioDot: {
        width: 14,
        height: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.inkSoft,
    },
    choiceRadioDotSelected: {
        backgroundColor: fantasyTokens.colors.claret,
        borderColor: fantasyTokens.colors.claret,
    },
    choiceOptionName: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkDark,
        flex: 1,
    },
    choiceOptionDescription: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
    },
    choicePreview: {
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: 'rgba(212,201,180,0.28)',
        padding: fantasyTokens.spacing.md,
    },
    choicePreviewTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    choicePreviewName: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
    },
    choicePreviewDescription: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    infoNote: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: 'rgba(212,201,180,0.45)',
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    infoNoteText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    customSection: {
        gap: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        padding: fantasyTokens.spacing.lg,
    },
    customSectionHeader: {
        gap: fantasyTokens.spacing.md,
    },
    customSectionCopy: {
        gap: fantasyTokens.spacing.xs,
    },
    customSectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    customSectionBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    addButton: {
        alignSelf: 'flex-start',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: 'rgba(140,29,56,0.08)',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: 10,
    },
    addButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    emptyState: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    customFeatureCard: {
        gap: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: '#faf0e8',
        padding: fantasyTokens.spacing.md,
    },
    customFeatureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    customFeatureTitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkDark,
    },
    removeButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    textArea: {
        minHeight: 108,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
});
