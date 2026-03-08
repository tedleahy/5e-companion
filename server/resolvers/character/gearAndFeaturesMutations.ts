import type { Context } from "../..";
import type {
    MutationAddAttackArgs,
    MutationAddFeatureArgs,
    MutationAddInventoryItemArgs,
    MutationRemoveAttackArgs,
    MutationRemoveFeatureArgs,
    MutationRemoveInventoryItemArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter, stripNullishFields } from "./helpers";

/**
 * Mutation argument shape for adding a weapon alias.
 */
type AddWeaponArgs = {
    characterId: string;
    input: MutationAddAttackArgs['input'];
};

/**
 * Mutation argument shape for removing a weapon alias.
 */
type RemoveWeaponArgs = {
    characterId: string;
    weaponId: string;
};

/**
 * Mutation argument shape for updating a weapon row.
 */
type UpdateWeaponArgs = {
    characterId: string;
    weaponId: string;
    input: MutationAddAttackArgs['input'];
};

/**
 * Mutation argument shape for updating an inventory item row.
 */
type UpdateInventoryItemArgs = {
    characterId: string;
    itemId: string;
    input: MutationAddInventoryItemArgs['input'];
};

/**
 * Mutation argument shape for updating a feature row.
 */
type UpdateFeatureArgs = {
    characterId: string;
    featureId: string;
    input: MutationAddFeatureArgs['input'];
};

/**
 * Adds an attack row to an owned character.
 */
export async function addAttack(
    _parent: unknown,
    { characterId, input }: MutationAddAttackArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.attack.create({
        data: { characterId, ...input },
    });
}

/**
 * Adds a weapon row to an owned character.
 */
export async function addWeapon(
    _parent: unknown,
    { characterId, input }: AddWeaponArgs,
    ctx: Context,
) {
    return await addAttack(_parent, { characterId, input }, ctx);
}

/**
 * Removes an attack row from an owned character.
 */
export async function removeAttack(
    _parent: unknown,
    { characterId, attackId }: MutationRemoveAttackArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.attack.deleteMany({
        where: { id: attackId, characterId },
    });

    if (result.count === 0) throw new Error('Attack not found.');

    return true;
}

/**
 * Removes a weapon row from an owned character.
 */
export async function removeWeapon(
    _parent: unknown,
    { characterId, weaponId }: RemoveWeaponArgs,
    ctx: Context,
) {
    return await removeAttack(_parent, { characterId, attackId: weaponId }, ctx);
}

/**
 * Updates a weapon row for an owned character.
 */
export async function updateWeapon(
    _parent: unknown,
    { characterId, weaponId, input }: UpdateWeaponArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.attack.updateMany({
        where: { id: weaponId, characterId },
        data: { ...input },
    });

    if (result.count === 0) throw new Error('Weapon not found.');

    return await prisma.attack.findUnique({ where: { id: weaponId } });
}

/**
 * Adds an inventory item to an owned character.
 */
export async function addInventoryItem(
    _parent: unknown,
    { characterId, input }: MutationAddInventoryItemArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const data = { characterId, ...stripNullishFields(input) };

    return await prisma.inventoryItem.create({ data: data as any });
}

/**
 * Updates an inventory item for an owned character.
 */
export async function updateInventoryItem(
    _parent: unknown,
    { characterId, itemId, input }: UpdateInventoryItemArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.inventoryItem.updateMany({
        where: { id: itemId, characterId },
        data: { ...stripNullishFields(input) } as any,
    });

    if (result.count === 0) throw new Error('Inventory item not found.');

    return await prisma.inventoryItem.findUnique({ where: { id: itemId } });
}

/**
 * Removes an inventory item from an owned character.
 */
export async function removeInventoryItem(
    _parent: unknown,
    { characterId, itemId }: MutationRemoveInventoryItemArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.inventoryItem.deleteMany({
        where: { id: itemId, characterId },
    });

    if (result.count === 0) throw new Error('Inventory item not found.');

    return true;
}

/**
 * Adds a feature row to an owned character.
 */
export async function addFeature(
    _parent: unknown,
    { characterId, input }: MutationAddFeatureArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterFeature.create({
        data: { characterId, ...input },
    });
}

/**
 * Updates a feature row for an owned character.
 */
export async function updateFeature(
    _parent: unknown,
    { characterId, featureId, input }: UpdateFeatureArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.characterFeature.updateMany({
        where: { id: featureId, characterId },
        data: { ...input },
    });

    if (result.count === 0) throw new Error('Feature not found.');

    return await prisma.characterFeature.findUnique({ where: { id: featureId } });
}

/**
 * Removes a feature row from an owned character.
 */
export async function removeFeature(
    _parent: unknown,
    { characterId, featureId }: MutationRemoveFeatureArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.characterFeature.deleteMany({
        where: { id: featureId, characterId },
    });

    if (result.count === 0) throw new Error('Feature not found.');

    return true;
}
