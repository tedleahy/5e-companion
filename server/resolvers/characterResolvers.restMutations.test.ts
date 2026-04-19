import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterClassFindManyMock,
    characterFindFirstMock,
    clearAllCharacterResolverMocks,
    executeRawMock,
    fakeCharacter,
    fakeHitDicePools,
    fakeStats,
    hitDicePoolFindManyMock,
    hitDicePoolUpdateMock,
    resolvers,
    spellSlotUpdateManyMock,
    statsFindUniqueMock,
    statsUpdateMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — spendHitDie', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.spendHitDie({}, { characterId: 'char-1', classId: 'wizard', amount: 1 }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('decrements a specific hit-dice pool by amount', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce(fakeHitDicePools);

        const result = await resolvers.spendHitDie(
            {}, { characterId: 'char-1', classId: 'wizard', amount: 2 }, authedCtx,
        );

        const args = hitDicePoolUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'hd-1' });
        expect(args.data.remaining).toBe(5);
        expect(result).toEqual(fakeStats);
    });

    test('floors remaining at 0', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        hitDicePoolFindManyMock.mockResolvedValueOnce([
            {
                ...fakeHitDicePools[0],
                remaining: 1,
            },
        ]);

        await resolvers.spendHitDie({}, { characterId: 'char-1', classId: 'wizard', amount: 5 }, authedCtx);

        const args = hitDicePoolUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.remaining).toBe(0);
    });
});

describe('characterResolvers — shortRest', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.shortRest({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('resets pact slots, restores short-rest features, and returns character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        spellSlotUpdateManyMock.mockResolvedValueOnce({ count: 1 });
        executeRawMock.mockResolvedValueOnce(2);

        const result = await resolvers.shortRest({}, { characterId: 'char-1' }, authedCtx);

        expect(spellSlotUpdateManyMock).toHaveBeenCalledTimes(1);
        const slotArgs = spellSlotUpdateManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(slotArgs.where).toEqual({ characterId: 'char-1', kind: 'PACT_MAGIC' });
        expect(slotArgs.data).toEqual({ used: 0 });
        expect(executeRawMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeCharacter);
    });
});

describe('characterResolvers — longRest', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.longRest({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('restores HP, resets death saves, recovers hit dice, resets spell slots, restores features', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce({
            ...fakeStats,
            hp: { current: 30, max: 76, temp: 5 },
        });
        hitDicePoolFindManyMock.mockResolvedValueOnce([
            { id: 'hd-1', characterId: 'char-1', classId: 'class-wizard-id', total: 9, remaining: 4 },
            { id: 'hd-2', characterId: 'char-1', classId: 'class-warlock-id', total: 3, remaining: 1 },
        ]);
        characterClassFindManyMock.mockResolvedValueOnce([
            { classId: 'class-wizard-id', level: 9, isStartingClass: true, classRef: { name: 'Wizard' } },
            { classId: 'class-warlock-id', level: 3, isStartingClass: false, classRef: { name: 'Warlock' } },
        ]);
        statsUpdateMock.mockResolvedValueOnce({});
        hitDicePoolUpdateMock.mockResolvedValue({});
        spellSlotUpdateManyMock.mockResolvedValueOnce({ count: 3 });
        executeRawMock.mockResolvedValueOnce(2);

        const result = await resolvers.longRest({}, { characterId: 'char-1' }, authedCtx);

        const hpCall = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(hpCall.data.hp).toEqual({ current: 76, max: 76, temp: 0 });
        expect(hpCall.data.deathSaves).toEqual({ successes: 0, failures: 0 });

        expect(hitDicePoolUpdateMock).toHaveBeenCalledTimes(2);
        expect(hitDicePoolUpdateMock.mock.calls[0]![0]).toEqual({
            where: { id: 'hd-1' },
            data: { remaining: 9 },
        });
        expect(hitDicePoolUpdateMock.mock.calls[1]![0]).toEqual({
            where: { id: 'hd-2' },
            data: { remaining: 2 },
        });

        expect(spellSlotUpdateManyMock).toHaveBeenCalledTimes(1);
        expect(executeRawMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeCharacter);
    });
});
