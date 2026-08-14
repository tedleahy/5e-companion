import prisma from '../prisma';
import { raceLanguageChoiceCountFromSrd } from './compendiumBrowseSeed';

type AbilityBonus = {
    ability_score: { index: string };
    bonus: number;
};

export type SrdRace = {
    index: string;
    name: string;
    speed: number;
    ability_bonuses: AbilityBonus[];
    alignment: string;
    age: string;
    size: string;
    size_description: string;
    language_desc: string;
    language_options?: { choose?: number };
    languages: Array<{ index: string }>;
    traits: Array<{ index: string }>;
    subraces: Array<{ index: string }>;
};

/** Maps an SRD race into Race upsert scalars plus nested ability-bonus create rows. */
export function raceSeedPayload(race: SrdRace) {
    return {
        srdIndex: race.index,
        name: race.name,
        speed: race.speed,
        alignment: race.alignment,
        age: race.age,
        size: race.size,
        sizeDescription: race.size_description,
        languageDescription: race.language_desc,
        languageChoiceCount: raceLanguageChoiceCountFromSrd(race),
        languageIndexes: race.languages.map(({ index }) => index),
        traitIndexes: race.traits.map(({ index }) => index),
        subraceIndexes: race.subraces.map(({ index }) => index),
        sourceBook: 'SRD',
        abilityBonuses: race.ability_bonuses.map((abilityBonus) => ({
            bonus: abilityBonus.bonus,
            abilityScore: {
                connect: {
                    srdIndex: abilityBonus.ability_score.index,
                },
            },
        })),
    };
}

/** Prisma race upsert args that replace ability-bonus join rows on reseed. */
export function raceUpsertArgs(race: SrdRace) {
    const { abilityBonuses, ...scalars } = raceSeedPayload(race);
    return {
        where: { srdIndex: race.index },
        update: {
            ...scalars,
            abilityBonuses: {
                deleteMany: {},
                create: abilityBonuses,
            },
        },
        create: {
            ...scalars,
            abilityBonuses: {
                create: abilityBonuses,
            },
        },
    };
}

export default async function seedRaces() {
    try {
        const relativeFilePath = '../../srd-json-files/5e-SRD-Races.json';
        const filePath = new URL(relativeFilePath, import.meta.url).pathname;
        const races = (await Bun.file(filePath).json()) as SrdRace[];

        console.log(`Loaded ${races.length} races from SRD JSON.`);

        let totalInserts = 0;

        for (const race of races) {
            const result = await prisma.race.upsert(raceUpsertArgs(race));

            if (result.id) totalInserts++;
        }

        console.log(`Seeded/updated ${totalInserts} races from SRD JSON.`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
