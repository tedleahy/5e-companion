import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFindFirstMock,
    clearAllCharacterResolverMocks,
    executeRawMock,
    fakeCharacter,
    fakeStats,
    resolvers,
    spellSlotUpdateManyMock,
    statsFindUniqueMock,
    statsUpdateMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — spendHitDie', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.spendHitDie({}, { characterId: 'char-1', amount: 1 }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('decrements hitDice.remaining by amount', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const updatedStats = { ...fakeStats, hitDice: { total: 12, remaining: 10, die: 'd6' } };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.spendHitDie({}, { characterId: 'char-1', amount: 2 }, authedCtx);

        const args = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.hitDice.remaining).toBe(10);
        expect(result).toEqual(updatedStats);
    });

    test('floors remaining at 0', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const lowStats = { ...fakeStats, hitDice: { total: 12, remaining: 1, die: 'd6' } };
        statsFindUniqueMock.mockResolvedValueOnce(lowStats);
        statsUpdateMock.mockResolvedValueOnce({ ...lowStats, hitDice: { total: 12, remaining: 0, die: 'd6' } });

        await resolvers.spendHitDie({}, { characterId: 'char-1', amount: 5 }, authedCtx);

        const args = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.hitDice.remaining).toBe(0);
    });
});

describe('characterResolvers — shortRest', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.shortRest({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('calls $executeRaw to restore short-rest features and returns character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        executeRawMock.mockResolvedValueOnce(2);

        const result = await resolvers.shortRest({}, { characterId: 'char-1' }, authedCtx);

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
        const preRestStats = {
            ...fakeStats,
            hp: { current: 30, max: 76, temp: 5 },
            hitDice: { total: 12, remaining: 4, die: 'd6' },
        };
        statsFindUniqueMock.mockResolvedValueOnce(preRestStats);
        statsUpdateMock
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        spellSlotUpdateManyMock.mockResolvedValueOnce({ count: 3 });
        executeRawMock.mockResolvedValueOnce(2);

        const result = await resolvers.longRest({}, { characterId: 'char-1' }, authedCtx);

        const hpCall = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(hpCall.data.hp).toEqual({ current: 76, max: 76, temp: 0 });
        expect(hpCall.data.deathSaves).toEqual({ successes: 0, failures: 0 });

        const hdCall = statsUpdateMock.mock.calls[1]![0] as Record<string, any>;
        expect(hdCall.data.hitDice.remaining).toBe(10);

        expect(spellSlotUpdateManyMock).toHaveBeenCalledTimes(1);
        const slotArgs = spellSlotUpdateManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(slotArgs.data.used).toBe(0);

        expect(executeRawMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeCharacter);
    });

    test('caps hit dice recovery at total', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const preRestStats = {
            ...fakeStats,
            hp: { current: 76, max: 76, temp: 0 },
            hitDice: { total: 12, remaining: 11, die: 'd6' },
        };
        statsFindUniqueMock.mockResolvedValueOnce(preRestStats);
        statsUpdateMock
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        spellSlotUpdateManyMock.mockResolvedValueOnce({ count: 0 });
        executeRawMock.mockResolvedValueOnce(0);

        await resolvers.longRest({}, { characterId: 'char-1' }, authedCtx);

        const hdCall = statsUpdateMock.mock.calls[1]![0] as Record<string, any>;
        expect(hdCall.data.hitDice.remaining).toBe(12);
    });
});
