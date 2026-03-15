import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    ABILITY_KEYS,
    SKILL_DEFINITIONS,
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
import {
    initAbilitiesTabState,
    nextProficiencyLevel,
    skillsTabReducer,
} from './skills/skills-tab-reducer';
import AbilityScoresAndSkillsCard from './AbilityScoresAndSkillsCard';

type AbilitiesTabProps = {
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    savingThrowProficiencies: AbilityKey[];
    skillProficiencies: SkillProficiencies;
    editMode: boolean;
    onChangeAbilityScore: (ability: AbilityKey, value: number) => void;
    onUpdateSkillProficiency?: (
        skillKey: SkillDefinition['key'],
        level: ProficiencyLevel,
        nextSkillProficiencies: SkillProficienciesInput,
    ) => Promise<void>;
    onUpdateSavingThrowProficiencies?: (
        ability: AbilityKey,
        nextSavingThrowProficiencies: AbilityKey[],
    ) => Promise<void>;
};

export default function AbilitiesTab({
    abilityScores,
    proficiencyBonus,
    savingThrowProficiencies,
    skillProficiencies,
    editMode,
    onChangeAbilityScore,
    onUpdateSkillProficiency,
    onUpdateSavingThrowProficiencies,
}: AbilitiesTabProps) {
    const [state, dispatch] = useReducer(
        skillsTabReducer,
        {
            skillProficiencies,
            savingThrowProficiencies,
        },
        initAbilitiesTabState,
    );

    useEffect(() => {
        dispatch({
            type: 'resetSkillProficiencies',
            skillProficiencies,
        });
    }, [skillProficiencies]);

    useEffect(() => {
        dispatch({
            type: 'resetSavingThrowProficiencies',
            savingThrowProficiencies,
        });
    }, [savingThrowProficiencies]);

    const filteredSkills = useMemo(() => {
        const normalizedSearch = state.searchText.trim().toLowerCase();

        return SKILL_DEFINITIONS.filter((skill) => {
            if (normalizedSearch.length === 0) {
                return true;
            }

            return skill.label.toLowerCase().includes(normalizedSearch);
        });
    }, [state.searchText]);

    const filteredSkillsByAbility = useMemo(() => {
        const groupedSkills = ABILITY_KEYS.reduce(
            (acc, ability) => {
                acc[ability] = [];
                return acc;
            },
            {} as Record<AbilityKey, SkillDefinition[]>,
        );

        filteredSkills.forEach((skill) => {
            groupedSkills[skill.ability].push(skill);
        });

        return groupedSkills;
    }, [filteredSkills]);

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

    const handleSavingThrowPress = useCallback((ability: AbilityKey) => {
        const currentlyProficient = state.localSavingThrowProficiencies.includes(ability);
        const nextSavingThrowProficiencies = ABILITY_KEYS.filter((abilityKey) => {
            if (abilityKey === ability) return !currentlyProficient;
            return state.localSavingThrowProficiencies.includes(abilityKey);
        });

        dispatch({
            type: 'toggleSavingThrow',
            ability,
        });

        if (!onUpdateSavingThrowProficiencies) return;

        void (async () => {
            try {
                await onUpdateSavingThrowProficiencies(ability, nextSavingThrowProficiencies);
            } catch {
                dispatch({
                    type: 'resetSavingThrowProficiencies',
                    savingThrowProficiencies,
                });
            }
        })();
    }, [
        onUpdateSavingThrowProficiencies,
        savingThrowProficiencies,
        state.localSavingThrowProficiencies,
    ]);

    const handleSearchChange = useCallback((searchText: string) => {
        dispatch({
            type: 'setSearchText',
            searchText,
        });
    }, []);

    const hasSkillSearch = state.searchText.trim().length > 0;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <AbilityScoresAndSkillsCard
                    abilityScores={abilityScores}
                    proficiencyBonus={proficiencyBonus}
                    savingThrowProficiencies={state.localSavingThrowProficiencies}
                    skillProficiencies={state.localSkillProficiencies}
                    editMode={editMode}
                    onChangeAbilityScore={onChangeAbilityScore}
                    skillsByAbility={filteredSkillsByAbility}
                    onPressSkill={editMode ? handleSkillPress : undefined}
                    onPressSavingThrow={editMode ? handleSavingThrowPress : undefined}
                    hideAbilitiesWithoutSkills={hasSkillSearch}
                    searchText={state.searchText}
                    onChangeSearchText={handleSearchChange}
                    cardIndex={0}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        marginTop: 10,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xl,
        gap: 12,
    },
});
