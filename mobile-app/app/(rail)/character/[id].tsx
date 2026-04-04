import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import CharacterSheetHeader, { CHARACTER_SHEET_TABS } from '@/components/character-sheet/CharacterSheetHeader';
import type { CharacterSheetTab } from '@/components/character-sheet/CharacterSheetHeader';
import DeathSavesCard from '@/components/character-sheet/DeathSavesCard';
import FeaturesTab from '@/components/character-sheet/FeaturesTab';
import GearTab from '@/components/character-sheet/GearTab';
import LevelUpWizardSheet from '@/components/character-sheet/level-up/LevelUpWizardSheet';
import QuickStatsCard from '@/components/character-sheet/QuickStatsCard';
import CharacterSheetPager from '@/components/character-sheet/CharacterSheetPager';
import type {
    CharacterSheetPagerHandle,
    CharacterSheetPagerPageSelectedEvent,
} from '@/components/character-sheet/CharacterSheetPager.types';
import AbilitiesTab from '@/components/character-sheet/AbilitiesTab';
import PassiveSensesCard from '@/components/character-sheet/skills/PassiveSensesCard';
import SpellsTab from '@/components/character-sheet/SpellsTab';
import TraitsTab from '@/components/character-sheet/TraitsTab';
import VitalsCard from '@/components/character-sheet/VitalsCard';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import useCharacterSheetData from '@/hooks/useCharacterSheetData';
import useCharacterSheetDraft from '@/hooks/useCharacterSheetDraft';
import {
    formatCharacterClassSummary,
    hasSpellcastingProfiles,
    orderedCharacterClassIds,
    primaryCharacterClassName,
    strongestSpellSaveDc,
} from '@/lib/characterClassSummary';
import { isAbilityKey, skillModifier } from '@/lib/characterSheetUtils';
import type { CharacterSheetDraftTraitTextField } from '@/lib/character-sheet/characterSheetDraft';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';

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
    const pagerRef = useRef<CharacterSheetPagerHandle>(null);
    const [spellSheetVisible, setSpellSheetVisible] = useState(false);
    const [levelUpSheetVisible, setLevelUpSheetVisible] = useState(false);
    const [saveErrorVisible, setSaveErrorVisible] = useState(false);
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const characterId = normaliseCharacterId(id);
    const {
        character,
        hasCurrentUserCharacters,
        loading,
        error,
        isUnauthenticated,
        handleToggleInspiration,
        handleUpdateDeathSaves,
        handleUpdateSkillProficiency,
        handleUpdateSavingThrowProficiencies,
        handleToggleSpellSlot,
        handleLearnSpell,
        handleForgetSpell,
        handleSetSpellPrepared,
        handleSaveCharacterSheet,
        handleToggleEquip,
    } = useCharacterSheetData(characterId);
    const {
        draft,
        editMode,
        startEditing,
        clearDraft,
        buildSaveInput,
        changeAbilityScore,
        changeHp,
        changeAc,
        changeSpeed,
        changeInitiative,
        changeCurrency,
        addWeapon,
        changeWeapon,
        removeWeapon,
        addInventoryItem,
        changeInventoryItem,
        toggleInventoryEquip,
        removeInventoryItem,
        addFeature,
        changeFeature,
        removeFeature,
        addTraitTag,
        changeTraitTag,
        removeTraitTag,
        changeTraitText,
    } = useCharacterSheetDraft(character);

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    useEffect(() => {
        if (!editMode && levelUpSheetVisible) {
            setLevelUpSheetVisible(false);
        }
    }, [editMode, levelUpSheetVisible]);

    /** Tabs visible for this character — hides Spells for non-casters. */
    const visibleTabs: readonly CharacterSheetTab[] = useMemo(() => {
        if (!character || !hasSpellcastingProfiles(character.spellcastingProfiles)) {
            return CHARACTER_SHEET_TABS.filter((tab) => tab !== 'Spells');
        }
        return [...CHARACTER_SHEET_TABS];
    }, [character]);

    /**
     * Called when a tab header button is pressed — syncs PagerView to that page.
     */
    const handleTabPress = useCallback((tab: CharacterSheetTab) => {
        setActiveTab(tab);
        const pageIndex = visibleTabs.indexOf(tab);
        pagerRef.current?.setPage(pageIndex);
    }, [visibleTabs]);

    /**
     * Called when the user swipes to a new page — syncs activeTab state.
     */
    const handlePageSelected = useCallback((event: CharacterSheetPagerPageSelectedEvent) => {
        const pageIndex = event.nativeEvent.position;
        const tab = visibleTabs[pageIndex];
        if (tab) setActiveTab(tab);
    }, [visibleTabs]);

    /**
     * Opens the chunk-1 level-up sheet shell while edit mode remains active underneath.
     */
    const handleOpenLevelUpSheet = useCallback(() => {
        setLevelUpSheetVisible(true);
    }, []);

    /**
     * Closes the level-up sheet without affecting the underlying edit draft.
     */
    const handleCloseLevelUpSheet = useCallback(() => {
        setLevelUpSheetVisible(false);
    }, []);

    if (!characterId) {
        return (
            <RailScreenShell>
                <View style={styles.centered}>
                    <Text style={styles.stateText}>Invalid character link.</Text>
                    <Text style={styles.stateSubtext}>
                        Choose a character from your roster and try again.
                    </Text>
                </View>
            </RailScreenShell>
        );
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

    if (!character) {
        const stateTitle = hasCurrentUserCharacters ? 'Character not found.' : 'No characters yet.';
        const stateSubtext = hasCurrentUserCharacters
            ? 'This character does not exist or is not available to your account.'
            : 'Create a character to get started.';

        return (
            <RailScreenShell>
                <View style={styles.centered}>
                    <Text style={styles.stateText}>{stateTitle}</Text>
                    <Text style={styles.stateSubtext}>{stateSubtext}</Text>
                </View>
            </RailScreenShell>
        );
    }

    if (!character.stats) {
        return (
            <RailScreenShell>
                <View style={styles.centered}>
                    <Text style={styles.stateText}>Character sheet is incomplete.</Text>
                    <Text style={styles.stateSubtext}>
                        This character is missing required stats data.
                    </Text>
                </View>
            </RailScreenShell>
        );
    }

    const { stats } = character;
    const savingThrowProficiencies = stats.savingThrowProficiencies.filter(isAbilityKey);

    /**
     * Finalises edit mode and confirms save completion.
     */
    async function handleDoneEdit() {
        const saveInput = buildSaveInput();

        if (saveInput) {
            try {
                await handleSaveCharacterSheet(saveInput);
            } catch (saveError) {
                console.error('Failed to save core character sheet edits', saveError);
                setSaveErrorVisible(true);
                return;
            }
        }

        clearDraft();
    }

    const displayedHp = draft?.hp ?? stats.hp;
    const displayedAc = draft?.ac ?? character.ac;
    const displayedSpeed = draft?.speed ?? character.speed;
    const displayedInitiative = draft?.initiative ?? character.initiative;
    const displayedAbilityScores = draft?.abilityScores ?? stats.abilityScores;
    const displayedCurrency = draft?.currency ?? stats.currency;
    const displayedTraits = draft?.traits ?? stats.traits;
    const displayedWeapons = draft?.weapons ?? character.weapons;
    const displayedInventory = draft?.inventory ?? character.inventory;
    const displayedFeatures = draft?.features ?? character.features;
    const classSummary = formatCharacterClassSummary(character.classes);
    const primaryClassName = primaryCharacterClassName(character.classes);
    const characterClassIds = orderedCharacterClassIds(character.classes);
    const spellSaveDC = strongestSpellSaveDc(character.spellcastingProfiles);
    const passivePerception =
        10 + skillModifier(
            displayedAbilityScores.wisdom,
            stats.skillProficiencies.perception,
            character.proficiencyBonus,
        );
    const passiveInvestigation =
        10 + skillModifier(
            displayedAbilityScores.intelligence,
            stats.skillProficiencies.investigation,
            character.proficiencyBonus,
        );
    const passiveInsight =
        10 + skillModifier(
            displayedAbilityScores.wisdom,
            stats.skillProficiencies.insight,
            character.proficiencyBonus,
        );

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <CharacterSheetHeader
                    name={character.name}
                    level={character.level}
                    classSummary={classSummary}
                    race={character.race}
                    alignment={character.alignment}
                    tabs={visibleTabs}
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                    editMode={editMode}
                    onStartEdit={startEditing}
                    onCancelEdit={clearDraft}
                    onDoneEdit={handleDoneEdit}
                    onLevelUp={handleOpenLevelUpSheet}
                />
                <CharacterSheetPager
                    ref={pagerRef}
                    testID="character-sheet-pager"
                    style={styles.pager}
                    initialPage={0}
                    scrollEnabled={!spellSheetVisible && !levelUpSheetVisible}
                    onPageSelected={handlePageSelected}
                >
                    {/* Page 0 — Core */}
                    <View key="Core" style={styles.page}>
                        <KeyboardAwareScrollView
                            {...keyboardAwareScrollProps}
                            bottomOffset={keyboardAwareBottomOffset}
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <VitalsCard
                                hp={displayedHp}
                                ac={displayedAc}
                                speed={displayedSpeed}
                                conditions={draft?.conditions ?? character.conditions}
                                editMode={editMode}
                                onChangeHpCurrent={(value: number) => changeHp('current', value)}
                                onChangeHpMax={(value: number) => changeHp('max', value)}
                                onChangeHpTemp={(value: number) => changeHp('temp', value)}
                                onChangeAc={changeAc}
                                onChangeSpeed={changeSpeed}
                            />
                            <QuickStatsCard
                                proficiencyBonus={character.proficiencyBonus}
                                initiative={displayedInitiative}
                                inspiration={character.inspiration}
                                spellSaveDC={spellSaveDC}
                                editMode={editMode}
                                onToggleInspiration={handleToggleInspiration}
                                onChangeInitiative={changeInitiative}
                            />
                            <PassiveSensesCard
                                passivePerception={passivePerception}
                                passiveInvestigation={passiveInvestigation}
                                passiveInsight={passiveInsight}
                                cardIndex={2}
                            />
                            <DeathSavesCard
                                successes={stats.deathSaves.successes}
                                failures={stats.deathSaves.failures}
                                onUpdate={handleUpdateDeathSaves}
                            />
                        </KeyboardAwareScrollView>
                    </View>

                    {/* Page 1 — Abilities */}
                    <View key="Abilities" style={styles.page}>
                        <AbilitiesTab
                            abilityScores={displayedAbilityScores}
                            proficiencyBonus={character.proficiencyBonus}
                            savingThrowProficiencies={savingThrowProficiencies}
                            skillProficiencies={stats.skillProficiencies}
                            editMode={editMode}
                            onChangeAbilityScore={changeAbilityScore}
                            onUpdateSkillProficiency={handleUpdateSkillProficiency}
                            onUpdateSavingThrowProficiencies={handleUpdateSavingThrowProficiencies}
                        />
                    </View>

                    {/* Spells — only for caster characters */}
                    {hasSpellcastingProfiles(character.spellcastingProfiles) ? (
                        <View key="Spells" style={styles.page}>
                            <SpellsTab
                                characterClassIds={characterClassIds}
                                spellcastingProfiles={character.spellcastingProfiles}
                                spellSlots={character.spellSlots}
                                spellbook={character.spellbook}
                                onToggleSpellSlot={handleToggleSpellSlot}
                                onLearnSpell={handleLearnSpell}
                                onForgetSpell={handleForgetSpell}
                                onSetSpellPrepared={handleSetSpellPrepared}
                                onAddSpellSheetVisibilityChange={setSpellSheetVisible}
                            />
                        </View>
                    ) : null}

                    {/* Gear */}
                    <View key="Gear" style={styles.page}>
                        <GearTab
                            weapons={displayedWeapons}
                            inventory={displayedInventory}
                            currency={displayedCurrency}
                            editMode={editMode}
                            onChangeCurrency={changeCurrency}
                            onAddWeapon={addWeapon}
                            onChangeWeapon={changeWeapon}
                            onRemoveWeapon={removeWeapon}
                            onAddInventoryItem={addInventoryItem}
                            onChangeInventoryItem={changeInventoryItem}
                            onRemoveInventoryItem={removeInventoryItem}
                            onToggleInventoryEquip={(itemId: string) => {
                                if (editMode) {
                                    toggleInventoryEquip(itemId);
                                    return;
                                }

                                void handleToggleEquip(itemId);
                            }}
                        />
                    </View>

                    {/* Page 4 — Traits */}
                    <View key="Traits" style={styles.page}>
                        <TraitsTab
                            background={character.background}
                            traits={displayedTraits}
                            editMode={editMode}
                            onChangeTraitText={(field: CharacterSheetDraftTraitTextField, value: string) => {
                                changeTraitText(field, value);
                            }}
                            onAddTraitTag={addTraitTag}
                            onChangeTraitTag={changeTraitTag}
                            onRemoveTraitTag={removeTraitTag}
                        />
                    </View>

                    {/* Page 5 — Features */}
                    <View key="Features" style={styles.page}>
                        <FeaturesTab
                            className={primaryClassName}
                            race={character.race}
                            features={displayedFeatures}
                            editMode={editMode}
                            onAddClassFeature={() => addFeature(primaryClassName)}
                            onAddRacialTrait={() => addFeature(character.race)}
                            onAddFeat={() => addFeature('Feat')}
                            onChangeFeature={changeFeature}
                            onRemoveFeature={removeFeature}
                        />
                    </View>
                </CharacterSheetPager>

                <Snackbar
                    visible={saveErrorVisible}
                    onDismiss={() => setSaveErrorVisible(false)}
                    duration={3000}
                    style={styles.errorSnackbar}
                >
                    Failed to save — your changes are still here.
                </Snackbar>

                <LevelUpWizardSheet
                    visible={levelUpSheetVisible}
                    characterName={character.name}
                    currentLevel={character.level}
                    onClose={handleCloseLevelUpSheet}
                />
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
    pager: {
        flex: 1,
    },
    page: {
        flex: 1,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        textAlign: 'center',
    },
    stateSubtext: {
        color: fantasyTokens.colors.inkSoft,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    errorDetail: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    errorSnackbar: {
        backgroundColor: '#8b1a1a',
    },
});
