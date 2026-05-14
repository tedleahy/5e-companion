import { Prisma, SpellSource } from '@prisma/client';
import prisma from '../prisma';

type CustomSpell = {
    name: string;
    sourceBook: string;
    schoolIndex: string;
    level: number;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    description: string[];
    higherLevel?: string;
    classIndexes: string[];
    ritual: boolean;
};

function parseMaterial(components: string): string | null {
    const match = components.match(/M \((.+)\)/);
    return match?.[1] ?? null;
}

function parseComponents(components: string): string[] {
    return components
        .replace(/\(.*\)/, '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
}

function parseClassIndexes(classIndexes: string[]): string[] {
    if (classIndexes[0] === 'artificer,wizard') return ['artificer', 'wizard'];
    return classIndexes.map(cls => cls.replace(' (optional)', ''));
}

function toCustomSpellRecord(spell: CustomSpell) {
    return {
        source: SpellSource.CUSTOM,
        srdIndex: null,
        name: spell.name,
        description: spell.description,
        higherLevel: spell.higherLevel ? [spell.higherLevel] : [],
        range: spell.range,
        components: parseComponents(spell.components),
        material: parseMaterial(spell.components),
        ritual: spell.ritual,
        duration: spell.duration,
        concentration: spell.duration.toLowerCase().startsWith('concentration'),
        castingTime: spell.castingTime,
        level: spell.level,
        damageAtSlotLevel: Prisma.JsonNull,
        damageTypeIndex: null,
        attackType: null,
        schoolIndex: spell.schoolIndex,
        classIndexes: parseClassIndexes(spell.classIndexes),
        subclassIndexes: [],
        sourceBook: spell.sourceBook,
        raw: spell ?? Prisma.JsonNull,
    };
}

export default async function seedCustomSpells(srdSpellNames: Set<string>) {
    try {
        const customFilePath = new URL('../../srd-json-files/5e-Spells-Custom.json', import.meta.url).pathname;
        const customSpells = (await Bun.file(customFilePath).json()) as CustomSpell[];

        const uniqueCustom = customSpells.filter((s) => !srdSpellNames.has(s.name.toLowerCase()));

        console.log(
            `Loaded ${customSpells.length} custom spells, ${customSpells.length - uniqueCustom.length} duplicates skipped.`,
        );

        const customRecords = uniqueCustom.map(toCustomSpellRecord);

        const result = await prisma.spell.createMany({
            data: customRecords,
            skipDuplicates: true,
        });

        console.log(`Seeded ${result.count} custom spells (skipDuplicates=true).`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
