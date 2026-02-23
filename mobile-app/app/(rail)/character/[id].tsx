import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import CharacterSheetHeader from '@/components/character-sheet/CharacterSheetHeader';
import type { CharacterSheetTab } from '@/components/character-sheet/CharacterSheetHeader';
import AbilityScoresAndSkillsCard from '@/components/character-sheet/AbilityScoresAndSkillsCard';
import DeathSavesCard from '@/components/character-sheet/DeathSavesCard';
import FeaturesTab from '@/components/character-sheet/FeaturesTab';
import GearTab from '@/components/character-sheet/GearTab';
import QuickStatsCard from '@/components/character-sheet/QuickStatsCard';
import SkillsTab from '@/components/character-sheet/SkillsTab';
import SpellsTab from '@/components/character-sheet/SpellsTab';
import VitalsCard from '@/components/character-sheet/VitalsCard';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import useCharacterSheetData from '@/hooks/useCharacterSheetData';
import { isAbilityKey } from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Normalises the dynamic route parameter into a usable character id.
 */
function normaliseCharacterId(rawId?: string): string | null {
    if (typeof rawId !== 'string') return null;

    const trimmedId = rawId.trim();
    if (trimmedId.length === 0) return null;

    return trimmedId;
}

/**
 * Dynamic character-sheet route that renders the selected character id.
 */
export default function CharacterByIdScreen() {
    /** Currently active top-level tab in the character sheet. */
    const [activeTab, setActiveTab] = useState<CharacterSheetTab>('Core');
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const characterId = normaliseCharacterId(id);
    const {
        character,
        loading,
        error,
        isUnauthenticated,
        handleToggleInspiration,
        handleUpdateDeathSaves,
        handleUpdateSkillProficiency,
        handleToggleSpellSlot,
        handleSetSpellPrepared,
    } = useCharacterSheetData(characterId ?? '');

    useEffect(() => {
        if (characterId) return;
        router.replace('/characters');
    }, [characterId, router]);

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    if (!characterId) {
        return null;
    }

    if (loading) {
        return (
            <RailScreenShell>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                </View>
            </RailScreenShell>
        );
    }

    if (error) {
        return (
            <RailScreenShell>
                <View style={styles.centered}>
                    <Text style={styles.stateText}>Failed to load character.</Text>
                    <Text style={styles.errorDetail}>{error.message}</Text>
                </View>
            </RailScreenShell>
        );
    }

    if (!character || !character.stats) {
        return (
            <RailScreenShell>
                <View style={styles.centered}>
                    <Text style={styles.stateText}>No characters yet.</Text>
                    <Text style={styles.stateSubtext}>
                        Create a character to get started.
                    </Text>
                </View>
            </RailScreenShell>
        );
    }

    const { stats } = character;
    const savingThrowProficiencies = stats.savingThrowProficiencies.filter(isAbilityKey);

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <CharacterSheetHeader
                    name={character.name}
                    level={character.level}
                    className={character.class}
                    subclass={character.subclass ?? undefined}
                    race={character.race}
                    alignment={character.alignment}
                    activeTab={activeTab}
                    onTabPress={setActiveTab}
                />
                {activeTab === 'Core' && (
                    // TODO: move this into a <CoreTab> component, similar to the other tabs below
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <>
                            <VitalsCard
                                hp={stats.hp}
                                ac={character.ac}
                                speed={character.speed}
                                conditions={character.conditions}
                            />
                            <QuickStatsCard
                                proficiencyBonus={character.proficiencyBonus}
                                initiative={character.initiative}
                                inspiration={character.inspiration}
                                spellSaveDC={character.spellSaveDC ?? null}
                                onToggleInspiration={handleToggleInspiration}
                            />
                            <AbilityScoresAndSkillsCard
                                abilityScores={stats.abilityScores}
                                proficiencyBonus={character.proficiencyBonus}
                                savingThrowProficiencies={savingThrowProficiencies}
                                skillProficiencies={stats.skillProficiencies}
                            />
                            <DeathSavesCard
                                successes={stats.deathSaves.successes}
                                failures={stats.deathSaves.failures}
                                onUpdate={handleUpdateDeathSaves}
                            />
                        </>
                    </ScrollView>
                )}

                {activeTab === 'Skills' && (
                    <SkillsTab
                        abilityScores={stats.abilityScores}
                        proficiencyBonus={character.proficiencyBonus}
                        skillProficiencies={stats.skillProficiencies}
                        onUpdateSkillProficiency={handleUpdateSkillProficiency}
                    />
                )}

                {activeTab === 'Spells' && (
                    <SpellsTab
                        spellcastingAbility={character.spellcastingAbility}
                        spellSaveDC={character.spellSaveDC}
                        spellAttackBonus={character.spellAttackBonus}
                        spellSlots={character.spellSlots}
                        spellbook={character.spellbook}
                        onToggleSpellSlot={handleToggleSpellSlot}
                        onSetSpellPrepared={handleSetSpellPrepared}
                    />
                )}

                {activeTab === 'Gear' && (
                    <GearTab
                        attacks={character.attacks}
                        inventory={character.inventory}
                        currency={stats.currency}
                    />
                )}

                {activeTab === 'Features' && (
                    <FeaturesTab
                        className={character.class}
                        race={character.race}
                        background={character.background}
                        features={character.features}
                        traits={stats.traits}
                    />
                )}
            </View>
        </RailScreenShell>
    );
}

/** Styles for character sheet screen states and layout. */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xl * 2,
        gap: 12,
    },
    centered: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
        justifyContent: 'center',
        alignItems: 'center',
        padding: fantasyTokens.spacing.lg,
    },
    stateText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 18,
        textAlign: 'center',
    },
    stateSubtext: {
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
        fontSize: 14,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    errorDetail: {
        color: fantasyTokens.colors.crimson,
        fontFamily: 'serif',
        fontSize: 13,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
});
