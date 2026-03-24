import { beforeEach, describe, expect, test } from 'bun:test';
import {
    characterClassFindManyMock,
    characterFeatureFindManyMock,
    characterSpellFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    fakeCharacterClasses,
    fakeCharacterDetail,
    fakeHitDicePools,
    fakeStats,
    hitDicePoolFindManyMock,
    inventoryItemFindManyMock,
    resolvers,
    spellSlotFindManyMock,
    statsFindUniqueMock,
    weaponFindManyMock,
} from './characterResolvers.testUtils';

describe('characterResolvers — field resolvers', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('characterLevel derives total level from preloaded classes', async () => {
        const result = await resolvers.characterLevel(fakeCharacterDetail as any);

        expect(result).toBe(12);
        expect(characterClassFindManyMock).not.toHaveBeenCalled();
    });

    test('characterProficiencyBonus derives from class levels', async () => {
        const result = await resolvers.characterProficiencyBonus(fakeCharacterDetail as any);

        expect(result).toBe(4);
    });

    test('characterClasses returns preloaded class rows without querying Prisma', async () => {
        const result = await resolvers.characterClasses(fakeCharacterDetail as any);

        expect(result).toEqual([
            {
                id: 'char-class-1',
                classId: 'wizard',
                className: 'Wizard',
                subclassId: 'evocation',
                subclassName: 'Evocation',
                level: 9,
                isStartingClass: true,
            },
            {
                id: 'char-class-2',
                classId: 'warlock',
                className: 'Warlock',
                subclassId: 'fiend',
                subclassName: 'Fiend',
                level: 3,
                isStartingClass: false,
            },
        ]);
        expect(characterClassFindManyMock).not.toHaveBeenCalled();
    });

    test('characterSpellcastingProfiles derives one profile per spellcasting class', async () => {
        const result = await resolvers.characterSpellcastingProfiles(fakeCharacterDetail as any);

        expect(result).toEqual([
            {
                classId: 'wizard',
                className: 'Wizard',
                subclassId: 'evocation',
                subclassName: 'Evocation',
                classLevel: 9,
                spellcastingAbility: 'intelligence',
                spellSaveDC: 17,
                spellAttackBonus: 9,
                slotKind: 'STANDARD',
            },
            {
                classId: 'warlock',
                className: 'Warlock',
                subclassId: 'fiend',
                subclassName: 'Fiend',
                classLevel: 3,
                spellcastingAbility: 'charisma',
                spellSaveDC: 12,
                spellAttackBonus: 4,
                slotKind: 'PACT_MAGIC',
            },
        ]);
    });

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

    test('characterStatsHitDicePools returns ordered class pools', async () => {
        characterClassFindManyMock.mockResolvedValueOnce([
            { classId: 'class-wizard-id', level: 9, isStartingClass: true, classRef: { name: 'Wizard' } },
            { classId: 'class-warlock-id', level: 3, isStartingClass: false, classRef: { name: 'Warlock' } },
        ]);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);

        const result = await resolvers.characterStatsHitDicePools(fakeStats as any);

        expect(result).toEqual([
            {
                id: 'hd-1',
                classId: 'wizard',
                className: 'Wizard',
                total: 9,
                remaining: 7,
                die: 'd6',
            },
            {
                id: 'hd-2',
                classId: 'warlock',
                className: 'Warlock',
                total: 3,
                remaining: 2,
                die: 'd8',
            },
        ]);
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

    test('characterSpellSlots sorts preloaded slots by kind then level', async () => {
        const result = await resolvers.characterSpellSlots(fakeCharacterDetail as any);

        expect(result).toEqual([
            fakeCharacterDetail.spellSlots[0],
            fakeCharacterDetail.spellSlots[1],
        ]);
        expect(spellSlotFindManyMock).not.toHaveBeenCalled();
    });

    test('characterSpellSlots loads and sorts slots when not preloaded', async () => {
        spellSlotFindManyMock.mockResolvedValueOnce([
            { id: 'slot-2', characterId: 'char-1', kind: 'PACT_MAGIC', level: 2, total: 2, used: 0 },
            { id: 'slot-1', characterId: 'char-1', kind: 'STANDARD', level: 1, total: 4, used: 1 },
        ]);

        const result = await resolvers.characterSpellSlots(fakeCharacter as any);

        expect(spellSlotFindManyMock).toHaveBeenCalledTimes(1);
        const args = spellSlotFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual([
            { id: 'slot-1', characterId: 'char-1', kind: 'STANDARD', level: 1, total: 4, used: 1 },
            { id: 'slot-2', characterId: 'char-1', kind: 'PACT_MAGIC', level: 2, total: 2, used: 0 },
        ]);
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
