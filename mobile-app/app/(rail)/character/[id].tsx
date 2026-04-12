import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { SkillProficiencies } from '@/types/generated_graphql_types';
import { registerUnsavedChanges, unregisterUnsavedChanges } from '@/lib/unsavedChanges';
import CharacterSheetHeader, { CHARACTER_SHEET_TABS } from '@/components/character-sheet/CharacterSheetHeader';
import type { CharacterSheetTab } from '@/components/character-sheet/CharacterSheetHeader';
import DeathSavesCard from '@/components/character-sheet/DeathSavesCard';
import FeaturesTab from '@/components/character-sheet/FeaturesTab';
import GearTab from '@/components/character-sheet/GearTab';
import LevelUpWizardSheet from '@/components/character-sheet/level-up/LevelUpWizardSheet';
import QuickStatsCard from '@/components/character-sheet/QuickStatsCard';
// ESLint's resolver does not understand Expo's platform-specific module suffixes here.
// eslint-disable-next-line import/no-unresolved
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
import useLevelUpWizard from '@/hooks/useLevelUpWizard';
import useAvailableSubclasses from '@/hooks/useAvailableSubclasses';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import useCharacterSheetData from '@/hooks/useCharacterSheetData';
import useCharacterSheetDraft from '@/hooks/useCharacterSheetDraft';
import { isAtMaxLevel } from '@/lib/characterLevelUp/advancedClassChoices';
import { mapCustomFeatureDrafts } from '@/lib/characterLevelUp/subclassFeatures';
import {
    formatCharacterClassSummary,
    hasSpellcastingProfiles,
    orderedCharacterClassIds,
    primaryCharacterClassName,
    strongestSpellSaveDc,
} from '@/lib/characterClassSummary';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
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
    const navigation = useNavigation();
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
        isDirty,
        startEditing,
        clearDraft,
        buildSaveInput,
        changeAbilityScore,
        changeSkillProficiency,
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
        applyConfirmedLevelUp,
    } = useCharacterSheetDraft(character);
    const draftSkillProficiencies = useMemo<SkillProficiencies | undefined>(() => {
        if (!draft?.skillProficiencies) {
            return undefined;
        }

        return {
            __typename: 'SkillProficiencies',
            ...draft.skillProficiencies,
        };
    }, [draft?.skillProficiencies]);
    const wizardCharacter = useMemo(() => {
        if (!character) {
            return null;
        }

        if (!character.stats) {
            return {
                ...character,
                stats: null,
            };
        }

        return {
            ...character,
            level: draft?.level ?? character.level,
            classes: draft?.classes ?? character.classes,
            spellcastingProfiles: draft?.spellcastingProfiles ?? character.spellcastingProfiles,
            spellSlots: draft?.spellSlots ?? character.spellSlots,
            spellbook: draft?.spellbook ?? character.spellbook,
            stats: {
                ...character.stats,
                hp: draft?.hp ?? character.stats.hp,
                abilityScores: draft?.abilityScores ?? character.stats.abilityScores,
                skillProficiencies: draftSkillProficiencies ?? character.stats.skillProficiencies,
            },
        };
    }, [character, draft?.abilityScores, draft?.classes, draft?.hp, draft?.level, draft?.spellSlots, draft?.spellbook, draft?.spellcastingProfiles, draftSkillProficiencies]);
    const allSubclassClassIds = useMemo(
        () => CLASS_OPTIONS.map((option) => option.value),
        [],
    );
    const { availableSubclasses, availableSubclassesByClassId } = useAvailableSubclasses(allSubclassClassIds);
    const levelUpWizard = useLevelUpWizard(wizardCharacter, levelUpSheetVisible, availableSubclasses);
    const levelUpAvailableSubclasses = availableSubclassesByClassId[levelUpWizard.selectedClass.classId] ?? [];

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    useEffect(() => {
        if (!editMode && levelUpSheetVisible) {
            setLevelUpSheetVisible(false);
        }
    }, [editMode, levelUpSheetVisible]);

    // Intercept hardware back button when there are unsaved changes
    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (editMode && isDirty) {
                Alert.alert(
                    'Discard changes?',
                    'You have unsaved changes to your character sheet. Are you sure you want to discard them?',
                    [
                        { text: 'Keep Editing', style: 'cancel' },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => {
                                clearDraft();
                                // Navigate back after discarding changes
                                router.back();
                            },
                        },
                    ],
                );
                // Return true to prevent default back action (wait for user choice)
                return true;
            }
            return false;
        });

        return () => subscription.remove();
    }, [editMode, isDirty, clearDraft, router]);

    // Intercept navigation away when there are unsaved changes
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (editMode && isDirty) {
                // Prevent default behavior
                e.preventDefault();

                Alert.alert(
                    'Discard changes?',
                    'You have unsaved changes to your character sheet. Are you sure you want to discard them?',
                    [
                        { text: 'Keep Editing', style: 'cancel' },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => {
                                clearDraft();
                                // After clearing draft, dispatch the original action
                                navigation.dispatch(e.data.action);
                            },
                        },
                    ],
                );
            }
        });

        return unsubscribe;
    }, [navigation, editMode, isDirty, clearDraft]);

    // Register unsaved changes handler for global navigation interception
    useEffect(() => {
        const handler = {
            getIsDirty: () => isDirty,
            discardChanges: clearDraft,
        };
        registerUnsavedChanges(handler);
        return () => unregisterUnsavedChanges();
    }, [isDirty, clearDraft]);

    /** Tabs visible for this character — hides Spells for non-casters. */
    const visibleTabs: readonly CharacterSheetTab[] = useMemo(() => {
        const visibleSpellcastingProfiles = draft?.spellcastingProfiles ?? character?.spellcastingProfiles ?? [];

        if (!character || !hasSpellcastingProfiles(visibleSpellcastingProfiles)) {
            return CHARACTER_SHEET_TABS.filter((tab) => tab !== 'Spells');
        }
        return [...CHARACTER_SHEET_TABS];
    }, [character, draft?.spellcastingProfiles]);

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
     * Silently refuses if the character has already reached level 20.
     */
    const handleOpenLevelUpSheet = useCallback(() => {
        const currentLevel = draft?.level ?? character?.level ?? 0;

        if (isAtMaxLevel(currentLevel)) {
            return;
        }

        setLevelUpSheetVisible(true);
    }, [character?.level, draft?.level]);

    /**
     * Closes the level-up sheet without affecting the underlying edit draft.
     * Shows a discard confirmation when the wizard contains user-entered data.
     */
    const handleCloseLevelUpSheet = useCallback(() => {
        if (levelUpWizard.isDirty) {
            Alert.alert(
                'Discard level-up changes?',
                'You have unsaved progress in the level-up wizard. Are you sure you want to discard it?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            setLevelUpSheetVisible(false);
                            levelUpWizard.resetWizard();
                        },
                    },
                ],
            );
            return;
        }

        setLevelUpSheetVisible(false);
        levelUpWizard.resetWizard();
    }, [levelUpWizard]);

    /**
     * Handles canceling edit mode with confirmation if there are unsaved changes.
     */
    const handleCancelEdit = useCallback(() => {
        if (isDirty) {
            Alert.alert(
                'Discard changes?',
                'You have unsaved changes to your character sheet. Are you sure you want to discard them?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: clearDraft,
                    },
                ],
            );
            return;
        }

        clearDraft();
    }, [clearDraft, isDirty]);

    /**
     * Applies the current wizard result into the local edit draft and closes the sheet.
     */
    const handleConfirmLevelUp = useCallback(() => {
        if (!levelUpWizard.hitPointsState) {
            return;
        }

        applyConfirmedLevelUp({
            selectedClass: levelUpWizard.selectedClass,
            hitPointsState: levelUpWizard.hitPointsState,
            asiOrFeatState: levelUpWizard.steps.some((step) => step.id === 'asi_or_feat')
                ? levelUpWizard.asiOrFeatState
                : null,
            spellcastingState: levelUpWizard.spellcastingState,
            multiclassProficiencyState: levelUpWizard.multiclassProficiencyState,
            invocationState: levelUpWizard.invocationState,
            metamagicState: levelUpWizard.metamagicState,
            mysticArcanumState: levelUpWizard.mysticArcanumState,
            features: [
                ...levelUpWizard.newFeatures,
                ...mapCustomFeatureDrafts(levelUpWizard.selectedClass, levelUpWizard.customFeatures),
            ],
        });
        setLevelUpSheetVisible(false);
        levelUpWizard.resetWizard();
    }, [applyConfirmedLevelUp, levelUpWizard]);

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
        if (!character) {
            return;
        }

        const saveInput = buildSaveInput();
        const draftSpellbook = draft?.spellbook ?? character.spellbook;
        const currentSpellIds = new Set(character.spellbook.map((entry) => entry.spell.id));
        const draftSpellIds = new Set(draftSpellbook.map((entry) => entry.spell.id));
        const spellIdsToLearn = draftSpellbook
            .filter((entry) => !currentSpellIds.has(entry.spell.id))
            .map((entry) => entry.spell.id);
        const spellIdsToForget = character.spellbook
            .filter((entry) => !draftSpellIds.has(entry.spell.id))
            .map((entry) => entry.spell.id);

        if (saveInput) {
            try {
                await handleSaveCharacterSheet(saveInput);
            } catch (saveError) {
                console.error('Failed to save core character sheet edits', saveError);
                setSaveErrorVisible(true);
                return;
            }
        }

        await Promise.all([
            ...spellIdsToLearn.map((spellId) => handleLearnSpell(spellId)),
            ...spellIdsToForget.map((spellId) => handleForgetSpell(spellId)),
        ]).catch((spellError) => {
            console.error('Failed to save spellbook changes', spellError);
        });

        clearDraft();
    }

    const displayedHp = draft?.hp ?? stats.hp;
    const displayedAc = draft?.ac ?? character.ac;
    const displayedSpeed = draft?.speed ?? character.speed;
    const displayedInitiative = draft?.initiative ?? character.initiative;
    const displayedAbilityScores = draft?.abilityScores ?? stats.abilityScores;
    const displayedSkillProficiencies = draftSkillProficiencies ?? stats.skillProficiencies;
    const displayedCurrency = draft?.currency ?? stats.currency;
    const displayedTraits = draft?.traits ?? stats.traits;
    const displayedWeapons = draft?.weapons ?? character.weapons;
    const displayedInventory = draft?.inventory ?? character.inventory;
    const displayedFeatures = draft?.features ?? character.features;
    const displayedLevel = draft?.level ?? character.level;
    const displayedClasses = draft?.classes ?? character.classes;
    const displayedSpellcastingProfiles = draft?.spellcastingProfiles ?? character.spellcastingProfiles;
    const displayedSpellSlots = draft?.spellSlots ?? character.spellSlots;
    const displayedSpellbook = draft?.spellbook ?? character.spellbook;
    const classSummary = formatCharacterClassSummary(displayedClasses);
    const primaryClassName = primaryCharacterClassName(displayedClasses);
    const characterClassIds = orderedCharacterClassIds(displayedClasses);
    const spellSaveDC = strongestSpellSaveDc(displayedSpellcastingProfiles);
    const passivePerception =
        10 + skillModifier(
            displayedAbilityScores.wisdom,
            displayedSkillProficiencies.perception,
            character.proficiencyBonus,
        );
    const passiveInvestigation =
        10 + skillModifier(
            displayedAbilityScores.intelligence,
            displayedSkillProficiencies.investigation,
            character.proficiencyBonus,
        );
    const passiveInsight =
        10 + skillModifier(
            displayedAbilityScores.wisdom,
            displayedSkillProficiencies.insight,
            character.proficiencyBonus,
        );

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <CharacterSheetHeader
                    name={character.name}
                    level={displayedLevel}
                    classSummary={classSummary}
                    race={character.race}
                    alignment={character.alignment}
                    tabs={visibleTabs}
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                    editMode={editMode}
                    onStartEdit={startEditing}
                    onCancelEdit={handleCancelEdit}
                    onDoneEdit={handleDoneEdit}
                    onLevelUp={displayedLevel < 20 ? handleOpenLevelUpSheet : undefined}
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
                            skillProficiencies={displayedSkillProficiencies}
                            editMode={editMode}
                            onChangeAbilityScore={changeAbilityScore}
                            onUpdateSkillProficiency={editMode
                                ? (skillKey, level) => changeSkillProficiency(skillKey, level)
                                : handleUpdateSkillProficiency}
                            onUpdateSavingThrowProficiencies={handleUpdateSavingThrowProficiencies}
                        />
                    </View>

                    {/* Spells — only for caster characters */}
                    {hasSpellcastingProfiles(displayedSpellcastingProfiles) ? (
                        <View key="Spells" style={styles.page}>
                            <SpellsTab
                                characterClassIds={characterClassIds}
                                spellcastingProfiles={displayedSpellcastingProfiles}
                                spellSlots={displayedSpellSlots}
                                spellbook={displayedSpellbook}
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
                nextCharacterLevel={displayedLevel + 1}
                wizard={levelUpWizard}
                availableSubclasses={levelUpAvailableSubclasses}
                onConfirm={handleConfirmLevelUp}
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
