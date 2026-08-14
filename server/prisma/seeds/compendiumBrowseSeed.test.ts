import { describe, expect, test } from 'bun:test';
import {
    backgroundSeedPayload,
    featSeedPayload,
    languageSeedPayload,
    raceLanguageChoiceCountFromSrd,
    startingEquipmentFromSrd,
    subraceSeedPayload,
    type SrdBackground,
    type SrdFeat,
    type SrdLanguage,
    type SrdSubrace,
} from './compendiumBrowseSeed';

describe('raceLanguageChoiceCountFromSrd', () => {
    test('promotes Human language choices without parsing raw data at query time', async () => {
        const races = await Bun.file(new URL('../../srd-json-files/5e-SRD-Races.json', import.meta.url)).json() as Array<{
            index: string;
            language_options?: { choose?: number };
        }>;

        expect(raceLanguageChoiceCountFromSrd(races.find((race) => race.index === 'human')!)).toBe(1);
        expect(raceLanguageChoiceCountFromSrd(races.find((race) => race.index === 'elf')!)).toBeNull();
    });
});

describe('featSeedPayload', () => {
    test('maps Grappler to an ability-score threshold of Strength 13', async () => {
        const feats = await Bun.file(new URL('../../srd-json-files/5e-SRD-Feats.json', import.meta.url)).json() as SrdFeat[];
        const grappler = feats.find((feat) => feat.index === 'grappler');

        expect(grappler).toBeDefined();
        expect(featSeedPayload(grappler!)).toMatchObject({
            name: 'Grappler',
            prerequisites: [
                {
                    minimumScore: 13,
                    abilityScore: { connect: { srdIndex: 'str' } },
                },
            ],
            sourceBook: 'SRD',
            raw: grappler,
        });
    });

    test('returns no prerequisite rows when a feat is open to all', () => {
        const openFeat = featSeedPayload({ index: 'open', name: 'Open' });

        expect(openFeat.prerequisites).toEqual([]);
        expect(featSeedPayload({ index: 'open', name: 'Open', prerequisites: [] }).prerequisites).toEqual([]);
        expect(openFeat.sourceBook).toBe('SRD');
        expect(openFeat.description).toEqual([]);
    });
});

describe('languageSeedPayload', () => {
    test('promotes typical_speakers for every bundled SRD language', async () => {
        const languages = await Bun.file(new URL('../../srd-json-files/5e-SRD-Languages.json', import.meta.url)).json() as SrdLanguage[];

        expect(languages).toHaveLength(16);
        expect(languageSeedPayload(languages.find((language) => language.index === 'common')!).typicalSpeakers).toEqual(['Humans']);
        expect(languageSeedPayload(languages.find((language) => language.index === 'deep-speech')!).typicalSpeakers).toEqual(['Aboleths', 'Cloakers']);
        expect(languages.every((language) => languageSeedPayload(language).typicalSpeakers.length > 0)).toBe(true);
        expect(languages.every((language) => languageSeedPayload(language).sourceBook === 'SRD')).toBe(true);
    });

    test('defaults omitted speakers and nullable scalars', () => {
        expect(languageSeedPayload({ index: 'invented', name: 'Invented' })).toMatchObject({
            name: 'Invented',
            type: null,
            script: null,
            description: null,
            typicalSpeakers: [],
            sourceBook: 'SRD',
        });
    });
});

describe('subraceSeedPayload', () => {
    test('maps each bundled SRD subrace to nested ability-bonus create data', async () => {
        const subraces = await Bun.file(new URL('../../srd-json-files/5e-SRD-Subraces.json', import.meta.url)).json() as SrdSubrace[];
        const expected: Record<string, { bonus: number; abilityScore: { connect: { srdIndex: string } } }> = {
            'hill-dwarf': { bonus: 1, abilityScore: { connect: { srdIndex: 'wis' } } },
            'high-elf': { bonus: 1, abilityScore: { connect: { srdIndex: 'int' } } },
            'lightfoot-halfling': { bonus: 1, abilityScore: { connect: { srdIndex: 'cha' } } },
            'rock-gnome': { bonus: 1, abilityScore: { connect: { srdIndex: 'con' } } },
        };

        expect(subraces).toHaveLength(4);
        for (const [srdIndex, bonus] of Object.entries(expected)) {
            const subrace = subraces.find((candidate) => candidate.index === srdIndex);
            expect(subrace).toBeDefined();
            const payload = subraceSeedPayload(subrace!);
            expect(payload.abilityBonuses).toEqual([bonus]);
            expect(payload.sourceBook).toBe('SRD');
            expect(payload.raceRef).toEqual({
                connect: { srdIndex: subrace!.race.index },
            });
        }
    });
});

describe('backgroundSeedPayload', () => {
    test('maps Acolyte equipment and suggested characteristics onto the upsert payload', async () => {
        const backgrounds = await Bun.file(new URL('../../srd-json-files/5e-SRD-Backgrounds.json', import.meta.url)).json() as SrdBackground[];
        const acolyte = backgrounds.find((background) => background.index === 'acolyte');
        const payload = backgroundSeedPayload(acolyte!);

        expect(acolyte).toBeDefined();
        expect(payload.sourceBook).toBe('SRD');
        expect(payload.startingEquipment).toEqual([
            { name: 'Clothes, common', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Pouch', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Holy Symbols', quantity: 1, choiceGroup: 1, choiceCount: 1 },
        ]);
        expect(payload.suggestedCharacteristics?.personalityTraits).toEqual({
            choose: 2,
            options: expect.arrayContaining([
                'I idolize a particular hero of my faith, and constantly refer to that person\'s deeds and example.',
            ]),
        });
        expect(payload.suggestedCharacteristics?.personalityTraits?.options).toHaveLength(8);
        expect(payload.suggestedCharacteristics?.ideals).toEqual({
            choose: 1,
            options: expect.arrayContaining([
                'Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld.',
            ]),
        });
        expect(payload.suggestedCharacteristics?.ideals?.options).toHaveLength(6);
        expect(payload.suggestedCharacteristics?.bonds?.choose).toBe(1);
        expect(payload.suggestedCharacteristics?.bonds?.options).toHaveLength(6);
        expect(payload.suggestedCharacteristics?.flaws?.choose).toBe(1);
        expect(payload.suggestedCharacteristics?.flaws?.options).toHaveLength(6);
    });

    test('returns null characteristics and empty equipment when a background has none', () => {
        expect(backgroundSeedPayload({ index: 'none', name: 'None' })).toMatchObject({
            name: 'None',
            featureName: null,
            featureDescription: [],
            languageChoiceCount: null,
            startingEquipment: [],
            suggestedCharacteristics: null,
            sourceBook: 'SRD',
        });
    });
});

describe('startingEquipmentFromSrd', () => {
    test('prefers a class option desc over the equipment-category fallback', () => {
        expect(startingEquipmentFromSrd(
            [{ equipment: { name: 'Dagger' }, quantity: 1 }],
            [{ desc: '(a) a quarterstaff or (b) a dagger', choose: 1, from: { equipment_category: { name: 'Simple Weapons' } } }],
        )).toEqual([
            { name: 'Dagger', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: '(a) a quarterstaff or (b) a dagger', quantity: 1, choiceGroup: 1, choiceCount: 1 },
        ]);
    });

    test('keeps barbarian class equipment on the shared item shape', async () => {
        const classes = await Bun.file(new URL('../../srd-json-files/5e-SRD-Classes.json', import.meta.url)).json() as Array<{
            index: string;
            starting_equipment?: Array<{ equipment: { name: string }; quantity: number }>;
            starting_equipment_options?: Array<{ desc?: string; choose?: number }>;
        }>;
        const barbarian = classes.find((srdClass) => srdClass.index === 'barbarian');
        const equipment = startingEquipmentFromSrd(barbarian?.starting_equipment, barbarian?.starting_equipment_options);

        expect(equipment).toEqual(expect.arrayContaining([
            { name: 'Explorer\'s Pack', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Javelin', quantity: 4, choiceGroup: null, choiceCount: null },
            { name: '(a) a greataxe or (b) any martial melee weapon', quantity: 1, choiceGroup: 1, choiceCount: 1 },
        ]));
    });
});
