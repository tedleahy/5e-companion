import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
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
import type { AbilityKey } from '@/lib/characterSheetUtils';
import type { AbilityScoresInput, CurrencyInput, HpInput, TraitsInput } from '@/types/generated_graphql_types';

type CoreEditDraft = {
    hp: HpInput;
    ac: number;
    speed: number;
    initiative: number;
    abilityScores: AbilityScoresInput;
    currency: CurrencyInput;
    traits: TraitsInput;
    conditions: string[];
};

/**
 * Builds editable core-sheet draft state from character data.
 */
function buildCoreDraft(character: NonNullable<ReturnType<typeof useCharacterSheetData>['character']>): CoreEditDraft {
    return {
        hp: {
            current: character.stats?.hp.current ?? 0,
            max: character.stats?.hp.max ?? 0,
            temp: character.stats?.hp.temp ?? 0,
        },
        ac: character.ac,
        speed: character.speed,
        initiative: character.initiative,
        abilityScores: {
            strength: character.stats?.abilityScores.strength ?? 10,
            dexterity: character.stats?.abilityScores.dexterity ?? 10,
            constitution: character.stats?.abilityScores.constitution ?? 10,
            intelligence: character.stats?.abilityScores.intelligence ?? 10,
            wisdom: character.stats?.abilityScores.wisdom ?? 10,
            charisma: character.stats?.abilityScores.charisma ?? 10,
        },
        currency: {
            cp: character.stats?.currency.cp ?? 0,
            sp: character.stats?.currency.sp ?? 0,
            ep: character.stats?.currency.ep ?? 0,
            gp: character.stats?.currency.gp ?? 0,
            pp: character.stats?.currency.pp ?? 0,
        },
        traits: {
            personality: character.stats?.traits.personality ?? '',
            ideals: character.stats?.traits.ideals ?? '',
            bonds: character.stats?.traits.bonds ?? '',
            flaws: character.stats?.traits.flaws ?? '',
        },
        conditions: character.conditions,
    };
}

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
    const [editMode, setEditMode] = useState(false);
    const [isSavedVisible, setIsSavedVisible] = useState(false);
    const [coreDraft, setCoreDraft] = useState<CoreEditDraft | null>(null);
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
        handleSaveCharacterSheetCore,
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

    /**
     * Enters local character-sheet edit mode.
     */
    function handleStartEdit() {
        setCoreDraft(buildCoreDraft(character as NonNullable<typeof character>));
        setEditMode(true);
    }

    /**
     * Leaves edit mode without persisting pending changes.
     */
    function handleCancelEdit() {
        setCoreDraft(null);
        setEditMode(false);
    }

    /**
     * Finalises edit mode and confirms save completion.
     */
    async function handleDoneEdit() {
        if (coreDraft) {
            try {
                await handleSaveCharacterSheetCore(coreDraft);
            } catch (error) {
                console.error('Failed to save core character sheet edits', error);
            }
        }

        setCoreDraft(null);
        setEditMode(false);
        setIsSavedVisible(true);
    }

    const displayedHp = coreDraft?.hp ?? stats.hp;
    const displayedAc = coreDraft?.ac ?? character.ac;
    const displayedSpeed = coreDraft?.speed ?? character.speed;
    const displayedInitiative = coreDraft?.initiative ?? character.initiative;
    const displayedAbilityScores = coreDraft?.abilityScores ?? stats.abilityScores;

    /**
     * Updates one draft ability score while preserving all other ability values.
     */
    function handleChangeAbilityScore(ability: AbilityKey, value: number) {
        setCoreDraft((previousDraft) => {
            if (!previousDraft) return previousDraft;

            return {
                ...previousDraft,
                abilityScores: {
                    ...previousDraft.abilityScores,
                    [ability]: value,
                },
            };
        });
    }

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
                    editMode={editMode}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onDoneEdit={handleDoneEdit}
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
                                hp={displayedHp}
                                ac={displayedAc}
                                speed={displayedSpeed}
                                conditions={character.conditions}
                                editMode={editMode}
                                onChangeHpCurrent={(value: number) => {
                                    setCoreDraft((previousDraft) => {
                                        if (!previousDraft) return previousDraft;
                                        return {
                                            ...previousDraft,
                                            hp: { ...previousDraft.hp, current: value },
                                        };
                                    });
                                }}
                                onChangeHpMax={(value: number) => {
                                    setCoreDraft((previousDraft) => {
                                        if (!previousDraft) return previousDraft;
                                        return {
                                            ...previousDraft,
                                            hp: { ...previousDraft.hp, max: value },
                                        };
                                    });
                                }}
                                onChangeHpTemp={(value: number) => {
                                    setCoreDraft((previousDraft) => {
                                        if (!previousDraft) return previousDraft;
                                        return {
                                            ...previousDraft,
                                            hp: { ...previousDraft.hp, temp: value },
                                        };
                                    });
                                }}
                                onChangeAc={(value: number) => {
                                    setCoreDraft((previousDraft) => {
                                        if (!previousDraft) return previousDraft;
                                        return {
                                            ...previousDraft,
                                            ac: value,
                                        };
                                    });
                                }}
                                onChangeSpeed={(value: number) => {
                                    setCoreDraft((previousDraft) => {
                                        if (!previousDraft) return previousDraft;
                                        return {
                                            ...previousDraft,
                                            speed: value,
                                        };
                                    });
                                }}
                            />
                            <QuickStatsCard
                                proficiencyBonus={character.proficiencyBonus}
                                initiative={displayedInitiative}
                                inspiration={character.inspiration}
                                spellSaveDC={character.spellSaveDC ?? null}
                                editMode={editMode}
                                onToggleInspiration={handleToggleInspiration}
                                onChangeInitiative={(value: number) => {
                                    setCoreDraft((previousDraft) => {
                                        if (!previousDraft) return previousDraft;
                                        return {
                                            ...previousDraft,
                                            initiative: value,
                                        };
                                    });
                                }}
                            />
                            <DeathSavesCard
                                successes={stats.deathSaves.successes}
                                failures={stats.deathSaves.failures}
                                onUpdate={handleUpdateDeathSaves}
                            />
                            <AbilityScoresAndSkillsCard
                                abilityScores={displayedAbilityScores}
                                proficiencyBonus={character.proficiencyBonus}
                                savingThrowProficiencies={savingThrowProficiencies}
                                skillProficiencies={stats.skillProficiencies}
                                editMode={editMode}
                                onChangeAbilityScore={handleChangeAbilityScore}
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
                        weapons={character.weapons}
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

                <Snackbar
                    visible={isSavedVisible}
                    onDismiss={() => setIsSavedVisible(false)}
                    duration={1400}
                    style={styles.savedSnackbar}
                >
                    Saved
                </Snackbar>
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
    savedSnackbar: {
        backgroundColor: '#2a5c2a',
    },
});
