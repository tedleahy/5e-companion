import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    classFindManyMock,
    clearAllCharacterResolverMocks,
    resolvers,
    unauthedCtx,
} from './characterResolvers.testUtils';

/** Minimal archived custom class row shaped like a `CLASS_DETAILS_INCLUDE` Prisma result. */
function archivedCustomClassRow() {
    return {
        id: 'custom-warden-id',
        ownerUserId: 'user-abc',
        srdIndex: null,
        name: 'Warden',
        emoji: '🛡️',
        description: ['A stalwart custom class.'],
        hitDie: 10,
        primaryAbilityIndexes: ['str'],
        savingThrowIndexes: ['str', 'con'],
        multiclassPrerequisites: [],
        startingEquipment: [],
        spellcastingMode: 'NONE',
        spellcastingAbility: null,
        addSpellcastingAbility: false,
        archivedAt: new Date('2026-01-01'),
        sourceBook: 'Custom',
        proficiencyRules: [],
        progression: [],
        features: [],
        spellList: [],
        _count: { characterClasses: 1 },
    };
}

describe('characterResolvers.attachedClassDetails', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('requires authentication', async () => {
        await expect(resolvers.attachedClassDetails({}, { values: ['warden'] }, unauthedCtx)).rejects.toThrow();
    });

    test('returns an empty list without querying Prisma when no ids are requested', async () => {
        const result = await resolvers.attachedClassDetails({}, { values: [] }, authedCtx);

        expect(result).toEqual([]);
        expect(classFindManyMock).not.toHaveBeenCalled();
    });

    test('loads an archived custom class attached to the caller\'s character', async () => {
        classFindManyMock.mockResolvedValueOnce([archivedCustomClassRow()]);

        const result = await resolvers.attachedClassDetails({}, { values: ['custom-warden-id'] }, authedCtx);

        expect(classFindManyMock).toHaveBeenCalledTimes(1);
        const args = classFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({
            OR: [
                { srdIndex: { in: ['custom-warden-id'] }, ownerUserId: null },
                { id: { in: ['custom-warden-id'] }, ownerUserId: 'user-abc' },
            ],
        });
        expect(result).toEqual([
            expect.objectContaining({
                id: 'custom-warden-id',
                name: 'Warden',
                archived: true,
                isCustom: true,
            }),
        ]);
    });
});

describe('characterResolvers.customClasses', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('requires authentication', async () => {
        await expect(resolvers.customClasses({}, {}, unauthedCtx)).rejects.toThrow('UNAUTHENTICATED');
    });

    test('returns lightweight summaries without loading the full class graph', async () => {
        classFindManyMock.mockResolvedValueOnce([
            {
                id: 'custom-warden-id',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'Warden',
                emoji: '🛡️',
                description: ['A stalwart custom class.'],
                hitDie: 10,
                primaryAbilityIndexes: ['str'],
                savingThrowIndexes: ['str', 'con'],
                multiclassPrerequisites: [{ abilityIndex: 'str', minimum: 13, group: 1 }],
                spellcastingMode: 'NONE',
                spellcastingAbility: null,
            },
        ]);

        const result = await resolvers.customClasses({}, {}, authedCtx);

        expect(classFindManyMock).toHaveBeenCalledTimes(1);
        const args = classFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.include).toBeUndefined();
        expect(args.where).toEqual({ ownerUserId: 'user-abc', archivedAt: null });
        expect(result).toEqual([
            expect.objectContaining({
                id: 'custom-warden-id',
                value: 'custom-warden-id',
                name: 'Warden',
                emoji: '🛡️',
                isCustom: true,
                spellcastingMode: 'NONE',
            }),
        ]);
        expect(result[0]).not.toHaveProperty('progression');
        expect(result[0]).not.toHaveProperty('features');
        expect(result[0]).not.toHaveProperty('spells');
        expect(result[0]).not.toHaveProperty('proficiencies');
        expect(result[0]).not.toHaveProperty('equipment');
    });
});
