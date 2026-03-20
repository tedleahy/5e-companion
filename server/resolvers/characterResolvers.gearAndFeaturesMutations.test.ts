import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFindFirstMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    inventoryItemFindUniqueMock,
    inventoryItemUpdateManyMock,
    resolvers,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — updateInventoryItem', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateInventoryItem({}, { characterId: 'char-1', itemId: 'item-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('updates an inventory item for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Rope', quantity: 2, equipped: true, description: 'Silken rope' };
        const updated = { id: 'item-1', characterId: 'char-1', magical: false, weight: null, ...input };
        inventoryItemUpdateManyMock.mockResolvedValueOnce({ count: 1 });
        inventoryItemFindUniqueMock.mockResolvedValueOnce(updated);

        const result = await resolvers.updateInventoryItem({}, { characterId: 'char-1', itemId: 'item-1', input }, authedCtx);

        expect(inventoryItemUpdateManyMock).toHaveBeenCalledTimes(1);
        const args = inventoryItemUpdateManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'item-1', characterId: 'char-1' });
        expect(args.data).toEqual({ ...input });
        expect(result).toEqual(updated);
    });

    test('throws when item does not belong to character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        inventoryItemUpdateManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.updateInventoryItem({}, { characterId: 'char-1', itemId: 'item-other', input: { name: 'X' } as any }, authedCtx))
            .rejects.toThrow('Inventory item not found.');
    });
});
