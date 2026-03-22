import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFeatureCreateMock,
    characterFeatureDeleteManyMock,
    characterFeatureFindManyMock,
    characterFeatureUpdateMock,
    characterFindFirstMock,
    characterUpdateMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    fakeStats,
    inventoryItemCreateMock,
    inventoryItemDeleteManyMock,
    inventoryItemFindManyMock,
    inventoryItemUpdateMock,
    resolvers,
    statsFindUniqueMock,
    statsUpdateMock,
    transactionMock,
    unauthedCtx,
    weaponCreateMock,
    weaponDeleteManyMock,
    weaponFindManyMock,
    weaponUpdateMock,
} from './characterResolvers.testUtils';

describe('characterResolvers — saveCharacterSheet', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.saveCharacterSheet({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('saves the full editable sheet inside one transaction', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce({
            ...fakeCharacter,
            ac: 18,
            speed: 30,
            initiative: 4,
            conditions: ['Blessed'],
        });
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats });
        weaponFindManyMock.mockResolvedValueOnce([
            { id: 'attack-1', characterId: 'char-1' },
            { id: 'attack-2', characterId: 'char-1' },
        ]);
        inventoryItemFindManyMock.mockResolvedValueOnce([
            { id: 'item-1', characterId: 'char-1' },
            { id: 'item-2', characterId: 'char-1' },
        ]);
        characterFeatureFindManyMock.mockResolvedValueOnce([
            { id: 'feature-1', characterId: 'char-1' },
            { id: 'feature-2', characterId: 'char-1' },
        ]);
        weaponUpdateMock.mockResolvedValue({ id: 'attack-1' });
        weaponCreateMock.mockResolvedValue({ id: 'attack-3' });
        inventoryItemUpdateMock.mockResolvedValue({ id: 'item-1' });
        inventoryItemCreateMock.mockResolvedValue({ id: 'item-3' });
        characterFeatureUpdateMock.mockResolvedValue({ id: 'feature-1' });
        characterFeatureCreateMock.mockResolvedValue({ id: 'feature-3' });

        const result = await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 18,
                speed: 30,
                initiative: 4,
                conditions: ['Blessed'],
                hp: { current: 60, max: 76, temp: 0 },
                abilityScores: {
                    strength: 8,
                    dexterity: 16,
                    constitution: 14,
                    intelligence: 20,
                    wisdom: 14,
                    charisma: 11,
                },
                currency: { cp: 0, sp: 10, ep: 0, gp: 900, pp: 3 },
                traits: {
                    personality: 'Curious',
                    ideals: 'Knowledge',
                    bonds: 'Spellbook',
                    flaws: 'Arrogant',
                    armorProficiencies: [],
                    weaponProficiencies: ['Daggers'],
                    toolProficiencies: [],
                    languages: ['Common', 'Elvish'],
                },
                weapons: [
                    { id: 'attack-1', name: 'Dagger', attackBonus: '+8', damage: '1d4+4 piercing', type: 'melee' },
                    { name: 'Quarterstaff', attackBonus: '+7', damage: '1d6+3 bludgeoning', type: 'melee' },
                ],
                inventory: [
                    { id: 'item-1', name: 'Staff', quantity: 1, weight: 4, description: 'Arcane focus', equipped: true, magical: true },
                    { name: 'Torch', quantity: 5, weight: 1, description: null, equipped: false, magical: false },
                ],
                features: [
                    { id: 'feature-1', name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover slots', usesMax: 1, usesRemaining: 1, recharge: 'long' },
                    { name: 'Keen Mind', source: 'Feat', description: 'Always know north', usesMax: null, usesRemaining: null, recharge: null },
                ],
            },
        }, authedCtx);

        expect(transactionMock).toHaveBeenCalledTimes(1);
        expect(characterUpdateMock).toHaveBeenCalledTimes(1);
        expect(statsUpdateMock).toHaveBeenCalledTimes(1);
        expect(weaponDeleteManyMock).toHaveBeenCalledWith({
            where: { characterId: 'char-1', id: { in: ['attack-2'] } },
        });
        expect(weaponUpdateMock).toHaveBeenCalledWith({
            where: { id: 'attack-1' },
            data: {
                name: 'Dagger',
                attackBonus: '+8',
                damage: '1d4+4 piercing',
                type: 'melee',
            },
        });
        expect(weaponCreateMock).toHaveBeenCalledWith({
            data: {
                characterId: 'char-1',
                name: 'Quarterstaff',
                attackBonus: '+7',
                damage: '1d6+3 bludgeoning',
                type: 'melee',
            },
        });
        expect(inventoryItemDeleteManyMock).toHaveBeenCalledWith({
            where: { characterId: 'char-1', id: { in: ['item-2'] } },
        });
        expect(characterFeatureDeleteManyMock).toHaveBeenCalledWith({
            where: { characterId: 'char-1', id: { in: ['feature-2'] } },
        });
        expect(result).toEqual({
            ...fakeCharacter,
            ac: 18,
            speed: 30,
            initiative: 4,
            conditions: ['Blessed'],
        });
    });

    test('surfaces transactional failures so the caller can keep the draft', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce(fakeStats);
        weaponFindManyMock.mockResolvedValueOnce([{ id: 'attack-1', characterId: 'char-1' }]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);
        weaponUpdateMock.mockRejectedValueOnce(new Error('Database write failed'));

        expect(resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 17,
                speed: 35,
                initiative: 3,
                conditions: [],
                hp: { current: 54, max: 76, temp: 2 },
                abilityScores: {
                    strength: 8,
                    dexterity: 16,
                    constitution: 14,
                    intelligence: 20,
                    wisdom: 13,
                    charisma: 11,
                },
                currency: { cp: 0, sp: 14, ep: 0, gp: 847, pp: 3 },
                traits: {
                    personality: 'Curious',
                    ideals: 'Knowledge',
                    bonds: 'Spellbook',
                    flaws: 'Arrogant',
                    armorProficiencies: [],
                    weaponProficiencies: ['Daggers'],
                    toolProficiencies: [],
                    languages: ['Common', 'Elvish'],
                },
                weapons: [
                    { id: 'attack-1', name: 'Dagger', attackBonus: '+7', damage: '1d4+3 piercing', type: 'melee' },
                ],
                inventory: [],
                features: [],
            },
        }, authedCtx)).rejects.toThrow('Database write failed');

        expect(transactionMock).toHaveBeenCalledTimes(1);
    });

    test('throws when submitted inventory ids do not belong to the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce(fakeStats);
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([{ id: 'item-1', characterId: 'char-1' }]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);

        expect(resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 17,
                speed: 35,
                initiative: 3,
                conditions: [],
                hp: { current: 54, max: 76, temp: 2 },
                abilityScores: {
                    strength: 8,
                    dexterity: 16,
                    constitution: 14,
                    intelligence: 20,
                    wisdom: 13,
                    charisma: 11,
                },
                currency: { cp: 0, sp: 14, ep: 0, gp: 847, pp: 3 },
                traits: {
                    personality: 'Curious',
                    ideals: 'Knowledge',
                    bonds: 'Spellbook',
                    flaws: 'Arrogant',
                    armorProficiencies: [],
                    weaponProficiencies: ['Daggers'],
                    toolProficiencies: [],
                    languages: ['Common', 'Elvish'],
                },
                weapons: [],
                inventory: [
                    { id: 'item-other', name: 'Staff', quantity: 1, weight: 4, description: 'Arcane focus', equipped: true, magical: true },
                ],
                features: [],
            },
        }, authedCtx)).rejects.toThrow('Inventory item not found.');
    });

    test('throws when submitted feature ids do not belong to the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce(fakeStats);
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([{ id: 'feature-1', characterId: 'char-1' }]);

        expect(resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 17,
                speed: 35,
                initiative: 3,
                conditions: [],
                hp: { current: 54, max: 76, temp: 2 },
                abilityScores: {
                    strength: 8,
                    dexterity: 16,
                    constitution: 14,
                    intelligence: 20,
                    wisdom: 13,
                    charisma: 11,
                },
                currency: { cp: 0, sp: 14, ep: 0, gp: 847, pp: 3 },
                traits: {
                    personality: 'Curious',
                    ideals: 'Knowledge',
                    bonds: 'Spellbook',
                    flaws: 'Arrogant',
                    armorProficiencies: [],
                    weaponProficiencies: ['Daggers'],
                    toolProficiencies: [],
                    languages: ['Common', 'Elvish'],
                },
                weapons: [],
                inventory: [],
                features: [
                    { id: 'feature-other', name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover slots', usesMax: 1, usesRemaining: 1, recharge: 'long' },
                ],
            },
        }, authedCtx)).rejects.toThrow('Feature not found.');
    });
});
