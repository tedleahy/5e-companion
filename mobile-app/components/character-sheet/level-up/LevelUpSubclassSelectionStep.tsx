import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import type { AvailableSubclassOption } from '@/lib/subclasses';
import {
    subclassCategoryName,
} from '@/lib/characterLevelUp/subclassFeatures';
import { fantasyTokens } from '@/theme/fantasyTheme';
import ExpandableLoreText from './ExpandableLoreText';

type LevelUpSubclassSelectionStepProps = {
    selectedClass: LevelUpWizardSelectedClass;
    availableSubclasses: AvailableSubclassOption[];
    selectedSubclassId: string | null;
    customSubclassName: string;
    customSubclassDescription: string;
    selectedMode: 'none' | 'srd' | 'custom';
    onSelectExistingSubclass: (subclass: AvailableSubclassOption) => void;
    onSelectCustomSubclass: () => void;
    onChangeCustomSubclassName: (value: string) => void;
    onChangeCustomSubclassDescription: (value: string) => void;
};

/**
 * Renders the subclass selection step for class levels that unlock a subclass.
 */
export default function LevelUpSubclassSelectionStep({
    selectedClass,
    availableSubclasses,
    selectedSubclassId,
    customSubclassName,
    customSubclassDescription,
    selectedMode,
    onSelectExistingSubclass,
    onSelectCustomSubclass,
    onChangeCustomSubclassName,
    onChangeCustomSubclassDescription,
}: LevelUpSubclassSelectionStepProps) {
    const categoryName = subclassCategoryName(selectedClass.classId);
    const existingSubclassSelected = selectedMode === 'srd';
    const customSelected = selectedMode === 'custom';

    return (
        <View style={styles.section} testID="level-up-step-subclass_selection">
            <Text style={styles.bodyText}>
                {`Choose your ${categoryName} for ${selectedClass.className}.`}
            </Text>

            {availableSubclasses.map((subclass) => {
                const isSelected = existingSubclassSelected && selectedSubclassId === subclass.value;

                return (
                    <Pressable
                        key={subclass.value}
                        onPress={() => onSelectExistingSubclass(subclass)}
                        style={[
                            styles.optionCard,
                            isSelected && styles.optionCardSelected,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Choose ${subclass.name}`}
                        accessibilityState={{ selected: isSelected }}
                        testID={`level-up-subclass-option-${subclass.value}`}
                    >
                        <View style={styles.optionHeader}>
                            <Text style={styles.optionIcon}>{subclass.icon}</Text>
                            <View style={styles.optionTitleWrap}>
                                <Text style={styles.optionTitle}>{subclass.name}</Text>
                                <Text style={styles.optionSubtitle}>
                                    {subclass.isCustom ? `Custom ${categoryName}` : categoryName}
                                </Text>
                            </View>
                            <View style={[
                                styles.sourceBadge,
                                subclass.isCustom && styles.customBadge,
                            ]}>
                                <Text style={[
                                    styles.sourceBadgeText,
                                    subclass.isCustom && styles.customBadgeText,
                                ]}>
                                    {subclass.isCustom ? 'Yours' : 'SRD'}
                                </Text>
                            </View>
                        </View>
                        <ExpandableLoreText
                            text={subclass.description}
                            testID={`level-up-subclass-description-${subclass.value}`}
                        />
                    </Pressable>
                );
            })}

            <Pressable
                onPress={onSelectCustomSubclass}
                style={[
                    styles.optionCard,
                    customSelected && styles.optionCardSelected,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Choose a custom subclass"
                accessibilityState={{ selected: customSelected }}
                testID="level-up-subclass-option-custom"
            >
                <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{'\u2728'}</Text>
                    <View style={styles.optionTitleWrap}>
                        <Text style={styles.optionTitle}>Custom Subclass</Text>
                        <Text style={styles.optionSubtitle}>Use your table&apos;s own subclass</Text>
                    </View>
                </View>

                <Text style={styles.optionDescription}>
                    Enter the name your character should use for this subclass.
                </Text>

                {customSelected ? (
                    <View style={styles.customInputGroup}>
                        <TextInput
                            mode="outlined"
                            label="Custom Subclass Name"
                            placeholder={`Enter your ${categoryName.toLowerCase()} name`}
                            value={customSubclassName}
                            onChangeText={onChangeCustomSubclassName}
                            outlineColor={fantasyTokens.colors.gold}
                            activeOutlineColor={fantasyTokens.colors.claret}
                            textColor={fantasyTokens.colors.inkDark}
                            style={styles.input}
                            testID="level-up-custom-subclass-name-input"
                        />
                        <TextInput
                            mode="outlined"
                            label="Subclass Description"
                            placeholder="Describe this subclass for future selection screens"
                            value={customSubclassDescription}
                            onChangeText={onChangeCustomSubclassDescription}
                            outlineColor={fantasyTokens.colors.gold}
                            activeOutlineColor={fantasyTokens.colors.claret}
                            textColor={fantasyTokens.colors.inkDark}
                            multiline
                            style={styles.input}
                            contentStyle={styles.descriptionInputContent}
                            testID="level-up-custom-subclass-description-input"
                        />
                    </View>
                ) : null}
            </Pressable>
        </View>
    );
}

/**
 * Styles for the subclass selection step.
 */
const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    optionCard: {
        gap: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        padding: fantasyTokens.spacing.lg,
    },
    optionCardSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: '#faf0e8',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.sm,
    },
    optionIcon: {
        fontSize: 28,
    },
    optionTitleWrap: {
        flex: 1,
        gap: 2,
    },
    optionTitle: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
    },
    optionSubtitle: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    optionDescription: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        lineHeight: 24,
    },
    sourceBadge: {
        borderRadius: 999,
        backgroundColor: 'rgba(45,106,79,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    customBadge: {
        backgroundColor: 'rgba(122,77,24,0.12)',
    },
    sourceBadgeText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.success,
    },
    customBadgeText: {
        color: fantasyTokens.colors.inkDark,
    },
    customInputGroup: {
        gap: fantasyTokens.spacing.sm,
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        marginTop: fantasyTokens.spacing.xs,
    },
    descriptionInputContent: {
        minHeight: 96,
    },
});
