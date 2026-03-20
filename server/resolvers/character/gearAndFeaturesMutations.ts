import type { Context } from "../..";
import type {
    MutationUpdateInventoryItemArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter, stripNullishFields } from "./helpers";

/**
 * Updates an inventory item for an owned character.
 */
export async function updateInventoryItem(
    _parent: unknown,
    { characterId, itemId, input }: MutationUpdateInventoryItemArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.inventoryItem.updateMany({
        where: { id: itemId, characterId },
        data: { ...stripNullishFields(input) } as any,
    });

    if (result.count === 0) throw new Error('Inventory item not found.');

    const inventoryItem = await prisma.inventoryItem.findUnique({ where: { id: itemId } });

    if (!inventoryItem) {
        throw new Error('Inventory item not found after update.');
    }

    return inventoryItem;
}
