import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import { POINT_BUY_COSTS, POINT_BUY_MAX, POINT_BUY_MIN, POINT_BUY_TOTAL, RACE_ABILITY_BONUSES, pointBuySpent } from '@/lib/dndHelpers';
import AbilityBlock from '@/components/wizard/AbilityBlock';
import { sharedStyles } from './abilitiesShared';

export default function PointBuyAbilityMode() {
    const { draft, setAbilityScore } = useCharacterDraft();
    const racialBonuses = RACE_ABILITY_BONUSES[draft.race] ?? {};

    const spent = pointBuySpent(draft.abilityScores);
    const pointsRemaining = POINT_BUY_TOTAL - spent;

    const rows: AbilityKey[][] = [];
    for (let i = 0; i < ABILITY_KEYS.length; i += 2) {
        rows.push(ABILITY_KEYS.slice(i, i + 2) as AbilityKey[]);
    }

    function handleIncrement(ability: AbilityKey) {
        const current = draft.abilityScores[ability];
        if (current >= POINT_BUY_MAX) return;
        const costDiff = (POINT_BUY_COSTS[current + 1] ?? 0) - (POINT_BUY_COSTS[current] ?? 0);
        if (costDiff > pointsRemaining) return;
        setAbilityScore(ability, current + 1);
    }

    function handleDecrement(ability: AbilityKey) {
        const current = draft.abilityScores[ability];
        if (current <= POINT_BUY_MIN) return;
        setAbilityScore(ability, current - 1);
    }

    return (
        <>
            <View style={styles.pointCounter}>
                <Text style={styles.pointCounterText}>
                    Points remaining: {pointsRemaining} / {POINT_BUY_TOTAL}
                </Text>
            </View>

            <View style={sharedStyles.grid}>
                {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={sharedStyles.gridRow}>
                        {row.map((ability) => (
                            <View key={ability} style={sharedStyles.gridItem}>
                                <AbilityBlock
                                    ability={ability}
                                    score={draft.abilityScores[ability]}
                                    onIncrement={() => handleIncrement(ability)}
                                    onDecrement={() => handleDecrement(ability)}
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
    pointCounter: {
        backgroundColor: 'rgba(201,146,42,0.08)',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    pointCounterText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        color: fantasyTokens.colors.gold,
        letterSpacing: 0.5,
    },
});
