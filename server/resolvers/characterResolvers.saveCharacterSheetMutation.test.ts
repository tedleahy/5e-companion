import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFeatureCreateMock,
    characterFeatureDeleteManyMock,
    characterFeatureFindManyMock,
    characterFeatureUpdateMock,
    characterFindFirstMock,
    characterUpdateMock,
    classFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    fakeCharacterClasses,
    fakeHitDicePools,
    fakeStats,
    featureCreateMock,
    featureFindFirstMock,
    hitDicePoolFindManyMock,
    inventoryItemCreateMock,
    inventoryItemDeleteManyMock,
    inventoryItemFindManyMock,
    inventoryItemUpdateMock,
    resolvers,
    spellSlotFindManyMock,
    statsFindUniqueMock,
    statsUpdateMock,
    subclassCreateMock,
    subclassFindFirstMock,
    subclassFindManyMock,
    transactionMock,
    unauthedCtx,
    weaponCreateMock,
    weaponDeleteManyMock,
    weaponFindManyMock,
    weaponUpdateMock,
} from './characterResolvers.testUtils';

const BASE_SAVE_CLASSES = [
    {
        id: 'char-class-1',
        classId: 'wizard',
        subclassId: 'evocation',
        level: 9,
        isStartingClass: true,
    },
    {
        id: 'char-class-2',
        classId: 'warlock',
        subclassId: 'fiend',
        level: 3,
        isStartingClass: false,
    },
] as const;

const EXISTING_SPELL_SLOTS = [
    { id: 'slot-standard-1', characterId: 'char-1', kind: 'STANDARD', level: 1, total: 4, used: 1 },
    { id: 'slot-standard-2', characterId: 'char-1', kind: 'STANDARD', level: 2, total: 3, used: 0 },
    { id: 'slot-standard-3', characterId: 'char-1', kind: 'STANDARD', level: 3, total: 3, used: 2 },
    { id: 'slot-pact-1', characterId: 'char-1', kind: 'PACT_MAGIC', level: 2, total: 2, used: 1 },
] as const;

/**
 * Seeds the reference-data mocks needed to resolve saved class rows.
 */
function mockClassReferenceLookups() {
    classFindManyMock.mockResolvedValueOnce([
        fakeCharacterClasses[0]!.classRef,
        fakeCharacterClasses[1]!.classRef,
    ]);
    subclassFindManyMock.mockResolvedValueOnce([
        fakeCharacterClasses[0]!.subclassRef,
        fakeCharacterClasses[1]!.subclassRef,
    ]);
}

describe('characterResolvers — saveCharacterSheet', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.saveCharacterSheet({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('saves the full editable sheet inside one transaction and re-derives level-up data', async () => {
        mockClassReferenceLookups();
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce({
            ...fakeCharacter,
            ac: 18,
            speed: 30,
            initiative: 4,
            proficiencyBonus: 5,
            conditions: ['Blessed'],
        });
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats });
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);
        spellSlotFindManyMock.mockResolvedValueOnce(EXISTING_SPELL_SLOTS);
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
                classes: [
                    {
                        ...BASE_SAVE_CLASSES[0],
                        level: 10,
                    },
                    BASE_SAVE_CLASSES[1],
                ],
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
        expect(characterUpdateMock).toHaveBeenCalledWith({
            where: { id: 'char-1' },
            data: {
                ac: 18,
                speed: 30,
                initiative: 4,
                conditions: ['Blessed'],
                proficiencyBonus: 5,
                spellcastingAbility: null,
                spellSaveDC: null,
                spellAttackBonus: null,
                classes: {
                    deleteMany: {},
                    create: [
                        {
                            classId: 'class-wizard-id',
                            subclassId: 'subclass-evocation-id',
                            level: 10,
                            isStartingClass: true,
                        },
                        {
                            classId: 'class-warlock-id',
                            subclassId: 'subclass-fiend-id',
                            level: 3,
                            isStartingClass: false,
                        },
                    ],
                },
                hitDicePools: {
                    deleteMany: {},
                    create: [
                        {
                            classId: 'class-wizard-id',
                            total: 10,
                            remaining: 8,
                            die: 'd6',
                        },
                        {
                            classId: 'class-warlock-id',
                            total: 3,
                            remaining: 2,
                            die: 'd8',
                        },
                    ],
                },
                spellSlots: {
                    deleteMany: {},
                    create: [
                        { kind: 'STANDARD', level: 1, total: 4, used: 1 },
                        { kind: 'STANDARD', level: 2, total: 3, used: 0 },
                        { kind: 'STANDARD', level: 3, total: 3, used: 2 },
                        { kind: 'STANDARD', level: 4, total: 3, used: 0 },
                        { kind: 'STANDARD', level: 5, total: 2, used: 0 },
                        { kind: 'PACT_MAGIC', level: 2, total: 2, used: 1 },
                    ],
                },
            },
        });
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
            proficiencyBonus: 5,
            conditions: ['Blessed'],
        });
    });

    test('surfaces transactional failures so the caller can keep the draft', async () => {
        mockClassReferenceLookups();
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);
        spellSlotFindManyMock.mockResolvedValueOnce(EXISTING_SPELL_SLOTS);
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
                classes: BASE_SAVE_CLASSES,
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
        mockClassReferenceLookups();
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);
        spellSlotFindManyMock.mockResolvedValueOnce(EXISTING_SPELL_SLOTS);
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
                classes: BASE_SAVE_CLASSES,
                weapons: [],
                inventory: [
                    { id: 'item-other', name: 'Staff', quantity: 1, weight: 4, description: 'Arcane focus', equipped: true, magical: true },
                ],
                features: [],
            },
        }, authedCtx)).rejects.toThrow('Inventory item not found.');
    });

    test('throws when submitted feature ids do not belong to the character', async () => {
        mockClassReferenceLookups();
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);
        spellSlotFindManyMock.mockResolvedValueOnce(EXISTING_SPELL_SLOTS);
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
                classes: BASE_SAVE_CLASSES,
                weapons: [],
                inventory: [],
                features: [
                    { id: 'feature-other', name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover slots', usesMax: 1, usesRemaining: 1, recharge: 'long' },
                ],
            },
        }, authedCtx)).rejects.toThrow('Feature not found.');
    });

    test('creates and persists a new owned custom subclass when the saved sheet submits one', async () => {
        classFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.classRef,
        ]);
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats });
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools.slice(0, 1));
        spellSlotFindManyMock.mockResolvedValueOnce(EXISTING_SPELL_SLOTS.slice(0, 3));
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);
        subclassFindFirstMock.mockResolvedValueOnce(null);
        subclassCreateMock.mockResolvedValueOnce({
            id: 'custom-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            description: ['A delicate art of mirrored wards and refractions.'],
            classId: 'class-wizard-id',
        });

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 17,
                speed: 35,
                initiative: 3,
                conditions: [],
                hp: fakeStats.hp,
                abilityScores: fakeStats.abilityScores,
                currency: fakeStats.currency,
                traits: fakeStats.traits,
                classes: [
                    {
                        id: 'char-class-1',
                        classId: 'wizard',
                        subclassId: null,
                        customSubclass: {
                            name: 'School of Glass',
                            description: 'A delicate art of mirrored wards and refractions.',
                        },
                        level: 10,
                        isStartingClass: true,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [],
            },
        } as any, authedCtx);

        expect(subclassCreateMock).toHaveBeenCalledWith({
            data: {
                ownerUserId: 'user-abc',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards and refractions.'],
                classId: 'class-wizard-id',
            },
        });
        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.classes.create).toEqual([
            {
                classId: 'class-wizard-id',
                subclassId: 'custom-subclass-id',
                level: 10,
                isStartingClass: true,
            },
        ]);
    });

    test('persists reusable custom subclass feature definitions and links the saved character feature row', async () => {
        classFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.classRef,
        ]);
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterUpdateMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats });
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools.slice(0, 1));
        spellSlotFindManyMock.mockResolvedValueOnce(EXISTING_SPELL_SLOTS.slice(0, 3));
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);
        subclassFindFirstMock.mockResolvedValueOnce(null);
        subclassCreateMock.mockResolvedValueOnce({
            id: 'custom-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            description: ['A delicate art of mirrored wards and refractions.'],
            classId: 'class-wizard-id',
        });
        featureFindFirstMock.mockResolvedValueOnce(null);
        featureCreateMock.mockResolvedValueOnce({
            id: 'glass-feature-1',
        });
        characterFeatureCreateMock.mockResolvedValueOnce({
            id: 'character-feature-1',
        });

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 17,
                speed: 35,
                initiative: 3,
                conditions: [],
                hp: fakeStats.hp,
                abilityScores: fakeStats.abilityScores,
                currency: fakeStats.currency,
                traits: fakeStats.traits,
                classes: [
                    {
                        id: 'char-class-1',
                        classId: 'wizard',
                        subclassId: null,
                        customSubclass: {
                            name: 'School of Glass',
                            description: 'A delicate art of mirrored wards and refractions.',
                        },
                        level: 10,
                        isStartingClass: true,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [
                    {
                        name: 'Refraction Shield',
                        source: 'School of Glass Wizard 10',
                        description: 'Bend light to turn aside attacks.',
                        usesMax: null,
                        usesRemaining: null,
                        recharge: null,
                        customSubclassFeature: {
                            classId: 'wizard',
                            level: 10,
                        },
                    },
                ],
            },
        } as any, authedCtx);

        expect(featureCreateMock).toHaveBeenCalledWith({
            data: {
                ownerUserId: 'user-abc',
                name: 'Refraction Shield',
                description: ['Bend light to turn aside attacks.'],
                level: 10,
                kind: 'SUBCLASS_FEATURE',
                sourceLabel: 'School of Glass Wizard 10',
                classId: 'class-wizard-id',
                subclassId: 'custom-subclass-id',
            },
        });
        expect(characterFeatureCreateMock).toHaveBeenCalledWith({
            data: {
                characterId: 'char-1',
                featureId: 'glass-feature-1',
                name: 'Refraction Shield',
                source: 'School of Glass Wizard 10',
                description: 'Bend light to turn aside attacks.',
                usesMax: null,
                usesRemaining: null,
                recharge: null,
            },
        });
    });
});
