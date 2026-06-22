import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    classFindFirstMock,
    clearAllCharacterResolverMocks,
    featureCreateMock,
    featureDeleteManyMock,
    featureFindManyMock,
    featureUpdateMock,
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
                selectionLevel: 3,
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
                selectionLevel: 3,
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
                { input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
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
                { input: { classId: '   ', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
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

    test('rejects description over 10000 characters', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                {
                    input: {
                        classId: 'wizard',
                        name: 'School of Glass',
                        description: 'A'.repeat(10001),
                    },
                },
                authedCtx,
            ),
        ).rejects.toThrow('Description must be 10000 characters or fewer.');
    });

    test('rejects selection levels outside 1 through 20', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 0 } },
                authedCtx,
            ),
        ).rejects.toThrow('Selection level must be an integer from 1 to 20.');

        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 21 } },
                authedCtx,
            ),
        ).rejects.toThrow('Selection level must be an integer from 1 to 20.');
    });

    test('rejects unknown class srdIndex', () => {
        classFindFirstMock.mockResolvedValueOnce(null);

        expect(
            resolvers.createCustomSubclass(
                {},
                { input: { classId: 'unknown', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
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
                { input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
                authedCtx,
            ),
        ).rejects.toThrow('You already have a custom subclass named "Foo" for Wizard.');
    });

    test('creates an owned subclass and returns it', async () => {
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });
        subclassFindFirstMock
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 'new-subclass-id',
                srdIndex: null,
                ownerUserId: 'user-abc',
                name: 'School of Glass',
                selectionLevel: 3,
                description: ['A delicate art.'],
                classId: 'class-wizard-id',
                classRef: {
                    id: 'class-wizard-id',
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                features: [],
            });

        subclassCreateMock.mockResolvedValueOnce({
            id: 'new-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            selectionLevel: 3,
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
            { input: { classId: 'wizard', name: 'School of Glass', description: 'A delicate art.', selectionLevel: 3 } },
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
                    selectionLevel: 3,
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
            selectionLevel: 3,
            description: ['A delicate art.'],
            features: [],
            characterUsageCount: 0,
        });
    });

    test('rejects invalid feature rows before creating a subclass', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                {
                    input: {
                        classId: 'wizard',
                        name: 'School of Glass',
                        description: 'A delicate art.',
                        features: [{ name: 'Glass Step', description: 'Step through mirrors.', level: 0 }],
                    },
                },
                authedCtx,
            ),
        ).rejects.toThrow('Feature 1 level must be a positive integer.');
    });

    test('rejects duplicate feature names at the same level', () => {
        expect(
            resolvers.createCustomSubclass(
                {},
                {
                    input: {
                        classId: 'wizard',
                        name: 'School of Glass',
                        description: 'A delicate art.',
                        features: [
                            { name: 'Glass Step', description: 'Step through mirrors.', level: 2 },
                            { name: 'glass step', description: 'Step again.', level: 2 },
                        ],
                    },
                },
                authedCtx,
            ),
        ).rejects.toThrow('Duplicate subclass feature "glass step" at level 2.');
    });

    test('creates owned subclass feature definitions with source labels', async () => {
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });
        subclassFindFirstMock
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 'new-subclass-id',
                srdIndex: null,
                ownerUserId: 'user-abc',
                    name: 'School of Glass',
                    description: ['A delicate art.'],
                    selectionLevel: 3,
                    classId: 'class-wizard-id',
                classRef: {
                    id: 'class-wizard-id',
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                features: [
                    {
                        id: 'feature-glass-step',
                        name: 'Glass Step',
                        description: ['Step through mirrors.'],
                        level: 2,
                    },
                ],
            });

        subclassCreateMock.mockResolvedValueOnce({
            id: 'new-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            selectionLevel: 3,
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
            {
                input: {
                    classId: 'wizard',
                    name: 'School of Glass',
                    description: 'A delicate art.',
                    selectionLevel: 3,
                    features: [
                        {
                            name: 'Glass Step',
                            description: 'Step through mirrors.',
                            level: 2,
                        },
                    ],
                },
            },
            authedCtx,
        );

        expect(featureCreateMock).toHaveBeenCalledWith({
            data: {
                ownerUserId: 'user-abc',
                name: 'Glass Step',
                description: ['Step through mirrors.'],
                level: 2,
                kind: 'SUBCLASS_FEATURE',
                sourceLabel: 'School of Glass Wizard 2',
                classId: 'class-wizard-id',
                subclassId: 'new-subclass-id',
            },
        });
        expect(result.features).toEqual([
            {
                id: 'feature-glass-step',
                name: 'Glass Step',
                description: 'Step through mirrors.',
                level: 2,
            },
        ]);
    });
});

describe('customSubclassManager — updateCustomSubclass', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
                unauthedCtx,
            ),
        ).rejects.toThrow('UNAUTHENTICATED');
    });

    test('rejects blank fields', () => {
        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: '', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
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
                { id: 'sub-1', input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
                authedCtx,
            ),
        ).rejects.toThrow('Custom subclass not found.');
    });

    test('rejects when subclass is archived', () => {
        subclassFindFirstMock.mockResolvedValueOnce(null); // because archivedAt: null in where

        expect(
            resolvers.updateCustomSubclass(
                {},
                { id: 'sub-1', input: { classId: 'wizard', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
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
                { id: 'sub-1', input: { classId: 'sorcerer', name: 'Foo', description: 'Bar', selectionLevel: 3 } },
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
                {
                    id: 'sub-1',
                    input: {
                        classId: 'sorcerer',
                        name: 'Foo',
                        description: 'Bar',
                        selectionLevel: 3,
                        features: [{ id: 'feature-1', name: 'Feature A', description: 'Does something.', level: 3 }],
                    },
                },
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
                { id: 'sub-1', input: { classId: 'wizard', name: 'Duplicate', description: 'Bar', selectionLevel: 3 } },
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
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 'sub-1',
                srdIndex: null,
                ownerUserId: 'user-abc',
                name: 'Updated Name',
                selectionLevel: 3,
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

        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });

        subclassUpdateMock.mockResolvedValueOnce({
            id: 'sub-1',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'Updated Name',
            selectionLevel: 3,
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
            { id: 'sub-1', input: { classId: 'wizard', name: 'Updated Name', description: 'Updated description.', selectionLevel: 3 } },
            authedCtx,
        );

        expect(subclassUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'sub-1' },
                data: {
                    name: 'Updated Name',
                    description: ['Updated description.'],
                    selectionLevel: 3,
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
            selectionLevel: 3,
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

    test('reconciles updated, created, and omitted owned feature definitions', async () => {
        subclassFindFirstMock
            .mockResolvedValueOnce({
                id: 'sub-1',
                ownerUserId: 'user-abc',
                classRef: {
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                _count: { characterClasses: 0, features: 2 },
            })
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
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
                        id: 'feat-kept',
                        name: 'Feature A',
                        description: ['Updated feature.'],
                        level: 3,
                    },
                    {
                        id: 'feat-created',
                        name: 'Feature B',
                        description: ['New feature.'],
                        level: 7,
                    },
                ],
                _count: { characterClasses: 0 },
            });
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });
        featureFindManyMock.mockResolvedValueOnce([
            { id: 'feat-kept', ownerUserId: 'user-abc', subclassId: 'sub-1', kind: 'SUBCLASS_FEATURE' },
            { id: 'feat-removed', ownerUserId: 'user-abc', subclassId: 'sub-1', kind: 'SUBCLASS_FEATURE' },
        ]);

        const result = await resolvers.updateCustomSubclass(
            {},
            {
                id: 'sub-1',
                input: {
                    classId: 'wizard',
                    name: 'Updated Name',
                    description: 'Updated description.',
                    selectionLevel: 3,
                    features: [
                        {
                            id: 'feat-kept',
                            name: 'Feature A',
                            description: 'Updated feature.',
                            level: 3,
                        },
                        {
                            name: 'Feature B',
                            description: 'New feature.',
                            level: 7,
                        },
                    ],
                },
            },
            authedCtx,
        );

        expect(featureDeleteManyMock).toHaveBeenCalledWith({
            where: {
                ownerUserId: 'user-abc',
                kind: 'SUBCLASS_FEATURE',
                subclassId: 'sub-1',
                id: { notIn: ['feat-kept'] },
            },
        });
        expect(featureUpdateMock).toHaveBeenCalledWith({
            where: { id: 'feat-kept', ownerUserId: 'user-abc' },
            data: {
                ownerUserId: 'user-abc',
                name: 'Feature A',
                description: ['Updated feature.'],
                level: 3,
                kind: 'SUBCLASS_FEATURE',
                sourceLabel: 'Updated Name Wizard 3',
                classId: 'class-wizard-id',
                subclassId: 'sub-1',
            },
        });
        expect(featureCreateMock).toHaveBeenCalledWith({
            data: {
                ownerUserId: 'user-abc',
                name: 'Feature B',
                description: ['New feature.'],
                level: 7,
                kind: 'SUBCLASS_FEATURE',
                sourceLabel: 'Updated Name Wizard 7',
                classId: 'class-wizard-id',
                subclassId: 'sub-1',
            },
        });
        expect(result.features).toHaveLength(2);
    });

    test('rejects updating a feature not owned by the subclass', () => {
        subclassFindFirstMock
            .mockResolvedValueOnce({
                id: 'sub-1',
                ownerUserId: 'user-abc',
                classRef: {
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                _count: { characterClasses: 0, features: 1 },
            })
            .mockResolvedValueOnce(null);
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' });
        featureFindManyMock.mockResolvedValueOnce([
            { id: 'owned-feature', ownerUserId: 'user-abc', subclassId: 'sub-1', kind: 'SUBCLASS_FEATURE' },
        ]);

        expect(
            resolvers.updateCustomSubclass(
                {},
                {
                    id: 'sub-1',
                    input: {
                        classId: 'wizard',
                        name: 'Updated Name',
                        description: 'Updated description.',
                        selectionLevel: 3,
                        features: [
                            {
                                id: 'other-feature',
                                name: 'Feature A',
                                description: 'Updated feature.',
                                level: 3,
                            },
                        ],
                    },
                },
                authedCtx,
            ),
        ).rejects.toThrow('Custom subclass feature not found.');
    });

    test('allows changing parent class when saved feature definitions are emptied', async () => {
        subclassFindFirstMock
            .mockResolvedValueOnce({
                id: 'sub-1',
                ownerUserId: 'user-abc',
                classRef: {
                    srdIndex: 'wizard',
                    name: 'Wizard',
                },
                _count: { characterClasses: 0, features: 1 },
            })
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 'sub-1',
                srdIndex: null,
                ownerUserId: 'user-abc',
                name: 'Updated Name',
                description: ['Updated description.'],
                classId: 'class-fighter-id',
                classRef: {
                    id: 'class-fighter-id',
                    srdIndex: 'fighter',
                    name: 'Fighter',
                },
                features: [],
                _count: { characterClasses: 0 },
            });
        classFindFirstMock.mockResolvedValueOnce({ id: 'class-fighter-id', srdIndex: 'fighter', name: 'Fighter' });
        featureFindManyMock.mockResolvedValueOnce([
            { id: 'feat-removed', ownerUserId: 'user-abc', subclassId: 'sub-1', kind: 'SUBCLASS_FEATURE' },
        ]);

        const result = await resolvers.updateCustomSubclass(
            {},
            {
                id: 'sub-1',
                input: {
                    classId: 'fighter',
                    name: 'Updated Name',
                    description: 'Updated description.',
                    selectionLevel: 3,
                    features: [],
                },
            },
            authedCtx,
        );

        expect(featureDeleteManyMock).toHaveBeenCalledWith({
            where: {
                ownerUserId: 'user-abc',
                kind: 'SUBCLASS_FEATURE',
                subclassId: 'sub-1',
            },
        });
        expect(result.classId).toBe('fighter');
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
