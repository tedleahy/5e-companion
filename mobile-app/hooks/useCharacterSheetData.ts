import { useCallback } from 'react';
import type { ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import type {
    CurrentUserCharactersQuery,
    ToggleInspirationMutation,
    ToggleInspirationMutationVariables,
    UpdateDeathSavesMutation,
    UpdateDeathSavesMutationVariables,
    ProficiencyLevel,
    SkillProficiencies,
    SkillProficienciesInput,
} from '@/types/generated_graphql_types';
import {
    GET_CURRENT_USER_CHARACTERS,
    PREPARE_SPELL,
    TOGGLE_INSPIRATION,
    TOGGLE_SPELL_SLOT,
    UNPREPARE_SPELL,
    UPDATE_DEATH_SAVES,
    UPDATE_SKILL_PROFICIENCIES,
} from '@/graphql/characterSheet.operations';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type { SkillKey } from '@/lib/characterSheetUtils';

/**
 * Mutation payload for optimistic skill proficiency updates.
 */
type UpdateSkillProficienciesMutationData = {
    updateSkillProficiencies: {
        __typename: 'CharacterStats';
        id: string;
        skillProficiencies: SkillProficiencies;
    };
};

/**
 * Variables for updating a character's skill proficiencies.
 */
type UpdateSkillProficienciesMutationVariables = {
    characterId: string;
    input: SkillProficienciesInput;
};

/**
 * Spell slot shape used by cache update helpers.
 */
type CharacterSpellSlot = {
    __typename?: 'SpellSlot';
    id: string;
    level: number;
    total: number;
    used: number;
};

/**
 * Spellbook row shape used by cache update helpers.
 */
type CharacterSpellbookEntry = {
    __typename?: 'CharacterSpell';
    prepared: boolean;
    spell: {
        __typename?: 'Spell';
        id: string;
        name: string;
        level: number;
        schoolIndex: string;
        castingTime: string;
        range?: string | null;
        concentration: boolean;
        ritual: boolean;
    };
};

/**
 * Attack row shape returned for the character sheet.
 */
type CharacterAttack = {
    __typename?: 'Attack';
    id: string;
    name: string;
    attackBonus: string;
    damage: string;
    type: string;
};

/**
 * Inventory row shape returned for the character sheet.
 */
type CharacterInventoryItem = {
    __typename?: 'InventoryItem';
    id: string;
    name: string;
    quantity: number;
    weight?: number | null;
    description?: string | null;
    equipped: boolean;
    magical: boolean;
};

/**
 * Feature row shape returned for the character sheet.
 */
type CharacterFeature = {
    __typename?: 'CharacterFeature';
    id: string;
    name: string;
    source: string;
    description: string;
    usesMax?: number | null;
    usesRemaining?: number | null;
    recharge?: string | null;
};

/**
 * Traits metadata shape used by the Features tab.
 */
type CharacterTraits = {
    __typename?: 'Traits';
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
    armorProficiencies?: string[] | null;
    weaponProficiencies?: string[] | null;
    toolProficiencies?: string[] | null;
    languages?: string[] | null;
};

/**
 * Currency shape used by the Gear tab.
 */
type CharacterCurrency = {
    __typename?: 'Currency';
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
};

/**
 * Base generated character result from the current-user query.
 */
type BaseCharacter = CurrentUserCharactersQuery['currentUserCharacters'][number];
/**
 * Non-nullable stats row from the generated character result.
 */
type BaseCharacterStats = NonNullable<BaseCharacter['stats']>;

/**
 * Character query shape with explicit fields used by the character sheet UI.
 */
type CharacterWithSpells = Omit<BaseCharacter, 'stats'> & {
    background: string;
    spellcastingAbility?: string | null;
    spellSaveDC?: number | null;
    spellAttackBonus?: number | null;
    spellSlots: CharacterSpellSlot[];
    spellbook: CharacterSpellbookEntry[];
    attacks: CharacterAttack[];
    inventory: CharacterInventoryItem[];
    features: CharacterFeature[];
    stats?: (BaseCharacterStats & {
        traits: CharacterTraits;
        currency: CharacterCurrency;
    }) | null;
};

/**
 * Query result shape for current user characters with nested sheet data.
 */
type CurrentUserCharactersWithSpellsQuery = {
    currentUserCharacters: CharacterWithSpells[];
};

/**
 * Mutation payload for toggling a spell slot.
 */
type ToggleSpellSlotMutationData = {
    toggleSpellSlot: CharacterSpellSlot;
};

/**
 * Variables for toggling one spell-slot level.
 */
type ToggleSpellSlotMutationVariables = {
    characterId: string;
    level: number;
};

/**
 * Shared variables for prepare/unprepare spell mutations.
 */
type SpellPreparedMutationVariables = {
    characterId: string;
    spellId: string;
};

/**
 * Mutation payload when marking a spell as prepared.
 */
type PrepareSpellMutationData = {
    prepareSpell: {
        __typename: 'CharacterSpell';
        prepared: boolean;
        spell: {
            __typename: 'Spell';
            id: string;
        };
    };
};

/**
 * Mutation payload when marking a spell as unprepared.
 */
type UnprepareSpellMutationData = {
    unprepareSpell: {
        __typename: 'CharacterSpell';
        prepared: boolean;
        spell: {
            __typename: 'Spell';
            id: string;
        };
    };
};

/**
 * Applies an optimistic spell slot usage value to the current character cache.
 */
type CharacterCacheUpdater = (character: CharacterWithSpells) => CharacterWithSpells;

/**
 * Updates a single character entry in the current-user cache.
 */
function updateCharacterInCache(
    cache: ApolloCache,
    characterId: string,
    updateCharacter: CharacterCacheUpdater,
) {
    cache.updateQuery<CurrentUserCharactersWithSpellsQuery>(
        { query: GET_CURRENT_USER_CHARACTERS },
        (data: CurrentUserCharactersWithSpellsQuery | null) => {
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
        spellSlots: currentCharacter.spellSlots.map((slot: CharacterSpellSlot) => {
            if (slot.level !== level) return slot;
            return { ...slot, used };
        }),
    }));
}

/**
 * Applies an optimistic prepared flag to one spellbook entry in cache.
 */
function updateSpellPreparedInCache(
    cache: ApolloCache,
    characterId: string,
    spellId: string,
    prepared: boolean,
) {
    updateCharacterInCache(cache, characterId, (currentCharacter: CharacterWithSpells) => ({
        ...currentCharacter,
        spellbook: currentCharacter.spellbook.map((entry: CharacterSpellbookEntry) => {
            if (entry.spell.id !== spellId) return entry;
            return { ...entry, prepared };
        }),
    }));
}

/**
 * Loads character-sheet data and exposes optimistic mutation handlers.
 */
export default function useCharacterSheetData(characterId: string) {
    const { data, loading, error } = useQuery<CurrentUserCharactersWithSpellsQuery>(
        GET_CURRENT_USER_CHARACTERS,
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
        UpdateSkillProficienciesMutationData,
        UpdateSkillProficienciesMutationVariables
    >(UPDATE_SKILL_PROFICIENCIES);

    const [toggleSpellSlot] = useMutation<
        ToggleSpellSlotMutationData,
        ToggleSpellSlotMutationVariables
    >(TOGGLE_SPELL_SLOT);

    const [prepareSpell] = useMutation<
        PrepareSpellMutationData,
        SpellPreparedMutationVariables
    >(PREPARE_SPELL);

    const [unprepareSpell] = useMutation<
        UnprepareSpellMutationData,
        SpellPreparedMutationVariables
    >(UNPREPARE_SPELL);

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

    return {
        character,
        loading,
        error,
        isUnauthenticated: isUnauthenticatedError(error),
        handleToggleInspiration,
        handleUpdateDeathSaves,
        handleUpdateSkillProficiency,
        handleToggleSpellSlot,
        handleSetSpellPrepared,
    };
}
