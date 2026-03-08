import { beforeEach, describe, expect, test } from 'bun:test';
import {
    attackFindManyMock,
    characterFeatureFindManyMock,
    characterSpellFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    fakeStats,
    inventoryItemFindManyMock,
    resolvers,
    spellSlotFindManyMock,
    statsFindUniqueMock,
} from './characterResolvers.testUtils';

describe('characterResolvers — field resolvers', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('characterStats calls findUnique with characterId', async () => {
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);

        const result = await resolvers.characterStats(fakeCharacter as any);

        expect(statsFindUniqueMock).toHaveBeenCalledTimes(1);
        const args = statsFindUniqueMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeStats);
    });

    test('characterAttacks calls attack.findMany with characterId', async () => {
        const fakeAttacks = [{ id: 'atk-1', name: 'Dagger' }];
        attackFindManyMock.mockResolvedValueOnce(fakeAttacks);

        const result = await resolvers.characterAttacks(fakeCharacter as any);

        expect(attackFindManyMock).toHaveBeenCalledTimes(1);
        const args = attackFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeAttacks);
    });

    test('characterWeapons calls attack.findMany with characterId', async () => {
        const fakeWeapons = [{ id: 'atk-2', name: 'Longsword' }];
        attackFindManyMock.mockResolvedValueOnce(fakeWeapons);

        const result = await resolvers.characterWeapons(fakeCharacter as any);

        expect(attackFindManyMock).toHaveBeenCalledTimes(1);
        const args = attackFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeWeapons);
    });

    test('characterInventory calls inventoryItem.findMany with characterId', async () => {
        inventoryItemFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterInventory(fakeCharacter as any);

        const args = inventoryItemFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
    });

    test('characterFeatures calls characterFeature.findMany with characterId', async () => {
        characterFeatureFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterFeatures(fakeCharacter as any);

        const args = characterFeatureFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
    });

    test('characterSpellSlots calls spellSlot.findMany ordered by level', async () => {
        spellSlotFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterSpellSlots(fakeCharacter as any);

        const args = spellSlotFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.orderBy).toEqual({ level: 'asc' });
    });

    test('characterSpellbook calls findMany with include spell', async () => {
        characterSpellFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterSpellbook(fakeCharacter as any);

        const args = characterSpellFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.include).toEqual({ spell: true });
    });
});
