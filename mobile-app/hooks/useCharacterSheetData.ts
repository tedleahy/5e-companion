import { useCallback } from 'react';
import { deriveSpellcastingStats } from '@/lib/characterSheetUtils';
import type { ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import type {
    AbilityScoresInput,
    AttackInput,
    CharacterSpell,
    CurrencyInput,
    FeatureInput,
    HpInput,
    InventoryItemInput,
    MutationAddFeatureArgs,
    MutationForgetSpellArgs,
    MutationAddInventoryItemArgs,
    MutationLearnSpellArgs,
    MutationAddWeaponArgs,
    MutationRemoveFeatureArgs,
    MutationRemoveInventoryItemArgs,
    MutationRemoveWeaponArgs,
    MutationUpdateAbilityScoresArgs,
    MutationUpdateCharacterArgs,
    MutationUpdateCurrencyArgs,
    MutationUpdateFeatureArgs,
    MutationUpdateHpArgs,
    MutationUpdateInventoryItemArgs,
    MutationUpdateTraitsArgs,
    MutationUpdateWeaponArgs,
    Query,
    TraitsInput,
    ProficiencyLevel,
    SkillProficiencies,
    SkillProficienciesInput,
    SpellSlot,
    SavingThrowProficienciesInput,
} from '@/types/generated_graphql_types';
import {
    ADD_FEATURE,
    FORGET_SPELL,
    ADD_INVENTORY_ITEM,
    ADD_WEAPON,
    GET_CURRENT_USER_CHARACTERS,
    LEARN_SPELL,
    PREPARE_SPELL,
    REMOVE_FEATURE,
    REMOVE_INVENTORY_ITEM,
    REMOVE_WEAPON,
    TOGGLE_INSPIRATION,
    TOGGLE_SPELL_SLOT,
    UNPREPARE_SPELL,
    UPDATE_ABILITY_SCORES,
    UPDATE_CHARACTER,
    UPDATE_CURRENCY,
    UPDATE_DEATH_SAVES,
    UPDATE_FEATURE,
    UPDATE_HP,
    UPDATE_INVENTORY_ITEM,
    UPDATE_SAVING_THROW_PROFICIENCIES,
    UPDATE_SKILL_PROFICIENCIES,
    UPDATE_TRAITS,
    UPDATE_WEAPON,
} from '@/graphql/characterSheet.operations';
import {
    addSpellToSpellbookInCache,
    removeSpellFromSpellbookInCache,
    updateSpellPreparedInCache,
} from '@/hooks/cache/spellbookCache';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type { AbilityKey, SkillKey } from '@/lib/characterSheetUtils';

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
 * Mutation payload for optimistic saving throw proficiency updates.
 */
type UpdateSavingThrowProficienciesMutationData = {
    updateSavingThrowProficiencies: {
        __typename: 'CharacterStats';
        id: string;
        savingThrowProficiencies: string[];
    };
};

/**
 * Mutation payload when toggling inspiration.
 */
type ToggleInspirationMutationData = {
    toggleInspiration: {
        __typename: 'Character';
        id: string;
        inspiration: boolean;
    };
};

/**
 * Variables for inspiration toggle mutation.
 */
type ToggleInspirationMutationVariables = {
    characterId: string;
};

/**
 * Mutation payload for death-save updates.
 */
type UpdateDeathSavesMutationData = {
    updateDeathSaves: {
        __typename: 'CharacterStats';
        id: string;
        deathSaves: {
            __typename: 'DeathSaves';
            successes: number;
            failures: number;
        };
    };
};

/**
 * Variables for updating death saves.
 */
type UpdateDeathSavesMutationVariables = {
    characterId: string;
    input: {
        successes: number;
        failures: number;
    };
};

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
    weapons: CharacterAttack[];
    inventory: CharacterInventoryItem[];
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
 * Maps a weapon row into the GraphQL attack input shape.
 */
function weaponInput(weapon: CharacterAttack): AttackInput {
    return {
        name: weapon.name,
        attackBonus: weapon.attackBonus,
        damage: weapon.damage,
        type: weapon.type,
    };
}

/**
 * Maps an inventory row into the GraphQL input shape.
 */
function inventoryItemInput(item: CharacterInventoryItem): InventoryItemInput {
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
 * Maps a feature row into the GraphQL input shape.
 */
function featureInput(feature: CharacterFeature): FeatureInput {
    return {
        name: feature.name,
        source: feature.source,
        description: feature.description,
        recharge: feature.recharge ?? undefined,
        usesMax: feature.usesMax ?? undefined,
        usesRemaining: feature.usesRemaining ?? undefined,
    };
}

/**
 * Compares two weapon rows for persisted-field changes.
 */
function hasWeaponChanged(previousWeapon: CharacterAttack, nextWeapon: CharacterAttack): boolean {
    return previousWeapon.name !== nextWeapon.name
        || previousWeapon.attackBonus !== nextWeapon.attackBonus
        || previousWeapon.damage !== nextWeapon.damage
        || previousWeapon.type !== nextWeapon.type;
}

/**
 * Compares two inventory rows for persisted-field changes.
 */
function hasInventoryItemChanged(previousItem: CharacterInventoryItem, nextItem: CharacterInventoryItem): boolean {
    return previousItem.name !== nextItem.name
        || previousItem.quantity !== nextItem.quantity
        || previousItem.weight !== nextItem.weight
        || previousItem.description !== nextItem.description
        || previousItem.equipped !== nextItem.equipped
        || previousItem.magical !== nextItem.magical;
}

/**
 * Compares two feature rows for persisted-field changes.
 */
function hasFeatureChanged(previousFeature: CharacterFeature, nextFeature: CharacterFeature): boolean {
    return previousFeature.name !== nextFeature.name
        || previousFeature.source !== nextFeature.source
        || previousFeature.description !== nextFeature.description
        || previousFeature.recharge !== nextFeature.recharge
        || previousFeature.usesMax !== nextFeature.usesMax
        || previousFeature.usesRemaining !== nextFeature.usesRemaining;
}

/**
 * Variables for updating a character's skill proficiencies.
 */
type UpdateSkillProficienciesMutationVariables = {
    characterId: string;
    input: SkillProficienciesInput;
};

/**
 * Variables for updating saving throw proficiencies.
 */
type UpdateSavingThrowProficienciesMutationVariables = {
    characterId: string;
    input: SavingThrowProficienciesInput;
};

/**
 * Spell slot shape used by cache update helpers.
 */
type CharacterSpellSlot = SpellSlot;

/**
 * Spellbook row shape used by cache update helpers.
 */
type CharacterSpellbookEntry = CharacterSpell;

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
type CurrentUserCharactersQuery = Pick<Query, 'currentUserCharacters'>;
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
    weapons: CharacterAttack[];
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
 * Mutation payload when learning a new spell.
 */
type LearnSpellMutationData = {
    learnSpell: {
        __typename: 'CharacterSpell';
        prepared: boolean;
        spell: {
            __typename: 'Spell';
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
};

/**
 * Mutation payload when forgetting an existing spell.
 */
type ForgetSpellMutationData = {
    forgetSpell: boolean;
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
 * Loads character-sheet data and exposes optimistic mutation handlers.
 */
export default function useCharacterSheetData(characterId: string) {
    const { data, loading, error, refetch } = useQuery<CurrentUserCharactersWithSpellsQuery>(
        GET_CURRENT_USER_CHARACTERS,
    );

    const [toggleInspiration] = useMutation<
        ToggleInspirationMutationData,
        ToggleInspirationMutationVariables
    >(TOGGLE_INSPIRATION);

    const [updateDeathSaves] = useMutation<
        UpdateDeathSavesMutationData,
        UpdateDeathSavesMutationVariables
    >(UPDATE_DEATH_SAVES);

    const [updateSkillProficiencies] = useMutation<
        UpdateSkillProficienciesMutationData,
        UpdateSkillProficienciesMutationVariables
    >(UPDATE_SKILL_PROFICIENCIES);

    const [updateSavingThrowProficiencies] = useMutation<
        UpdateSavingThrowProficienciesMutationData,
        UpdateSavingThrowProficienciesMutationVariables
    >(UPDATE_SAVING_THROW_PROFICIENCIES);

    const [toggleSpellSlot] = useMutation<
        ToggleSpellSlotMutationData,
        ToggleSpellSlotMutationVariables
    >(TOGGLE_SPELL_SLOT);

    const [learnSpell] = useMutation<
        LearnSpellMutationData,
        MutationLearnSpellArgs
    >(LEARN_SPELL);

    const [forgetSpell] = useMutation<
        ForgetSpellMutationData,
        MutationForgetSpellArgs
    >(FORGET_SPELL);

    const [prepareSpell] = useMutation<
        PrepareSpellMutationData,
        SpellPreparedMutationVariables
    >(PREPARE_SPELL);

    const [unprepareSpell] = useMutation<
        UnprepareSpellMutationData,
        SpellPreparedMutationVariables
    >(UNPREPARE_SPELL);

    const [updateCharacter] = useMutation<{ updateCharacter: { id: string } }, MutationUpdateCharacterArgs>(
        UPDATE_CHARACTER,
    );

    const [updateHP] = useMutation<{ updateHP: { id: string } }, MutationUpdateHpArgs>(UPDATE_HP);

    const [updateAbilityScores] = useMutation<
        { updateAbilityScores: { id: string } },
        MutationUpdateAbilityScoresArgs
    >(UPDATE_ABILITY_SCORES);

    const [updateCurrency] = useMutation<{ updateCurrency: { id: string } }, MutationUpdateCurrencyArgs>(
        UPDATE_CURRENCY,
    );

    const [updateTraits] = useMutation<{ updateTraits: { id: string } }, MutationUpdateTraitsArgs>(
        UPDATE_TRAITS,
    );

    const [addWeapon] = useMutation<{ addWeapon: { id: string } }, MutationAddWeaponArgs>(ADD_WEAPON);
    const [updateWeapon] = useMutation<{ updateWeapon: { id: string } }, MutationUpdateWeaponArgs>(UPDATE_WEAPON);
    const [removeWeapon] = useMutation<{ removeWeapon: boolean }, MutationRemoveWeaponArgs>(REMOVE_WEAPON);

    const [addInventoryItem] = useMutation<{ addInventoryItem: { id: string } }, MutationAddInventoryItemArgs>(
        ADD_INVENTORY_ITEM,
    );
    const [updateInventoryItem] = useMutation<
        { updateInventoryItem: { id: string } },
        MutationUpdateInventoryItemArgs
    >(UPDATE_INVENTORY_ITEM);
    const [removeInventoryItem] = useMutation<
        { removeInventoryItem: boolean },
        MutationRemoveInventoryItemArgs
    >(REMOVE_INVENTORY_ITEM);

    const [addFeature] = useMutation<{ addFeature: { id: string } }, MutationAddFeatureArgs>(ADD_FEATURE);
    const [updateFeature] = useMutation<{ updateFeature: { id: string } }, MutationUpdateFeatureArgs>(UPDATE_FEATURE);
    const [removeFeature] = useMutation<{ removeFeature: boolean }, MutationRemoveFeatureArgs>(REMOVE_FEATURE);

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
        if (!character || !character.stats) return;

        const originalWeaponsById = new Map(character.weapons.map((weapon) => [weapon.id, weapon]));
        const originalInventoryById = new Map(character.inventory.map((item) => [item.id, item]));
        const originalFeaturesById = new Map(character.features.map((feature) => [feature.id, feature]));
        const nextWeaponIds = new Set(input.weapons.filter((weapon) => !isDraftEntityId(weapon.id)).map((weapon) => weapon.id));
        const nextInventoryIds = new Set(input.inventory.filter((item) => !isDraftEntityId(item.id)).map((item) => item.id));
        const nextFeatureIds = new Set(input.features.filter((feature) => !isDraftEntityId(feature.id)).map((feature) => feature.id));

        await Promise.all([
            updateCharacter({
                variables: {
                    id: character.id,
                    input: {
                        ac: input.ac,
                        speed: input.speed,
                        initiative: input.initiative,
                        conditions: input.conditions,
                        ...(input.spellSaveDC != null && { spellSaveDC: input.spellSaveDC }),
                        ...(input.spellAttackBonus != null && { spellAttackBonus: input.spellAttackBonus }),
                    },
                },
            }),
            updateHP({
                variables: {
                    characterId: character.id,
                    input: input.hp,
                },
            }),
            updateAbilityScores({
                variables: {
                    characterId: character.id,
                    input: input.abilityScores,
                },
            }),
            updateCurrency({
                variables: {
                    characterId: character.id,
                    input: input.currency,
                },
            }),
            updateTraits({
                variables: {
                    characterId: character.id,
                    input: input.traits,
                },
            }),
            ...character.weapons
                .filter((weapon) => !nextWeaponIds.has(weapon.id))
                .map((weapon) => removeWeapon({
                    variables: {
                        characterId: character.id,
                        weaponId: weapon.id,
                    },
                })),
            ...input.weapons.map((weapon) => {
                if (isDraftEntityId(weapon.id)) {
                    return addWeapon({
                        variables: {
                            characterId: character.id,
                            input: weaponInput(weapon),
                        },
                    });
                }

                const existingWeapon = originalWeaponsById.get(weapon.id);
                if (!existingWeapon || !hasWeaponChanged(existingWeapon, weapon)) {
                    return Promise.resolve();
                }

                return updateWeapon({
                    variables: {
                        characterId: character.id,
                        weaponId: weapon.id,
                        input: weaponInput(weapon),
                    },
                });
            }),
            ...character.inventory
                .filter((item) => !nextInventoryIds.has(item.id))
                .map((item) => removeInventoryItem({
                    variables: {
                        characterId: character.id,
                        itemId: item.id,
                    },
                })),
            ...input.inventory.map((item) => {
                if (isDraftEntityId(item.id)) {
                    return addInventoryItem({
                        variables: {
                            characterId: character.id,
                            input: inventoryItemInput(item),
                        },
                    });
                }

                const existingItem = originalInventoryById.get(item.id);
                if (!existingItem || !hasInventoryItemChanged(existingItem, item)) {
                    return Promise.resolve();
                }

                return updateInventoryItem({
                    variables: {
                        characterId: character.id,
                        itemId: item.id,
                        input: inventoryItemInput(item),
                    },
                });
            }),
            ...character.features
                .filter((feature) => !nextFeatureIds.has(feature.id))
                .map((feature) => removeFeature({
                    variables: {
                        characterId: character.id,
                        featureId: feature.id,
                    },
                })),
            ...input.features.map((feature) => {
                if (isDraftEntityId(feature.id)) {
                    return addFeature({
                        variables: {
                            characterId: character.id,
                            input: featureInput(feature),
                        },
                    });
                }

                const existingFeature = originalFeaturesById.get(feature.id);
                if (!existingFeature || !hasFeatureChanged(existingFeature, feature)) {
                    return Promise.resolve();
                }

                return updateFeature({
                    variables: {
                        characterId: character.id,
                        featureId: feature.id,
                        input: featureInput(feature),
                    },
                });
            }),
        ]);

        await refetch();
    }, [
        addFeature,
        addInventoryItem,
        addWeapon,
        character,
        refetch,
        removeFeature,
        removeInventoryItem,
        removeWeapon,
        updateAbilityScores,
        updateCharacter,
        updateCurrency,
        updateFeature,
        updateHP,
        updateInventoryItem,
        updateTraits,
        updateWeapon,
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
