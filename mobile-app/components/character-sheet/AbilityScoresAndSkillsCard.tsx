import { StyleSheet, View } from 'react-native';
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
} from '@/lib/characterSheetUtils';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import type { AbilityScores, SkillProficiencies } from '@/types/generated_graphql_types';
import SheetCard from './SheetCard';
import SectionLabel from './SectionLabel';
import ProficiencyDot from './ProficiencyDot';
import InlineField from './edit-mode/InlineField';

type AbilityScoresAndSkillsCardProps = {
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    savingThrowProficiencies: AbilityKey[];
    skillProficiencies: SkillProficiencies;
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
    editMode = false,
    onChangeAbilityScore,
}: AbilityScoresAndSkillsCardProps) {
    return (
        <SheetCard index={2}>
            <SectionLabel>Abilities & Skills</SectionLabel>
            <View style={styles.list}>
                {ABILITY_KEYS.map((ability, index) => {
                    const score = abilityScores[ability];
                    const mod = abilityModifier(score);
                    const label = ability.charAt(0).toUpperCase() + ability.slice(1);
                    const saveProficient = savingThrowProficiencies.includes(ability);
                    const saveMod = savingThrowModifier(score, saveProficient, proficiencyBonus);
                    const skills = SKILLS_BY_ABILITY[ability];

                    return (
                        <View
                            key={ability}
                            style={[
                                styles.abilityRow,
                                index < ABILITY_KEYS.length - 1 && styles.abilityRowDivider,
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
                                <View style={styles.skillRow}>
                                    <ProficiencyDot
                                        level={
                                            saveProficient
                                                ? ProficiencyLevel.Proficient
                                                : ProficiencyLevel.None
                                        }
                                    />
                                    <Text style={styles.skillName}>Saving Throw</Text>
                                    <Text style={styles.skillMod}>
                                        {formatSignedNumber(saveMod)}
                                    </Text>
                                </View>

                                {skills.map((skill) => {
                                    const profLevel = skillProficiencies[skill.key];
                                    const skillModValue = skillModifier(
                                        abilityScores[skill.ability],
                                        profLevel,
                                        proficiencyBonus,
                                    );

                                    return (
                                        <View key={skill.key} style={styles.skillRow}>
                                            <ProficiencyDot level={profLevel} />
                                            <Text style={styles.skillName}>{skill.label}</Text>
                                            <Text style={styles.skillMod}>
                                                {formatSignedNumber(skillModValue)}
                                            </Text>
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
    skillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    skillName: {
        flex: 1,
        fontFamily: 'serif',
        fontSize: 13,
        color: fantasyTokens.colors.inkLight,
    },
    skillMod: {
        fontFamily: 'serif',
        fontSize: 12,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
        minWidth: 28,
        textAlign: 'right',
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
