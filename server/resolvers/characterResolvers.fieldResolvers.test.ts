import { beforeEach, describe, expect, test } from 'bun:test';
import {
    characterFeatureFindManyMock,
    characterSpellFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    fakeCharacterDetail,
    fakeStats,
    inventoryItemFindManyMock,
    resolvers,
    spellSlotFindManyMock,
    statsFindUniqueMock,
    weaponFindManyMock,
} from './characterResolvers.testUtils';

describe('characterResolvers — field resolvers', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('characterStats returns preloaded stats without querying Prisma', async () => {
        const result = await resolvers.characterStats(fakeCharacterDetail as any);

        expect(statsFindUniqueMock).not.toHaveBeenCalled();
        expect(result).toEqual(fakeCharacterDetail.stats);
    });

    test('characterStats calls findUnique with characterId', async () => {
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);

        const result = await resolvers.characterStats(fakeCharacter as any);

        expect(statsFindUniqueMock).toHaveBeenCalledTimes(1);
        const args = statsFindUniqueMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeStats);
    });

    test('characterWeapons returns preloaded weapons without querying Prisma', async () => {
        const result = await resolvers.characterWeapons(fakeCharacterDetail as any);

        expect(weaponFindManyMock).not.toHaveBeenCalled();
        expect(result).toEqual(fakeCharacterDetail.weapons);
    });

    test('characterWeapons calls weapon.findMany with characterId', async () => {
        const fakeWeapons = [{ id: 'atk-2', name: 'Longsword' }];
        weaponFindManyMock.mockResolvedValueOnce(fakeWeapons);

        const result = await resolvers.characterWeapons(fakeCharacter as any);

        expect(weaponFindManyMock).toHaveBeenCalledTimes(1);
        const args = weaponFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeWeapons);
    });

    test('characterInventory returns preloaded inventory without querying Prisma', async () => {
        const result = await resolvers.characterInventory(fakeCharacterDetail as any);

        expect(inventoryItemFindManyMock).not.toHaveBeenCalled();
        expect(result).toEqual(fakeCharacterDetail.inventory);
    });

    test('characterInventory calls inventoryItem.findMany with characterId', async () => {
        inventoryItemFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterInventory(fakeCharacter as any);

        const args = inventoryItemFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
    });

    test('characterFeatures returns preloaded features without querying Prisma', async () => {
        const result = await resolvers.characterFeatures(fakeCharacterDetail as any);

        expect(characterFeatureFindManyMock).not.toHaveBeenCalled();
        expect(result).toEqual(fakeCharacterDetail.features);
    });

    test('characterFeatures calls characterFeature.findMany with characterId', async () => {
        characterFeatureFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterFeatures(fakeCharacter as any);

        const args = characterFeatureFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
    });

    test('characterSpellSlots returns preloaded spell slots without querying Prisma', async () => {
        const result = await resolvers.characterSpellSlots(fakeCharacterDetail as any);

        expect(spellSlotFindManyMock).not.toHaveBeenCalled();
        expect(result).toEqual(fakeCharacterDetail.spellSlots);
    });

    test('characterSpellSlots calls spellSlot.findMany ordered by level', async () => {
        spellSlotFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterSpellSlots(fakeCharacter as any);

        const args = spellSlotFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.orderBy).toEqual({ level: 'asc' });
    });

    test('characterSpellbook returns preloaded spellbook without querying Prisma', async () => {
        const result = await resolvers.characterSpellbook(fakeCharacterDetail as any);

        expect(characterSpellFindManyMock).not.toHaveBeenCalled();
        expect(result).toEqual(fakeCharacterDetail.spellbook);
    });

    test('characterSpellbook calls findMany with include spell', async () => {
        characterSpellFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterSpellbook(fakeCharacter as any);

        const args = characterSpellFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.include).toEqual({ spell: true });
    });
});
