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
import useCharacterSheetData, { type SaveCharacterSheetCoreInput } from '@/hooks/useCharacterSheetData';
import { deriveSpellcastingStats, isAbilityKey, skillModifier } from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { AbilityKey } from '@/lib/characterSheetUtils';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';

type CharacterSheetEditDraft = SaveCharacterSheetCoreInput;
type ProficiencyDraftKey = 'armorProficiencies' | 'weaponProficiencies' | 'toolProficiencies' | 'languages';

/**
 * Creates a stable local-only id for new edit-mode rows.
 */
function createDraftId(prefix: string): string {
    return `draft-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Builds editable core-sheet draft state from character data.
 */
function buildCoreDraft(character: NonNullable<ReturnType<typeof useCharacterSheetData>['character']>): CharacterSheetEditDraft {
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
            armorProficiencies: character.stats?.traits.armorProficiencies ?? [],
            weaponProficiencies: character.stats?.traits.weaponProficiencies ?? [],
            toolProficiencies: character.stats?.traits.toolProficiencies ?? [],
            languages: character.stats?.traits.languages ?? [],
        },
        conditions: character.conditions,
        weapons: character.weapons.map((weapon) => ({ ...weapon })),
        inventory: character.inventory.map((item) => ({ ...item })),
        features: character.features.map((feature) => ({ ...feature })),
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
    const pagerRef = useRef<CharacterSheetPagerHandle>(null);
    const [spellSheetVisible, setSpellSheetVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [saveErrorVisible, setSaveErrorVisible] = useState(false);
    const [sheetDraft, setSheetDraft] = useState<CharacterSheetEditDraft | null>(null);
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
        handleUpdateSavingThrowProficiencies,
        handleToggleSpellSlot,
        handleLearnSpell,
        handleForgetSpell,
        handleSetSpellPrepared,
        handleSaveCharacterSheetCore,
        handleLevelUp,
        handleToggleEquip,
    } = useCharacterSheetData(characterId ?? '');

    useEffect(() => {
        if (characterId) return;
        router.replace('/characters');
    }, [characterId, router]);

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    /** Tabs visible for this character — hides Spells for non-casters. */
    const visibleTabs: readonly CharacterSheetTab[] = useMemo(() => {
        if (!character?.spellcastingAbility) {
            return CHARACTER_SHEET_TABS.filter((tab) => tab !== 'Spells');
        }
        return [...CHARACTER_SHEET_TABS];
    }, [character?.spellcastingAbility]);

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
        setSheetDraft(buildCoreDraft(character as NonNullable<typeof character>));
        setEditMode(true);
    }

    /**
     * Leaves edit mode without persisting pending changes.
     */
    function handleCancelEdit() {
        setSheetDraft(null);
        setEditMode(false);
    }

    /**
     * Finalises edit mode and confirms save completion.
     */
    async function handleDoneEdit() {
        if (sheetDraft) {
            try {
                const { spellAttackBonus, spellSaveDC } = deriveSpellcastingStats(
                    character?.spellcastingAbility,
                    sheetDraft.abilityScores as Record<AbilityKey, number>,
                    character?.proficiencyBonus ?? 2,
                );
                await handleSaveCharacterSheetCore({
                    ...sheetDraft,
                    spellSaveDC,
                    spellAttackBonus,
                });
            } catch (saveError) {
                console.error('Failed to save core character sheet edits', saveError);
                setSaveErrorVisible(true);
                return;
            }
        }

        setSheetDraft(null);
        setEditMode(false);
    }

    const displayedHp = sheetDraft?.hp ?? stats.hp;
    const displayedAc = sheetDraft?.ac ?? character.ac;
    const displayedSpeed = sheetDraft?.speed ?? character.speed;
    const displayedInitiative = sheetDraft?.initiative ?? character.initiative;
    const displayedAbilityScores = sheetDraft?.abilityScores ?? stats.abilityScores;
    const displayedCurrency = sheetDraft?.currency ?? stats.currency;
    const displayedTraits = sheetDraft?.traits ?? stats.traits;
    const displayedWeapons = sheetDraft?.weapons ?? character.weapons;
    const displayedInventory = sheetDraft?.inventory ?? character.inventory;
    const displayedFeatures = sheetDraft?.features ?? character.features;
    const { spellAttackBonus: derivedSpellAttack, spellSaveDC: derivedSpellSaveDC } =
        deriveSpellcastingStats(character.spellcastingAbility, displayedAbilityScores, character.proficiencyBonus);
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

    /**
     * Applies a functional update to the current sheet draft when edit mode is active.
     */
    function updateSheetDraft(updater: (draft: CharacterSheetEditDraft) => CharacterSheetEditDraft) {
        setSheetDraft((previousDraft) => {
            if (!previousDraft) return previousDraft;
            return updater(previousDraft);
        });
    }

    /**
     * Updates one draft ability score while preserving all other ability values.
     */
    function handleChangeAbilityScore(ability: AbilityKey, value: number) {
        updateSheetDraft((previousDraft) => ({
                ...previousDraft,
                abilityScores: {
                    ...previousDraft.abilityScores,
                    [ability]: value,
                },
            }));
    }

    /**
     * Adds a new blank weapon row to the local edit draft.
     */
    function handleAddWeapon() {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            weapons: [
                ...previousDraft.weapons,
                { id: createDraftId('weapon'), name: '', attackBonus: '', damage: '', type: 'melee', __typename: 'Attack' },
            ],
        }));
    }

    /**
     * Adds a new blank inventory row to the backpack draft list.
     */
    function handleAddInventoryItem() {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            inventory: [
                ...previousDraft.inventory,
                {
                    id: createDraftId('item'),
                    name: '',
                    quantity: 1,
                    weight: null,
                    description: '',
                    equipped: false,
                    magical: false,
                    __typename: 'InventoryItem',
                },
            ],
        }));
    }

    /**
     * Adds a new blank feature row to one feature category.
     */
    function handleAddFeature(source: string) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            features: [
                ...previousDraft.features,
                {
                    id: createDraftId('feature'),
                    name: '',
                    source,
                    description: '',
                    recharge: null,
                    usesMax: null,
                    usesRemaining: null,
                    __typename: 'CharacterFeature',
                },
            ],
        }));
    }

    /**
     * Adds a blank proficiency or language tag to the draft.
     */
    function handleAddTraitTag(key: ProficiencyDraftKey) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            traits: {
                ...previousDraft.traits,
                [key]: [...(previousDraft.traits[key] ?? []), ''],
            },
        }));
    }

    /**
     * Updates one draft proficiency or language tag by index.
     */
    function handleChangeTraitTag(key: ProficiencyDraftKey, index: number, value: string) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            traits: {
                ...previousDraft.traits,
                [key]: (previousDraft.traits[key] ?? []).map((entry, entryIndex) => (
                    entryIndex === index ? value : entry
                )),
            },
        }));
    }

    /**
     * Removes one draft proficiency or language tag by index.
     */
    function handleRemoveTraitTag(key: ProficiencyDraftKey, index: number) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            traits: {
                ...previousDraft.traits,
                [key]: (previousDraft.traits[key] ?? []).filter((_, entryIndex) => entryIndex !== index),
            },
        }));
    }

    /**
     * Removes one weapon row from the local draft.
     */
    function handleRemoveWeapon(weaponId: string) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            weapons: previousDraft.weapons.filter((weapon) => weapon.id !== weaponId),
        }));
    }

    /**
     * Updates one editable weapon field in the local draft.
     */
    function handleChangeWeapon(weaponId: string, field: 'name' | 'attackBonus' | 'damage', value: string) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            weapons: previousDraft.weapons.map((weapon) => (
                weapon.id === weaponId ? { ...weapon, [field]: value } : weapon
            )),
        }));
    }

    /**
     * Removes one inventory row from the local draft.
     */
    function handleRemoveInventoryItem(itemId: string) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            inventory: previousDraft.inventory.filter((item) => item.id !== itemId),
        }));
    }

    /**
     * Updates one inventory item in the local draft.
     */
    function handleChangeInventoryItem(itemId: string, changes: Partial<CharacterSheetEditDraft['inventory'][number]>) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            inventory: previousDraft.inventory.map((item) => (
                item.id === itemId ? { ...item, ...changes } : item
            )),
        }));
    }

    /**
     * Toggles equipped state for one inventory row.
     * In edit mode, mutates the local draft. Outside edit mode, calls the
     * server mutation directly so equip/unequip works without editing.
     */
    function handleToggleInventoryEquip(itemId: string) {
        if (editMode) {
            updateSheetDraft((previousDraft) => ({
                ...previousDraft,
                inventory: previousDraft.inventory.map((item) => (
                    item.id === itemId ? { ...item, equipped: !item.equipped } : item
                )),
            }));
        } else {
            void handleToggleEquip(itemId);
        }
    }

    /**
     * Removes one feature row from the local draft.
     */
    function handleRemoveFeature(featureId: string) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            features: previousDraft.features.filter((feature) => feature.id !== featureId),
        }));
    }

    /**
     * Updates one editable field on a feature row.
     */
    function handleChangeFeature(featureId: string, changes: Partial<CharacterSheetEditDraft['features'][number]>) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            features: previousDraft.features.map((feature) => (
                feature.id === featureId ? { ...feature, ...changes } : feature
            )),
        }));
    }

    /**
     * Updates one editable personality trait field.
     */
    function handleChangeTrait(field: keyof SaveCharacterSheetCoreInput['traits'], value: string | string[]) {
        updateSheetDraft((previousDraft) => ({
            ...previousDraft,
            traits: {
                ...previousDraft.traits,
                [field]: value,
            },
        }));
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
                    tabs={visibleTabs}
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                    editMode={editMode}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onDoneEdit={handleDoneEdit}
                    onLevelUp={handleLevelUp}
                />
                <CharacterSheetPager
                    ref={pagerRef}
                    testID="character-sheet-pager"
                    style={styles.pager}
                    initialPage={0}
                    scrollEnabled={!spellSheetVisible}
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
                                conditions={character.conditions}
                                editMode={editMode}
                                onChangeHpCurrent={(value: number) => {
                                    updateSheetDraft((previousDraft) => ({
                                            ...previousDraft,
                                            hp: { ...previousDraft.hp, current: value },
                                        }));
                                }}
                                onChangeHpMax={(value: number) => {
                                    updateSheetDraft((previousDraft) => ({
                                            ...previousDraft,
                                            hp: { ...previousDraft.hp, max: value },
                                        }));
                                }}
                                onChangeHpTemp={(value: number) => {
                                    updateSheetDraft((previousDraft) => ({
                                            ...previousDraft,
                                            hp: { ...previousDraft.hp, temp: value },
                                        }));
                                }}
                                onChangeAc={(value: number) => {
                                    updateSheetDraft((previousDraft) => ({
                                            ...previousDraft,
                                            ac: value,
                                        }));
                                }}
                                onChangeSpeed={(value: number) => {
                                    updateSheetDraft((previousDraft) => ({
                                            ...previousDraft,
                                            speed: value,
                                        }));
                                }}
                            />
                            <QuickStatsCard
                                proficiencyBonus={character.proficiencyBonus}
                                initiative={displayedInitiative}
                                inspiration={character.inspiration}
                                spellSaveDC={derivedSpellSaveDC}
                                editMode={editMode}
                                onToggleInspiration={handleToggleInspiration}
                                onChangeInitiative={(value: number) => {
                                    updateSheetDraft((previousDraft) => ({
                                            ...previousDraft,
                                            initiative: value,
                                        }));
                                }}
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
                            onChangeAbilityScore={handleChangeAbilityScore}
                            onUpdateSkillProficiency={handleUpdateSkillProficiency}
                            onUpdateSavingThrowProficiencies={handleUpdateSavingThrowProficiencies}
                        />
                    </View>

                    {/* Spells — only for caster characters */}
                    {character.spellcastingAbility ? (
                        <View key="Spells" style={styles.page}>
                            <SpellsTab
                                characterClass={character.class}
                                spellcastingAbility={character.spellcastingAbility}
                                spellSaveDC={derivedSpellSaveDC}
                                spellAttackBonus={derivedSpellAttack}
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
                            onChangeCurrency={(key: 'cp' | 'sp' | 'ep' | 'gp' | 'pp', value: number) => {
                                updateSheetDraft((previousDraft) => ({
                                    ...previousDraft,
                                    currency: {
                                        ...previousDraft.currency,
                                        [key]: value,
                                    },
                                }));
                            }}
                            onAddWeapon={handleAddWeapon}
                            onChangeWeapon={handleChangeWeapon}
                            onRemoveWeapon={handleRemoveWeapon}
                            onAddInventoryItem={handleAddInventoryItem}
                            onChangeInventoryItem={handleChangeInventoryItem}
                            onRemoveInventoryItem={handleRemoveInventoryItem}
                            onToggleInventoryEquip={handleToggleInventoryEquip}
                        />
                    </View>

                    {/* Page 4 — Traits */}
                    <View key="Traits" style={styles.page}>
                        <TraitsTab
                            background={character.background}
                            traits={displayedTraits}
                            editMode={editMode}
                            onChangeTraitText={(field: 'personality' | 'ideals' | 'bonds' | 'flaws', value: string) => {
                                handleChangeTrait(field, value);
                            }}
                            onAddTraitTag={handleAddTraitTag}
                            onChangeTraitTag={handleChangeTraitTag}
                            onRemoveTraitTag={handleRemoveTraitTag}
                        />
                    </View>

                    {/* Page 5 — Features */}
                    <View key="Features" style={styles.page}>
                        <FeaturesTab
                            className={character.class}
                            race={character.race}
                            features={displayedFeatures}
                            editMode={editMode}
                            onAddClassFeature={() => handleAddFeature(character.class)}
                            onAddRacialTrait={() => handleAddFeature(character.race)}
                            onAddFeat={() => handleAddFeature('Feat')}
                            onChangeFeature={handleChangeFeature}
                            onRemoveFeature={handleRemoveFeature}
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
        fontSize: 18,
        textAlign: 'center',
    },
    stateSubtext: {
        color: fantasyTokens.colors.inkSoft,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    errorDetail: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    errorSnackbar: {
        backgroundColor: '#8b1a1a',
    },
});
