import { beforeEach, describe, expect, test } from 'bun:test';
import type { CharacterClassReference } from './character/multiclassRules';
import {
    authedCtx,
    backgroundFindFirstMock,
    characterCreateMock,
    characterDeleteManyMock,
    characterFindFirstMock,
    characterUpdateMock,
    classFindManyMock,
    clearAllCharacterResolverMocks,
    executeRawMock,
    fakeCharacter,
    featureFindManyMock,
    resolvers,
    raceFindFirstMock,
    subclassCreateManyAndReturnMock,
    subclassFindManyMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

const { materialiseResolvedCharacterClasses } = await import('./character/subclassReferences');

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
            { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id', selectionLevel: 2 },
            { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id', selectionLevel: 1 },
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
        featureFindManyMock.mockResolvedValueOnce([]);

        const input = {
            name: 'Vaelindra',
            race: 'elf',
            classes: [
                { classId: 'wizard', subclassId: 'evocation', level: 9 },
                { classId: 'warlock', subclassId: 'fiend', level: 3 },
            ],
            startingClassId: 'wizard',
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
            { classId: 'class-wizard-id', subclassId: 'subclass-evocation-id', level: 9, isStartingClass: true },
            { classId: 'class-warlock-id', subclassId: 'subclass-fiend-id', level: 3, isStartingClass: false },
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
            { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id', selectionLevel: 2 },
        ]);
        raceFindFirstMock.mockResolvedValueOnce({ id: 'race-elf-id', name: 'Elf', languages: [], traits: [] });
        backgroundFindFirstMock.mockResolvedValueOnce({ id: 'background-acolyte-id', name: 'Acolyte', proficiencies: [], languages: [], languageChoiceCount: null });
        featureFindManyMock.mockResolvedValueOnce([]);

        expect(resolvers.createCharacter({}, {
            input: {
                name: 'Vaelindra',
                race: 'elf',
                classes: [{ classId: 'wizard', subclassId: 'evocation', level: 1 }],
                startingClassId: 'wizard',
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

    test('rejects archived custom subclass ids for new characters', async () => {
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
        subclassFindManyMock.mockResolvedValueOnce([]);
        raceFindFirstMock.mockResolvedValueOnce({ id: 'race-elf-id', name: 'Elf', languages: [], traits: [] });
        backgroundFindFirstMock.mockResolvedValueOnce({ id: 'background-acolyte-id', name: 'Acolyte', proficiencies: [], languages: [], languageChoiceCount: null });

        expect(resolvers.createCharacter({}, {
            input: {
                name: 'Vaelindra',
                race: 'elf',
                classes: [{ classId: 'wizard', subclassId: 'archived-custom-id', level: 2 }],
                startingClassId: 'wizard',
                alignment: 'Chaotic Good',
                background: 'acolyte',
                ac: 12,
                speed: 30,
                initiative: 2,
                abilityScores: { strength: 8, dexterity: 14, constitution: 14, intelligence: 16, wisdom: 10, charisma: 10 },
                skillProficiencies: {},
            },
        } as any, authedCtx)).rejects.toThrow('Unknown subclass: archived-custom-id');

        const args = subclassFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where.AND[0].OR).toEqual([
            { ownerUserId: null },
            { ownerUserId: 'user-abc', archivedAt: null },
        ]);
    });

    test('creates and attaches a new owned custom subclass when the input provides one', async () => {
        characterCreateMock.mockResolvedValueOnce({ id: 'char-new', ownerUserId: 'user-abc' });
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
        subclassFindManyMock.mockResolvedValueOnce([]);
        subclassCreateManyAndReturnMock.mockResolvedValueOnce([{
            id: 'custom-subclass-id',
            srdIndex: null,
            ownerUserId: 'user-abc',
            name: 'School of Glass',
            description: ['A delicate art of mirrored wards and refractions.'],
            selectionLevel: 2,
            classId: 'class-wizard-id',
        }]);
        featureFindManyMock.mockReset();
        featureFindManyMock.mockImplementation(() => Promise.resolve([
            {
                id: 'feature-arcane-recovery',
                name: 'Arcane Recovery',
                description: ['Recover spell slots on a short rest.'],
                sourceLabel: 'Wizard 1',
                kind: 'CLASS_FEATURE',
                level: 1,
                classId: 'class-wizard-id',
                subclassId: null,
            },
            {
                id: 'feature-refraction-shield',
                name: 'Refraction Shield',
                description: ['Bend light to turn aside attacks.'],
                sourceLabel: 'School of Glass Wizard 2',
                kind: 'SUBCLASS_FEATURE',
                level: 2,
                classId: 'class-wizard-id',
                subclassId: 'custom-subclass-id',
            },
        ]));

        await resolvers.createCharacter({}, {
            input: {
                name: 'Vaelindra',
                race: 'elf',
                classes: [
                    {
                        classId: 'wizard',
                        level: 2,
                        customSubclass: {
                            name: 'School of Glass',
                            description: 'A delicate art of mirrored wards and refractions.',
                            selectionLevel: 2,
                        },
                    },
                ],
                startingClassId: 'wizard',
                alignment: 'Chaotic Good',
                background: 'acolyte',
                ac: 12,
                speed: 30,
                initiative: 2,
                abilityScores: { strength: 8, dexterity: 14, constitution: 14, intelligence: 16, wisdom: 10, charisma: 10 },
                skillProficiencies: {},
            },
        } as any, authedCtx);

        expect(subclassFindManyMock).toHaveBeenCalledWith({
            where: {
                ownerUserId: 'user-abc',
                archivedAt: null,
                OR: [{
                    classId: 'class-wizard-id',
                    name: {
                        equals: 'School of Glass',
                        mode: 'insensitive',
                    },
                }],
            },
        });
        expect(subclassCreateManyAndReturnMock).toHaveBeenCalledWith({
            data: [{
                ownerUserId: 'user-abc',
                name: 'School of Glass',
                description: ['A delicate art of mirrored wards and refractions.'],
                selectionLevel: 2,
                classId: 'class-wizard-id',
            }],
        });
        const callArgs = characterCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.classes.create).toEqual([
            { classId: 'class-wizard-id', subclassId: 'custom-subclass-id', level: 2, isStartingClass: true },
        ]);
        expect(featureFindManyMock).toHaveBeenCalledTimes(1);
        expect(callArgs.data.features.create).toEqual([
            {
                featureId: 'feature-arcane-recovery',
                name: 'Arcane Recovery',
                source: 'Wizard 1',
                description: 'Recover spell slots on a short rest.',
                usesMax: 1,
                usesRemaining: 1,
                recharge: 'long',
            },
            {
                featureId: 'feature-refraction-shield',
                name: 'Refraction Shield',
                source: 'School of Glass Wizard 2',
                description: 'Bend light to turn aside attacks.',
            },
        ]);
    });

    test('batches multiple inline custom subclass lookups and creates', async () => {
        const wizardClass: CharacterClassReference = {
            id: 'class-wizard-id',
            srdIndex: 'wizard',
            name: 'Wizard',
            hitDie: 6,
            spellcastingAbility: 'int',
        };
        const fighterClass: CharacterClassReference = {
            id: 'class-fighter-id',
            srdIndex: 'fighter',
            name: 'Fighter',
            hitDie: 10,
            spellcastingAbility: null,
        };
        subclassFindManyMock.mockResolvedValueOnce([]);
        subclassCreateManyAndReturnMock.mockResolvedValueOnce([
            {
                id: 'subclass-glass-id',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'School of Glass',
                description: ['Mirrored wards.'],
                selectionLevel: 2,
                classId: wizardClass.id,
            },
            {
                id: 'subclass-iron-id',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'Iron Vanguard',
                description: ['Unbroken defence.'],
                selectionLevel: 3,
                classId: fighterClass.id,
            },
        ]);

        const result = await materialiseResolvedCharacterClasses(
            {
                subclass: {
                    findMany: subclassFindManyMock,
                    createManyAndReturn: subclassCreateManyAndReturnMock,
                },
            } as any,
            'user-abc',
            [
                {
                    classId: 'wizard',
                    level: 2,
                    customSubclass: {
                        name: 'School of Glass',
                        description: 'Mirrored wards.',
                        selectionLevel: 2,
                    },
                },
                {
                    classId: 'fighter',
                    level: 3,
                    customSubclass: {
                        name: 'Iron Vanguard',
                        description: 'Unbroken defence.',
                        selectionLevel: 3,
                    },
                },
            ],
            new Map([
                ['wizard', wizardClass],
                ['fighter', fighterClass],
            ]),
            new Map(),
        );

        expect(subclassFindManyMock).toHaveBeenCalledTimes(1);
        expect(subclassCreateManyAndReturnMock).toHaveBeenCalledTimes(1);
        expect(subclassCreateManyAndReturnMock.mock.calls[0]![0].data).toHaveLength(2);
        expect(result.map((resolvedClass) => resolvedClass.subclassRef?.id)).toEqual([
            'subclass-glass-id',
            'subclass-iron-id',
        ]);
    });

    test('batches updates for existing inline custom subclasses', async () => {
        const wizardClass: CharacterClassReference = {
            id: 'class-wizard-id',
            srdIndex: 'wizard',
            name: 'Wizard',
            hitDie: 6,
            spellcastingAbility: 'int',
        };
        const fighterClass: CharacterClassReference = {
            id: 'class-fighter-id',
            srdIndex: 'fighter',
            name: 'Fighter',
            hitDie: 10,
            spellcastingAbility: null,
        };
        subclassFindManyMock.mockResolvedValueOnce([
            {
                id: 'subclass-glass-id',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'School of Glass',
                description: ['Old glass description.'],
                selectionLevel: 3,
                classId: wizardClass.id,
            },
            {
                id: 'subclass-iron-id',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'Iron Vanguard',
                description: ['Old iron description.'],
                selectionLevel: 3,
                classId: fighterClass.id,
            },
        ]);

        const result = await materialiseResolvedCharacterClasses(
            {
                subclass: {
                    findMany: subclassFindManyMock,
                    createManyAndReturn: subclassCreateManyAndReturnMock,
                },
                $executeRaw: executeRawMock,
            } as any,
            'user-abc',
            [
                {
                    classId: 'wizard',
                    level: 2,
                    customSubclass: {
                        name: 'School of Glass',
                        description: 'Updated glass description.',
                        selectionLevel: 2,
                    },
                },
                {
                    classId: 'fighter',
                    level: 3,
                    customSubclass: {
                        name: 'Iron Vanguard',
                        description: 'Updated iron description.',
                        selectionLevel: 4,
                    },
                },
            ],
            new Map([
                ['wizard', wizardClass],
                ['fighter', fighterClass],
            ]),
            new Map(),
        );

        expect(subclassFindManyMock).toHaveBeenCalledTimes(1);
        expect(executeRawMock).toHaveBeenCalledTimes(1);
        expect(JSON.parse(executeRawMock.mock.calls[0]![1] as string)).toEqual([
            {
                id: 'subclass-glass-id',
                description: 'Updated glass description.',
                selection_level: 2,
            },
            {
                id: 'subclass-iron-id',
                description: 'Updated iron description.',
                selection_level: 4,
            },
        ]);
        expect(subclassCreateManyAndReturnMock).not.toHaveBeenCalled();
        expect(result.map((resolvedClass) => resolvedClass.subclassRef?.selectionLevel)).toEqual([2, 4]);
    });

    test('grants only the chosen child feature for parent/child class feature choices', async () => {
        characterCreateMock.mockResolvedValueOnce({ id: 'char-new', ownerUserId: 'user-abc' });
        classFindManyMock.mockResolvedValueOnce([
            {
                id: 'class-warlock-id',
                srdIndex: 'warlock',
                name: 'Warlock',
                hitDie: 8,
                spellcastingAbility: 'cha',
                proficiencies: [],
            },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id', selectionLevel: 1 },
        ]);
        raceFindFirstMock.mockResolvedValueOnce({
            id: 'race-human-id',
            name: 'Human',
            languages: [{ name: 'Common' }],
            traits: [],
        });
        backgroundFindFirstMock.mockResolvedValueOnce({
            id: 'background-acolyte-id',
            name: 'Acolyte',
            proficiencies: [],
            languages: [],
            languageChoiceCount: null,
        });
        featureFindManyMock.mockResolvedValueOnce([
            {
                id: 'feature-pact-boon',
                srdIndex: 'pact-boon',
                name: 'Pact Boon',
                description: ['Choose one pact boon.'],
                sourceLabel: 'Warlock 3',
                kind: 'CLASS_FEATURE',
                level: 3,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: null,
                chooseCount: 1,
            },
            {
                id: 'feature-pact-blade',
                srdIndex: 'pact-of-the-blade',
                name: 'Pact of the Blade',
                description: ['Create a pact weapon.'],
                sourceLabel: 'Warlock 3',
                kind: 'CLASS_FEATURE',
                level: 3,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-pact-boon',
                chooseCount: null,
                raw: { parent: { index: 'pact-boon' } },
            },
            {
                id: 'feature-pact-chain',
                srdIndex: 'pact-of-the-chain',
                name: 'Pact of the Chain',
                description: ['Summon a special familiar.'],
                sourceLabel: 'Warlock 3',
                kind: 'CLASS_FEATURE',
                level: 3,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-pact-boon',
                chooseCount: null,
                raw: { parent: { index: 'pact-boon' } },
            },
            {
                id: 'feature-pact-tome',
                srdIndex: 'pact-of-the-tome',
                name: 'Pact of the Tome',
                description: ['Receive a Book of Shadows.'],
                sourceLabel: 'Warlock 3',
                kind: 'CLASS_FEATURE',
                level: 3,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-pact-boon',
                chooseCount: null,
                raw: { parent: { index: 'pact-boon' } },
            },
        ]);

        await resolvers.createCharacter({}, {
            input: {
                name: 'Nyx',
                race: 'human',
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 3 }],
                featureChoices: [{
                    parentSrdIndex: 'pact-boon',
                    chosenChildSrdIndex: 'pact-of-the-chain',
                }],
                startingClassId: 'warlock',
                alignment: 'Neutral',
                background: 'acolyte',
                ac: 12,
                speed: 30,
                initiative: 2,
                abilityScores: { strength: 8, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 10, charisma: 16 },
                skillProficiencies: {},
            },
        } as any, authedCtx);

        const callArgs = characterCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.features.create).toEqual([
            {
                featureId: 'feature-pact-boon',
                name: 'Pact Boon',
                source: 'Warlock 3',
                description: 'Choose one pact boon.',
            },
            {
                featureId: 'feature-pact-chain',
                name: 'Pact of the Chain',
                source: 'Warlock 3',
                description: 'Summon a special familiar.',
            },
        ]);
    });

    test('grants only selected dynamic Eldritch Invocation choices', async () => {
        characterCreateMock.mockResolvedValueOnce({ id: 'char-new', ownerUserId: 'user-abc' });
        classFindManyMock.mockResolvedValueOnce([
            {
                id: 'class-warlock-id',
                srdIndex: 'warlock',
                name: 'Warlock',
                hitDie: 8,
                spellcastingAbility: 'cha',
                proficiencies: [],
            },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id', selectionLevel: 1 },
        ]);
        raceFindFirstMock.mockResolvedValueOnce({
            id: 'race-human-id',
            name: 'Human',
            languages: [{ name: 'Common' }],
            traits: [],
        });
        backgroundFindFirstMock.mockResolvedValueOnce({
            id: 'background-acolyte-id',
            name: 'Acolyte',
            proficiencies: [],
            languages: [],
            languageChoiceCount: null,
        });
        featureFindManyMock.mockResolvedValueOnce([
            {
                id: 'feature-eldritch-invocations',
                srdIndex: 'eldritch-invocations',
                name: 'Eldritch Invocations',
                description: ['Choose two invocations.'],
                sourceLabel: 'Warlock 2',
                kind: 'CLASS_FEATURE',
                level: 2,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: null,
                chooseCount: null,
            },
            {
                id: 'feature-armor-of-shadows',
                srdIndex: 'eldritch-invocation-armor-of-shadows',
                name: 'Eldritch Invocation: Armor of Shadows',
                description: ['Cast mage armor at will.'],
                sourceLabel: 'Warlock 2',
                kind: 'CLASS_FEATURE',
                level: 2,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-eldritch-invocations',
                chooseCount: null,
                raw: { parent: { index: 'eldritch-invocations' } },
            },
            {
                id: 'feature-beast-speech',
                srdIndex: 'eldritch-invocation-beast-speech',
                name: 'Eldritch Invocation: Beast Speech',
                description: ['Cast speak with animals at will.'],
                sourceLabel: 'Warlock 2',
                kind: 'CLASS_FEATURE',
                level: 2,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-eldritch-invocations',
                chooseCount: null,
                raw: { parent: { index: 'eldritch-invocations' } },
            },
            {
                id: 'feature-devils-sight',
                srdIndex: 'eldritch-invocation-devils-sight',
                name: "Eldritch Invocation: Devil's Sight",
                description: ['See normally in darkness.'],
                sourceLabel: 'Warlock 2',
                kind: 'CLASS_FEATURE',
                level: 2,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-eldritch-invocations',
                chooseCount: null,
                raw: { parent: { index: 'eldritch-invocations' } },
            },
        ]);

        await resolvers.createCharacter({}, {
            input: {
                name: 'Nyx',
                race: 'human',
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 2 }],
                featureChoices: [
                    {
                        parentSrdIndex: 'eldritch-invocations',
                        chosenChildSrdIndex: 'eldritch-invocation-armor-of-shadows',
                    },
                    {
                        parentSrdIndex: 'eldritch-invocations',
                        chosenChildSrdIndex: 'eldritch-invocation-beast-speech',
                    },
                ],
                startingClassId: 'warlock',
                alignment: 'Neutral',
                background: 'acolyte',
                ac: 12,
                speed: 30,
                initiative: 2,
                abilityScores: { strength: 8, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 10, charisma: 16 },
                skillProficiencies: {},
            },
        } as any, authedCtx);

        const callArgs = characterCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.features.create).toEqual([
            {
                featureId: 'feature-eldritch-invocations',
                name: 'Eldritch Invocations',
                source: 'Warlock 2',
                description: 'Choose two invocations.',
            },
            {
                featureId: 'feature-armor-of-shadows',
                name: 'Eldritch Invocation: Armor of Shadows',
                source: 'Warlock 2',
                description: 'Cast mage armor at will.',
            },
            {
                featureId: 'feature-beast-speech',
                name: 'Eldritch Invocation: Beast Speech',
                source: 'Warlock 2',
                description: 'Cast speak with animals at will.',
            },
        ]);
    });

    test('rejects createCharacter when a required parent/child feature choice is missing', async () => {
        classFindManyMock.mockResolvedValueOnce([
            {
                id: 'class-warlock-id',
                srdIndex: 'warlock',
                name: 'Warlock',
                hitDie: 8,
                spellcastingAbility: 'cha',
                proficiencies: [],
            },
        ]);
        subclassFindManyMock.mockResolvedValueOnce([
            { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id', selectionLevel: 1 },
        ]);
        raceFindFirstMock.mockResolvedValueOnce({
            id: 'race-human-id',
            name: 'Human',
            languages: [{ name: 'Common' }],
            traits: [],
        });
        backgroundFindFirstMock.mockResolvedValueOnce({
            id: 'background-acolyte-id',
            name: 'Acolyte',
            proficiencies: [],
            languages: [],
            languageChoiceCount: null,
        });
        featureFindManyMock.mockResolvedValueOnce([
            {
                id: 'feature-pact-boon',
                srdIndex: 'pact-boon',
                name: 'Pact Boon',
                description: ['Choose one pact boon.'],
                sourceLabel: 'Warlock 3',
                kind: 'CLASS_FEATURE',
                level: 3,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: null,
                chooseCount: 1,
            },
            {
                id: 'feature-pact-chain',
                srdIndex: 'pact-of-the-chain',
                name: 'Pact of the Chain',
                description: ['Summon a special familiar.'],
                sourceLabel: 'Warlock 3',
                kind: 'CLASS_FEATURE',
                level: 3,
                classId: 'class-warlock-id',
                subclassId: null,
                parentFeatureId: 'feature-pact-boon',
                chooseCount: null,
                raw: { parent: { index: 'pact-boon' } },
            },
        ]);

        expect(resolvers.createCharacter({}, {
            input: {
                name: 'Nyx',
                race: 'human',
                classes: [{ classId: 'warlock', subclassId: 'fiend', level: 3 }],
                startingClassId: 'warlock',
                alignment: 'Neutral',
                background: 'acolyte',
                ac: 12,
                speed: 30,
                initiative: 2,
                abilityScores: { strength: 8, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 10, charisma: 16 },
                skillProficiencies: {},
            },
        } as any, authedCtx)).rejects.toThrow('Pact Boon requires 1 choice');
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
