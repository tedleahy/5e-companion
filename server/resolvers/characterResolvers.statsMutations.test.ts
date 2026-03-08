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

describe('characterResolvers — updateAbilityScores', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateAbilityScores(
            {}, { characterId: 'char-1', input: {} as any }, unauthedCtx,
        )).rejects.toThrow('UNAUTHENTICATED');
    });

    test('updates ability scores on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newScores = { strength: 10, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 };
        const updatedStats = { ...fakeStats, abilityScores: newScores };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateAbilityScores(
            {}, { characterId: 'char-1', input: newScores }, authedCtx,
        );

        expect(statsUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.abilityScores).toEqual(newScores);
        expect(result).toEqual(updatedStats);
    });

    test('throws when character not found', () => {
        characterFindFirstMock.mockResolvedValueOnce(null);

        expect(resolvers.updateAbilityScores(
            {}, { characterId: 'char-1', input: {} as any }, authedCtx,
        )).rejects.toThrow('Character not found.');
    });
});

describe('characterResolvers — updateHP', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('updates HP on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newHP = { current: 30, max: 76, temp: 0 };
        const updatedStats = { ...fakeStats, hp: newHP };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateHP(
            {}, { characterId: 'char-1', input: newHP }, authedCtx,
        );

        expect(statsUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.hp).toEqual(newHP);
        expect(result).toEqual(updatedStats);
    });
});

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

describe('characterResolvers — updateTraits', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('merges editable traits while preserving metadata fields', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newTraits = { personality: 'Bold', ideals: 'Freedom', bonds: 'Family', flaws: 'Reckless' };
        statsUpdateMock.mockResolvedValueOnce({
            ...fakeStats,
            traits: {
                ...fakeStats.traits,
                ...newTraits,
            },
        });

        const result = await resolvers.updateTraits(
            {}, { characterId: 'char-1', input: newTraits }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.traits).toEqual({
            ...fakeStats.traits,
            ...newTraits,
        });
        expect(result.traits.armorProficiencies).toEqual([]);
        expect(result.traits.languages).toEqual(['Common', 'Elvish']);
    });
});

describe('characterResolvers — updateCurrency', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('updates currency on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newCurrency = { cp: 10, sp: 20, ep: 0, gp: 500, pp: 5 };
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, currency: newCurrency });

        const result = await resolvers.updateCurrency(
            {}, { characterId: 'char-1', input: newCurrency }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.currency).toEqual(newCurrency);
        expect(result.currency).toEqual(newCurrency);
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
