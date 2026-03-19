import { mock } from 'bun:test';

// character model mocks
export const characterFindFirstMock: any = mock((_args: unknown) => Promise.resolve(null));
export const characterFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
export const characterCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const characterDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));

// characterStats model mocks
export const statsFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const statsUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));

// field resolver model mocks
export const attackFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
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
export const attackCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const attackUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
export const attackUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
export const attackFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
export const attackDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
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
        create: characterCreateMock,
        update: characterUpdateMock,
        deleteMany: characterDeleteManyMock,
    },
    characterStats: {
        findUnique: statsFindUniqueMock,
        update: statsUpdateMock,
    },
    attack: {
        findMany: attackFindManyMock,
        findUnique: attackFindUniqueMock,
        create: attackCreateMock,
        update: attackUpdateMock,
        updateMany: attackUpdateManyMock,
        deleteMany: attackDeleteManyMock,
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
        attack: {
            findMany: attackFindManyMock,
            findUnique: attackFindUniqueMock,
            create: attackCreateMock,
            update: attackUpdateMock,
            updateMany: attackUpdateManyMock,
            deleteMany: attackDeleteManyMock,
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
 * Clears all mock call history between tests.
 */
export function clearAllCharacterResolverMocks() {
    characterFindFirstMock.mockClear();
    characterFindManyMock.mockClear();
    characterCreateMock.mockClear();
    characterUpdateMock.mockClear();
    characterDeleteManyMock.mockClear();
    statsFindUniqueMock.mockClear();
    statsUpdateMock.mockClear();
    attackFindManyMock.mockClear();
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
    attackCreateMock.mockClear();
    attackUpdateMock.mockClear();
    attackUpdateManyMock.mockClear();
    attackFindUniqueMock.mockClear();
    attackDeleteManyMock.mockClear();
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
