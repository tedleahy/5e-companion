import type { Prisma } from "@prisma/client";
import type { Context } from "../..";
import type {
    MutationSaveCharacterSheetArgs,
    SaveCharacterSheetAttackInput,
    SaveCharacterSheetFeatureInput,
    SaveCharacterSheetInventoryItemInput,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter } from "./helpers";

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
                spellSaveDC: input.spellSaveDC ?? null,
                spellAttackBonus: input.spellAttackBonus ?? null,
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
    nextWeapons: SaveCharacterSheetAttackInput[],
) {
    const existingWeapons = await tx.attack.findMany({
        where: { characterId },
    });
    const existingWeaponIds = new Set(existingWeapons.map((weapon) => weapon.id));
    const submittedWeaponIds = new Set(
        nextWeapons
            .map((weapon) => weapon.id)
            .filter((weaponId): weaponId is string => typeof weaponId === 'string'),
    );

    const removedWeaponIds = existingWeapons
        .filter((weapon) => !submittedWeaponIds.has(weapon.id))
        .map((weapon) => weapon.id);

    if (removedWeaponIds.length > 0) {
        await tx.attack.deleteMany({
            where: {
                characterId,
                id: { in: removedWeaponIds },
            },
        });
    }

    for (const weapon of nextWeapons) {
        const data = {
            name: weapon.name,
            attackBonus: weapon.attackBonus,
            damage: weapon.damage,
            type: weapon.type,
        };

        if (weapon.id) {
            if (!existingWeaponIds.has(weapon.id)) {
                throw new Error('Weapon not found.');
            }

            await tx.attack.update({
                where: { id: weapon.id },
                data,
            });
            continue;
        }

        await tx.attack.create({
            data: {
                characterId,
                ...data,
            },
        });
    }
}

/**
 * Reconciles the persisted inventory rows against the submitted sheet payload.
 */
async function reconcileInventory(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextInventory: SaveCharacterSheetInventoryItemInput[],
) {
    const existingInventory = await tx.inventoryItem.findMany({
        where: { characterId },
    });
    const existingInventoryIds = new Set(existingInventory.map((item) => item.id));
    const submittedInventoryIds = new Set(
        nextInventory
            .map((item) => item.id)
            .filter((itemId): itemId is string => typeof itemId === 'string'),
    );

    const removedInventoryIds = existingInventory
        .filter((item) => !submittedInventoryIds.has(item.id))
        .map((item) => item.id);

    if (removedInventoryIds.length > 0) {
        await tx.inventoryItem.deleteMany({
            where: {
                characterId,
                id: { in: removedInventoryIds },
            },
        });
    }

    for (const item of nextInventory) {
        const data = {
            name: item.name,
            quantity: item.quantity,
            weight: item.weight ?? null,
            description: item.description ?? null,
            equipped: item.equipped,
            magical: item.magical,
        };

        if (item.id) {
            if (!existingInventoryIds.has(item.id)) {
                throw new Error('Inventory item not found.');
            }

            await tx.inventoryItem.update({
                where: { id: item.id },
                data,
            });
            continue;
        }

        await tx.inventoryItem.create({
            data: {
                characterId,
                ...data,
            },
        });
    }
}

/**
 * Reconciles the persisted feature rows against the submitted sheet payload.
 */
async function reconcileFeatures(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextFeatures: SaveCharacterSheetFeatureInput[],
) {
    const existingFeatures = await tx.characterFeature.findMany({
        where: { characterId },
    });
    const existingFeatureIds = new Set(existingFeatures.map((feature) => feature.id));
    const submittedFeatureIds = new Set(
        nextFeatures
            .map((feature) => feature.id)
            .filter((featureId): featureId is string => typeof featureId === 'string'),
    );

    const removedFeatureIds = existingFeatures
        .filter((feature) => !submittedFeatureIds.has(feature.id))
        .map((feature) => feature.id);

    if (removedFeatureIds.length > 0) {
        await tx.characterFeature.deleteMany({
            where: {
                characterId,
                id: { in: removedFeatureIds },
            },
        });
    }

    for (const feature of nextFeatures) {
        const data = {
            name: feature.name,
            source: feature.source,
            description: feature.description,
            usesMax: feature.usesMax ?? null,
            usesRemaining: feature.usesRemaining ?? null,
            recharge: feature.recharge ?? null,
        };

        if (feature.id) {
            if (!existingFeatureIds.has(feature.id)) {
                throw new Error('Feature not found.');
            }

            await tx.characterFeature.update({
                where: { id: feature.id },
                data,
            });
            continue;
        }

        await tx.characterFeature.create({
            data: {
                characterId,
                ...data,
            },
        });
    }
}
