import { useState } from 'react';
import {
    createBlankDraftFeature,
    createBlankDraftInventoryItem,
    createBlankDraftWeapon,
    createCharacterSheetDraft,
    mapCharacterSheetDraftToSaveInput,
    type CharacterSheetDraft,
    type CharacterSheetDraftCurrencyKey,
    type CharacterSheetDraftFeature,
    type CharacterSheetDraftInventoryItem,
    type CharacterSheetDraftTraitTextField,
    type CharacterSheetDraftWeaponField,
    type ProficiencyDraftKey,
} from '@/lib/character-sheet/characterSheetDraft';
import type {
    CharacterSheetDetailQuery,
    SaveCharacterSheetInput,
} from '@/types/generated_graphql_types';
import type { AbilityKey } from '@/lib/characterSheetUtils';

/** Character detail row consumed by the character-sheet draft hook. */
type CharacterSheetDetail = NonNullable<CharacterSheetDetailQuery['character']>;

/**
 * Owns local edit-mode draft state for the character-sheet route.
 */
export default function useCharacterSheetDraft(character: CharacterSheetDetail | null) {
    const [draft, setDraft] = useState<CharacterSheetDraft | null>(null);
    const editMode = draft !== null;

    /**
     * Applies a functional update to the current draft when edit mode is active.
     */
    function updateDraft(updater: (currentDraft: CharacterSheetDraft) => CharacterSheetDraft) {
        setDraft((previousDraft) => {
            if (!previousDraft) return previousDraft;
            return updater(previousDraft);
        });
    }

    /**
     * Starts edit mode by copying the latest character state into a local draft.
     */
    function startEditing() {
        if (!character) return;
        setDraft(createCharacterSheetDraft(character));
    }

    /**
     * Clears the current draft and exits edit mode.
     */
    function clearDraft() {
        setDraft(null);
    }

    /**
     * Builds the save mutation input from the current draft state.
     */
    function buildSaveInput(): SaveCharacterSheetInput | null {
        if (!draft || !character) return null;

        return mapCharacterSheetDraftToSaveInput(
            draft,
            character.spellcastingAbility,
            character.proficiencyBonus,
        );
    }

    /**
     * Updates one draft ability score while preserving the rest.
     */
    function changeAbilityScore(ability: AbilityKey, value: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            abilityScores: {
                ...currentDraft.abilityScores,
                [ability]: value,
            },
        }));
    }

    /**
     * Updates one draft HP field.
     */
    function changeHp(field: keyof CharacterSheetDraft['hp'], value: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            hp: {
                ...currentDraft.hp,
                [field]: value,
            },
        }));
    }

    /**
     * Updates the draft armour class value.
     */
    function changeAc(value: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            ac: value,
        }));
    }

    /**
     * Updates the draft speed value.
     */
    function changeSpeed(value: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            speed: value,
        }));
    }

    /**
     * Updates the draft initiative value.
     */
    function changeInitiative(value: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            initiative: value,
        }));
    }

    /**
     * Updates one draft currency field.
     */
    function changeCurrency(key: CharacterSheetDraftCurrencyKey, value: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            currency: {
                ...currentDraft.currency,
                [key]: value,
            },
        }));
    }

    /**
     * Adds a blank weapon row to the draft.
     */
    function addWeapon() {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            weapons: [...currentDraft.weapons, createBlankDraftWeapon()],
        }));
    }

    /**
     * Updates one editable weapon field.
     */
    function changeWeapon(weaponId: string, field: CharacterSheetDraftWeaponField, value: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            weapons: currentDraft.weapons.map((weapon) => (
                weapon.id === weaponId ? { ...weapon, [field]: value } : weapon
            )),
        }));
    }

    /**
     * Removes one draft weapon row.
     */
    function removeWeapon(weaponId: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            weapons: currentDraft.weapons.filter((weapon) => weapon.id !== weaponId),
        }));
    }

    /**
     * Adds a blank inventory row to the draft.
     */
    function addInventoryItem() {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            inventory: [...currentDraft.inventory, createBlankDraftInventoryItem()],
        }));
    }

    /**
     * Updates one draft inventory row.
     */
    function changeInventoryItem(itemId: string, changes: Partial<CharacterSheetDraftInventoryItem>) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            inventory: currentDraft.inventory.map((item) => (
                item.id === itemId ? { ...item, ...changes } : item
            )),
        }));
    }

    /**
     * Toggles equipped state for one draft inventory row.
     */
    function toggleInventoryEquip(itemId: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            inventory: currentDraft.inventory.map((item) => (
                item.id === itemId ? { ...item, equipped: !item.equipped } : item
            )),
        }));
    }

    /**
     * Removes one draft inventory row.
     */
    function removeInventoryItem(itemId: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            inventory: currentDraft.inventory.filter((item) => item.id !== itemId),
        }));
    }

    /**
     * Adds a blank feature row to the draft.
     */
    function addFeature(source: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            features: [...currentDraft.features, createBlankDraftFeature(source)],
        }));
    }

    /**
     * Updates one editable draft feature field.
     */
    function changeFeature(featureId: string, changes: Partial<CharacterSheetDraftFeature>) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            features: currentDraft.features.map((feature) => (
                feature.id === featureId ? { ...feature, ...changes } : feature
            )),
        }));
    }

    /**
     * Removes one draft feature row.
     */
    function removeFeature(featureId: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            features: currentDraft.features.filter((feature) => feature.id !== featureId),
        }));
    }

    /**
     * Adds a blank tag row to one draft trait list.
     */
    function addTraitTag(key: ProficiencyDraftKey) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            traits: {
                ...currentDraft.traits,
                [key]: [...(currentDraft.traits[key] ?? []), ''],
            },
        }));
    }

    /**
     * Updates one trait tag value by index.
     */
    function changeTraitTag(key: ProficiencyDraftKey, index: number, value: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            traits: {
                ...currentDraft.traits,
                [key]: (currentDraft.traits[key] ?? []).map((entry, entryIndex) => (
                    entryIndex === index ? value : entry
                )),
            },
        }));
    }

    /**
     * Removes one draft trait tag by index.
     */
    function removeTraitTag(key: ProficiencyDraftKey, index: number) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            traits: {
                ...currentDraft.traits,
                [key]: (currentDraft.traits[key] ?? []).filter((_, entryIndex) => entryIndex !== index),
            },
        }));
    }

    /**
     * Updates one draft trait text field.
     */
    function changeTraitText(field: CharacterSheetDraftTraitTextField, value: string) {
        updateDraft((currentDraft) => ({
            ...currentDraft,
            traits: {
                ...currentDraft.traits,
                [field]: value,
            },
        }));
    }

    return {
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
    };
}
