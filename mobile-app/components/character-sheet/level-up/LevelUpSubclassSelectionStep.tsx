import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import {
    levelUpSrdSubclassOption,
    subclassCategoryName,
} from '@/lib/characterLevelUp/subclassFeatures';
import { fantasyTokens } from '@/theme/fantasyTheme';
import ExpandableLoreText from './ExpandableLoreText';

type LevelUpSubclassSelectionStepProps = {
    selectedClass: LevelUpWizardSelectedClass;
    selectedSrdSubclassId: string | null;
    customSubclassName: string;
    selectedMode: 'none' | 'srd' | 'custom';
    onSelectSrdSubclass: (subclassId: string) => void;
    onSelectCustomSubclass: () => void;
    onChangeCustomSubclassName: (value: string) => void;
};

/**
 * Renders the subclass selection step for class levels that unlock a subclass.
 */
export default function LevelUpSubclassSelectionStep({
    selectedClass,
    selectedSrdSubclassId,
    customSubclassName,
    selectedMode,
    onSelectSrdSubclass,
    onSelectCustomSubclass,
    onChangeCustomSubclassName,
}: LevelUpSubclassSelectionStepProps) {
    const srdSubclass = levelUpSrdSubclassOption(selectedClass.classId);
    const categoryName = subclassCategoryName(selectedClass.classId);
    const srdSelected = selectedMode === 'srd' && selectedSrdSubclassId === srdSubclass?.subclassId;
    const customSelected = selectedMode === 'custom';

    return (
        <View style={styles.section} testID="level-up-step-subclass_selection">
            <Text style={styles.bodyText}>
                {`Choose your ${categoryName} for ${selectedClass.className}.`}
            </Text>

            {srdSubclass ? (
                <Pressable
                    onPress={() => onSelectSrdSubclass(srdSubclass.subclassId)}
                    style={[
                        styles.optionCard,
                        srdSelected && styles.optionCardSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${srdSubclass.name}`}
                    accessibilityState={{ selected: srdSelected }}
                    testID={`level-up-subclass-option-${srdSubclass.subclassId}`}
                >
                    <View style={styles.optionHeader}>
                        <Text style={styles.optionIcon}>{srdSubclass.icon}</Text>
                        <View style={styles.optionTitleWrap}>
                            <Text style={styles.optionTitle}>{srdSubclass.name}</Text>
                            <Text style={styles.optionSubtitle}>{categoryName}</Text>
                        </View>
                        <View style={styles.srdBadge}>
                            <Text style={styles.srdBadgeText}>SRD</Text>
                        </View>
                    </View>
                    <ExpandableLoreText
                        text={srdSubclass.description}
                        testID={`level-up-subclass-description-${srdSubclass.subclassId}`}
                    />
                </Pressable>
            ) : null}

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
    srdBadge: {
        borderRadius: 999,
        backgroundColor: 'rgba(45,106,79,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    srdBadgeText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.success,
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        marginTop: fantasyTokens.spacing.xs,
    },
});
