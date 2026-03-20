import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFeatureCreateMock,
    characterFeatureDeleteManyMock,
    characterFeatureFindUniqueMock,
    characterFeatureUpdateManyMock,
    characterFindFirstMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    inventoryItemCreateMock,
    inventoryItemDeleteManyMock,
    inventoryItemFindUniqueMock,
    inventoryItemUpdateManyMock,
    resolvers,
    unauthedCtx,
    weaponCreateMock,
    weaponDeleteManyMock,
    weaponFindUniqueMock,
    weaponUpdateManyMock,
} from './characterResolvers.testUtils';

describe('characterResolvers — addWeapon', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.addWeapon({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates a weapon for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Dagger', attackBonus: '+7', damage: '1d4+3 P', type: 'melee' };
        const created = { id: 'atk-1', characterId: 'char-1', ...input };
        weaponCreateMock.mockResolvedValueOnce(created);

        const result = await resolvers.addWeapon({}, { characterId: 'char-1', input }, authedCtx);

        expect(weaponCreateMock).toHaveBeenCalledTimes(1);
        const args = weaponCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.characterId).toBe('char-1');
        expect(args.data.name).toBe('Dagger');
        expect(result).toEqual(created);
    });
});

describe('characterResolvers — updateWeapon', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateWeapon({}, { characterId: 'char-1', weaponId: 'atk-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('updates a weapon for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Longsword', attackBonus: '+8', damage: '1d8+4 slashing', type: 'melee' };
        const updated = { id: 'atk-1', characterId: 'char-1', ...input };
        weaponUpdateManyMock.mockResolvedValueOnce({ count: 1 });
        weaponFindUniqueMock.mockResolvedValueOnce(updated);

        const result = await resolvers.updateWeapon({}, { characterId: 'char-1', weaponId: 'atk-1', input }, authedCtx);

        expect(weaponUpdateManyMock).toHaveBeenCalledTimes(1);
        const args = weaponUpdateManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'atk-1', characterId: 'char-1' });
        expect(args.data).toEqual({ ...input });
        expect(result).toEqual(updated);
    });

    test('throws when weapon does not belong to character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        weaponUpdateManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.updateWeapon({}, { characterId: 'char-1', weaponId: 'atk-other', input: { name: 'X' } as any }, authedCtx))
            .rejects.toThrow('Weapon not found.');
    });
});

describe('characterResolvers — removeWeapon', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.removeWeapon({}, { characterId: 'char-1', weaponId: 'atk-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the weapon and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        weaponDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.removeWeapon({}, { characterId: 'char-1', weaponId: 'atk-1' }, authedCtx);

        expect(result).toBe(true);
        const args = weaponDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'atk-1', characterId: 'char-1' });
    });

    test('throws when weapon not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        weaponDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.removeWeapon({}, { characterId: 'char-1', weaponId: 'atk-1' }, authedCtx))
            .rejects.toThrow('Weapon not found.');
    });
});

describe('characterResolvers — addInventoryItem', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.addInventoryItem({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates an inventory item for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Rope', quantity: 1 };
        const created = { id: 'item-1', characterId: 'char-1', ...input };
        inventoryItemCreateMock.mockResolvedValueOnce(created);

        const result = await resolvers.addInventoryItem({}, { characterId: 'char-1', input }, authedCtx);

        expect(inventoryItemCreateMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(created);
    });
});

describe('characterResolvers — removeInventoryItem', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.removeInventoryItem({}, { characterId: 'char-1', itemId: 'item-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the item and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        inventoryItemDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.removeInventoryItem({}, { characterId: 'char-1', itemId: 'item-1' }, authedCtx);

        expect(result).toBe(true);
        const args = inventoryItemDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'item-1', characterId: 'char-1' });
    });

    test('throws when item not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        inventoryItemDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.removeInventoryItem({}, { characterId: 'char-1', itemId: 'item-1' }, authedCtx))
            .rejects.toThrow('Inventory item not found.');
    });
});

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

describe('characterResolvers — addFeature', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.addFeature({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates a feature for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover spell slots' };
        const created = { id: 'feat-1', characterId: 'char-1', ...input };
        characterFeatureCreateMock.mockResolvedValueOnce(created);

        const result = await resolvers.addFeature({}, { characterId: 'char-1', input }, authedCtx);

        expect(characterFeatureCreateMock).toHaveBeenCalledTimes(1);
        const args = characterFeatureCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.characterId).toBe('char-1');
        expect(args.data.name).toBe('Arcane Recovery');
        expect(result).toEqual(created);
    });
});

describe('characterResolvers — removeFeature', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.removeFeature({}, { characterId: 'char-1', featureId: 'feat-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the feature and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterFeatureDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.removeFeature({}, { characterId: 'char-1', featureId: 'feat-1' }, authedCtx);

        expect(result).toBe(true);
        const args = characterFeatureDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'feat-1', characterId: 'char-1' });
    });

    test('throws when feature not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterFeatureDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.removeFeature({}, { characterId: 'char-1', featureId: 'feat-1' }, authedCtx))
            .rejects.toThrow('Feature not found.');
    });
});

describe('characterResolvers — updateFeature', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateFeature({}, { characterId: 'char-1', featureId: 'feat-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('updates a feature for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Arcane Recovery', source: 'Wizard 2', description: 'Recover more spell slots', recharge: 'long' };
        const updated = { id: 'feat-1', characterId: 'char-1', usesMax: null, usesRemaining: null, ...input };
        characterFeatureUpdateManyMock.mockResolvedValueOnce({ count: 1 });
        characterFeatureFindUniqueMock.mockResolvedValueOnce(updated);

        const result = await resolvers.updateFeature({}, { characterId: 'char-1', featureId: 'feat-1', input }, authedCtx);

        expect(characterFeatureUpdateManyMock).toHaveBeenCalledTimes(1);
        const args = characterFeatureUpdateManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'feat-1', characterId: 'char-1' });
        expect(args.data).toEqual({ ...input });
        expect(result).toEqual(updated);
    });

    test('throws when feature does not belong to character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterFeatureUpdateManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.updateFeature({}, { characterId: 'char-1', featureId: 'feat-other', input: { name: 'X' } as any }, authedCtx))
            .rejects.toThrow('Feature not found.');
    });
});
