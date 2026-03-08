import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import { rollAllAbilityScores } from '@/lib/dndHelpers';
import AbilityBlock from '@/components/wizard/AbilityBlock';

export default function StepAbilities() {
    const { draft, setAbilityScore, setAllAbilityScores } = useCharacterDraft();

    function handleRoll() {
        setAllAbilityScores(rollAllAbilityScores());
    }

    // Render abilities in a 2-column grid
    const rows: AbilityKey[][] = [];
    for (let i = 0; i < ABILITY_KEYS.length; i += 2) {
        rows.push(ABILITY_KEYS.slice(i, i + 2) as AbilityKey[]);
    }

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Set your abilities.</Text>
            <Text style={styles.sub}>Six scores, six aspects of your soul.</Text>

            <Pressable
                onPress={handleRoll}
                style={({ pressed }) => [styles.rollBtn, pressed && styles.rollBtnPressed]}
            >
                <Text style={styles.rollBtnText}>{'\u{1F3B2}'} Roll 4d6 drop lowest</Text>
            </Pressable>

            <View style={styles.grid}>
                {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.gridRow}>
                        {row.map((ability) => (
                            <View key={ability} style={styles.gridItem}>
                                <AbilityBlock
                                    ability={ability}
                                    score={draft.abilityScores[ability]}
                                    onIncrement={() => setAbilityScore(ability, draft.abilityScores[ability] + 1)}
                                    onDecrement={() => setAbilityScore(ability, draft.abilityScores[ability] - 1)}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    heading: {
        fontFamily: 'serif',
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 26,
        marginBottom: 4,
    },
    sub: {
        fontFamily: 'serif',
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
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
    rollBtnText: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
    },
    grid: {
        gap: 8,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 8,
    },
    gridItem: {
        flex: 1,
    },
});
