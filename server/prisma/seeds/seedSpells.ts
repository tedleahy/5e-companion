import { Prisma, SpellSource } from '@prisma/client';
import prisma from '../prisma';

type SrdSpell = {
    index: string;
    name: string;
    desc: string[];
    higher_level?: string[];
    range: string;
    components: string[];
    material?: string;
    ritual: boolean;
    duration: string;
    concentration: boolean;
    casting_time: string;
    level: number;
    attack_type?: string;
    damage?: {
        damage_type?: {
            index?: string;
        };
        damage_at_slot_level?: Record<string, string>;
        damage_at_character_level?: Record<string, string>;
    };
    school: {
        index: string;
    };
    classes: Array<{ index: string }>;
    subclasses: Array<{ index: string }>;
};

function toSrdSpellRecord(spell: SrdSpell) {
    return {
        source: SpellSource.SRD,
        srdIndex: spell.index,
        name: spell.name,
        description: spell.desc,
        higherLevel: spell.higher_level ?? [],
        range: spell.range,
        components: spell.components,
        material: spell.material ?? null,
        ritual: spell.ritual,
        duration: spell.duration,
        concentration: spell.concentration,
        castingTime: spell.casting_time,
        level: spell.level,
        damageAtSlotLevel:
            spell.damage?.damage_at_slot_level ??
            spell.damage?.damage_at_character_level ??
            Prisma.JsonNull,
        damageTypeIndex: spell.damage?.damage_type?.index ?? null,
        attackType: spell.attack_type ?? null,
        schoolIndex: spell.school.index,
        classIndexes: spell.classes.map((item) => item.index),
        subclassIndexes: spell.subclasses.map((item) => item.index),
        sourceBook: 'SRD',
        raw: spell ?? Prisma.JsonNull,
    };
}

export default async function seedSpells(): Promise<Set<string>> {
    try {
        // --- Seed SRD spells ---
        const srdFilePath = new URL('../../srd-json-files/5e-SRD-Spells.json', import.meta.url).pathname;
        const srdSpells = (await Bun.file(srdFilePath).json()) as SrdSpell[];

        console.log(`Loaded ${srdSpells.length} spells from SRD JSON.`);

        const srdRecords = srdSpells.map(toSrdSpellRecord);

        const srdResult = await prisma.spell.createMany({
            data: srdRecords,
            skipDuplicates: true,
        });

        console.log(`Seeded ${srdResult.count} SRD spells (skipDuplicates=true).`);

        return new Set(srdSpells.map((s) => s.name.toLowerCase()));
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }

    return new Set();
}
