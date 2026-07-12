import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import type { MulticlassProficiencyGains, LevelUpMulticlassProficiencyState } from '@/lib/characterLevelUp/multiclassProficiencies';
import {
    getAutomaticProficiencyLabels,
    getMulticlassProficiencyGains,
} from '@/lib/characterLevelUp/multiclassProficiencies';
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
    onToggleSkill: (skill: string) => void;
};

/**
 * Renders the multiclass proficiency gains step.
 */
export default function LevelUpMulticlassProficienciesStep({
    selectedClass,
    proficiencyState,
    existingSkillProficiencies,
    onToggleSkill,
}: LevelUpMulticlassProficienciesStepProps) {
    const gains = getMulticlassProficiencyGains(selectedClass.classId, selectedClass);
    const automaticLabels = gains ? getAutomaticProficiencyLabels(gains) : [];

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
            ) : (
                <View style={styles.emptyCard} testID="level-up-no-proficiencies">
                    <Text style={styles.emptyText}>
                        {`${selectedClass.className} does not grant additional proficiencies when multiclassing.`}
                    </Text>
                </View>
            )}

            {gains && gains.skillChoices > 0 ? (
                <SkillPicker
                    gains={gains}
                    selectedSkills={proficiencyState.selectedSkills}
                    existingSkillProficiencies={existingSkillProficiencies}
                    onToggleSkill={onToggleSkill}
                />
            ) : null}
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
    gains: MulticlassProficiencyGains;
    selectedSkills: string[];
    existingSkillProficiencies: SkillProficiencies | null;
    onToggleSkill: (skill: string) => void;
};

/**
 * Renders the skill choice picker grouped by ability score.
 */
function SkillPicker({ gains, selectedSkills, existingSkillProficiencies, onToggleSkill }: SkillPickerProps) {
    const skillOptionSet = new Set(gains.skillOptions);

    // Group available skill options by ability
    const groupedSkills = ABILITY_KEYS.map((ability) => {
        const skills = SKILL_DEFINITIONS
            .filter((s) => s.ability === ability && skillOptionSet.has(s.label));
        return { ability, skills };
    }).filter((group) => group.skills.length > 0);

    return (
        <View style={styles.skillSection} testID="level-up-skill-picker">
            <Text style={styles.skillSectionTitle}>
                {`Choose ${gains.skillChoices} Skill ${gains.skillChoices > 1 ? 'Proficiencies' : 'Proficiency'}`}
            </Text>
            <Text style={styles.skillSectionBody}>
                {`Select from the ${gains.skillOptions.length > 10 ? 'full' : 'class'} skill list below.`}
            </Text>

            {groupedSkills.map(({ ability, skills }) => (
                <View key={ability} style={styles.abilityGroup} testID={`level-up-skill-group-${ability}`}>
                    <Text style={styles.abilityGroupLabel}>
                        {ABILITY_ABBREVIATIONS[ability]}
                    </Text>
                    <View style={styles.skillGrid}>
                        {skills.map((skillDef) => {
                            const skill = skillDef.label;
                            const isSelected = selectedSkills.includes(skill);
                            const alreadyProficient = isAlreadyProficient(skillDef, existingSkillProficiencies);
                            const isDisabled = !isSelected && (selectedSkills.length >= gains.skillChoices || alreadyProficient);
                            const existingLabel = proficiencyLabel(skillDef, existingSkillProficiencies);

                            return (
                                <Pressable
                                    key={skill}
                                    onPress={() => onToggleSkill(skill)}
                                    disabled={isDisabled}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                                    accessibilityLabel={`${skill} proficiency`}
                                    style={[
                                        styles.skillChip,
                                        isSelected && styles.skillChipSelected,
                                        alreadyProficient && styles.skillChipAlreadyProficient,
                                        isDisabled && !alreadyProficient && styles.skillChipDisabled,
                                    ]}
                                    testID={`level-up-skill-option-${skill}`}
                                >
                                    <Text
                                        style={[
                                            styles.skillChipText,
                                            isSelected && styles.skillChipTextSelected,
                                            alreadyProficient && styles.skillChipTextAlreadyProficient,
                                            isDisabled && !alreadyProficient && styles.skillChipTextDisabled,
                                        ]}
                                    >
                                        {skill}
                                    </Text>
                                    {existingLabel ? (
                                        <Text
                                            style={styles.skillChipExistingLabel}
                                            testID={`level-up-skill-existing-${skill}`}
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

            <Text style={styles.skillCountLabel} testID="level-up-skill-count">
                {`${selectedSkills.length} of ${gains.skillChoices} selected`}
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
