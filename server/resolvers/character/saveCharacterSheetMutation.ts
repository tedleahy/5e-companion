import type { Prisma } from "@prisma/client";
import type { Context } from "../..";
import type {
    MutationSaveCharacterSheetArgs,
    SaveCharacterSheetFeatureInput,
    SaveCharacterSheetInventoryItemInput,
    SaveCharacterSheetWeaponInput,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter } from "./helpers";
import { reconcileCharacterSheetCollection } from "./reconcileSheetCollection";

/**
 * Writes the full editable character sheet in one atomic transaction.
 */
export async function saveCharacterSheet(
    _parent: unknown,
    { characterId, input }: MutationSaveCharacterSheetArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.$transaction(async (tx) => {
        const updatedCharacter = await tx.character.update({
            where: { id: characterId },
            data: {
                ac: input.ac,
                speed: input.speed,
                initiative: input.initiative,
                conditions: input.conditions,
            },
        });

        const stats = await tx.characterStats.findUnique({
            where: { characterId },
        });

        if (!stats) throw new Error('Character stats not found.');

        await tx.characterStats.update({
            where: { id: stats.id },
            data: {
                hp: input.hp,
                abilityScores: input.abilityScores,
                currency: input.currency,
                traits: input.traits,
            },
        });

        await reconcileWeapons(tx, characterId, input.weapons);
        await reconcileInventory(tx, characterId, input.inventory);
        await reconcileFeatures(tx, characterId, input.features);

        return updatedCharacter;
    });
}

/**
 * Reconciles the persisted weapon rows against the submitted sheet payload.
 */
async function reconcileWeapons(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextWeapons: SaveCharacterSheetWeaponInput[],
) {
    await reconcileCharacterSheetCollection({
        delegate: tx.weapon,
        characterId,
        nextItems: nextWeapons,
        notFoundMessage: 'Weapon not found.',
        buildUpdateData(weapon) {
            return {
                name: weapon.name,
                attackBonus: weapon.attackBonus,
                damage: weapon.damage,
                type: weapon.type,
            };
        },
        buildCreateData(weapon, currentCharacterId) {
            return {
                characterId: currentCharacterId,
                name: weapon.name,
                attackBonus: weapon.attackBonus,
                damage: weapon.damage,
                type: weapon.type,
            };
        },
    });
}

/**
 * Reconciles the persisted inventory rows against the submitted sheet payload.
 */
async function reconcileInventory(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextInventory: SaveCharacterSheetInventoryItemInput[],
) {
    await reconcileCharacterSheetCollection({
        delegate: tx.inventoryItem,
        characterId,
        nextItems: nextInventory,
        notFoundMessage: 'Inventory item not found.',
        buildUpdateData(item) {
            return {
                name: item.name,
                quantity: item.quantity,
                weight: item.weight ?? null,
                description: item.description ?? null,
                equipped: item.equipped,
                magical: item.magical,
            };
        },
        buildCreateData(item, currentCharacterId) {
            return {
                characterId: currentCharacterId,
                name: item.name,
                quantity: item.quantity,
                weight: item.weight ?? null,
                description: item.description ?? null,
                equipped: item.equipped,
                magical: item.magical,
            };
        },
    });
}

/**
 * Reconciles the persisted feature rows against the submitted sheet payload.
 */
async function reconcileFeatures(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextFeatures: SaveCharacterSheetFeatureInput[],
) {
    await reconcileCharacterSheetCollection({
        delegate: tx.characterFeature,
        characterId,
        nextItems: nextFeatures,
        notFoundMessage: 'Feature not found.',
        buildUpdateData(feature) {
            return {
                name: feature.name,
                source: feature.source,
                description: feature.description,
                usesMax: feature.usesMax ?? null,
                usesRemaining: feature.usesRemaining ?? null,
                recharge: feature.recharge ?? null,
            };
        },
        buildCreateData(feature, currentCharacterId) {
            return {
                characterId: currentCharacterId,
                name: feature.name,
                source: feature.source,
                description: feature.description,
                usesMax: feature.usesMax ?? null,
                usesRemaining: feature.usesRemaining ?? null,
                recharge: feature.recharge ?? null,
            };
        },
    });
}
