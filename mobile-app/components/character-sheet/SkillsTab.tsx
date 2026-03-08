import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
    ABILITY_KEYS,
    abilityModifier,
    SKILL_DEFINITIONS,
    skillModifier,
    type SkillDefinition,
    type AbilityKey,
} from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    ProficiencyLevel,
    type SkillProficienciesInput,
    type AbilityScores,
    type SkillProficiencies,
} from '@/types/generated_graphql_types';
import CardDivider from './CardDivider';
import PassiveSensesCard from './skills/PassiveSensesCard';
import SkillAbilityFilters from './skills/SkillAbilityFilters';
import SkillGroupHeader from './skills/SkillGroupHeader';
import SkillRow from './skills/SkillRow';
import SkillsLegend from './skills/SkillsLegend';
import SkillsSearch from './skills/SkillsSearch';
import {
    initSkillsTabState,
    nextProficiencyLevel,
    skillsTabReducer,
} from './skills/skills-tab-reducer';
import SheetCard from './SheetCard';

type SkillsTabProps = {
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    skillProficiencies: SkillProficiencies;
    onUpdateSkillProficiency?: (
        skillKey: SkillDefinition['key'],
        level: ProficiencyLevel,
        nextSkillProficiencies: SkillProficienciesInput,
    ) => Promise<void>;
};

type SkillSection = {
    ability: AbilityKey;
    abilityLabel: string;
    abilityScore: number;
    abilityMod: number;
    isHighestAbility: boolean;
    data: SkillDefinition[];
};

function abilityLabel(ability: AbilityKey): string {
    return ability.charAt(0).toUpperCase() + ability.slice(1);
}

export default function SkillsTab({
    abilityScores,
    proficiencyBonus,
    skillProficiencies,
    onUpdateSkillProficiency,
}: SkillsTabProps) {
    const [state, dispatch] = useReducer(
        skillsTabReducer,
        skillProficiencies,
        initSkillsTabState,
    );

    useEffect(() => {
        dispatch({
            type: 'resetSkillProficiencies',
            skillProficiencies,
        });
    }, [skillProficiencies]);

    const passivePerception = useMemo(() => {
        return 10 + skillModifier(
            abilityScores.wisdom,
            state.localSkillProficiencies.perception,
            proficiencyBonus,
        );
    }, [abilityScores.wisdom, proficiencyBonus, state.localSkillProficiencies.perception]);

    const passiveInvestigation = useMemo(() => {
        return 10 + skillModifier(
            abilityScores.intelligence,
            state.localSkillProficiencies.investigation,
            proficiencyBonus,
        );
    }, [
        abilityScores.intelligence,
        proficiencyBonus,
        state.localSkillProficiencies.investigation,
    ]);

    const passiveInsight = useMemo(() => {
        return 10 + skillModifier(
            abilityScores.wisdom,
            state.localSkillProficiencies.insight,
            proficiencyBonus,
        );
    }, [abilityScores.wisdom, proficiencyBonus, state.localSkillProficiencies.insight]);

    const filteredSkills = useMemo(() => {
        const normalizedSearch = state.searchText.trim().toLowerCase();

        return SKILL_DEFINITIONS.filter((skill) => {
            if (state.abilityFilter !== 'all' && skill.ability !== state.abilityFilter) {
                return false;
            }

            if (normalizedSearch.length === 0) {
                return true;
            }

            return skill.label.toLowerCase().includes(normalizedSearch);
        });
    }, [state.abilityFilter, state.searchText]);

    const highestAbilityScore = useMemo(() => {
        return ABILITY_KEYS.reduce((highest, key) => {
            return Math.max(highest, abilityScores[key]);
        }, Number.NEGATIVE_INFINITY);
    }, [abilityScores]);

    const sections = useMemo<SkillSection[]>(() => {
        return ABILITY_KEYS.map((ability) => {
            const score = abilityScores[ability];
            const mod = abilityModifier(score);

            return {
                ability,
                abilityLabel: abilityLabel(ability),
                abilityScore: score,
                abilityMod: mod,
                isHighestAbility: score === highestAbilityScore,
                skills: filteredSkills.filter((skill) => skill.ability === ability),
            };
        })
            .filter((group) => group.skills.length > 0)
            .map((group) => ({
                ability: group.ability,
                abilityLabel: group.abilityLabel,
                abilityScore: group.abilityScore,
                abilityMod: group.abilityMod,
                isHighestAbility: group.isHighestAbility,
                data: group.skills,
            }));
    }, [abilityScores, filteredSkills, highestAbilityScore]);

    const handleSkillPress = useCallback((skillKey: SkillDefinition['key']) => {
        const nextLevel = nextProficiencyLevel(state.localSkillProficiencies[skillKey]);
        const nextSkillProficiencies: SkillProficienciesInput = {
            ...state.localSkillProficiencies,
            [skillKey]: nextLevel,
        };

        dispatch({
            type: 'cycleSkill',
            skillKey,
        });

        if (!onUpdateSkillProficiency) return;

        void (async () => {
            try {
                await onUpdateSkillProficiency(skillKey, nextLevel, nextSkillProficiencies);
            } catch {
                dispatch({
                    type: 'resetSkillProficiencies',
                    skillProficiencies,
                });
            }
        })();
    }, [
        onUpdateSkillProficiency,
        skillProficiencies,
        state.localSkillProficiencies,
    ]);

    const handleSearchChange = useCallback((searchText: string) => {
        dispatch({
            type: 'setSearchText',
            searchText,
        });
    }, []);

    const handleFilterChange = useCallback((abilityFilter: AbilityKey | 'all') => {
        dispatch({
            type: 'setAbilityFilter',
            abilityFilter,
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <PassiveSensesCard
                    passivePerception={passivePerception}
                    passiveInvestigation={passiveInvestigation}
                    passiveInsight={passiveInsight}
                />

                <SheetCard index={1} style={styles.skillsCard}>
                    <SkillsSearch
                        searchText={state.searchText}
                        onChangeSearchText={handleSearchChange}
                    />

                    <SkillAbilityFilters
                        activeFilter={state.abilityFilter}
                        onFilterChange={handleFilterChange}
                    />
                    <CardDivider />

                    {sections.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No skills match this search.</Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.sectionList}
                            contentContainerStyle={styles.sectionListContent}
                        >
                            {sections.map((section) => (
                                <View key={section.ability}>
                                    <SkillGroupHeader
                                        abilityLabel={section.abilityLabel}
                                        abilityScore={section.abilityScore}
                                        abilityModifier={section.abilityMod}
                                        isHighestAbility={section.isHighestAbility}
                                    />

                                    {section.data.map((item) => {
                                        const proficiencyLevel = state.localSkillProficiencies[item.key];
                                        const modifier = skillModifier(
                                            abilityScores[item.ability],
                                            proficiencyLevel,
                                            proficiencyBonus,
                                        );

                                        return (
                                            <SkillRow
                                                key={item.key}
                                                skillKey={item.key}
                                                skillLabel={item.label}
                                                ability={item.ability}
                                                proficiencyLevel={proficiencyLevel}
                                                modifier={modifier}
                                                onPress={handleSkillPress}
                                            />
                                        );
                                    })}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <CardDivider />
                    <SkillsLegend />
                </SheetCard>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    content: {
        marginTop: 10,
        flex: 1,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xl,
        gap: 12,
    },
    skillsCard: {
        flex: 1,
    },
    sectionList: {
        flex: 1,
    },
    sectionListContent: {
        paddingBottom: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.lg,
        flex: 1,
    },
    emptyText: {
        fontFamily: 'serif',
        fontSize: 13,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
});
