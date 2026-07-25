import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { SKILL_DEFINITIONS, ABILITY_ABBREVIATIONS, type AbilityKey, type SkillKey } from '@/lib/characterSheetUtils';
import {
    BACKGROUND_SKILL_PROFICIENCIES,
    proficiencyTypeLabel,
    skillKeyFromProficiencyValue,
    SKILL_SRD_INDEX_BY_KEY,
    type ClassProficiencyChoiceGroup,
} from '@/lib/characterCreation/classRules';
import {
    presentationClassLabel,
    presentationSavingThrows,
    startingClassRow,
    type CreateClassPresentation,
} from '@/lib/characterCreation/multiclass';
import ProficiencyItem from '@/components/character-creation-wizard/ProficiencyItem';
import { wizardStepStyles } from '@/components/character-creation-wizard/styles/wizardStepStyles';
import useCreationProficiencyRequirements from '@/hooks/useCreationProficiencyRequirements';
export default function StepSkills() {
    const { draft, toggleProficiencyChoice } = useCharacterDraft();
    const startingClass = startingClassRow(draft.classes, draft.startingClassId);
    const startingClassId = startingClass?.classId ?? '';
    const {
        proficiencyChoiceGroups,
        fixedSkillKeys,
        loading,
        error,
        refetch,
    } = useCreationProficiencyRequirements(draft.classes, draft.startingClassId);
    const savingThrows = presentationSavingThrows(startingClassId, draft.classPresentationById);
    const startingClassName = presentationClassLabel(startingClassId, draft.classPresentationById);

    const backgroundSkillProfs: SkillKey[] = BACKGROUND_SKILL_PROFICIENCIES[draft.background] ?? [];
    const backgroundSkills = SKILL_DEFINITIONS.filter((skill) => backgroundSkillProfs.includes(skill.key));
    const backgroundSkillValues = new Set(
        backgroundSkillProfs.map((skillKey) => SKILL_SRD_INDEX_BY_KEY[skillKey]),
    );

    const fixedClassSkillKeys = fixedSkillKeys.filter((skillKey) => !backgroundSkillProfs.includes(skillKey));
    const fixedClassSkills = SKILL_DEFINITIONS.filter((skill) => fixedClassSkillKeys.includes(skill.key));

    const startingGroups = proficiencyChoiceGroups.filter((group) => group.classId === startingClassId);
    const secondaryGroups = proficiencyChoiceGroups.filter((group) => group.classId !== startingClassId);

    if (error) {
        return (
            <ScrollView style={wizardStepStyles.scroll} contentContainerStyle={wizardStepStyles.container}>
                <Text style={wizardStepStyles.heading}>Choose your skills.</Text>
                <Text style={styles.errorText} testID="create-skills-requirements-error">
                    Could not load class proficiency requirements. Check your connection and try again.
                </Text>
                <Pressable
                    onPress={refetch}
                    style={styles.retryButton}
                    testID="create-skills-requirements-retry"
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={wizardStepStyles.scroll} contentContainerStyle={wizardStepStyles.container}>
            <Text style={wizardStepStyles.heading}>Choose your skills.</Text>
            <Text style={wizardStepStyles.sub}>
                Select the proficiencies that suit your character&apos;s background and class.
            </Text>

            {loading ? (
                <Text style={styles.loadingText} testID="create-skills-requirements-loading">
                    Loading class proficiency requirements…
                </Text>
            ) : null}

            {savingThrows.length > 0 && (
                <>
                    <Text style={wizardStepStyles.sectionLabel}>Saving Throw Proficiencies</Text>
                    <Text style={styles.savingThrowNote}>
                        Granted by your starting class ({startingClassName})
                    </Text>
                    <View style={styles.savingThrowRow}>
                        {savingThrows.map((ability: AbilityKey) => (
                            <View key={ability} style={styles.savingThrowChip}>
                                <Text style={styles.savingThrowChipText}>
                                    {ABILITY_ABBREVIATIONS[ability]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {backgroundSkills.length > 0 && (
                <>
                    <Text style={wizardStepStyles.sectionLabel}>
                        Background Skills ({draft.background})
                    </Text>
                    <View style={styles.list}>
                        {backgroundSkills.map((skill) => (
                            <ProficiencyItem
                                key={skill.key}
                                name={skill.label}
                                abilityAbbr={ABILITY_ABBREVIATIONS[skill.ability]}
                                selected
                                locked
                                onToggle={() => {}}
                            />
                        ))}
                    </View>
                </>
            )}

            {fixedClassSkills.length > 0 && (
                <>
                    <Text style={wizardStepStyles.sectionLabel}>
                        Class Skills (automatic)
                    </Text>
                    <View style={styles.list}>
                        {fixedClassSkills.map((skill) => (
                            <ProficiencyItem
                                key={skill.key}
                                testID={`create-skill-class-fixed-${skill.key}`}
                                name={skill.label}
                                abilityAbbr={ABILITY_ABBREVIATIONS[skill.ability]}
                                selected
                                locked
                                onToggle={() => {}}
                            />
                        ))}
                    </View>
                </>
            )}

            <ProficiencyChoiceGroupList
                groups={startingGroups}
                draftChoices={draft.proficiencyChoices}
                lockedOptionValues={backgroundSkillValues}
                onToggle={toggleProficiencyChoice}
                showGapAbove={backgroundSkills.length > 0 || fixedClassSkills.length > 0}
                classPresentationById={draft.classPresentationById}
            />

            {secondaryGroups.length > 0 ? (
                <>
                    <Text style={[wizardStepStyles.sectionLabel, styles.sectionGap]}>
                        Multiclass Proficiencies
                    </Text>
                    <Text style={styles.multiclassHint}>
                        Choose the required MULTICLASS proficiency options for each secondary class.
                    </Text>
                    <ProficiencyChoiceGroupList
                        groups={secondaryGroups}
                        draftChoices={draft.proficiencyChoices}
                        lockedOptionValues={backgroundSkillValues}
                        onToggle={toggleProficiencyChoice}
                        labelClassNames
                        classPresentationById={draft.classPresentationById}
                    />
                </>
            ) : null}

            <Text style={styles.hint}>
                You can add more proficiencies later from the Skills tab on your character sheet.
            </Text>
        </ScrollView>
    );
}

type ProficiencyChoiceGroupListProps = {
    groups: ClassProficiencyChoiceGroup[];
    draftChoices: Array<{ classId: string; choiceGroup: number; values: string[] }>;
    lockedOptionValues: ReadonlySet<string>;
    onToggle: (classId: string, choiceGroup: number, value: string, maxChoices: number) => void;
    showGapAbove?: boolean;
    labelClassNames?: boolean;
    classPresentationById: Record<string, CreateClassPresentation>;
};

/**
 * Renders independently limited proficiency choice groups (skills + named).
 */
function ProficiencyChoiceGroupList({
    groups,
    draftChoices,
    lockedOptionValues,
    onToggle,
    showGapAbove = false,
    labelClassNames = false,
    classPresentationById,
}: ProficiencyChoiceGroupListProps) {
    return (
        <>
            {groups.map((group, groupIndex) => {
                const selectedValues = draftChoices.find(
                    (entry) => entry.classId === group.classId && entry.choiceGroup === group.choiceGroup,
                )?.values ?? [];
                const atGroupLimit = selectedValues.length >= group.pick;
                const typeLabel = proficiencyTypeLabel(group.type);
                const classPrefix = labelClassNames
                    ? `${presentationClassLabel(group.classId, classPresentationById)} `
                    : '';
                const choosableOptions = group.options.filter(
                    (option) => !lockedOptionValues.has(option.value),
                );

                return (
                    <View
                        key={`proficiency-${group.classId}-${group.choiceGroup}`}
                        style={groupIndex > 0 || showGapAbove ? styles.sectionGap : undefined}
                        testID={`create-proficiency-choice-group-${group.classId}-${group.choiceGroup}`}
                    >
                        <Text style={wizardStepStyles.sectionLabel}>
                            {classPrefix}Class {typeLabel}s — Pick {group.pick}
                            {group.pick > 0 && ` (${selectedValues.length}/${group.pick})`}
                        </Text>
                        <View style={styles.list}>
                            {choosableOptions.map((option) => {
                                const isSelected = selectedValues.includes(option.value);
                                const skillKey = skillKeyFromProficiencyValue(option.value);
                                const abilityAbbr = skillKey
                                    ? ABILITY_ABBREVIATIONS[
                                        SKILL_DEFINITIONS.find((skill) => skill.key === skillKey)!.ability
                                    ]
                                    : undefined;

                                return (
                                    <ProficiencyItem
                                        key={`${group.classId}-${option.value}`}
                                        testID={`create-proficiency-choice-${group.classId}-${option.value}`}
                                        name={option.name}
                                        abilityAbbr={abilityAbbr}
                                        selected={isSelected}
                                        disabled={!isSelected && atGroupLimit}
                                        onToggle={() => onToggle(
                                            group.classId,
                                            group.choiceGroup,
                                            option.value,
                                            group.pick,
                                        )}
                                    />
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </>
    );
}

const styles = StyleSheet.create({
    savingThrowNote: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.45)',
        marginBottom: 8,
    },
    savingThrowRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    savingThrowChip: {
        backgroundColor: 'rgba(42,122,42,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(42,122,42,0.25)',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    savingThrowChipText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        letterSpacing: 1,
        color: '#2a7a2a',
        fontWeight: '600',
    },
    sectionGap: {
        marginTop: 16,
    },
    list: {
        gap: 6,
    },
    multiclassHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.45)',
        marginBottom: 8,
    },
    loadingText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.55)',
        marginBottom: 12,
    },
    errorText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        color: fantasyTokens.colors.claretLight,
        marginBottom: 12,
    },
    retryButton: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.md,
        paddingVertical: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    retryButtonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        letterSpacing: 1,
        color: fantasyTokens.colors.goldLight,
    },
    hint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 10,
    },
});
