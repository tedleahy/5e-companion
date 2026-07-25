import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFeatureCreateMock,
    characterFeatureDeleteManyMock,
    characterFeatureFindManyMock,
    characterFeatureUpdateMock,
    characterClassFindManyMock,
    characterFindFirstMock,
    characterSpellCreateMock,
    characterSpellDeleteManyMock,
    characterSpellFindManyMock,
    characterSpellUpdateMock,
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
    spellFindManyMock,
    spellSlotFindManyMock,
    statsFindUniqueMock,
    statsUpdateMock,
    subclassCreateManyAndReturnMock,
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

const BASE_SAVE_SKILL_PROFICIENCIES = {
    acrobatics: 'none',
    animalHandling: 'none',
    arcana: 'expert',
    athletics: 'none',
    deception: 'none',
    history: 'expert',
    insight: 'proficient',
    intimidation: 'none',
    investigation: 'expert',
    medicine: 'none',
    nature: 'proficient',
    perception: 'proficient',
    performance: 'none',
    persuasion: 'none',
    religion: 'proficient',
    sleightOfHand: 'none',
    stealth: 'proficient',
    survival: 'none',
} as const;

/**
 * Seeds the reference-data mocks needed to resolve saved class rows.
 */
function mockClassReferenceLookups() {
    classFindManyMock.mockResolvedValueOnce([
        fakeCharacterClasses[0]!.classRef,
        fakeCharacterClasses[1]!.classRef,
    ]);
    characterClassFindManyMock.mockResolvedValueOnce([
        {
            classId: fakeCharacterClasses[0]!.classId,
            subclassId: fakeCharacterClasses[0]!.subclassId,
        },
        {
            classId: fakeCharacterClasses[1]!.classId,
            subclassId: fakeCharacterClasses[1]!.subclassId,
        },
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

    test('rejects archived custom subclass ids that are not already attached to the character', () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        classFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.classRef,
        ]);
        characterClassFindManyMock.mockResolvedValueOnce([
            { classId: 'class-wizard-id', subclassId: 'other-subclass-id' },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([]);

        expect(resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 12,
                speed: 30,
                initiative: 2,
                conditions: [],
                hp: { current: 10, max: 10, temp: 0 },
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
                currency: fakeStats.currency,
                traits: fakeStats.traits,
                classes: [
                    {
                        classId: 'wizard',
                        subclassId: 'archived-custom-id',
                        level: 2,
                        isStartingClass: true,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [],
            },
        } as any, authedCtx)).rejects.toThrow('Unknown subclass: archived-custom-id');

        const args = subclassFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where.AND[0].OR).toEqual([
            { ownerUserId: null },
            { ownerUserId: 'user-abc', archivedAt: null },
            {
                ownerUserId: 'user-abc',
                archivedAt: { not: null },
                id: { in: ['other-subclass-id'] },
            },
        ]);
    });

    test('allows sheet saves to preserve an archived custom subclass already attached to the character', async () => {
        const archivedSubclass = {
            id: 'archived-custom-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            classId: 'class-wizard-id',
            selectionLevel: 20,
            archivedAt: new Date('2026-06-01T00:00:00.000Z'),
        };

        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        classFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.classRef,
        ]);
        characterClassFindManyMock.mockResolvedValueOnce([
            { classId: 'class-wizard-id', subclassId: 'archived-custom-id' },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([archivedSubclass]);
        characterUpdateMock.mockResolvedValueOnce({
            ...fakeCharacter,
            proficiencyBonus: 2,
        });
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats });
        hitDicePoolFindManyMock.mockResolvedValueOnce([]);
        spellSlotFindManyMock.mockResolvedValueOnce([]);
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 12,
                speed: 30,
                initiative: 2,
                conditions: [],
                hp: { current: 10, max: 10, temp: 0 },
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
                currency: fakeStats.currency,
                traits: fakeStats.traits,
                classes: [
                    {
                        classId: 'wizard',
                        subclassId: 'archived-custom-id',
                        level: 2,
                        isStartingClass: true,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [],
            },
        } as any, authedCtx);

        expect(characterUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    classes: {
                        deleteMany: {},
                        create: [
                            {
                                classId: 'class-wizard-id',
                                subclassId: 'archived-custom-id',
                                level: 2,
                                isStartingClass: true,
                            },
                        ],
                    },
                }),
            }),
        );
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
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
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
                spellbook: [],
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
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
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
                spellbook: [],
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
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
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
                spellbook: [],
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
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
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
                spellbook: [],
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
        subclassFindManyMock.mockResolvedValueOnce([]);
        subclassCreateManyAndReturnMock.mockResolvedValueOnce([{
            id: 'custom-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            description: ['A delicate art of mirrored wards and refractions.'],
            selectionLevel: 2,
            classId: 'class-wizard-id',
        }]);

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 17,
                speed: 35,
                initiative: 3,
                conditions: [],
                hp: fakeStats.hp,
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: fakeStats.skillProficiencies,
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
                            selectionLevel: 2,
                        },
                        level: 10,
                        isStartingClass: true,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [],
            },
        } as any, authedCtx);

        expect(subclassFindManyMock).toHaveBeenCalledWith({
            where: {
                ownerUserId: 'user-abc',
                archivedAt: null,
                OR: [{
                    classId: 'class-wizard-id',
                    name: {
                        equals: 'School of Glass',
                        mode: 'insensitive',
                    },
                }],
            },
        });
        expect(subclassCreateManyAndReturnMock).toHaveBeenCalledWith({
            data: [{
                ownerUserId: 'user-abc',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards and refractions.'],
                selectionLevel: 2,
                classId: 'class-wizard-id',
            }],
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
        subclassFindManyMock.mockResolvedValueOnce([]);
        subclassCreateManyAndReturnMock.mockResolvedValueOnce([{
            id: 'custom-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            description: ['A delicate art of mirrored wards and refractions.'],
            selectionLevel: 2,
            classId: 'class-wizard-id',
        }]);
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
                skillProficiencies: fakeStats.skillProficiencies,
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
                            selectionLevel: 2,
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
                spellbook: [],
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

    test('reconciles spellbook learn/forget/prepared changes inside the sheet save transaction', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        mockClassReferenceLookups();
        characterUpdateMock.mockResolvedValueOnce({
            ...fakeCharacter,
            proficiencyBonus: 4,
        });
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);
        spellSlotFindManyMock.mockResolvedValueOnce([]);
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);
        spellFindManyMock.mockResolvedValueOnce([
            { id: 'spell-keep' },
            { id: 'spell-new' },
        ]);
        characterSpellFindManyMock.mockResolvedValueOnce([
            { spellId: 'spell-keep', prepared: false },
            { spellId: 'spell-old', prepared: true },
        ]);
        characterSpellCreateMock.mockResolvedValueOnce({});
        characterSpellUpdateMock.mockResolvedValueOnce({});
        characterSpellDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 12,
                speed: 30,
                initiative: 2,
                conditions: [],
                hp: { current: 10, max: 10, temp: 0 },
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
                currency: fakeStats.currency,
                traits: fakeStats.traits,
                classes: [BASE_SAVE_CLASSES[0]],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [
                    { spellId: 'spell-keep', prepared: true },
                    { spellId: 'spell-new', prepared: false },
                ],
            },
        } as any, authedCtx);

        expect(characterSpellDeleteManyMock).toHaveBeenCalledWith({
            where: { characterId: 'char-1', spellId: { in: ['spell-old'] } },
        });
        expect(characterSpellCreateMock).toHaveBeenCalledWith({
            data: {
                characterId: 'char-1',
                spellId: 'spell-new',
                prepared: false,
            },
        });
        expect(characterSpellUpdateMock).toHaveBeenCalledWith({
            where: { characterId_spellId: { characterId: 'char-1', spellId: 'spell-keep' } },
            data: { prepared: true },
        });
    });

    test('rejects newly added multiclass rows that omit required proficiencyChoices', async () => {
        const bardRef = {
            id: 'class-bard-id',
            srdIndex: 'bard',
            name: 'Bard',
            hitDie: 8,
            spellcastingAbility: 'cha',
            spellcastingMode: 'STANDARD',
            proficiencyRules: [
                {
                    grant: 'MULTICLASS',
                    choiceGroup: 1,
                    choiceCount: 1,
                    proficiencyRef: { id: 'prof-stealth', srdIndex: 'skill-stealth', name: 'Stealth', type: 'SKILL' },
                },
                {
                    grant: 'MULTICLASS',
                    choiceGroup: 1,
                    choiceCount: 1,
                    proficiencyRef: { id: 'prof-performance', srdIndex: 'skill-performance', name: 'Performance', type: 'SKILL' },
                },
            ],
            proficiencies: [],
            progression: [],
        };

        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        classFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.classRef,
            bardRef,
        ]);
        characterClassFindManyMock.mockResolvedValueOnce([
            { classId: fakeCharacterClasses[0]!.classId, subclassId: fakeCharacterClasses[0]!.subclassId },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.subclassRef,
        ]);

        await expect(resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 12,
                speed: 30,
                initiative: 2,
                conditions: [],
                hp: fakeStats.hp,
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
                currency: fakeStats.currency,
                traits: fakeStats.traits,
                classes: [
                    {
                        id: 'char-class-1',
                        classId: 'wizard',
                        subclassId: 'evocation',
                        level: 9,
                        isStartingClass: true,
                    },
                    {
                        classId: 'bard',
                        subclassId: null,
                        level: 1,
                        isStartingClass: false,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [],
            },
        } as any, authedCtx)).rejects.toThrow('Choose exactly 1 proficiency from bard choice group 1');
    });

    test('accepts newly added multiclass rows with valid proficiencyChoices and merges grants', async () => {
        const bardRef = {
            id: 'class-bard-id',
            srdIndex: 'bard',
            name: 'Bard',
            hitDie: 8,
            spellcastingAbility: 'cha',
            spellcastingMode: 'STANDARD',
            proficiencyRules: [
                {
                    grant: 'MULTICLASS',
                    choiceGroup: null,
                    choiceCount: null,
                    proficiencyRef: { id: 'prof-light', srdIndex: 'light-armor', name: 'Light armour', type: 'ARMOR' },
                },
                {
                    grant: 'MULTICLASS',
                    choiceGroup: 1,
                    choiceCount: 1,
                    proficiencyRef: { id: 'prof-stealth', srdIndex: 'skill-stealth', name: 'Stealth', type: 'SKILL' },
                },
                {
                    grant: 'MULTICLASS',
                    choiceGroup: 1,
                    choiceCount: 1,
                    proficiencyRef: { id: 'prof-performance', srdIndex: 'skill-performance', name: 'Performance', type: 'SKILL' },
                },
                {
                    grant: 'MULTICLASS',
                    choiceGroup: 2,
                    choiceCount: 1,
                    proficiencyRef: { id: 'prof-lute', srdIndex: 'lute', name: 'Lute', type: 'TOOL' },
                },
                {
                    grant: 'MULTICLASS',
                    choiceGroup: 2,
                    choiceCount: 1,
                    proficiencyRef: { id: 'prof-flute', srdIndex: 'flute', name: 'Flute', type: 'TOOL' },
                },
            ],
            proficiencies: [],
            progression: [],
        };

        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        classFindManyMock.mockResolvedValueOnce([
            {
                ...fakeCharacterClasses[0]!.classRef,
                proficiencyRules: [],
                proficiencies: [],
                progression: [],
            },
            bardRef,
        ]);
        characterClassFindManyMock.mockResolvedValueOnce([
            { classId: fakeCharacterClasses[0]!.classId, subclassId: fakeCharacterClasses[0]!.subclassId },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            fakeCharacterClasses[0]!.subclassRef,
        ]);
        characterUpdateMock.mockResolvedValueOnce({
            ...fakeCharacter,
            proficiencyBonus: 4,
        });
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools.slice(0, 1));
        spellSlotFindManyMock.mockResolvedValueOnce([]);
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);
        characterSpellFindManyMock.mockResolvedValueOnce([]);

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 12,
                speed: 30,
                initiative: 2,
                conditions: [],
                hp: fakeStats.hp,
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: {
                    ...BASE_SAVE_SKILL_PROFICIENCIES,
                    stealth: 'none',
                    performance: 'none',
                },
                currency: fakeStats.currency,
                traits: {
                    ...fakeStats.traits,
                    armorProficiencies: [],
                    toolProficiencies: [],
                },
                classes: [
                    {
                        id: 'char-class-1',
                        classId: 'wizard',
                        subclassId: 'evocation',
                        level: 9,
                        isStartingClass: true,
                    },
                    {
                        classId: 'bard',
                        subclassId: null,
                        level: 1,
                        isStartingClass: false,
                    },
                ],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [],
                proficiencyChoices: [
                    { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
                    { classId: 'bard', choiceGroup: 2, values: ['lute'] },
                ],
            },
        } as any, authedCtx);

        const statsUpdateArgs = statsUpdateMock.mock.calls[0]![0] as {
            data: {
                skillProficiencies: Record<string, string>;
                traits: {
                    armorProficiencies: string[];
                    toolProficiencies: string[];
                };
            };
        };
        expect(statsUpdateArgs.data.skillProficiencies.stealth).toBe('proficient');
        expect(statsUpdateArgs.data.traits.armorProficiencies).toContain('Light armour');
        expect(statsUpdateArgs.data.traits.toolProficiencies).toContain('Lute');
    });

    test('allows ordinary trait edits without proficiencyChoices when no class is newly added', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        mockClassReferenceLookups();
        characterUpdateMock.mockResolvedValueOnce({
            ...fakeCharacter,
            proficiencyBonus: 4,
        });
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        statsUpdateMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);
        spellSlotFindManyMock.mockResolvedValueOnce([]);
        weaponFindManyMock.mockResolvedValueOnce([]);
        inventoryItemFindManyMock.mockResolvedValueOnce([]);
        characterFeatureFindManyMock.mockResolvedValueOnce([]);
        characterSpellFindManyMock.mockResolvedValueOnce([]);

        await resolvers.saveCharacterSheet({}, {
            characterId: 'char-1',
            input: {
                ac: 12,
                speed: 30,
                initiative: 2,
                conditions: [],
                hp: fakeStats.hp,
                abilityScores: fakeStats.abilityScores,
                skillProficiencies: BASE_SAVE_SKILL_PROFICIENCIES,
                currency: fakeStats.currency,
                traits: {
                    ...fakeStats.traits,
                    toolProficiencies: ['Custom tool'],
                },
                classes: [...BASE_SAVE_CLASSES],
                weapons: [],
                inventory: [],
                features: [],
                spellbook: [],
            },
        } as any, authedCtx);

        const statsUpdateArgs = statsUpdateMock.mock.calls[0]![0] as {
            data: { traits: { toolProficiencies: string[] } };
        };
        expect(statsUpdateArgs.data.traits.toolProficiencies).toEqual(['Custom tool']);
    });
});
