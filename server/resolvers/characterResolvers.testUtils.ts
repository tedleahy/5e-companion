import { mock } from 'bun:test';

// character model mocks
export const characterFindFirstMock: any = mock((_args: unknown) => Promise.resolve(null));
export const characterFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const characterCountMock: any = mock((_args: unknown) => Promise.resolve(0));
export const characterCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));

// characterStats model mocks
export const statsFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const statsUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));

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
export const transactionMock: any = mock((callback: (tx: any) => Promise<unknown>) => callback({
    character: {
        findFirst: characterFindFirstMock,
        findMany: characterFindManyMock,
        count: characterCountMock,
        create: characterCreateMock,
        update: characterUpdateMock,
        deleteMany: characterDeleteManyMock,
    },
    characterStats: {
        findUnique: statsFindUniqueMock,
        update: statsUpdateMock,
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
}));

mock.module('../prisma/prisma', () => ({
    default: {
        character: {
            findFirst: characterFindFirstMock,
            findMany: characterFindManyMock,
            count: characterCountMock,
            create: characterCreateMock,
            update: characterUpdateMock,
            deleteMany: characterDeleteManyMock,
        },
        characterStats: {
            findUnique: statsFindUniqueMock,
            update: statsUpdateMock,
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
        $executeRaw: executeRawMock,
        $transaction: transactionMock,
    },
}));

mock.module('../lib/auth', () => ({
    requireUser(ctx: { userId: string | null }): string {
        if (!ctx.userId) throw new Error('UNAUTHENTICATED');
        return ctx.userId;
    },
}));

export const resolvers: any = await import('./characterResolvers');

export const authedCtx = { userId: 'user-abc' };
export const unauthedCtx = { userId: null };

export const fakeCharacter: any = {
    id: 'char-1',
    ownerUserId: 'user-abc',
    name: 'Vaelindra',
    inspiration: false,
};

export const fakeStats: any = {
    id: 'stats-1',
    characterId: 'char-1',
    abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 },
    hp: { current: 54, max: 76, temp: 2 },
    deathSaves: { successes: 0, failures: 0 },
    hitDice: { total: 12, remaining: 12, die: 'd6' },
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

/**
 * Rich character detail payload for resolver tests that exercise parent-loaded relations.
 */
export const fakeCharacterDetail: any = {
    ...fakeCharacter,
    stats: fakeStats,
    weapons: [{ id: 'weapon-1', characterId: 'char-1', name: 'Longsword', attackBonus: '+7', damage: '1d8+4 S', type: 'melee' }],
    inventory: [{ id: 'item-1', characterId: 'char-1', name: 'Potion of Healing', quantity: 2, weight: 0.5, description: 'Restores hit points', equipped: false, magical: true }],
    features: [{ id: 'feature-1', characterId: 'char-1', name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover spell slots on a short rest.', usesMax: 1, usesRemaining: 1, recharge: 'long' }],
    spellSlots: [{ id: 'slot-1', characterId: 'char-1', level: 1, total: 4, used: 1 }],
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
    statsFindUniqueMock.mockClear();
    statsUpdateMock.mockClear();
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
