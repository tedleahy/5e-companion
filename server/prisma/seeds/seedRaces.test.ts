import { describe, expect, test } from 'bun:test';
import { raceSeedPayload, raceUpsertArgs, type SrdRace } from './seedRaces';

type AbilityBonusCreate = {
    bonus: number;
    abilityScore: { connect: { srdIndex: string } };
};

function bonus(srdIndex: string, value: number): AbilityBonusCreate {
    return { bonus: value, abilityScore: { connect: { srdIndex } } };
}

describe('raceSeedPayload', () => {
    test('maps bundled SRD races to nested ability-bonus create data', async () => {
        const races = await Bun.file(new URL('../../srd-json-files/5e-SRD-Races.json', import.meta.url)).json() as SrdRace[];
        const expected: Record<string, AbilityBonusCreate[]> = {
            dwarf: [bonus('con', 2)],
            elf: [bonus('dex', 2)],
            human: ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((srdIndex) => bonus(srdIndex, 1)),
            'half-orc': [bonus('str', 2), bonus('con', 1)],
        };

        for (const [srdIndex, abilityBonuses] of Object.entries(expected)) {
            const race = races.find((candidate) => candidate.index === srdIndex);
            expect(race).toBeDefined();
            const payload = raceSeedPayload(race!);
            expect(payload.abilityBonuses).toEqual(abilityBonuses);
            expect(payload.sourceBook).toBe('SRD');
            expect(payload.srdIndex).toBe(srdIndex);
        }
    });
});

describe('raceUpsertArgs', () => {
    test('replaces ability-bonus join rows when reseeding an existing race', async () => {
        const races = await Bun.file(new URL('../../srd-json-files/5e-SRD-Races.json', import.meta.url)).json() as SrdRace[];
        const dwarf = races.find((race) => race.index === 'dwarf');
        expect(dwarf).toBeDefined();

        const args = raceUpsertArgs(dwarf!);
        const expectedBonuses = [bonus('con', 2)];

        expect(args.update.abilityBonuses).toEqual({
            deleteMany: {},
            create: expectedBonuses,
        });
        expect(args.create.abilityBonuses).toEqual({
            create: expectedBonuses,
        });
    });

    test('picks up ability-bonus modifications on reseed instead of leaving stale join rows', () => {
        const stale = raceUpsertArgs({
            index: 'dwarf',
            name: 'Dwarf',
            speed: 25,
            ability_bonuses: [{ ability_score: { index: 'con' }, bonus: 2 }],
            alignment: '',
            age: '',
            size: 'Medium',
            size_description: '',
            language_desc: '',
            languages: [],
            traits: [],
            subraces: [],
        });
        const updated = raceUpsertArgs({
            index: 'dwarf',
            name: 'Dwarf',
            speed: 25,
            ability_bonuses: [{ ability_score: { index: 'str' }, bonus: 1 }],
            alignment: '',
            age: '',
            size: 'Medium',
            size_description: '',
            language_desc: '',
            languages: [],
            traits: [],
            subraces: [],
        });

        expect(stale.update.abilityBonuses.create).toEqual([bonus('con', 2)]);
        expect(updated.update.abilityBonuses).toEqual({
            deleteMany: {},
            create: [bonus('str', 1)],
        });
    });
});
