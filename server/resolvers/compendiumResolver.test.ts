import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    backgroundCountMock,
    backgroundFindManyMock,
    characterFindManyMock,
    classCountMock,
    clearAllCharacterResolverMocks,
    featCountMock,
    featFindManyMock,
    languageCountMock,
    languageFindManyMock,
    raceCountMock,
    raceFindManyMock,
    spellCountMock,
    subclassCountMock,
    subclassFindManyMock,
    subraceCountMock,
    subraceFindManyMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

const {
    default: compendiumCounts,
    compendiumBackgrounds,
    compendiumFeats,
    compendiumLanguages,
    compendiumRaces,
    compendiumSubclasses,
    compendiumSubraces,
} = await import('./compendiumResolver');

const strength = { id: 'ability-str', srdIndex: 'str', fullName: 'Strength' };
const dexterity = { id: 'ability-dex', srdIndex: 'dex', fullName: 'Dexterity' };
const wisdom = { id: 'ability-wis', srdIndex: 'wis', fullName: 'Wisdom' };

describe('compendiumCounts', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('rejects unauthenticated requests before querying counts', () => {
        expect(compendiumCounts({}, {}, unauthedCtx)).rejects.toThrow('UNAUTHENTICATED');
        expect(classCountMock).not.toHaveBeenCalled();
        expect(raceCountMock).not.toHaveBeenCalled();
        expect(backgroundCountMock).not.toHaveBeenCalled();
    });

    test('returns SRD and caller-owned custom totals for every browse category', async () => {
        classCountMock.mockResolvedValueOnce(12).mockResolvedValueOnce(2);
        subclassCountMock.mockResolvedValueOnce(12).mockResolvedValueOnce(3);
        raceCountMock.mockResolvedValueOnce(9).mockResolvedValueOnce(1);
        subraceCountMock.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
        backgroundCountMock.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
        featCountMock.mockResolvedValueOnce(1).mockResolvedValueOnce(3);
        languageCountMock.mockResolvedValueOnce(16).mockResolvedValueOnce(2);
        spellCountMock.mockResolvedValueOnce(319);

        const result = await compendiumCounts({}, {}, authedCtx);

        expect(raceCountMock.mock.calls).toEqual([
            [{ where: { ownerUserId: null } }],
            [{ where: { ownerUserId: 'user-abc' } }],
        ]);
        expect(backgroundCountMock.mock.calls).toEqual([
            [{ where: { ownerUserId: null } }],
            [{ where: { ownerUserId: 'user-abc' } }],
        ]);
        expect(result).toEqual({
            srdClassCount: 12,
            customClassCount: 2,
            srdSubclassCount: 12,
            customSubclassCount: 3,
            srdRaceCount: 9,
            customRaceCount: 1,
            srdSubraceCount: 4,
            customSubraceCount: 1,
            srdBackgroundCount: 1,
            customBackgroundCount: 2,
            srdFeatCount: 1,
            customFeatCount: 3,
            srdLanguageCount: 16,
            customLanguageCount: 2,
            spellCount: 319,
        });
    });
});

describe('compendium browse queries', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('every catalog requires authentication before reading reference data', () => {
        const calls = [
            compendiumRaces({}, {}, unauthedCtx),
            compendiumSubraces({}, {}, unauthedCtx),
            compendiumSubclasses({}, {}, unauthedCtx),
            compendiumBackgrounds({}, {}, unauthedCtx),
            compendiumFeats({}, {}, unauthedCtx),
            compendiumLanguages({}, {}, unauthedCtx),
        ];

        for (const call of calls) expect(call).rejects.toThrow('UNAUTHENTICATED');
        expect(raceFindManyMock).not.toHaveBeenCalled();
        expect(subraceFindManyMock).not.toHaveBeenCalled();
        expect(subclassFindManyMock).not.toHaveBeenCalled();
        expect(backgroundFindManyMock).not.toHaveBeenCalled();
        expect(featFindManyMock).not.toHaveBeenCalled();
        expect(languageFindManyMock).not.toHaveBeenCalled();
    });

    test('maps race promotions, summaries, cross-links, and caller-scoped usage', async () => {
        raceFindManyMock.mockResolvedValueOnce([{
            id: 'race-elf',
            ownerUserId: null,
            srdIndex: 'elf',
            name: 'Elf',
            speed: 30,
            alignment: 'Elves love freedom.',
            age: 'Elves mature slowly.',
            size: 'Medium',
            sizeDescription: 'Slender and graceful.',
            languageDescription: 'Common and Elvish.',
            languageChoiceCount: null,
            sourceBook: 'SRD',
            abilityBonuses: [{ bonus: 2, abilityScore: dexterity }],
            traits: [{
                id: 'trait-darkvision', srdIndex: 'darkvision', name: 'Darkvision',
                description: ['Accustomed to twilit forests.'], languageChoiceCount: null,
            }],
            languages: [{ id: 'language-common', srdIndex: 'common', name: 'Common' }],
            subraces: [{
                id: 'subrace-high-elf', srdIndex: 'high-elf', name: 'High Elf',
                abilityBonuses: [{ bonus: 1, abilityScore: wisdom }],
                _count: { traits: 2 },
            }],
            _count: { characters: 3 },
        }]);

        const result = await compendiumRaces({}, {}, authedCtx);

        expect(raceFindManyMock).toHaveBeenCalledTimes(1);
        const query = raceFindManyMock.mock.calls[0]![0];
        expect(query.where).toEqual({
            OR: [{ ownerUserId: null }, { ownerUserId: 'user-abc' }],
        });
        expect(query.include.traits.where).toEqual(query.where);
        expect(query.include.languages.where).toEqual(query.where);
        expect(query.include.subraces.where).toEqual(query.where);
        expect(query.include._count.select.characters.where).toEqual({ ownerUserId: 'user-abc' });
        expect(result).toEqual([expect.objectContaining({
            value: 'elf',
            isCustom: false,
            languageChoiceCount: 0,
            abilitySummary: 'DEX +2',
            abilityBonuses: [{ abilityIndex: 'dex', abilityName: 'Dexterity', bonus: 2 }],
            characterUsageCount: 3,
            subraces: [{
                value: 'high-elf',
                name: 'High Elf',
                abilityBonuses: [{ abilityIndex: 'wis', abilityName: 'Wisdom', bonus: 1 }],
                abilitySummary: 'WIS +1',
                traitCount: 2,
            }],
        })]);
    });

    test('maps subrace additions and scopes both the subrace and its parent race', async () => {
        subraceFindManyMock.mockResolvedValueOnce([{
            id: 'subrace-high-elf',
            ownerUserId: null,
            srdIndex: 'high-elf',
            name: 'High Elf',
            description: 'Graceful scholars of magic.',
            sourceBook: 'SRD',
            raceRef: {
                id: 'race-elf', srdIndex: 'elf', name: 'Elf', speed: 30, size: 'Medium',
                languageDescription: 'Common and Elvish.', languageChoiceCount: null,
                abilityBonuses: [{ bonus: 2, abilityScore: dexterity }],
                traits: [],
                languages: [{ id: 'language-elvish', srdIndex: 'elvish', name: 'Elvish' }],
            },
            abilityBonuses: [{ bonus: 1, abilityScore: wisdom }],
            traits: [],
            _count: { characters: 1 },
        }]);

        const result = await compendiumSubraces({}, {}, authedCtx);

        const visible = { OR: [{ ownerUserId: null }, { ownerUserId: 'user-abc' }] };
        const query = subraceFindManyMock.mock.calls[0]![0];
        expect(query.where).toEqual({ AND: [visible, { raceRef: visible }] });
        expect(query.include.raceRef.include.traits.where).toEqual(visible);
        expect(result[0]).toEqual(expect.objectContaining({
            value: 'high-elf',
            abilitySummary: 'WIS +1',
            characterUsageCount: 1,
            parentRace: expect.objectContaining({ value: 'elf', abilitySummary: 'DEX +2' }),
        }));
    });

    test('maps SRD subclass rows, promoting the parent class SRD index', async () => {
        subclassFindManyMock.mockResolvedValueOnce([{
            id: 'subclass-evocation-id',
            ownerUserId: null,
            srdIndex: 'evocation',
            name: 'School of Evocation',
            description: ['You focus your study on magic that creates elemental effects.'],
            selectionLevel: 2,
            sourceBook: 'SRD',
            classId: 'class-wizard-id',
            classRef: { id: 'class-wizard-id', srdIndex: 'wizard', name: 'Wizard' },
            features: [{
                id: 'feature-sculpt-spells',
                name: 'Sculpt Spells',
                description: ['You can create pockets of relative safety.'],
                level: 2,
            }],
            _count: { characterClasses: 2 },
        }]);

        const result = await compendiumSubclasses({}, {}, authedCtx);

        const query = subclassFindManyMock.mock.calls[0]![0];
        expect(query.orderBy).toEqual({ name: 'asc' });
        expect(query.include._count.select.characterClasses.where)
            .toEqual({ character: { ownerUserId: 'user-abc' } });
        expect(query.include.features.where).toEqual({ kind: 'SUBCLASS_FEATURE' });
        expect(result).toEqual([{
            id: 'subclass-evocation-id',
            value: 'evocation',
            srdIndex: 'evocation',
            name: 'School of Evocation',
            description: ['You focus your study on magic that creates elemental effects.'],
            isCustom: false,
            sourceBook: 'SRD',
            classId: 'wizard',
            className: 'Wizard',
            selectionLevel: 2,
            features: [{
                id: 'feature-sculpt-spells',
                name: 'Sculpt Spells',
                description: 'You can create pockets of relative safety.',
                level: 2,
            }],
            characterUsageCount: 2,
            // SRD rows are never editable, so re-parenting never applies to them.
            canChangeClass: false,
            cannotChangeClassReason: null,
        }]);
    });

    test('falls back to the row id for customs and locks re-parenting once a character depends on it', async () => {
        subclassFindManyMock.mockResolvedValueOnce([
            {
                id: 'subclass-custom-unused',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'Path of Embers',
                description: ['A homebrew barbarian path.'],
                selectionLevel: 3,
                sourceBook: null,
                classId: 'class-custom-id',
                classRef: { id: 'class-custom-id', srdIndex: null, name: 'Emberkin' },
                features: [],
                _count: { characterClasses: 0 },
            },
            {
                id: 'subclass-custom-used',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'Path of Ash',
                description: [],
                selectionLevel: 3,
                sourceBook: null,
                classId: 'class-barbarian-id',
                classRef: { id: 'class-barbarian-id', srdIndex: 'barbarian', name: 'Barbarian' },
                features: [],
                _count: { characterClasses: 4 },
            },
        ]);

        const result = await compendiumSubclasses({}, {}, authedCtx);

        expect(result[0]).toEqual(expect.objectContaining({
            value: 'subclass-custom-unused',
            isCustom: true,
            // Custom parent classes have no SRD index, so the class id carries through.
            classId: 'class-custom-id',
            canChangeClass: true,
            cannotChangeClassReason: null,
        }));
        expect(result[1]).toEqual(expect.objectContaining({
            value: 'subclass-custom-used',
            classId: 'barbarian',
            characterUsageCount: 4,
            canChangeClass: false,
            cannotChangeClassReason: 'Cannot change the parent class of a subclass used by 4 character(s).',
        }));
    });

    test('hides archived customs and subclasses of archived classes without hiding SRD rows', async () => {
        subclassFindManyMock.mockResolvedValueOnce([]);

        await compendiumSubclasses({}, {}, authedCtx);

        expect(subclassFindManyMock.mock.calls[0]![0].where).toEqual({
            AND: [
                { OR: [{ ownerUserId: null }, { ownerUserId: 'user-abc', archivedAt: null }] },
                { classRef: { archivedAt: null } },
            ],
        });
    });

    test('maps typed background JSON and filters related custom references by owner', async () => {
        backgroundFindManyMock.mockResolvedValueOnce([{
            id: 'background-acolyte',
            ownerUserId: null,
            srdIndex: 'acolyte',
            name: 'Acolyte',
            sourceBook: 'SRD',
            featureName: 'Shelter of the Faithful',
            featureDescription: ['You receive aid from your temple.'],
            languageChoiceCount: 2,
            proficiencies: [{
                id: 'proficiency-insight', srdIndex: 'skill-insight', name: 'Insight',
                type: 'SKILL', ownerUserId: null,
            }],
            languages: [],
            startingEquipment: [{
                name: 'Holy Symbols', quantity: 1, choiceGroup: 1, choiceCount: 1,
            }],
            suggestedCharacteristics: {
                personalityTraits: { choose: 2, options: ['I quote sacred texts.'] },
                ideals: null,
                bonds: null,
                flaws: null,
            },
            _count: { characters: 2 },
        }]);

        const result = await compendiumBackgrounds({}, {}, authedCtx);

        const query = backgroundFindManyMock.mock.calls[0]![0];
        expect(query.include.proficiencies.where).toEqual({
            OR: [{ ownerUserId: null }, { ownerUserId: 'user-abc' }],
        });
        expect(result[0]).toEqual(expect.objectContaining({
            value: 'acolyte',
            startingEquipment: [{ name: 'Holy Symbols', quantity: 1, choiceGroup: 1, choiceCount: 1 }],
            suggestedCharacteristics: {
                personalityTraits: { choose: 2, options: ['I quote sacred texts.'] },
                ideals: null,
                bonds: null,
                flaws: null,
            },
            characterUsageCount: 2,
        }));
    });

    test('maps normalized feat prerequisites and caller-scoped usage counts', async () => {
        featFindManyMock.mockResolvedValueOnce([
            {
                id: 'feat-grappler',
                ownerUserId: null,
                srdIndex: 'grappler',
                name: 'Grappler',
                sourceBook: 'SRD',
                description: ['You have developed the skills necessary to hold your own.'],
                prerequisites: [{ minimumScore: 13, abilityScore: strength }],
                _count: { characterFeats: 4 },
            },
            {
                id: 'feat-custom',
                ownerUserId: 'user-abc',
                srdIndex: null,
                name: 'Custom Feat',
                sourceBook: null,
                description: [],
                prerequisites: [],
                _count: { characterFeats: 0 },
            },
        ]);

        const result = await compendiumFeats({}, {}, authedCtx);

        const query = featFindManyMock.mock.calls[0]![0];
        expect(query.include._count.select.characterFeats.where).toEqual({
            character: { ownerUserId: 'user-abc' },
        });
        expect(result[0]).toEqual(expect.objectContaining({
            value: 'grappler',
            prerequisites: [{ abilityIndex: 'str', abilityName: 'Strength', minimumScore: 13 }],
            prerequisiteSummary: 'Strength 13 or higher',
            characterUsageCount: 4,
        }));
        expect(result[1]).toEqual(expect.objectContaining({
            value: 'feat-custom',
            isCustom: true,
            prerequisiteSummary: null,
        }));
    });

    test('batches language usage and counts each caller character only once per language', async () => {
        languageFindManyMock.mockResolvedValueOnce([
            {
                id: 'language-dwarvish', ownerUserId: null, srdIndex: 'dwarvish', name: 'Dwarvish',
                sourceBook: 'SRD', type: 'Standard', script: 'Dwarvish', typicalSpeakers: ['Dwarves'],
                description: 'A language of hard consonants.',
                races: [{ id: 'race-dwarf', srdIndex: 'dwarf', name: 'Dwarf' }], backgrounds: [], traits: [],
            },
            {
                id: 'language-giant', ownerUserId: null, srdIndex: 'giant', name: 'Giant',
                sourceBook: 'SRD', type: 'Standard', script: 'Dwarvish', typicalSpeakers: ['Ogres'],
                description: null, races: [], backgrounds: [], traits: [],
            },
        ]);
        characterFindManyMock.mockResolvedValueOnce([
            {
                raceRef: { languages: [{ id: 'language-dwarvish' }] },
                languages: [
                    { languageId: 'language-dwarvish' },
                    { languageId: 'language-giant' },
                ],
            },
            { raceRef: null, languages: [{ languageId: 'language-giant' }] },
        ]);

        const result = await compendiumLanguages({}, {}, authedCtx);

        expect(languageFindManyMock).toHaveBeenCalledTimes(1);
        expect(characterFindManyMock).toHaveBeenCalledTimes(1);
        expect(characterFindManyMock.mock.calls[0]![0].where).toEqual({ ownerUserId: 'user-abc' });
        expect(result).toEqual([
            expect.objectContaining({
                value: 'dwarvish',
                grantingRaces: [{ value: 'dwarf', name: 'Dwarf' }],
                sameScriptLanguages: [{ value: 'giant', name: 'Giant' }],
                characterUsageCount: 1,
            }),
            expect.objectContaining({
                value: 'giant',
                sameScriptLanguages: [{ value: 'dwarvish', name: 'Dwarvish' }],
                characterUsageCount: 2,
            }),
        ]);
    });

    test('returns null summaries when an entry has no bonuses or prerequisites', async () => {
        raceFindManyMock.mockResolvedValueOnce([{
            id: 'race-plain', ownerUserId: 'user-abc', srdIndex: null, name: 'Plainsfolk',
            speed: 30, alignment: null, age: null, size: 'Medium', sizeDescription: null,
            languageDescription: null, languageChoiceCount: null, sourceBook: null,
            abilityBonuses: [],
            traits: [], languages: [], subraces: [{
                id: 'subrace-plain', srdIndex: null, name: 'Nomad',
                abilityBonuses: [], _count: { traits: 0 },
            }],
            _count: { characters: 0 },
        }]);
        featFindManyMock.mockResolvedValueOnce([{
            id: 'feat-open', ownerUserId: null, srdIndex: 'open', name: 'Open',
            sourceBook: 'SRD', description: [], prerequisites: [],
            _count: { characterFeats: 0 },
        }]);

        const [races, feats] = await Promise.all([
            compendiumRaces({}, {}, authedCtx),
            compendiumFeats({}, {}, authedCtx),
        ]);

        expect(races[0]).toEqual(expect.objectContaining({ abilitySummary: null }));
        expect(races[0]!.subraces[0]).toEqual(expect.objectContaining({ abilitySummary: null }));
        expect(feats[0]).toEqual(expect.objectContaining({ prerequisiteSummary: null }));
    });

    test('does not treat missing or blank scripts as a shared peer group', async () => {
        languageFindManyMock.mockResolvedValueOnce([
            {
                id: 'language-deep-speech', ownerUserId: null, srdIndex: 'deep-speech', name: 'Deep Speech',
                sourceBook: 'SRD', type: 'Exotic', script: null, typicalSpeakers: ['Aboleths'],
                description: null, races: [], backgrounds: [], traits: [],
            },
            {
                id: 'language-cant', ownerUserId: null, srdIndex: 'thieves-cant', name: "Thieves' Cant",
                sourceBook: 'SRD', type: 'Exotic', script: null, typicalSpeakers: ['Rogues'],
                description: null, races: [], backgrounds: [], traits: [],
            },
            {
                id: 'language-invented', ownerUserId: 'user-abc', srdIndex: null, name: 'Invented',
                sourceBook: 'Personal compendium', type: 'Exotic', script: '   ', typicalSpeakers: [],
                description: null, races: [], backgrounds: [], traits: [],
            },
            {
                id: 'language-common', ownerUserId: null, srdIndex: 'common', name: 'Common',
                sourceBook: 'SRD', type: 'Standard', script: 'Common', typicalSpeakers: ['Humans'],
                description: null, races: [], backgrounds: [], traits: [],
            },
            {
                id: 'language-halfling', ownerUserId: null, srdIndex: 'halfling', name: 'Halfling',
                sourceBook: 'SRD', type: 'Standard', script: 'Common', typicalSpeakers: ['Halflings'],
                description: null, races: [], backgrounds: [], traits: [],
            },
        ]);

        const result = await compendiumLanguages({}, {}, authedCtx);

        expect(result).toEqual([
            expect.objectContaining({ value: 'deep-speech', sameScriptLanguages: [] }),
            expect.objectContaining({ value: 'thieves-cant', sameScriptLanguages: [] }),
            expect.objectContaining({ value: 'language-invented', sameScriptLanguages: [] }),
            expect.objectContaining({
                value: 'common',
                sameScriptLanguages: [{ value: 'halfling', name: 'Halfling' }],
            }),
            expect.objectContaining({
                value: 'halfling',
                sameScriptLanguages: [{ value: 'common', name: 'Common' }],
            }),
        ]);
    });
});
