import { useCallback } from 'react';
import { deriveSpellcastingStats } from '@/lib/characterSheetUtils';
import type { ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import type {
    AbilityScoresInput,
    CharacterFeature,
    CurrentUserCharacterSheetsQuery,
    CurrencyInput,
    ForgetSpellMutation,
    ForgetSpellMutationVariables,
    HpInput,
    InventoryItem,
    InventoryItemInput,
    LearnSpellMutation,
    LearnSpellMutationVariables,
    MutationUpdateCharacterArgs,
    MutationUpdateInventoryItemArgs,
    PrepareSpellMutation,
    PrepareSpellMutationVariables,
    ProficiencyLevel,
    SaveCharacterSheetFeatureInput,
    SaveCharacterSheetInventoryItemInput,
    SaveCharacterSheetMutation,
    SaveCharacterSheetMutationVariables,
    SaveCharacterSheetWeaponInput,
    SkillProficienciesInput,
    SpellSlot,
    ToggleInspirationMutation,
    ToggleInspirationMutationVariables,
    ToggleSpellSlotMutation,
    ToggleSpellSlotMutationVariables,
    TraitsInput,
    UnprepareSpellMutation,
    UnprepareSpellMutationVariables,
    UpdateDeathSavesMutation,
    UpdateDeathSavesMutationVariables,
    UpdateSavingThrowProficienciesMutation,
    UpdateSavingThrowProficienciesMutationVariables,
    UpdateSkillProficienciesMutation,
    UpdateSkillProficienciesMutationVariables,
    Weapon,
} from '@/types/generated_graphql_types';
import {
    FORGET_SPELL,
    GET_CURRENT_USER_CHARACTER_SHEETS,
    LEARN_SPELL,
    PREPARE_SPELL,
    SAVE_CHARACTER_SHEET,
    TOGGLE_INSPIRATION,
    TOGGLE_SPELL_SLOT,
    UNPREPARE_SPELL,
    UPDATE_CHARACTER,
    UPDATE_DEATH_SAVES,
    UPDATE_INVENTORY_ITEM,
    UPDATE_SAVING_THROW_PROFICIENCIES,
    UPDATE_SKILL_PROFICIENCIES,
} from '@/graphql/characterSheet.operations';
import {
    addSpellToSpellbookInCache,
    removeSpellFromSpellbookInCache,
    updateSpellPreparedInCache,
} from '@/hooks/cache/spellbookCache';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type { AbilityKey, SkillKey } from '@/lib/characterSheetUtils';

/**
 * Character shape returned by the full character-sheet query.
 */
type CharacterWithSpells = CurrentUserCharacterSheetsQuery['currentUserCharacters'][number];

/**
 * Callback for cache-level character updates.
 */
type CharacterCacheUpdater = (character: CharacterWithSpells) => CharacterWithSpells;

/**
 * Persisted edit payload for core character sheet fields.
 */
export type SaveCharacterSheetCoreInput = {
    ac: number;
    speed: number;
    initiative: number;
    conditions: string[];
    hp: HpInput;
    abilityScores: AbilityScoresInput;
    currency: CurrencyInput;
    traits: TraitsInput;
    weapons: Weapon[];
    inventory: InventoryItem[];
    features: CharacterFeature[];
    spellSaveDC?: number | null;
    spellAttackBonus?: number | null;
};


/**
 * Returns true when a local edit-mode row has not yet been persisted.
 */
function isDraftEntityId(id: string): boolean {
    return id.startsWith('draft-');
}

/**
 * Maps a weapon row into the atomic save mutation input shape.
 */
function saveWeaponInput(weapon: Weapon): SaveCharacterSheetWeaponInput {
    return {
        id: isDraftEntityId(weapon.id) ? undefined : weapon.id,
        name: weapon.name,
        attackBonus: weapon.attackBonus,
        damage: weapon.damage,
        type: weapon.type,
    };
}

/**
 * Maps an inventory row into the atomic save mutation input shape.
 */
function saveInventoryItemInput(item: InventoryItem): SaveCharacterSheetInventoryItemInput {
    return {
        id: isDraftEntityId(item.id) ? undefined : item.id,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight ?? null,
        description: item.description ?? null,
        equipped: item.equipped,
        magical: item.magical,
    };
}

/**
 * Maps a feature row into the atomic save mutation input shape.
 */
function saveFeatureInput(feature: CharacterFeature): SaveCharacterSheetFeatureInput {
    return {
        id: isDraftEntityId(feature.id) ? undefined : feature.id,
        name: feature.name,
        source: feature.source,
        description: feature.description,
        recharge: feature.recharge ?? null,
        usesMax: feature.usesMax ?? null,
        usesRemaining: feature.usesRemaining ?? null,
    };
}

/**
 * Maps an inventory row into the GraphQL input shape.
 */
function inventoryItemInput(item: InventoryItem): InventoryItemInput {
    return {
        name: item.name,
        quantity: item.quantity,
        weight: item.weight ?? undefined,
        description: item.description ?? undefined,
        equipped: item.equipped,
        magical: item.magical,
    };
}


/**
 * Updates a single character entry in the current-user cache.
 */
function updateCharacterInCache(
    cache: ApolloCache,
    characterId: string,
    updateCharacter: CharacterCacheUpdater,
) {
    cache.updateQuery<CurrentUserCharacterSheetsQuery>(
        { query: GET_CURRENT_USER_CHARACTER_SHEETS },
        (data: CurrentUserCharacterSheetsQuery | null) => {
            if (!data) return data;

            return {
                ...data,
                currentUserCharacters: data.currentUserCharacters.map((currentCharacter: CharacterWithSpells) => {
                    if (currentCharacter.id !== characterId) return currentCharacter;
                    return updateCharacter(currentCharacter);
                }),
            };
        },
    );
}

/**
 * Applies an optimistic spell slot usage value to the current character cache.
 */
function updateSpellSlotInCache(
    cache: ApolloCache,
    characterId: string,
    level: number,
    used: number,
) {
    updateCharacterInCache(cache, characterId, (currentCharacter: CharacterWithSpells) => ({
        ...currentCharacter,
        spellSlots: currentCharacter.spellSlots.map((slot: SpellSlot) => {
            if (slot.level !== level) return slot;
            return { ...slot, used };
        }),
    }));
}

/**
 * Loads character-sheet data and exposes optimistic mutation handlers.
 */
export default function useCharacterSheetData(characterId: string) {
    const { data, loading, error, refetch } = useQuery<CurrentUserCharacterSheetsQuery>(
        GET_CURRENT_USER_CHARACTER_SHEETS,
    );

    const [toggleInspiration] = useMutation<
        ToggleInspirationMutation,
        ToggleInspirationMutationVariables
    >(TOGGLE_INSPIRATION);

    const [updateDeathSaves] = useMutation<
        UpdateDeathSavesMutation,
        UpdateDeathSavesMutationVariables
    >(UPDATE_DEATH_SAVES);

    const [updateSkillProficiencies] = useMutation<
        UpdateSkillProficienciesMutation,
        UpdateSkillProficienciesMutationVariables
    >(UPDATE_SKILL_PROFICIENCIES);

    const [updateSavingThrowProficiencies] = useMutation<
        UpdateSavingThrowProficienciesMutation,
        UpdateSavingThrowProficienciesMutationVariables
    >(UPDATE_SAVING_THROW_PROFICIENCIES);

    const [toggleSpellSlot] = useMutation<
        ToggleSpellSlotMutation,
        ToggleSpellSlotMutationVariables
    >(TOGGLE_SPELL_SLOT);

    const [learnSpell] = useMutation<
        LearnSpellMutation,
        LearnSpellMutationVariables
    >(LEARN_SPELL);

    const [forgetSpell] = useMutation<
        ForgetSpellMutation,
        ForgetSpellMutationVariables
    >(FORGET_SPELL);

    const [prepareSpell] = useMutation<
        PrepareSpellMutation,
        PrepareSpellMutationVariables
    >(PREPARE_SPELL);

    const [unprepareSpell] = useMutation<
        UnprepareSpellMutation,
        UnprepareSpellMutationVariables
    >(UNPREPARE_SPELL);

    const [saveCharacterSheet] = useMutation<
        SaveCharacterSheetMutation,
        SaveCharacterSheetMutationVariables
    >(SAVE_CHARACTER_SHEET);

    const [updateCharacter] = useMutation<{ updateCharacter: { id: string } }, MutationUpdateCharacterArgs>(
        UPDATE_CHARACTER,
    );
    const [updateInventoryItem] = useMutation<
        { updateInventoryItem: { id: string } },
        MutationUpdateInventoryItemArgs
    >(UPDATE_INVENTORY_ITEM);

    const currentUserCharacters = data?.currentUserCharacters ?? [];
    const character = currentUserCharacters.find((candidate) => candidate.id === characterId) ?? null;

    /**
     * Optimistically toggles inspiration for the active character.
     */
    const handleToggleInspiration = useCallback(() => {
        if (!character) return;

        toggleInspiration({
            variables: { characterId: character.id },
            optimisticResponse: {
                toggleInspiration: {
                    __typename: 'Character',
                    id: character.id,
                    inspiration: !character.inspiration,
                },
            },
        });
    }, [character, toggleInspiration]);

    /**
     * Optimistically updates death save successes/failures.
     */
    const handleUpdateDeathSaves = useCallback((successes: number, failures: number) => {
        if (!character || !character.stats) return;

        updateDeathSaves({
            variables: {
                characterId: character.id,
                input: { successes, failures },
            },
            optimisticResponse: {
                updateDeathSaves: {
                    __typename: 'CharacterStats',
                    id: character.stats.id,
                    deathSaves: {
                        __typename: 'DeathSaves',
                        successes,
                        failures,
                    },
                },
            },
        });
    }, [character, updateDeathSaves]);

    /**
     * Optimistically updates one skill proficiency level.
     */
    const handleUpdateSkillProficiency = useCallback(async (
        skillKey: SkillKey,
        level: ProficiencyLevel,
        nextSkillProficiencies: SkillProficienciesInput,
    ) => {
        if (!character || !character.stats) return;

        try {
            await updateSkillProficiencies({
                variables: {
                    characterId: character.id,
                    input: nextSkillProficiencies,
                },
                optimisticResponse: {
                    updateSkillProficiencies: {
                        __typename: 'CharacterStats',
                        id: character.stats.id,
                        skillProficiencies: {
                            __typename: 'SkillProficiencies',
                            ...character.stats.skillProficiencies,
                            [skillKey]: level,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Failed to update skill proficiency', { skillKey, level, error });
            throw error;
        }
    }, [character, updateSkillProficiencies]);

    /**
     * Optimistically updates saving throw proficiency selections.
     */
    const handleUpdateSavingThrowProficiencies = useCallback(async (
        ability: AbilityKey,
        proficiencies: AbilityKey[],
    ) => {
        if (!character || !character.stats) return;

        try {
            await updateSavingThrowProficiencies({
                variables: {
                    characterId: character.id,
                    input: { proficiencies },
                },
                optimisticResponse: {
                    updateSavingThrowProficiencies: {
                        __typename: 'CharacterStats',
                        id: character.stats.id,
                        savingThrowProficiencies: proficiencies,
                    },
                },
            });
        } catch (error) {
            console.error('Failed to update saving throw proficiencies', { ability, error });
            throw error;
        }
    }, [character, updateSavingThrowProficiencies]);

    /**
     * Cycles a spell slot level from used->used+1->reset.
     */
    const handleToggleSpellSlot = useCallback(async (level: number) => {
        if (!character) return;

        const slot = character.spellSlots.find((spellSlot) => spellSlot.level === level);
        if (!slot) return;

        const nextUsed = slot.used < slot.total ? slot.used + 1 : 0;

        try {
            await toggleSpellSlot({
                variables: {
                    characterId: character.id,
                    level,
                },
                optimisticResponse: {
                    toggleSpellSlot: {
                        __typename: 'SpellSlot',
                        id: slot.id,
                        level: slot.level,
                        total: slot.total,
                        used: nextUsed,
                    },
                },
                update(cache) {
                    updateSpellSlotInCache(cache, character.id, level, nextUsed);
                },
            });
        } catch (error) {
            console.error('Failed to toggle spell slot', { level, error });
            throw error;
        }
    }, [character, toggleSpellSlot]);

    /**
     * Sets prepared state for a spell with optimistic cache updates.
     */
    const handleSetSpellPrepared = useCallback(async (spellId: string, prepared: boolean) => {
        if (!character) return;

        try {
            if (prepared) {
                await prepareSpell({
                    variables: {
                        characterId: character.id,
                        spellId,
                    },
                    optimisticResponse: {
                        prepareSpell: {
                            __typename: 'CharacterSpell',
                            prepared: true,
                            spell: {
                                __typename: 'Spell',
                                id: spellId,
                            },
                        },
                    },
                    update(cache) {
                        updateSpellPreparedInCache(cache, character.id, spellId, true);
                    },
                });

                return;
            }

            await unprepareSpell({
                variables: {
                    characterId: character.id,
                    spellId,
                },
                optimisticResponse: {
                    unprepareSpell: {
                        __typename: 'CharacterSpell',
                        prepared: false,
                        spell: {
                            __typename: 'Spell',
                            id: spellId,
                        },
                    },
                },
                update(cache) {
                    updateSpellPreparedInCache(cache, character.id, spellId, false);
                },
            });
        } catch (error) {
            console.error('Failed to update prepared state', { spellId, prepared, error });
            throw error;
        }
    }, [character, prepareSpell, unprepareSpell]);

    /**
     * Adds a spell to the character spellbook by mutating and updating cache.
     */
    const handleLearnSpell = useCallback(async (spellId: string) => {
        if (!character) return;

        const isAlreadyKnown = character.spellbook.some((entry) => entry.spell.id === spellId);
        if (isAlreadyKnown) return;

        try {
            await learnSpell({
                variables: {
                    characterId: character.id,
                    spellId,
                },
                update(cache, result) {
                    if (!result.data?.learnSpell) return;

                    addSpellToSpellbookInCache(cache, character.id, result.data.learnSpell);
                },
            });
        } catch (error) {
            console.error('Failed to learn spell', { spellId, error });
            throw error;
        }
    }, [character, learnSpell]);

    /**
     * Removes a spell from the character spellbook by mutating and updating cache.
     */
    const handleForgetSpell = useCallback(async (spellId: string) => {
        if (!character) return;

        const isKnown = character.spellbook.some((entry) => entry.spell.id === spellId);
        if (!isKnown) return;

        try {
            const mutationResult = await forgetSpell({
                variables: {
                    characterId: character.id,
                    spellId,
                },
                update(cache, result) {
                    if (!result.data?.forgetSpell) return;
                    removeSpellFromSpellbookInCache(cache, character.id, spellId);
                },
            });

            if (!mutationResult.data?.forgetSpell) {
                throw new Error('Server rejected spell removal');
            }
        } catch (error) {
            console.error('Failed to forget spell', { spellId, error });
            throw error;
        }
    }, [character, forgetSpell]);

    /**
     * Persists the editable core sheet fields when edit mode is confirmed.
     */
    const handleSaveCharacterSheetCore = useCallback(async (input: SaveCharacterSheetCoreInput) => {
        if (!character) return;

        await saveCharacterSheet({
            variables: {
                characterId: character.id,
                input: {
                    ac: input.ac,
                    speed: input.speed,
                    initiative: input.initiative,
                    conditions: input.conditions,
                    hp: input.hp,
                    abilityScores: input.abilityScores,
                    currency: input.currency,
                    traits: input.traits,
                    weapons: input.weapons.map(saveWeaponInput),
                    inventory: input.inventory.map(saveInventoryItemInput),
                    features: input.features.map(saveFeatureInput),
                    spellSaveDC: input.spellSaveDC ?? null,
                    spellAttackBonus: input.spellAttackBonus ?? null,
                },
            },
            update(cache, result) {
                if (!result.data?.saveCharacterSheet) return;

                updateCharacterInCache(cache, character.id, () => result.data!.saveCharacterSheet);
            },
        });
    }, [
        character,
        saveCharacterSheet,
    ]);

    /**
     * Increments the character's level by 1 and recalculates proficiency bonus.
     * Proficiency bonus follows the 5e rule: 2 + floor((level - 1) / 4).
     */
    const handleLevelUp = useCallback(async () => {
        if (!character) return;
        const nextLevel = character.level + 1;
        const nextProficiencyBonus = 2 + Math.floor((nextLevel - 1) / 4);

        const abilityScores = character.stats?.abilityScores ?? {} as Record<AbilityKey, number>;
        const { spellAttackBonus, spellSaveDC } = deriveSpellcastingStats(
            character.spellcastingAbility,
            abilityScores as Record<AbilityKey, number>,
            nextProficiencyBonus,
        );

        await updateCharacter({
            variables: {
                id: character.id,
                input: {
                    level: nextLevel,
                    proficiencyBonus: nextProficiencyBonus,
                    ...(spellSaveDC != null && { spellSaveDC }),
                    ...(spellAttackBonus != null && { spellAttackBonus }),
                },
            },
        });

        await refetch();
    }, [character, refetch, updateCharacter]);

    /**
     * Toggles the equipped state of an inventory item directly via mutation.
     * Works outside edit mode — no draft required.
     */
    const handleToggleEquip = useCallback(async (itemId: string) => {
        if (!character) return;
        const item = character.inventory.find((inventoryItem) => inventoryItem.id === itemId);
        if (!item) return;

        await updateInventoryItem({
            variables: {
                characterId: character.id,
                itemId,
                input: inventoryItemInput({ ...item, equipped: !item.equipped }),
            },
        });

        await refetch();
    }, [character, refetch, updateInventoryItem]);

    return {
        character,
        loading,
        error,
        isUnauthenticated: isUnauthenticatedError(error),
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
    };
}
