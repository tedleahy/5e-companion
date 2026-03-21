import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFindFirstMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    fakeStats,
    resolvers,
    statsFindUniqueMock,
    statsUpdateMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — updateDeathSaves', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('updates death saves on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newDS = { successes: 2, failures: 1 };
        const updatedStats = { ...fakeStats, deathSaves: newDS };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateDeathSaves(
            {}, { characterId: 'char-1', input: newDS }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.deathSaves).toEqual(newDS);
        expect(result).toEqual(updatedStats);
    });
});

describe('characterResolvers — updateHitDice', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('updates hit dice on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newHD = { total: 12, remaining: 8, die: 'd6' };
        const updatedStats = { ...fakeStats, hitDice: newHD };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateHitDice(
            {}, { characterId: 'char-1', input: newHD }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.hitDice).toEqual(newHD);
        expect(result).toEqual(updatedStats);
    });
});

describe('characterResolvers — updateSkillProficiencies', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('merges provided skills over existing', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const input = { perception: 'proficient' };
        const merged = { ...fakeStats.skillProficiencies, perception: 'proficient' };
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, skillProficiencies: merged });

        await resolvers.updateSkillProficiencies(
            {}, { characterId: 'char-1', input: input as any }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.skillProficiencies.perception).toBe('proficient');
        expect(callArgs.data.skillProficiencies.arcana).toBe('expert');
    });
});

describe('characterResolvers — updateSavingThrowProficiencies', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('updates saving throw proficiencies on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newProfs = ['strength', 'constitution', 'intelligence'];
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, savingThrowProficiencies: newProfs });

        const result = await resolvers.updateSavingThrowProficiencies(
            {}, { characterId: 'char-1', input: { proficiencies: newProfs } }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.savingThrowProficiencies).toEqual(newProfs);
        expect(result.savingThrowProficiencies).toEqual(newProfs);
    });
});
