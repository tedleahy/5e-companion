import { SpellSource } from "@prisma/client";
import prisma from "../prisma";

type AbilityScore = {
    index: string;
    name: string;
    full_name: string;
    desc: string[];
    skills: Array<{ index: string }>;
}

function toRecord(abilityScore: AbilityScore) {
    return {
        source: SpellSource.SRD,
        srdIndex: abilityScore.index,
        name: abilityScore.name,
        fullName: abilityScore.full_name,
        description: abilityScore.desc,
        skillIndexes: abilityScore.skills.map(skill => skill.index),
    };
}

export default async function seedAbilityScores() {
    try {
        const relativeFilePath = '../../srd-json-files/5e-SRD-Ability-Scores.json';
        const filePath = new URL(relativeFilePath, import.meta.url).pathname;
        const abilityScores = (await Bun.file(filePath).json()) as AbilityScore[];

        console.log(`Loaded ${abilityScores.length} ability scores from SRD JSON.`);

        const records = abilityScores.map(toRecord);

        const result = await prisma.abilityScore.createMany({
            data: records,
            skipDuplicates: true,
        });

        console.log(`Seeded ${result.count} ability scores (skipDuplicates=true).`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
