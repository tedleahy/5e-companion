import type { Context } from "../..";
import type {
    MutationAddInventoryItemArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter, stripNullishFields } from "./helpers";

/**
 * Mutation argument shape for updating an inventory item row.
 */
type UpdateInventoryItemArgs = {
    characterId: string;
    itemId: string;
    input: MutationAddInventoryItemArgs['input'];
};

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
