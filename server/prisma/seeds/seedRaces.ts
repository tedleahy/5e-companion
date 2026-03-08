import { Prisma } from '@prisma/client';
import prisma from '../prisma';

type AbilityBonus = {
    ability_score: { index: string },
    bonus: number;
}

type Race = {
    index: string;
    name: string;
    speed: number;
    ability_bonuses: AbilityBonus[];
    alignment: string;
    age: string;
    size: string;
    size_description: string;
    language_desc: string;
    languages: Array<{ index: string }>
    traits: Array<{ index: string }>
    subraces: Array<{ index: string }>
};

function toRecord(race: Race) {
    return {
        srdIndex: race.index,
        name: race.name,
        speed: race.speed,
        alignment: race.alignment,
        age: race.age,
        size: race.size,
        sizeDescription: race.size_description,
        languageDescription: race.language_desc,
        languageIndexes: race.languages.map(({ index }) => index),
        traitIndexes: race.traits.map(({ index }) => index),
        subraceIndexes: race.subraces.map(({ index }) => index),
        abilityBonuses: {
            create: race.ability_bonuses.map(abilityBonus => ({
                bonus: abilityBonus.bonus,
                abilityScore: {
                    connect: {
                        srdIndex: abilityBonus.ability_score.index,
                    }
                }
            })),
        },
    };
}

export default async function seedRaces() {
    try {
        const relativeFilePath = '../../../srd-json-files/5e-SRD-Races.json';
        const filePath = new URL(relativeFilePath, import.meta.url).pathname;
        const races = (await Bun.file(filePath).json()) as Race[];

        console.log(`Loaded ${races.length} races from SRD JSON.`);

        let totalInserts = 0;

        for (const race of races) {
            const result = await prisma.race.upsert({
                where: { srdIndex: race.index },
                update: {},
                create: toRecord(race),
            });

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
