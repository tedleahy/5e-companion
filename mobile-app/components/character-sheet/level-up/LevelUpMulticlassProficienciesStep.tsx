import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import type { LevelUpMulticlassProficiencyState } from '@/lib/characterLevelUp/multiclassProficiencies';
import {
    getAutomaticProficiencyLabels,
    getMulticlassProficiencyGains,
    getNonSkillMulticlassChoiceGroups,
    getSkillMulticlassChoiceGroups,
    selectedMulticlassProficiencyValues,
} from '@/lib/characterLevelUp/multiclassProficiencies';
import { proficiencyTypeLabel, type ClassProficiencyChoiceGroupBase } from '@/lib/characterCreation/classRules';
import {
    ABILITY_KEYS,
    ABILITY_ABBREVIATIONS,
    SKILL_DEFINITIONS,
    type SkillDefinition,
} from '@/lib/characterSheetUtils';
import type { ProficiencyLevel, SkillProficiencies } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';

type LevelUpMulticlassProficienciesStepProps = {
    selectedClass: LevelUpWizardSelectedClass;
    proficiencyState: LevelUpMulticlassProficiencyState;
    existingSkillProficiencies: SkillProficiencies | null;
    onToggleProficiency: (choiceGroup: number, value: string) => void;
};

/**
 * Renders the multiclass proficiency gains step.
 */
export default function LevelUpMulticlassProficienciesStep({
    selectedClass,
    proficiencyState,
    existingSkillProficiencies,
    onToggleProficiency,
}: LevelUpMulticlassProficienciesStepProps) {
    const gains = getMulticlassProficiencyGains(selectedClass.classId, selectedClass);
    const automaticLabels = gains ? getAutomaticProficiencyLabels(gains) : [];
    const skillChoiceGroups = gains ? getSkillMulticlassChoiceGroups(gains) : [];
    const nonSkillChoiceGroups = gains ? getNonSkillMulticlassChoiceGroups(gains) : [];
    const hasAnyChoices = skillChoiceGroups.length > 0 || nonSkillChoiceGroups.length > 0;

    return (
        <View style={styles.section} testID="level-up-step-multiclass_proficiencies">
            <Text style={styles.bodyText}>
                {`Multiclassing into ${selectedClass.className} grants the following proficiencies:`}
            </Text>

            {automaticLabels.length > 0 ? (
                <View style={styles.proficiencyCard} testID="level-up-auto-proficiencies">
                    <Text style={styles.proficiencyCardTitle}>Proficiencies Gained</Text>
                    {automaticLabels.map((label) => (
                        <Text key={label} style={styles.proficiencyItem}>{`\u2022 ${label}`}</Text>
                    ))}
                </View>
            ) : !hasAnyChoices ? (
                <View style={styles.emptyCard} testID="level-up-no-proficiencies">
                    <Text style={styles.emptyText}>
                        {`${selectedClass.className} does not grant additional proficiencies when multiclassing.`}
                    </Text>
                </View>
            ) : null}

            {skillChoiceGroups.map((group) => (
                <SkillPicker
                    key={group.choiceGroup}
                    group={group}
                    selectedValues={selectedMulticlassProficiencyValues(proficiencyState, group.choiceGroup)}
                    existingSkillProficiencies={existingSkillProficiencies}
                    onToggle={(value) => onToggleProficiency(group.choiceGroup, value)}
                />
            ))}

            {nonSkillChoiceGroups.map((group) => {
                const selectedValues = selectedMulticlassProficiencyValues(proficiencyState, group.choiceGroup);
                const typeLabel = proficiencyTypeLabel(group.type);
                return (
                    <View
                        key={group.choiceGroup}
                        style={styles.skillSection}
                        testID={`level-up-proficiency-choice-group-${group.choiceGroup}`}
                    >
                        <Text style={styles.skillSectionTitle}>
                            {`Choose ${group.pick} ${typeLabel} ${group.pick > 1 ? 'Proficiencies' : 'Proficiency'}`}
                        </Text>
                        <View style={styles.skillGrid}>
                            {group.options.map((option) => {
                                const isSelected = selectedValues.includes(option.value);
                                const isDisabled = !isSelected && selectedValues.length >= group.pick;
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => onToggleProficiency(group.choiceGroup, option.value)}
                                        disabled={isDisabled}
                                        accessibilityRole="checkbox"
                                        accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                                        accessibilityLabel={`${option.name} proficiency`}
                                        style={[
                                            styles.skillChip,
                                            isSelected && styles.skillChipSelected,
                                            isDisabled && styles.skillChipDisabled,
                                        ]}
                                        testID={`level-up-proficiency-option-${option.value}`}
                                    >
                                        <Text
                                            style={[
                                                styles.skillChipText,
                                                isSelected && styles.skillChipTextSelected,
                                                isDisabled && styles.skillChipTextDisabled,
                                            ]}
                                        >
                                            {option.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        <Text
                            style={styles.skillCountLabel}
                            testID={`level-up-proficiency-count-${group.choiceGroup}`}
                        >
                            {`${selectedValues.length} of ${group.pick} selected`}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

/**
 * Returns whether the character already has proficiency (or expertise) in a skill.
 */
function isAlreadyProficient(
    skillDef: SkillDefinition,
    existingProficiencies: SkillProficiencies | null,
): boolean {
    if (!existingProficiencies) return false;
    const level: ProficiencyLevel = existingProficiencies[skillDef.key];
    return level === 'proficient' || level === 'expert';
}

/**
 * Returns a display label for existing proficiency level.
 */
function proficiencyLabel(
    skillDef: SkillDefinition,
    existingProficiencies: SkillProficiencies | null,
): string | null {
    if (!existingProficiencies) return null;
    const level: ProficiencyLevel = existingProficiencies[skillDef.key];
    if (level === 'expert') return 'Expert';
    if (level === 'proficient') return 'Proficient';
    return null;
}

type SkillPickerProps = {
    group: ClassProficiencyChoiceGroupBase;
    selectedValues: string[];
    existingSkillProficiencies: SkillProficiencies | null;
    onToggle: (value: string) => void;
};

/**
 * Renders one skill choice-group picker grouped by ability score.
 */
function SkillPicker({ group, selectedValues, existingSkillProficiencies, onToggle }: SkillPickerProps) {
    const optionsByLabel = new Map(group.options.map((option) => [option.name, option]));

    const groupedSkills = ABILITY_KEYS.map((ability) => {
        const skills = SKILL_DEFINITIONS
            .filter((skill) => skill.ability === ability && optionsByLabel.has(skill.label))
            .map((skill) => ({
                skillDef: skill,
                option: optionsByLabel.get(skill.label)!,
            }));
        return { ability, skills };
    }).filter((entry) => entry.skills.length > 0);

    return (
        <View style={styles.skillSection} testID={`level-up-skill-picker-${group.choiceGroup}`}>
            <Text style={styles.skillSectionTitle}>
                {`Choose ${group.pick} Skill ${group.pick > 1 ? 'Proficiencies' : 'Proficiency'}`}
            </Text>
            <Text style={styles.skillSectionBody}>
                {`Select from the ${group.options.length > 10 ? 'full' : 'class'} skill list below.`}
            </Text>

            {groupedSkills.map(({ ability, skills }) => (
                <View key={ability} style={styles.abilityGroup} testID={`level-up-skill-group-${ability}`}>
                    <Text style={styles.abilityGroupLabel}>
                        {ABILITY_ABBREVIATIONS[ability]}
                    </Text>
                    <View style={styles.skillGrid}>
                        {skills.map(({ skillDef, option }) => {
                            const isSelected = selectedValues.includes(option.value);
                            const alreadyProficient = isAlreadyProficient(skillDef, existingSkillProficiencies);
                            const isDisabled = !isSelected && (selectedValues.length >= group.pick || alreadyProficient);
                            const existingLabel = proficiencyLabel(skillDef, existingSkillProficiencies);

                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => onToggle(option.value)}
                                    disabled={isDisabled}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                                    accessibilityLabel={`${option.name} proficiency`}
                                    style={[
                                        styles.skillChip,
                                        isSelected && styles.skillChipSelected,
                                        alreadyProficient && styles.skillChipAlreadyProficient,
                                        isDisabled && !alreadyProficient && styles.skillChipDisabled,
                                    ]}
                                    testID={`level-up-skill-option-${option.name}`}
                                >
                                    <Text
                                        style={[
                                            styles.skillChipText,
                                            isSelected && styles.skillChipTextSelected,
                                            alreadyProficient && styles.skillChipTextAlreadyProficient,
                                            isDisabled && !alreadyProficient && styles.skillChipTextDisabled,
                                        ]}
                                    >
                                        {option.name}
                                    </Text>
                                    {existingLabel ? (
                                        <Text
                                            style={styles.skillChipExistingLabel}
                                            testID={`level-up-skill-existing-${option.name}`}
                                        >
                                            {existingLabel}
                                        </Text>
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            ))}

            <Text style={styles.skillCountLabel} testID={`level-up-skill-count-${group.choiceGroup}`}>
                {`${selectedValues.length} of ${group.pick} selected`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.md,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    proficiencyCard: {
        ...nightFormStyles.card,
        borderLeftWidth: 4,
        borderLeftColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    proficiencyCardTitle: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.parchment,
        marginBottom: fantasyTokens.spacing.xs,
    },
    proficiencyItem: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    emptyCard: {
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    emptyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    skillSection: {
        ...nightFormStyles.card,
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.lg,
    },
    skillSectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
    },
    skillSectionBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    abilityGroup: {
        gap: fantasyTokens.spacing.xs,
        marginTop: fantasyTokens.spacing.sm,
    },
    abilityGroupLabel: {
        ...nightFormStyles.label,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
    },
    skillGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    skillChip: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm - fantasyTokens.spacing.xs / 2,
    },
    skillChipSelected: {
        ...nightFormStyles.cardSelected,
    },
    skillChipAlreadyProficient: {
        opacity: 0.5,
        borderStyle: 'dashed',
    },
    skillChipDisabled: {
        opacity: 0.4,
    },
    skillChipText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    skillChipTextSelected: {
        color: fantasyTokens.colors.parchment,
    },
    skillChipTextAlreadyProficient: {
        color: fantasyTokens.colors.gold,
    },
    skillChipTextDisabled: {
        color: fantasyTokens.colors.gold,
    },
    skillChipExistingLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        fontSize: fantasyTokens.fontSizes.utility - 2,
    },
    skillCountLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
});
