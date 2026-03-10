import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    ABILITY_KEYS,
    SKILLS_BY_ABILITY,
    abilityModifier,
    savingThrowModifier,
    skillModifier,
    formatSignedNumber,
    type AbilityKey,
    type SkillDefinition,
} from '@/lib/characterSheetUtils';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import type { AbilityScores } from '@/types/generated_graphql_types';
import SheetCard from './SheetCard';
import SectionLabel from './SectionLabel';
import ProficiencyDot from './ProficiencyDot';
import InlineField from './edit-mode/InlineField';
import SearchBarInput from '../SearchBarInput';

type SkillLevels = Record<SkillDefinition['key'], ProficiencyLevel>;

type AbilityScoresAndSkillsCardProps = {
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    savingThrowProficiencies: AbilityKey[];
    skillProficiencies: SkillLevels;
    skillsByAbility?: Partial<Record<AbilityKey, SkillDefinition[]>>;
    hideAbilitiesWithoutSkills?: boolean;
    onPressSkill?: (skillKey: SkillDefinition['key']) => void;
    onPressSavingThrow?: (ability: AbilityKey) => void;
    searchText?: string;
    onChangeSearchText?: (searchText: string) => void;
    cardIndex?: number;
    emptyStateText?: string;
    editMode?: boolean;
    onChangeAbilityScore?: (ability: AbilityKey, value: number) => void;
};

/**
 * Parses an editable ability value.
 */
function parseAbilityScoreInput(value: string): number {
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) return 0;
    return parsedValue;
}

/**
 * Combined ability scores + grouped saving throws/skills layout.
 *
 * **React Native + D&D learning note:**
 * Each ability gets its own vertical "row": left column shows the raw score
 * and ability modifier, while the right column lists the saving throw and
 * the skills governed by that ability. Grouping by ability helps players
 * quickly connect a roll to the stat that drives it.
 */
export default function AbilityScoresAndSkillsCard({
    abilityScores,
    proficiencyBonus,
    savingThrowProficiencies,
    skillProficiencies,
    skillsByAbility,
    hideAbilitiesWithoutSkills = false,
    onPressSkill,
    onPressSavingThrow,
    searchText,
    onChangeSearchText,
    cardIndex = 2,
    emptyStateText = 'No skills match this search.',
    editMode = false,
    onChangeAbilityScore,
}: AbilityScoresAndSkillsCardProps) {
    const abilityRows = ABILITY_KEYS.map((ability) => {
        const skills = skillsByAbility?.[ability] ?? SKILLS_BY_ABILITY[ability];
        return { ability, skills };
    }).filter((row) => {
        if (!hideAbilitiesWithoutSkills) return true;
        return row.skills.length > 0;
    });

    return (
        <SheetCard index={cardIndex}>
            <SectionLabel>Abilities & Skills</SectionLabel>
            {onChangeSearchText && (
                <View style={styles.searchBarWrapper}>
                    <SearchBarInput
                        placeholder="Search skills"
                        searchText={searchText ?? ''}
                        onChangeSearchText={onChangeSearchText}
                    />
                </View>
            )}
            <View style={styles.list}>
                {abilityRows.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{emptyStateText}</Text>
                    </View>
                )}

                {abilityRows.map((row, index) => {
                    const { ability, skills } = row;
                    const score = abilityScores[ability];
                    const mod = abilityModifier(score);
                    const label = ability.charAt(0).toUpperCase() + ability.slice(1);
                    const saveProficient = savingThrowProficiencies.includes(ability);
                    const saveMod = savingThrowModifier(score, saveProficient, proficiencyBonus);
                    const savingThrowContent = (
                        <>
                            <ProficiencyDot
                                level={
                                    saveProficient
                                        ? ProficiencyLevel.Proficient
                                        : ProficiencyLevel.None
                                }
                            />
                            <Text style={[styles.skillName, saveProficient && styles.skillNameEmphasis]}>
                                Saving Throw
                            </Text>
                            <Text
                                testID={`ability-saves-mod-${ability}`}
                                style={[
                                    styles.skillMod,
                                    saveMod > 0 && styles.skillModPositive,
                                    saveMod < 0 && styles.skillModNegative,
                                ]}
                            >
                                {formatSignedNumber(saveMod)}
                            </Text>
                        </>
                    );

                    return (
                        <View
                            key={ability}
                            style={[
                                styles.abilityRow,
                                index < abilityRows.length - 1 && styles.abilityRowDivider,
                            ]}
                        >
                            <View style={styles.abilityColumn}>
                                <View style={styles.abilityCard}>
                                    <Text style={styles.abilityLabel}>{label}</Text>
                                    <InlineField
                                        value={String(score)}
                                        onChangeText={(value: string) => {
                                            if (!onChangeAbilityScore) return;
                                            onChangeAbilityScore(ability, parseAbilityScoreInput(value));
                                        }}
                                        editMode={editMode}
                                        style={styles.abilityScore}
                                        keyboardType="number-pad"
                                        align="center"
                                    />
                                    <View style={styles.modPill}>
                                        <Text style={styles.abilityMod}>
                                            {formatSignedNumber(mod)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.skillsColumn}>
                                {onPressSavingThrow ? (
                                    <Pressable
                                        onPress={() => onPressSavingThrow(ability)}
                                        style={[styles.skillRow, styles.skillRowPressable]}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Toggle saving throw proficiency for ${label}`}
                                        testID={`skills-tab-saving-throw-row-${ability}`}
                                    >
                                        {savingThrowContent}
                                    </Pressable>
                                ) : (
                                    <View style={styles.skillRow}>
                                        {savingThrowContent}
                                    </View>
                                )}

                                {skills.map((skill) => {
                                    const profLevel = skillProficiencies[skill.key];
                                    const skillModValue = skillModifier(
                                        abilityScores[skill.ability],
                                        profLevel,
                                        proficiencyBonus,
                                    );
                                    const skillContent = (
                                        <>
                                            <ProficiencyDot level={profLevel} />
                                            <Text
                                                style={[
                                                    styles.skillName,
                                                    profLevel !== ProficiencyLevel.None && styles.skillNameEmphasis,
                                                ]}
                                            >
                                                {skill.label}
                                            </Text>
                                            <Text
                                                testID={`ability-skills-mod-${skill.key}`}
                                                style={[
                                                    styles.skillMod,
                                                    skillModValue > 0 && styles.skillModPositive,
                                                    skillModValue < 0 && styles.skillModNegative,
                                                    profLevel === ProficiencyLevel.Expert && styles.skillModExpert,
                                                ]}
                                            >
                                                {formatSignedNumber(skillModValue)}
                                            </Text>
                                        </>
                                    );

                                    if (onPressSkill) {
                                        return (
                                            <Pressable
                                                key={skill.key}
                                                onPress={() => onPressSkill(skill.key)}
                                                style={[styles.skillRow, styles.skillRowPressable]}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Cycle proficiency for ${skill.label}`}
                                                testID={`skills-tab-row-${skill.key}`}
                                            >
                                                {skillContent}
                                            </Pressable>
                                        );
                                    }
                                    return (
                                        <View key={skill.key} style={styles.skillRow}>
                                            {skillContent}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={styles.legend}>
                <Text style={styles.legendText}>{'\u25CF'} Proficient</Text>
                <Text style={styles.legendText}>{'\u25CE'} Expertise</Text>
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    searchBarWrapper: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    list: {
        paddingHorizontal: 18,
        paddingBottom: 16,
    },
    abilityRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        gap: 12,
    },
    abilityRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.divider,
    },
    abilityColumn: {
        width: 94,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    abilityCard: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: fantasyTokens.colors.cardBg,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        gap: 4,
    },
    abilityLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
    abilityScore: {
        fontFamily: 'serif',
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 24,
    },
    abilityMod: {
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: '700',
        color: fantasyTokens.colors.crimson,
        opacity: 1,
    },
    modPill: {
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    skillsColumn: {
        flex: 1,
        gap: 8,
        paddingTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.lg,
    },
    emptyText: {
        fontFamily: 'serif',
        fontSize: 13,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
    skillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    skillRowPressable: {
        borderRadius: 8,
        marginHorizontal: -4,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    skillName: {
        flex: 1,
        fontFamily: 'serif',
        fontSize: 13,
        color: fantasyTokens.colors.inkLight,
    },
    skillNameEmphasis: {
        color: fantasyTokens.colors.inkDark,
        fontWeight: '600',
    },
    skillMod: {
        fontFamily: 'serif',
        fontSize: 12,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
        minWidth: 28,
        textAlign: 'right',
    },
    skillModPositive: {
        color: fantasyTokens.colors.greenDark,
    },
    skillModNegative: {
        color: fantasyTokens.colors.crimson,
    },
    skillModExpert: {
        color: fantasyTokens.colors.gold,
    },
    legend: {
        flexDirection: 'row',
        gap: 14,
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    legendText: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        fontStyle: 'italic',
    },
});
