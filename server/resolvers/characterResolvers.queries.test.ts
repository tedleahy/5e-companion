import { beforeEach, describe, expect, test } from 'bun:test';
import { CHARACTER_DETAIL_INCLUDE, CHARACTER_LIST_INCLUDE } from './character/detailLoad';
import {
    authedCtx,
    characterCountMock,
    characterFindFirstMock,
    characterFindManyMock,
    clearAllCharacterResolverMocks,
    fakeCharacter,
    resolvers,
    subclassFindManyMock,
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
        expect(args.include).toEqual(CHARACTER_DETAIL_INCLUDE);
        expect(result).toEqual(fakeCharacter);
    });

    test('currentUserCharacters throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.currentUserCharacters({}, {}, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('hasCurrentUserCharacters throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.hasCurrentUserCharacters({}, {}, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
        expect(characterCountMock).not.toHaveBeenCalled();
    });

    test('hasCurrentUserCharacters returns true when the user has at least one character', async () => {
        characterCountMock.mockResolvedValueOnce(1);

        const result = await resolvers.hasCurrentUserCharacters({}, {}, authedCtx);

        expect(characterCountMock).toHaveBeenCalledTimes(1);
        const args = characterCountMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ ownerUserId: 'user-abc' });
        expect(result).toBe(true);
    });

    test('currentUserCharacters calls findMany with ownerUserId', async () => {
        characterFindManyMock.mockResolvedValueOnce([fakeCharacter]);

        const result = await resolvers.currentUserCharacters({}, {}, authedCtx);

        expect(characterFindManyMock).toHaveBeenCalledTimes(1);
        const args = characterFindManyMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ ownerUserId: 'user-abc' });
        expect(args.include).toEqual(CHARACTER_LIST_INCLUDE);
        expect(result).toEqual([fakeCharacter]);
    });

    test('availableSubclasses returns SRD and owned custom subclasses for the requested classes', async () => {
        subclassFindManyMock.mockResolvedValueOnce([
            {
                id: 'subclass-evocation-id',
                srdIndex: 'evocation',
                ownerUserId: null,
                name: 'School of Evocation',
                description: ['Focus your magic on raw elemental force.'],
                classId: 'class-wizard-id',
                classRef: {
                    id: 'class-wizard-id',
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                features: [],
            },
            {
                id: 'custom-subclass-id',
                srdIndex: null,
                ownerUserId: 'user-abc',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards and refractions.'],
                classId: 'class-wizard-id',
                classRef: {
                    id: 'class-wizard-id',
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                features: [
                    {
                        id: 'glass-feature-1',
                        name: 'Refraction Shield',
                        description: ['Bend light to turn aside attacks.'],
                        level: 2,
                    },
                ],
            },
        ]);

        const result = await resolvers.availableSubclasses(
            {},
            { classIds: ['wizard'] },
            authedCtx,
        );

        expect(subclassFindManyMock).toHaveBeenCalledTimes(1);
        const args = subclassFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.include).toEqual({
            classRef: true,
            features: {
                where: {
                    kind: 'SUBCLASS_FEATURE',
                },
                orderBy: [
                    { level: 'asc' },
                    { name: 'asc' },
                ],
            },
        });
        expect(args.where).toEqual({
            AND: [
                {
                    OR: [
                        { ownerUserId: null },
                        { ownerUserId: 'user-abc' },
                    ],
                },
                {
                    classRef: {
                        srdIndex: {
                            in: ['wizard'],
                        },
                    },
                },
            ],
        });
        expect(result).toEqual([
            {
                id: 'subclass-evocation-id',
                value: 'evocation',
                srdIndex: 'evocation',
                classId: 'wizard',
                className: 'Wizard',
                name: 'School of Evocation',
                description: ['Focus your magic on raw elemental force.'],
                isCustom: false,
                features: [],
            },
            {
                id: 'custom-subclass-id',
                value: 'custom-subclass-id',
                srdIndex: null,
                classId: 'wizard',
                className: 'Wizard',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards and refractions.'],
                isCustom: true,
                features: [
                    {
                        id: 'glass-feature-1',
                        name: 'Refraction Shield',
                        description: 'Bend light to turn aside attacks.',
                        level: 2,
                    },
                ],
            },
        ]);
    });
});
