import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFindFirstMock,
    characterSpellDeleteManyMock,
    characterSpellUpdateMock,
    characterSpellUpsertMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    resolvers,
    spellSlotFindUniqueMock,
    spellSlotUpdateMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — learnSpell', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.learnSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('upserts a CharacterSpell row with prepared: false', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const created = { characterId: 'char-1', spellId: 'spell-1', prepared: false };
        characterSpellUpsertMock.mockResolvedValueOnce(created);

        const result = await resolvers.learnSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        expect(characterSpellUpsertMock).toHaveBeenCalledTimes(1);
        const args = characterSpellUpsertMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId_spellId: { characterId: 'char-1', spellId: 'spell-1' } });
        expect(args.create.prepared).toBe(false);
        expect(args.include).toEqual({ spell: true });
        expect(result).toEqual(created);
    });

    test('throws when character not found', () => {
        characterFindFirstMock.mockResolvedValueOnce(null);

        expect(resolvers.learnSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx))
            .rejects.toThrow('Character not found.');
    });
});

describe('characterResolvers — forgetSpell', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.forgetSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the CharacterSpell row and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterSpellDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.forgetSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        expect(result).toBe(true);
        const args = characterSpellDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1', spellId: 'spell-1' });
    });

    test('throws when spell not in spellbook', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterSpellDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.forgetSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx))
            .rejects.toThrow('Spell not in spellbook.');
    });
});

describe('characterResolvers — prepareSpell', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.prepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('sets prepared to true on existing CharacterSpell', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const updated = { characterId: 'char-1', spellId: 'spell-1', prepared: true };
        characterSpellUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.prepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        expect(characterSpellUpdateMock).toHaveBeenCalledTimes(1);
        const args = characterSpellUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.prepared).toBe(true);
        expect(args.include).toEqual({ spell: true });
        expect(result).toEqual(updated);
    });
});

describe('characterResolvers — unprepareSpell', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.unprepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('sets prepared to false on existing CharacterSpell', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const updated = { characterId: 'char-1', spellId: 'spell-1', prepared: false };
        characterSpellUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.unprepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        const args = characterSpellUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.prepared).toBe(false);
        expect(result).toEqual(updated);
    });
});

describe('characterResolvers — toggleSpellSlot', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 1 }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('increments used when not all used', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const slot = { id: 'slot-1', characterId: 'char-1', level: 1, total: 4, used: 2 };
        spellSlotFindUniqueMock.mockResolvedValueOnce(slot);
        const updated = { ...slot, used: 3 };
        spellSlotUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 1 }, authedCtx);

        const args = spellSlotUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.used).toBe(3);
        expect(result).toEqual(updated);
    });

    test('resets used to 0 when all slots are used', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const slot = { id: 'slot-1', characterId: 'char-1', level: 1, total: 4, used: 4 };
        spellSlotFindUniqueMock.mockResolvedValueOnce(slot);
        const updated = { ...slot, used: 0 };
        spellSlotUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 1 }, authedCtx);

        const args = spellSlotUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.used).toBe(0);
        expect(result).toEqual(updated);
    });

    test('throws when spell slot not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        spellSlotFindUniqueMock.mockResolvedValueOnce(null);

        expect(resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 9 }, authedCtx))
            .rejects.toThrow('Spell slot not found.');
    });
});
