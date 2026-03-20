import { useCallback } from 'react';
import { deriveSpellcastingStats } from '@/lib/characterSheetUtils';
import type { ApolloCache } from '@apollo/client';
import { skipToken, useMutation, useQuery } from '@apollo/client/react';
import type {
    CharacterSheetDetailQuery,
    CharacterSheetDetailQueryVariables,
    ForgetSpellMutation,
    ForgetSpellMutationVariables,
    InventoryItem,
    InventoryItemInput,
    LearnSpellMutation,
    LearnSpellMutationVariables,
    MutationUpdateCharacterArgs,
    MutationUpdateInventoryItemArgs,
    PrepareSpellMutation,
    PrepareSpellMutationVariables,
    ProficiencyLevel,
    SaveCharacterSheetInput,
    SaveCharacterSheetMutation,
    SaveCharacterSheetMutationVariables,
    SkillProficienciesInput,
    SpellSlot,
    ToggleInspirationMutation,
    ToggleInspirationMutationVariables,
    ToggleSpellSlotMutation,
    ToggleSpellSlotMutationVariables,
    UnprepareSpellMutation,
    UnprepareSpellMutationVariables,
    UpdateDeathSavesMutation,
    UpdateDeathSavesMutationVariables,
    UpdateSavingThrowProficienciesMutation,
    UpdateSavingThrowProficienciesMutationVariables,
    UpdateSkillProficienciesMutation,
    UpdateSkillProficienciesMutationVariables,
} from '@/types/generated_graphql_types';
import {
    FORGET_SPELL,
    GET_CHARACTER_SHEET_DETAIL,
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
type CharacterWithSpells = NonNullable<CharacterSheetDetailQuery['character']>;

/**
 * Callback for cache-level character updates.
 */
type CharacterCacheUpdater = (character: CharacterWithSpells) => CharacterWithSpells;

/**
 * Returns true when Apollo has delivered a usable full character-sheet payload.
 */
function isCharacterWithSpells(value: unknown): value is CharacterWithSpells {
    if (!value || typeof value !== 'object') return false;

    const character = value as Partial<CharacterWithSpells>;

    return typeof character.id === 'string'
        && typeof character.name === 'string'
        && typeof character.race === 'string'
        && typeof character.class === 'string'
        && typeof character.level === 'number'
        && typeof character.alignment === 'string'
        && typeof character.background === 'string'
        && typeof character.proficiencyBonus === 'number'
        && typeof character.inspiration === 'boolean'
        && typeof character.ac === 'number'
        && typeof character.speed === 'number'
        && typeof character.initiative === 'number'
        && Array.isArray(character.conditions)
        && Array.isArray(character.features)
        && Array.isArray(character.weapons)
        && Array.isArray(character.inventory)
        && Array.isArray(character.spellSlots)
        && Array.isArray(character.spellbook);
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
    cache.updateQuery<CharacterSheetDetailQuery, CharacterSheetDetailQueryVariables>(
        {
            query: GET_CHARACTER_SHEET_DETAIL,
            variables: { id: characterId },
        },
        (data: CharacterSheetDetailQuery | null) => {
            if (!data?.character) return data;

            return {
                ...data,
                character: updateCharacter(data.character),
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
export default function useCharacterSheetData(characterId: string | null) {
    const { data, dataState, loading, error, refetch } = useQuery<
        CharacterSheetDetailQuery,
        CharacterSheetDetailQueryVariables
    >(
        GET_CHARACTER_SHEET_DETAIL,
        characterId ? { variables: { id: characterId } } : skipToken,
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

    const character = dataState === 'complete' && isCharacterWithSpells(data?.character)
        ? data.character
        : null;
    const hasCurrentUserCharacters = dataState === 'complete'
        ? data.hasCurrentUserCharacters
        : false;

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
    const handleSaveCharacterSheet = useCallback(async (input: SaveCharacterSheetInput) => {
        if (!character) return;

        await saveCharacterSheet({
            variables: {
                characterId: character.id,
                input,
            },
            update(cache, result) {
                const savedCharacter = result.data?.saveCharacterSheet;
                if (!isCharacterWithSpells(savedCharacter)) return;

                updateCharacterInCache(cache, character.id, () => savedCharacter);
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
        hasCurrentUserCharacters,
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
        handleSaveCharacterSheet,
        handleLevelUp,
        handleToggleEquip,
    };
}
