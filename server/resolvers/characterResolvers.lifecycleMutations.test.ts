import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    backgroundFindFirstMock,
    characterCreateMock,
    characterDeleteManyMock,
    characterFindFirstMock,
    characterUpdateMock,
    classFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    resolvers,
    raceFindFirstMock,
    subclassFindManyMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — createCharacter', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.createCharacter({}, { input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates a multiclass character with derived class rows, hp, hit dice, and spell slots', async () => {
        characterCreateMock.mockResolvedValueOnce({ id: 'char-new', ownerUserId: 'user-abc' });
        classFindManyMock.mockResolvedValueOnce([
            {
                id: 'class-wizard-id',
                srdIndex: 'wizard',
                name: 'Wizard',
                hitDie: 6,
                spellcastingAbility: 'int',
                proficiencies: [
                    { srdIndex: 'saving-throw-int', name: 'INT', type: 'SAVING_THROW' },
                    { srdIndex: 'saving-throw-wis', name: 'WIS', type: 'SAVING_THROW' },
                ],
            },
            {
                id: 'class-warlock-id',
                srdIndex: 'warlock',
                name: 'Warlock',
                hitDie: 8,
                spellcastingAbility: 'cha',
                proficiencies: [
                    { srdIndex: 'saving-throw-wis', name: 'WIS', type: 'SAVING_THROW' },
                    { srdIndex: 'saving-throw-cha', name: 'CHA', type: 'SAVING_THROW' },
                ],
            },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id' },
            { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id' },
        ]);
        raceFindFirstMock.mockResolvedValueOnce({
            id: 'race-elf-id',
            name: 'Elf',
            languages: [{ name: 'Common' }, { name: 'Elvish' }],
            traits: [],
        });
        backgroundFindFirstMock.mockResolvedValueOnce({
            id: 'background-acolyte-id',
            name: 'Acolyte',
            proficiencies: [],
            languages: [],
            languageChoiceCount: 2,
        });

        const input = {
            name: 'Vaelindra',
            race: 'elf',
            classes: [
                { classId: 'wizard', subclassId: 'evocation', level: 9 },
                { classId: 'warlock', subclassId: 'fiend', level: 3 },
            ],
            startingClassIndex: 0,
            alignment: 'Chaotic Good',
            background: 'acolyte',
            ac: 17,
            speed: 30,
            initiative: 3,
            abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 14 },
            skillProficiencies: { arcana: 'expert' },
        };

        await resolvers.createCharacter({}, { input: input as any }, authedCtx);

        const callArgs = characterCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.ownerUserId).toBe('user-abc');
        expect(callArgs.data.race).toBe('Elf');
        expect(callArgs.data.background).toBe('Acolyte');
        expect(callArgs.data.proficiencyBonus).toBe(4);
        expect(callArgs.data.stats.create.hp).toEqual({ current: 77, max: 77, temp: 0 });
        expect(callArgs.data.stats.create.savingThrowProficiencies).toEqual(['intelligence', 'wisdom']);
        expect(callArgs.data.classes.create).toEqual([
            { classId: 'class-wizard-id', subclassId: 'subclass-evocation-id', level: 9, order: 0, isStartingClass: true },
            { classId: 'class-warlock-id', subclassId: 'subclass-fiend-id', level: 3, order: 1, isStartingClass: false },
        ]);
        expect(callArgs.data.hitDicePools.create).toEqual([
            { classId: 'class-wizard-id', total: 9, remaining: 9, die: 'd6' },
            { classId: 'class-warlock-id', total: 3, remaining: 3, die: 'd8' },
        ]);
        expect(callArgs.data.spellSlots.create).toEqual([
            { kind: 'STANDARD', level: 1, total: 4, used: 0 },
            { kind: 'STANDARD', level: 2, total: 3, used: 0 },
            { kind: 'STANDARD', level: 3, total: 3, used: 0 },
            { kind: 'STANDARD', level: 4, total: 3, used: 0 },
            { kind: 'STANDARD', level: 5, total: 1, used: 0 },
            { kind: 'PACT_MAGIC', level: 2, total: 2, used: 0 },
        ]);
    });

    test('rejects subclass rows that have not reached their unlock level', async () => {
        classFindManyMock.mockResolvedValueOnce([
            {
                id: 'class-wizard-id',
                srdIndex: 'wizard',
                name: 'Wizard',
                hitDie: 6,
                spellcastingAbility: 'int',
                proficiencies: [],
            },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id' },
        ]);
        raceFindFirstMock.mockResolvedValueOnce({ id: 'race-elf-id', name: 'Elf', languages: [], traits: [] });
        backgroundFindFirstMock.mockResolvedValueOnce({ id: 'background-acolyte-id', name: 'Acolyte', proficiencies: [], languages: [], languageChoiceCount: null });

        expect(resolvers.createCharacter({}, {
            input: {
                name: 'Vaelindra',
                race: 'elf',
                classes: [{ classId: 'wizard', subclassId: 'evocation', level: 1 }],
                startingClassIndex: 0,
                alignment: 'Chaotic Good',
                background: 'acolyte',
                ac: 12,
                speed: 30,
                initiative: 2,
                abilityScores: { strength: 8, dexterity: 14, constitution: 14, intelligence: 16, wisdom: 10, charisma: 10 },
                skillProficiencies: {},
            },
        } as any, authedCtx)).rejects.toThrow('requires wizard level 2');
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
