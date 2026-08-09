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

function normalizeSpellName(name: string): string {
    return name.toLowerCase();
}

type ExistingSpell = { name: string; source: SpellSource };

type CustomSpellPartition<T> = {
    /** Names not present in the database yet. */
    toCreate: T[];
    /** Names already held by a `CUSTOM` row, whose fields are refreshed from the JSON. */
    toUpdate: T[];
};

/**
 * Splits the custom JSON into rows to insert and rows to refresh, keyed on a
 * case-insensitive name match against what is already in the database.
 *
 * Entries are dropped when the name is already held by a non-custom (SRD) spell,
 * so custom spells can never shadow SRD ones, or when the same name appears
 * earlier in the JSON — only the first occurrence wins.
 */
export function partitionCustomSpells<T extends { name: string }>(
    spells: T[],
    existingSpells: ExistingSpell[],
): CustomSpellPartition<T> {
    const existingCustomNames = new Set<string>();
    const nonCustomNames = new Set<string>();

    for (const spell of existingSpells) {
        const normalizedName = normalizeSpellName(spell.name);
        if (spell.source === SpellSource.CUSTOM) existingCustomNames.add(normalizedName);
        else nonCustomNames.add(normalizedName);
    }

    const toCreate: T[] = [];
    const toUpdate: T[] = [];
    const seenNames = new Set<string>();

    for (const spell of spells) {
        const normalizedName = normalizeSpellName(spell.name);
        if (seenNames.has(normalizedName)) continue;
        seenNames.add(normalizedName);

        if (nonCustomNames.has(normalizedName)) continue;
        if (existingCustomNames.has(normalizedName)) toUpdate.push(spell);
        else toCreate.push(spell);
    }

    return { toCreate, toUpdate };
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

export default async function seedCustomSpells() {
    try {
        const customFilePath = new URL('../../srd-json-files/5e-Spells-Custom.json', import.meta.url).pathname;
        const customSpells = (await Bun.file(customFilePath).json()) as CustomSpell[];
        const existingSpells = await prisma.spell.findMany({ select: { name: true, source: true } });

        const { toCreate, toUpdate } = partitionCustomSpells(customSpells, existingSpells);
        const skippedCount = customSpells.length - toCreate.length - toUpdate.length;

        console.log(`Loaded ${customSpells.length} custom spells.`);

        const created = await prisma.spell.createMany({
            data: toCreate.map(toCustomSpellRecord),
        });

        await prisma.$transaction(
            toUpdate.map((spell) =>
                prisma.spell.updateMany({
                    where: {
                        source: SpellSource.CUSTOM,
                        name: { equals: spell.name, mode: 'insensitive' },
                    },
                    data: toCustomSpellRecord(spell),
                }),
            ),
        );

        console.log(
            `Custom spells: ${created.count} created, ${toUpdate.length} updated, ${skippedCount} skipped (name taken by an SRD spell, or duplicated in the JSON).`,
        );
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
