import { mock } from 'bun:test';

// character model mocks
export const characterFindFirstMock: any = mock((_args: unknown) => Promise.resolve(null));
export const characterFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const characterCountMock: any = mock((_args: unknown) => Promise.resolve(0));
export const characterCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const characterClassFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));

// characterStats model mocks
export const statsFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const statsUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const hitDicePoolFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const hitDicePoolUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));

// reference model mocks
export const classFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const subclassFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const raceFindFirstMock: any = mock((_args: unknown) => Promise.resolve(null));
export const backgroundFindFirstMock: any = mock((_args: unknown) => Promise.resolve(null));

// field resolver model mocks
export const weaponFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const inventoryItemFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const characterFeatureFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const spellSlotFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const characterSpellFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));

// spellbook + mutation mocks
export const characterSpellUpsertMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterSpellDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const characterSpellUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const spellSlotFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const spellSlotUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const spellSlotUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 0 }));
export const weaponCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const weaponUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const weaponUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const weaponFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const weaponDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const inventoryItemCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const inventoryItemUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const inventoryItemUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const inventoryItemFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const inventoryItemDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const characterFeatureCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterFeatureUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterFeatureUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const characterFeatureFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const characterFeatureDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const executeRawMock: any = mock((_args: unknown) => Promise.resolve(0));

function createMockTransactionClient() {
    return {
        character: {
            findFirst: characterFindFirstMock,
            findMany: characterFindManyMock,
            count: characterCountMock,
            create: characterCreateMock,
            update: characterUpdateMock,
            deleteMany: characterDeleteManyMock,
        },
        characterClass: {
            findMany: characterClassFindManyMock,
        },
        characterStats: {
            findUnique: statsFindUniqueMock,
            update: statsUpdateMock,
        },
        hitDicePool: {
            findMany: hitDicePoolFindManyMock,
            update: hitDicePoolUpdateMock,
        },
        class: {
            findMany: classFindManyMock,
        },
        subclass: {
            findMany: subclassFindManyMock,
        },
        race: {
            findFirst: raceFindFirstMock,
        },
        background: {
            findFirst: backgroundFindFirstMock,
        },
        characterSpell: {
            findMany: characterSpellFindManyMock,
            upsert: characterSpellUpsertMock,
            deleteMany: characterSpellDeleteManyMock,
            update: characterSpellUpdateMock,
        },
        weapon: {
            findMany: weaponFindManyMock,
            findUnique: weaponFindUniqueMock,
            create: weaponCreateMock,
            update: weaponUpdateMock,
            updateMany: weaponUpdateManyMock,
            deleteMany: weaponDeleteManyMock,
        },
        inventoryItem: {
            findMany: inventoryItemFindManyMock,
            findUnique: inventoryItemFindUniqueMock,
            create: inventoryItemCreateMock,
            update: inventoryItemUpdateMock,
            updateMany: inventoryItemUpdateManyMock,
            deleteMany: inventoryItemDeleteManyMock,
        },
        characterFeature: {
            findMany: characterFeatureFindManyMock,
            findUnique: characterFeatureFindUniqueMock,
            create: characterFeatureCreateMock,
            update: characterFeatureUpdateMock,
            updateMany: characterFeatureUpdateManyMock,
            deleteMany: characterFeatureDeleteManyMock,
        },
        spellSlot: {
            findMany: spellSlotFindManyMock,
            findUnique: spellSlotFindUniqueMock,
            update: spellSlotUpdateMock,
            updateMany: spellSlotUpdateManyMock,
        },
    };
}

export const transactionMock: any = mock((callback: (tx: any) => Promise<unknown>) => callback(createMockTransactionClient()));

function createMockPrismaClient() {
    return {
        ...createMockTransactionClient(),
        $executeRaw: executeRawMock,
        $transaction: transactionMock,
    };
}

mock.module('@prisma/adapter-pg', () => ({
    PrismaPg: class {
        constructor(_args: unknown) {}
    },
}));

mock.module('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            return createMockPrismaClient();
        }
    },
}));

function createAuthModuleMock() {
    return {
        requireUser(ctx: { userId: string | null }): string {
            if (!ctx.userId) throw new Error('UNAUTHENTICATED');
            return ctx.userId;
        },
    };
}

mock.module('../lib/auth', createAuthModuleMock);

mock.module('../../lib/auth', createAuthModuleMock);

export const resolvers: any = await import('./characterResolvers');

export const authedCtx = { userId: 'user-abc' };
export const unauthedCtx = { userId: null };

export const fakeCharacter: any = {
    id: 'char-1',
    ownerUserId: 'user-abc',
    name: 'Vaelindra',
    race: 'High Elf',
    alignment: 'Chaotic Good',
    background: 'Acolyte',
    inspiration: false,
    ac: 17,
    speed: 35,
    initiative: 3,
    proficiencyBonus: 4,
    conditions: [],
    notes: '',
};

export const fakeStats: any = {
    id: 'stats-1',
    characterId: 'char-1',
    abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 },
    hp: { current: 54, max: 76, temp: 2 },
    deathSaves: { successes: 0, failures: 0 },
    savingThrowProficiencies: ['constitution', 'intelligence'],
    skillProficiencies: { arcana: 'expert', history: 'proficient', stealth: 'none' },
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
    currency: { cp: 0, sp: 14, ep: 0, gp: 847, pp: 3 },
};

export const fakeCharacterClasses: any[] = [
    {
        id: 'char-class-1',
        characterId: 'char-1',
        classId: 'class-wizard-id',
        subclassId: 'subclass-evocation-id',
        level: 9,
        isStartingClass: true,
        classRef: {
            id: 'class-wizard-id',
            srdIndex: 'wizard',
            name: 'Wizard',
            hitDie: 6,
            spellcastingAbility: 'int',
        },
        subclassRef: {
            id: 'subclass-evocation-id',
            srdIndex: 'evocation',
            name: 'Evocation',
            classId: 'class-wizard-id',
        },
    },
    {
        id: 'char-class-2',
        characterId: 'char-1',
        classId: 'class-warlock-id',
        subclassId: 'subclass-fiend-id',
        level: 3,
        isStartingClass: false,
        classRef: {
            id: 'class-warlock-id',
            srdIndex: 'warlock',
            name: 'Warlock',
            hitDie: 8,
            spellcastingAbility: 'cha',
        },
        subclassRef: {
            id: 'subclass-fiend-id',
            srdIndex: 'fiend',
            name: 'Fiend',
            classId: 'class-warlock-id',
        },
    },
];

export const fakeHitDicePools: any[] = [
    {
        id: 'hd-1',
        characterId: 'char-1',
        classId: 'class-wizard-id',
        total: 9,
        remaining: 7,
        die: 'd6',
        classRef: {
            id: 'class-wizard-id',
            srdIndex: 'wizard',
            name: 'Wizard',
        },
    },
    {
        id: 'hd-2',
        characterId: 'char-1',
        classId: 'class-warlock-id',
        total: 3,
        remaining: 2,
        die: 'd8',
        classRef: {
            id: 'class-warlock-id',
            srdIndex: 'warlock',
            name: 'Warlock',
        },
    },
];

/**
 * Rich character detail payload for resolver tests that exercise parent-loaded relations.
 */
export const fakeCharacterDetail: any = {
    ...fakeCharacter,
    classes: fakeCharacterClasses,
    stats: fakeStats,
    weapons: [{ id: 'weapon-1', characterId: 'char-1', name: 'Longsword', attackBonus: '+7', damage: '1d8+4 S', type: 'melee' }],
    inventory: [{ id: 'item-1', characterId: 'char-1', name: 'Potion of Healing', quantity: 2, weight: 0.5, description: 'Restores hit points', equipped: false, magical: true }],
    features: [{ id: 'feature-1', characterId: 'char-1', name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover spell slots on a short rest.', usesMax: 1, usesRemaining: 1, recharge: 'long' }],
    spellSlots: [
        { id: 'slot-1', characterId: 'char-1', kind: 'STANDARD', level: 1, total: 4, used: 1 },
        { id: 'slot-2', characterId: 'char-1', kind: 'PACT_MAGIC', level: 2, total: 2, used: 0 },
    ],
    spellbook: [{
        characterId: 'char-1',
        spellId: 'spell-1',
        prepared: true,
        spell: {
            id: 'spell-1',
            name: 'Mage Armour',
            level: 1,
            schoolIndex: 'abjuration',
            classIndexes: ['wizard'],
            components: ['V', 'S', 'M'],
            concentration: false,
            description: ['Protective magical force.'],
            duration: '8 hours',
            higherLevel: [],
            material: 'A piece of cured leather',
            range: 'Touch',
            ritual: false,
            sourceBook: 'PHB',
            castingTime: '1 action',
        },
    }],
};

/**
 * Clears all mock call history between tests.
 */
export function clearAllCharacterResolverMocks() {
    characterFindFirstMock.mockClear();
    characterFindManyMock.mockClear();
    characterCountMock.mockClear();
    characterCreateMock.mockClear();
    characterUpdateMock.mockClear();
    characterDeleteManyMock.mockClear();
    characterClassFindManyMock.mockClear();
    statsFindUniqueMock.mockClear();
    statsUpdateMock.mockClear();
    hitDicePoolFindManyMock.mockClear();
    hitDicePoolUpdateMock.mockClear();
    classFindManyMock.mockClear();
    subclassFindManyMock.mockClear();
    raceFindFirstMock.mockClear();
    backgroundFindFirstMock.mockClear();
    weaponFindManyMock.mockClear();
    inventoryItemFindManyMock.mockClear();
    characterFeatureFindManyMock.mockClear();
    spellSlotFindManyMock.mockClear();
    characterSpellFindManyMock.mockClear();
    characterSpellUpsertMock.mockClear();
    characterSpellDeleteManyMock.mockClear();
    characterSpellUpdateMock.mockClear();
    spellSlotFindUniqueMock.mockClear();
    spellSlotUpdateMock.mockClear();
    spellSlotUpdateManyMock.mockClear();
    weaponCreateMock.mockClear();
    weaponUpdateMock.mockClear();
    weaponUpdateManyMock.mockClear();
    weaponFindUniqueMock.mockClear();
    weaponDeleteManyMock.mockClear();
    inventoryItemCreateMock.mockClear();
    inventoryItemUpdateMock.mockClear();
    inventoryItemUpdateManyMock.mockClear();
    inventoryItemFindUniqueMock.mockClear();
    inventoryItemDeleteManyMock.mockClear();
    characterFeatureCreateMock.mockClear();
    characterFeatureUpdateMock.mockClear();
    characterFeatureUpdateManyMock.mockClear();
    characterFeatureFindUniqueMock.mockClear();
    characterFeatureDeleteManyMock.mockClear();
    executeRawMock.mockClear();
    transactionMock.mockClear();
}
