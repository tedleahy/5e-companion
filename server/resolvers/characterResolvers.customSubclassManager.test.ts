import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    classFindFirstMock,
    clearAllCharacterResolverMocks,
    resolvers,
    subclassCreateMock,
    subclassFindFirstMock,
    subclassFindManyMock,
    subclassUpdateMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

describe('customSubclassManager — customSubclasses', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('maps ordered feature rows and joins multi-paragraph descriptions', async () => {
        subclassFindManyMock.mockResolvedValueOnce([
            {
                id: 'custom-subclass-id',
                srdIndex: null,
                ownerUserId: 'user-abc',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards.'],
                classId: 'class-wizard-id',
                classRef: {
                    id: 'class-wizard-id',
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                features: [
                    {
                        id: 'feature-refraction-shield',
                        name: 'Refraction Shield',
                        description: [
                            'Bend light to turn aside attacks.',
                            'The shield splinters into harmless motes.',
                        ],
                        level: 2,
                    },
                    {
                        id: 'feature-glass-step',
                        name: 'Glass Step',
                        description: ['Walk through a nearby reflection.'],
                        level: null,
                    },
                ],
                _count: { characterClasses: 4 },
            },
        ]);

        const result = await resolvers.customSubclasses({}, { classIds: ['wizard'] }, authedCtx);

        const args = subclassFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.include.features).toEqual({
            where: {
                kind: 'SUBCLASS_FEATURE',
            },
            orderBy: [
                { level: 'asc' },
                { name: 'asc' },
            ],
        });
        expect(result).toEqual([
            {
                id: 'custom-subclass-id',
                value: 'custom-subclass-id',
                classId: 'wizard',
                className: 'Wizard',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards.'],
                features: [
                    {
                        id: 'feature-refraction-shield',
                        name: 'Refraction Shield',
                        description: 'Bend light to turn aside attacks.\n\nThe shield splinters into harmless motes.',
                        level: 2,
                    },
                    {
                        id: 'feature-glass-step',
                        name: 'Glass Step',
                        description: 'Walk through a nearby reflection.',
                        level: 0,
                    },
                ],
                characterUsageCount: 4,
            },
        ]);
    });
});

describe('customSubclassManager — createCustomSubclass', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'wizard', name: 'Foo', description: 'Bar' } },
                unauthedCtx,
            ),
        ).rejects.toThrow('UNAUTHENTICATED');
    });

    test('rejects blank name', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'wizard', name: '   ', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Name, description, and class are required.');
    });

    test('rejects blank classId', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: '   ', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Name, description, and class are required.');
    });

    test('rejects name over 100 characters', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                {
                    input: {
                        classId: 'wizard',
                        name: 'A'.repeat(101),
                        description: 'Bar',
                    },
                },
                authedCtx,
            ),
        ).rejects.toThrow('Name must be 100 characters or fewer.');
    });

    test('rejects unknown class srdIndex', () => {
        classFindFirstMock.mockResolvedValueOnce(null);

        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'unknown', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Unknown class: unknown');
    });

    test('rejects duplicate active name for same class and user case-insensitively', () => {
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });
        subclassFindFirstMock.mockResolvedValueOnce({ id: 'existing-id', name: 'foo' });

        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'wizard', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('You already have a custom subclass named "Foo" for Wizard.');
    });

    test('creates an owned subclass and returns it', async () => {
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });
        subclassFindFirstMock.mockResolvedValueOnce(null);

        subclassCreateMock.mockResolvedValueOnce({
            id: 'new-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            description: ['A delicate art.'],
            classId: 'class-wizard-id',
            classRef: {
                id: 'class-wizard-id',
                srdIndex: 'wizard',
                name: 'Wizard',
            },
            features: [],
        });

        const result = await resolvers.createCustomSubclass(
            {},
            { input: { classId: 'wizard', name: 'School of Glass', description: 'A delicate art.' } },
            authedCtx,
        );

        expect(classFindFirstMock).toHaveBeenCalledWith(
            expect.objectContaining({ where: { srdIndex: 'wizard' } }),
        );
        expect(subclassFindFirstMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    ownerUserId: 'user-abc',
                    classId: 'class-wizard-id',
                    name: {
                        equals: 'School of Glass',
                        mode: 'insensitive',
                    },
                    archivedAt: null,
                },
            }),
        );
        expect(subclassCreateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    ownerUserId: 'user-abc',
                    name: 'School of Glass',
                    description: ['A delicate art.'],
                    classId: 'class-wizard-id',
                },
            }),
        );
        expect(result).toEqual({
            id: 'new-subclass-id',
            value: 'new-subclass-id',
            classId: 'wizard',
            className: 'Wizard',
            name: 'School of Glass',
            description: ['A delicate art.'],
            features: [],
            characterUsageCount: 0,
        });
    });
});

describe('customSubclassManager — updateCustomSubclass', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'wizard', name: 'Foo', description: 'Bar' } },
                unauthedCtx,
            ),
        ).rejects.toThrow('UNAUTHENTICATED');
    });

    test('rejects blank fields', () => {
        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: '', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Name, description, and class are required.');
    });

    test('rejects when subclass is not owned by the current user', () => {
        // subclass.findFirst returns null because where filters by ownerUserId
        subclassFindFirstMock.mockResolvedValueOnce(null);

        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'wizard', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Custom subclass not found.');
    });

    test('rejects when subclass is archived', () => {
        subclassFindFirstMock.mockResolvedValueOnce(null); // because archivedAt: null in where

        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'wizard', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Custom subclass not found.');
    });

    test('rejects changing parent class when subclass is used by characters', () => {
        subclassFindFirstMock.mockResolvedValueOnce({
            id: 'sub-1',
            ownerUserId: 'user-abc',
            classRef: {
                srdIndex: 'warlock',
                name: 'Warlock',
            },
            _count: { characterClasses: 3, features: 0 },
        });
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-sorcerer-id', srdIndex: 'sorcerer', name: 'Sorcerer' });

        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'sorcerer', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Cannot change the parent class of a subclass used by 3 character(s).');
    });

    test('rejects changing parent class when subclass has feature definitions', () => {
        subclassFindFirstMock.mockResolvedValueOnce({
            id: 'sub-1',
            ownerUserId: 'user-abc',
            classRef: {
                srdIndex: 'warlock',
                name: 'Warlock',
            },
            _count: { characterClasses: 0, features: 2 },
        });
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-sorcerer-id', srdIndex: 'sorcerer', name: 'Sorcerer' });

        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'sorcerer', name: 'Foo', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('Cannot change the parent class of a subclass with 2 feature definition(s).');
    });

    test('rejects duplicate name for same class and user', () => {
        subclassFindFirstMock
            .mockResolvedValueOnce({
                id: 'sub-1',
                ownerUserId: 'user-abc',
                classRef: {
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                _count: { characterClasses: 0, features: 0 },
            })
            .mockResolvedValueOnce({ id: 'other-id', name: 'Duplicate' }); // duplicate check

        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });

        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'wizard', name: 'Duplicate', description: 'Bar' } },
                authedCtx,
            ),
        ).rejects.toThrow('You already have a custom subclass named "Duplicate" for Wizard.');
    });

    test('updates subclass and returns it', async () => {
        subclassFindFirstMock
            .mockResolvedValueOnce({
                id: 'sub-1',
                ownerUserId: 'user-abc',
                classRef: {
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                _count: { characterClasses: 0, features: 0 },
            })
            .mockResolvedValueOnce(null); // no duplicate

        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });

        subclassUpdateMock.mockResolvedValueOnce({
            id: 'sub-1',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'Updated Name',
            description: ['Updated description.'],
            classId: 'class-wizard-id',
            classRef: {
                id: 'class-wizard-id',
                srdIndex: 'wizard',
                name: 'Wizard',
            },
            features: [
                {
                    id: 'feat-1',
                    name: 'Feature A',
                    description: ['Does something.'],
                    level: 3,
                },
            ],
            _count: { characterClasses: 0 },
        });

        const result = await resolvers.updateCustomSubclass(
            {},
            { id: 'sub-1', input: { classId: 'wizard', name: 'Updated Name', description: 'Updated description.' } },
            authedCtx,
        );

        expect(subclassUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'sub-1' },
                data: {
                    name: 'Updated Name',
                    description: ['Updated description.'],
                    classId: 'class-wizard-id',
                },
            }),
        );
        expect(result).toEqual({
            id: 'sub-1',
            value: 'sub-1',
            classId: 'wizard',
            className: 'Wizard',
            name: 'Updated Name',
            description: ['Updated description.'],
            features: [
                {
                    id: 'feat-1',
                    name: 'Feature A',
                    description: 'Does something.',
                    level: 3,
                },
            ],
            characterUsageCount: 0,
        });
    });
});

describe('customSubclassManager — archiveCustomSubclass', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(
            resolvers.archiveCustomSubclass({}, { id: 'sub-1' }, unauthedCtx),
        ).rejects.toThrow('UNAUTHENTICATED');
    });

    test('rejects when subclass not owned by user', () => {
        subclassFindFirstMock.mockResolvedValueOnce(null);

        expect(
            resolvers.archiveCustomSubclass({}, { id: 'sub-1' }, authedCtx),
        ).rejects.toThrow('Custom subclass not found.');
    });

    test('rejects when subclass is already archived', () => {
        subclassFindFirstMock.mockResolvedValueOnce(null); // archivedAt: null filter excludes it

        expect(
            resolvers.archiveCustomSubclass({}, { id: 'sub-1' }, authedCtx),
        ).rejects.toThrow('Custom subclass not found.');
    });

    test('sets archivedAt and returns true', async () => {
        subclassFindFirstMock.mockResolvedValueOnce({
            id: 'sub-1',
            ownerUserId: 'user-abc',
            archivedAt: null,
        });
        subclassUpdateMock.mockResolvedValueOnce({ id: 'sub-1', archivedAt: new Date() });

        const result = await resolvers.archiveCustomSubclass({}, { id: 'sub-1' }, authedCtx);

        expect(subclassFindFirstMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'sub-1', ownerUserId: 'user-abc', archivedAt: null },
            }),
        );
        expect(subclassUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'sub-1' },
                data: { archivedAt: expect.any(Date) as Date },
            }),
        );
        expect(result).toBe(true);
    });
});
