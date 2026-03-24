import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import { rollAllAbilityScores, suggestAbilityScores } from '@/lib/characterCreation/abilityRules';
import { RACE_ABILITY_BONUSES } from '@/lib/characterCreation/raceRules';
import {
    classLabel,
    startingClassRow,
} from '@/lib/characterCreation/multiclass';
import AbilityBlock from '@/components/wizard/AbilityBlock';
import { sharedStyles } from './abilitiesShared';

export default function RollAbilityMode() {
    const { draft, setAbilityScore, setAllAbilityScores } = useCharacterDraft();
    const racialBonuses = RACE_ABILITY_BONUSES[draft.race] ?? {};
    const scoresModified = ABILITY_KEYS.some((k) => draft.abilityScores[k] !== 10);
    const selectedStartingClass = startingClassRow(draft.classes, draft.startingClassId);
    const suggestedClassId = selectedStartingClass?.classId ?? '';
    const hasClass = suggestedClassId.length > 0;
    const canSuggest = scoresModified && hasClass;

    const rows: AbilityKey[][] = [];
    for (let i = 0; i < ABILITY_KEYS.length; i += 2) {
        rows.push(ABILITY_KEYS.slice(i, i + 2) as AbilityKey[]);
    }

    function handleRoll() {
        setAllAbilityScores(rollAllAbilityScores());
    }

    function handleSuggest() {
        setAllAbilityScores(suggestAbilityScores(draft.abilityScores, suggestedClassId));
    }

    return (
        <>
            <Pressable
                onPress={handleRoll}
                style={({ pressed }) => [styles.rollBtn, pressed && styles.rollBtnPressed]}
            >
                <Text style={styles.rollBtnText}>{'\u{1F3B2}'} Roll 4d6 drop lowest</Text>
            </Pressable>

            <Pressable
                onPress={handleSuggest}
                disabled={!canSuggest}
                style={({ pressed }) => [
                    styles.rollBtn,
                    !canSuggest && styles.rollBtnDisabled,
                    pressed && canSuggest && styles.rollBtnPressed,
                ]}
            >
                <Text style={[styles.rollBtnText, !canSuggest && styles.rollBtnTextDisabled]}>
                    {'\u2728'} Suggested for {hasClass ? classLabel(suggestedClassId) : 'your starting class'}
                </Text>
            </Pressable>

            <View style={sharedStyles.grid}>
                {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={sharedStyles.gridRow}>
                        {row.map((ability) => (
                            <View key={ability} style={sharedStyles.gridItem}>
                                <AbilityBlock
                                    ability={ability}
                                    score={draft.abilityScores[ability]}
                                    onIncrement={() => setAbilityScore(ability, draft.abilityScores[ability] + 1)}
                                    onDecrement={() => setAbilityScore(ability, draft.abilityScores[ability] - 1)}
                                    racialBonus={racialBonuses[ability]}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    rollBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(201,146,42,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.25)',
        borderRadius: 10,
        paddingVertical: 10,
        marginBottom: 12,
    },
    rollBtnPressed: {
        backgroundColor: 'rgba(201,146,42,0.15)',
    },
    rollBtnDisabled: {
        opacity: 0.35,
    },
    rollBtnText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
    },
    rollBtnTextDisabled: {
        opacity: 0.5,
    },
});
