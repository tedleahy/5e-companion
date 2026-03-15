import { Pressable, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useCharacterDraft } from '@/store/characterDraft';
import { ABILITY_ABBREVIATIONS, ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import { asiPointsForLevel } from '@/lib/characterCreation/abilityRules';
import { sharedStyles } from '@/components/wizard/abilitiesShared';
import RollAbilityMode from '@/components/wizard/RollAbilityMode';
import PointBuyAbilityMode from '@/components/wizard/PointBuyAbilityMode';

export default function StepAbilities() {
    const { draft, updateDraft, setAllAbilityScores } = useCharacterDraft();

    const isPointBuy = draft.abilityMode === 'pointBuy';
    const totalAsiPoints = asiPointsForLevel(draft.level);
    const usedAsiPoints = ABILITY_KEYS.reduce((sum, k) => sum + (draft.asiAllocations[k] ?? 0), 0);
    const remainingAsi = totalAsiPoints - usedAsiPoints;

    function handleModeSwitch(mode: 'roll' | 'pointBuy') {
        if (mode === draft.abilityMode) return;
        const newScores = mode === 'pointBuy'
            ? { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 }
            : { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
        updateDraft({ abilityMode: mode });
        setAllAbilityScores(newScores);
    }

    function handleAsiIncrement(ability: AbilityKey) {
        if (remainingAsi <= 0) return;
        updateDraft({
            asiAllocations: { ...draft.asiAllocations, [ability]: (draft.asiAllocations[ability] ?? 0) + 1 },
        });
    }

    function handleAsiDecrement(ability: AbilityKey) {
        if ((draft.asiAllocations[ability] ?? 0) <= 0) return;
        updateDraft({
            asiAllocations: { ...draft.asiAllocations, [ability]: draft.asiAllocations[ability] - 1 },
        });
    }

    return (
        <ScrollView style={sharedStyles.scroll} contentContainerStyle={sharedStyles.container}>
            <Text style={sharedStyles.heading}>Set your abilities.</Text>
            <Text style={sharedStyles.sub}>Six scores, six aspects of your soul.</Text>

            {/* Mode toggle */}
            <View style={sharedStyles.modeToggle}>
                <Pressable
                    onPress={() => handleModeSwitch('roll')}
                    style={[sharedStyles.modeTab, !isPointBuy && sharedStyles.modeTabActive]}
                >
                    <Text style={[sharedStyles.modeTabText, !isPointBuy && sharedStyles.modeTabTextActive]}>Roll</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleModeSwitch('pointBuy')}
                    style={[sharedStyles.modeTab, isPointBuy && sharedStyles.modeTabActive]}
                >
                    <Text style={[sharedStyles.modeTabText, isPointBuy && sharedStyles.modeTabTextActive]}>Point Buy</Text>
                </Pressable>
            </View>

            {/* Mode-specific content */}
            {isPointBuy ? <PointBuyAbilityMode /> : <RollAbilityMode />}

            {/* ASI Section */}
            {totalAsiPoints > 0 && (
                <View style={sharedStyles.asiSection}>
                    <Text style={sharedStyles.asiHeading}>Ability Score Increases</Text>
                    <Text style={sharedStyles.asiSub}>
                        Your level grants {totalAsiPoints} points to distribute. {remainingAsi} remaining.
                    </Text>
                    <View style={sharedStyles.asiGrid}>
                        {ABILITY_KEYS.map((ability) => {
                            const allocated = draft.asiAllocations[ability] ?? 0;
                            return (
                                <View key={ability} style={sharedStyles.asiRow}>
                                    <Text style={sharedStyles.asiLabel}>{ABILITY_ABBREVIATIONS[ability]}</Text>
                                    <View style={sharedStyles.asiControls}>
                                        <Pressable
                                            onPress={() => handleAsiDecrement(ability)}
                                            disabled={allocated <= 0}
                                            style={({ pressed }) => [
                                                sharedStyles.asiBtn,
                                                allocated <= 0 && sharedStyles.asiBtnDisabled,
                                                pressed && allocated > 0 && sharedStyles.asiBtnPressed,
                                            ]}
                                        >
                                            <Text style={sharedStyles.asiBtnText}>{'\u2212'}</Text>
                                        </Pressable>
                                        <Text style={sharedStyles.asiValue}>{allocated > 0 ? `+${allocated}` : '0'}</Text>
                                        <Pressable
                                            onPress={() => handleAsiIncrement(ability)}
                                            disabled={remainingAsi <= 0}
                                            style={({ pressed }) => [
                                                sharedStyles.asiBtn,
                                                remainingAsi <= 0 && sharedStyles.asiBtnDisabled,
                                                pressed && remainingAsi > 0 && sharedStyles.asiBtnPressed,
                                            ]}
                                        >
                                            <Text style={sharedStyles.asiBtnText}>+</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
