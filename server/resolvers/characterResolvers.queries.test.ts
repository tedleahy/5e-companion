import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    characterFindFirstMock,
    characterFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    resolvers,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('characterResolvers — queries', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('character throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.character({}, { id: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
        expect(characterFindFirstMock).not.toHaveBeenCalled();
    });

    test('character calls findFirst with id + ownerUserId', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);

        const result = await resolvers.character({}, { id: 'char-1' }, authedCtx);

        expect(characterFindFirstMock).toHaveBeenCalledTimes(1);
        const args = characterFindFirstMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ id: 'char-1', ownerUserId: 'user-abc' });
        expect(result).toEqual(fakeCharacter);
    });

    test('currentUserCharacters throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.currentUserCharacters({}, {}, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('currentUserCharacters calls findMany with ownerUserId', async () => {
        characterFindManyMock.mockResolvedValueOnce([fakeCharacter]);

        const result = await resolvers.currentUserCharacters({}, {}, authedCtx);

        expect(characterFindManyMock).toHaveBeenCalledTimes(1);
        const args = characterFindManyMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ ownerUserId: 'user-abc' });
        expect(result).toEqual([fakeCharacter]);
    });
});
