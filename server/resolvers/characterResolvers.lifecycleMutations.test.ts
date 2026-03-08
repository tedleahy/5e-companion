import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterCreateMock,
    characterDeleteManyMock,
    characterFindFirstMock,
    characterUpdateMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    resolvers,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — createCharacter', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.createCharacter({}, { input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates character with stats in a nested create', async () => {
        const createdChar = { id: 'char-new', ownerUserId: 'user-abc' };
        characterCreateMock.mockResolvedValueOnce(createdChar);

        const input = {
            name: 'Vaelindra',
            race: 'High Elf',
            class: 'Wizard',
            level: 12,
            alignment: 'Chaotic Good',
            background: 'Sage',
            proficiencyBonus: 4,
            ac: 17,
            speed: 35,
            initiative: 7,
            abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 },
            hp: { current: 76, max: 76, temp: 0 },
            hitDice: { total: 12, remaining: 12, die: 'd6' },
            skillProficiencies: { arcana: 'expert' },
        };

        const result = await resolvers.createCharacter({}, { input: input as any }, authedCtx);

        expect(characterCreateMock).toHaveBeenCalledTimes(1);
        const callArgs = characterCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.ownerUserId).toBe('user-abc');
        expect(callArgs.data.name).toBe('Vaelindra');
        expect(callArgs.data.stats.create.abilityScores).toEqual(input.abilityScores);
        expect(callArgs.data.stats.create.hp).toEqual(input.hp);
        expect(callArgs.data.stats.create.deathSaves).toEqual({ successes: 0, failures: 0 });
        expect(result).toEqual(createdChar);
    });
});

describe('characterResolvers — updateCharacter', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateCharacter({}, { id: 'char-1', input: {} }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('throws when character not found', () => {
        characterFindFirstMock.mockResolvedValueOnce(null);

        expect(resolvers.updateCharacter({}, { id: 'char-1', input: { name: 'New' } }, authedCtx))
            .rejects.toThrow('Character not found.');
    });

    test('updates only provided fields', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const updatedChar = { ...fakeCharacter, name: 'New Name' };
        characterUpdateMock.mockResolvedValueOnce(updatedChar);

        const result = await resolvers.updateCharacter(
            {}, { id: 'char-1', input: { name: 'New Name' } }, authedCtx,
        );

        expect(characterUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.name).toBe('New Name');
        expect(result).toEqual(updatedChar);
    });
});

describe('characterResolvers — deleteCharacter', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.deleteCharacter({}, { id: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('returns true on successful delete', async () => {
        characterDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.deleteCharacter({}, { id: 'char-1' }, authedCtx);

        expect(result).toBe(true);
        const callArgs = characterDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.where).toEqual({ id: 'char-1', ownerUserId: 'user-abc' });
    });

    test('throws when character not found', () => {
        characterDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.deleteCharacter({}, { id: 'char-1' }, authedCtx))
            .rejects.toThrow('Character not found.');
    });
});

describe('characterResolvers — toggleInspiration', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.toggleInspiration({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('flips inspiration from false to true', async () => {
        characterFindFirstMock.mockResolvedValueOnce({ ...fakeCharacter, inspiration: false });
        const updated = { ...fakeCharacter, inspiration: true };
        characterUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleInspiration({}, { characterId: 'char-1' }, authedCtx);

        expect(characterUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.inspiration).toBe(true);
        expect(result).toEqual(updated);
    });

    test('flips inspiration from true to false', async () => {
        characterFindFirstMock.mockResolvedValueOnce({ ...fakeCharacter, inspiration: true });
        const updated = { ...fakeCharacter, inspiration: false };
        characterUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleInspiration({}, { characterId: 'char-1' }, authedCtx);

        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.inspiration).toBe(false);
        expect(result).toEqual(updated);
    });
});
