import type { Prisma } from '@prisma/client';
import type { Context } from '..';
import { requireUser } from '../lib/auth';
import prisma from '../prisma/prisma';

type ReferenceRow = {
    id: string;
    srdIndex: string | null;
    name: string;
};

type AbilityBonusRow = {
    bonus: number;
    abilityScore: {
        id: string;
        srdIndex: string | null;
        fullName: string;
    };
};

type TraitRow = ReferenceRow & {
    description: string[];
    languageChoiceCount: number | null;
};

const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

function visibleReferenceWhere(userId: string) {
    return {
        OR: [
            { ownerUserId: null },
            { ownerUserId: userId },
        ],
    };
}

function valueOf(row: Pick<ReferenceRow, 'id' | 'srdIndex'>): string {
    return row.srdIndex ?? row.id;
}

function referenceOf(row: ReferenceRow) {
    return { value: valueOf(row), name: row.name };
}

function abilityBonusesOf(rows: AbilityBonusRow[]) {
    return [...rows]
        .sort((left, right) => {
            const leftIndex = left.abilityScore.srdIndex ?? left.abilityScore.id;
            const rightIndex = right.abilityScore.srdIndex ?? right.abilityScore.id;
            return ABILITY_ORDER.indexOf(leftIndex) - ABILITY_ORDER.indexOf(rightIndex);
        })
        .map((row) => ({
            abilityIndex: row.abilityScore.srdIndex ?? row.abilityScore.id,
            abilityName: row.abilityScore.fullName,
            bonus: row.bonus,
        }));
}

function abilitySummaryOf(rows: AbilityBonusRow[]): string {
    const bonuses = abilityBonusesOf(rows);
    if (bonuses.length === 0) return 'No ability score increase';

    const sharedBonus = bonuses[0]!.bonus;
    if (bonuses.length === ABILITY_ORDER.length && bonuses.every(({ bonus }) => bonus === sharedBonus)) {
        return `All ${sharedBonus >= 0 ? '+' : ''}${sharedBonus}`;
    }

    return bonuses
        .map(({ abilityIndex, bonus }) => `${abilityIndex.toUpperCase()} ${bonus >= 0 ? '+' : ''}${bonus}`)
        .join(', ');
}

function traitOf(row: TraitRow) {
    return {
        value: valueOf(row),
        name: row.name,
        description: row.description,
        languageChoiceCount: row.languageChoiceCount,
    };
}

function isJsonObject(value: Prisma.JsonValue | null | undefined): value is Prisma.JsonObject {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

function nullableInteger(value: Prisma.JsonValue | undefined): number | null {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

function equipmentFromJson(value: Prisma.JsonValue | null) {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry) => {
        if (!isJsonObject(entry) || typeof entry.name !== 'string'
            || typeof entry.quantity !== 'number' || !Number.isInteger(entry.quantity)) {
            return [];
        }

        return [{
            name: entry.name,
            quantity: entry.quantity,
            choiceGroup: nullableInteger(entry.choiceGroup),
            choiceCount: nullableInteger(entry.choiceCount),
        }];
    });
}

function characteristicOptionsFromJson(value: Prisma.JsonValue | undefined) {
    if (!isJsonObject(value) || typeof value.choose !== 'number' || !Number.isInteger(value.choose)
        || !Array.isArray(value.options) || !value.options.every((option) => typeof option === 'string')) {
        return null;
    }

    return { choose: value.choose, options: value.options };
}

function suggestedCharacteristicsFromJson(value: Prisma.JsonValue | null) {
    if (!isJsonObject(value)) return null;

    const result = {
        personalityTraits: characteristicOptionsFromJson(value.personalityTraits),
        ideals: characteristicOptionsFromJson(value.ideals),
        bonds: characteristicOptionsFromJson(value.bonds),
        flaws: characteristicOptionsFromJson(value.flaws),
    };

    return Object.values(result).some(Boolean) ? result : null;
}

function raceInclude(userId: string) {
    const visible = visibleReferenceWhere(userId);
    return {
        abilityBonuses: { include: { abilityScore: true } },
        traits: { where: visible, orderBy: { name: 'asc' as const } },
        languages: { where: visible, orderBy: { name: 'asc' as const } },
        subraces: {
            where: visible,
            include: {
                abilityBonuses: { include: { abilityScore: true } },
                _count: { select: { traits: { where: visible } } },
            },
            orderBy: { name: 'asc' as const },
        },
        _count: { select: { characters: { where: { ownerUserId: userId } } } },
    } satisfies Prisma.RaceInclude;
}

function subraceInclude(userId: string) {
    const visible = visibleReferenceWhere(userId);
    return {
        raceRef: {
            include: {
                abilityBonuses: { include: { abilityScore: true } },
                traits: { where: visible, orderBy: { name: 'asc' as const } },
                languages: { where: visible, orderBy: { name: 'asc' as const } },
            },
        },
        abilityBonuses: { include: { abilityScore: true } },
        traits: { where: visible, orderBy: { name: 'asc' as const } },
        _count: { select: { characters: { where: { ownerUserId: userId } } } },
    } satisfies Prisma.SubraceInclude;
}

function backgroundInclude(userId: string) {
    const visible = visibleReferenceWhere(userId);
    return {
        proficiencies: { where: visible, orderBy: { name: 'asc' as const } },
        languages: { where: visible, orderBy: { name: 'asc' as const } },
        _count: { select: { characters: { where: { ownerUserId: userId } } } },
    } satisfies Prisma.BackgroundInclude;
}

function featInclude(userId: string) {
    return {
        prerequisites: { include: { abilityScore: true } },
        _count: {
            select: {
                characterFeats: { where: { character: { ownerUserId: userId } } },
            },
        },
    } satisfies Prisma.FeatInclude;
}

function languageInclude(userId: string) {
    const visible = visibleReferenceWhere(userId);
    return {
        races: { where: visible, orderBy: { name: 'asc' as const } },
        backgrounds: { where: visible, orderBy: { name: 'asc' as const } },
        traits: { where: visible, orderBy: { name: 'asc' as const } },
    } satisfies Prisma.LanguageInclude;
}

/** True when a language has a named script rather than missing metadata. */
function hasRecordedScript(script: string | null | undefined): script is string {
    return script != null && script.trim() !== '';
}

/** Peers that share a recorded script with `row`. Null/blank scripts are not a shared group. */
function sameScriptPeersOf<T extends { id: string; script: string | null }>(row: T, rows: T[]) {
    if (!hasRecordedScript(row.script)) return [];
    return rows.filter((peer) => peer.id !== row.id && peer.script === row.script);
}

/** Returns lightweight Compendium totals without loading content rows. */
export default async function compendiumCounts(
    _parent: unknown,
    _args: unknown,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const [
        srdClassCount,
        customClassCount,
        srdSubclassCount,
        customSubclassCount,
        srdRaceCount,
        customRaceCount,
        srdSubraceCount,
        customSubraceCount,
        srdBackgroundCount,
        customBackgroundCount,
        srdFeatCount,
        customFeatCount,
        srdLanguageCount,
        customLanguageCount,
        spellCount,
    ] = await Promise.all([
        prisma.class.count({ where: { ownerUserId: null } }),
        prisma.class.count({ where: { ownerUserId: userId, archivedAt: null } }),
        prisma.subclass.count({ where: { ownerUserId: null } }),
        prisma.subclass.count({ where: { ownerUserId: userId, archivedAt: null } }),
        prisma.race.count({ where: { ownerUserId: null } }),
        prisma.race.count({ where: { ownerUserId: userId } }),
        prisma.subrace.count({ where: { ownerUserId: null } }),
        prisma.subrace.count({ where: { ownerUserId: userId } }),
        prisma.background.count({ where: { ownerUserId: null } }),
        prisma.background.count({ where: { ownerUserId: userId } }),
        prisma.feat.count({ where: { ownerUserId: null } }),
        prisma.feat.count({ where: { ownerUserId: userId } }),
        prisma.language.count({ where: { ownerUserId: null } }),
        prisma.language.count({ where: { ownerUserId: userId } }),
        prisma.spell.count(),
    ]);

    return {
        srdClassCount,
        customClassCount,
        srdSubclassCount,
        customSubclassCount,
        srdRaceCount,
        customRaceCount,
        srdSubraceCount,
        customSubraceCount,
        srdBackgroundCount,
        customBackgroundCount,
        srdFeatCount,
        customFeatCount,
        srdLanguageCount,
        customLanguageCount,
        spellCount,
    };
}

/** Returns all race browse rows visible to the caller. */
export async function compendiumRaces(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const rows = await prisma.race.findMany({
        where: visibleReferenceWhere(userId),
        include: raceInclude(userId),
        orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
        id: row.id,
        value: valueOf(row),
        srdIndex: row.srdIndex,
        name: row.name,
        isCustom: row.ownerUserId != null,
        sourceBook: row.sourceBook,
        speed: row.speed,
        size: row.size,
        sizeDescription: row.sizeDescription,
        age: row.age,
        alignment: row.alignment,
        languageDescription: row.languageDescription,
        languageChoiceCount: row.languageChoiceCount ?? 0,
        abilityBonuses: abilityBonusesOf(row.abilityBonuses),
        abilitySummary: abilitySummaryOf(row.abilityBonuses),
        traits: row.traits.map(traitOf),
        languages: row.languages.map(referenceOf),
        subraces: row.subraces.map((subrace) => ({
            value: valueOf(subrace),
            name: subrace.name,
            abilityBonuses: abilityBonusesOf(subrace.abilityBonuses),
            abilitySummary: abilitySummaryOf(subrace.abilityBonuses),
            traitCount: subrace._count.traits,
        })),
        characterUsageCount: row._count.characters,
    }));
}

/** Returns all subrace browse rows whose row and parent race are visible to the caller. */
export async function compendiumSubraces(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const visible = visibleReferenceWhere(userId);
    const rows = await prisma.subrace.findMany({
        where: { AND: [visible, { raceRef: visible }] },
        include: subraceInclude(userId),
        orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
        id: row.id,
        value: valueOf(row),
        srdIndex: row.srdIndex,
        name: row.name,
        description: row.description,
        isCustom: row.ownerUserId != null,
        sourceBook: row.sourceBook,
        parentRace: {
            value: valueOf(row.raceRef),
            name: row.raceRef.name,
            speed: row.raceRef.speed,
            size: row.raceRef.size,
            languageDescription: row.raceRef.languageDescription,
            languageChoiceCount: row.raceRef.languageChoiceCount ?? 0,
            abilityBonuses: abilityBonusesOf(row.raceRef.abilityBonuses),
            abilitySummary: abilitySummaryOf(row.raceRef.abilityBonuses),
            traits: row.raceRef.traits.map(traitOf),
            languages: row.raceRef.languages.map(referenceOf),
        },
        abilityBonuses: abilityBonusesOf(row.abilityBonuses),
        abilitySummary: abilitySummaryOf(row.abilityBonuses),
        traits: row.traits.map(traitOf),
        characterUsageCount: row._count.characters,
    }));
}

/** Returns all background browse rows visible to the caller. */
export async function compendiumBackgrounds(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const rows = await prisma.background.findMany({
        where: visibleReferenceWhere(userId),
        include: backgroundInclude(userId),
        orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
        id: row.id,
        value: valueOf(row),
        srdIndex: row.srdIndex,
        name: row.name,
        isCustom: row.ownerUserId != null,
        sourceBook: row.sourceBook,
        featureName: row.featureName,
        featureDescription: row.featureDescription,
        languageChoiceCount: row.languageChoiceCount ?? 0,
        proficiencies: row.proficiencies.map((proficiency) => ({
            value: valueOf(proficiency),
            name: proficiency.name,
            type: proficiency.type,
            isCustom: proficiency.ownerUserId != null,
        })),
        languages: row.languages.map(referenceOf),
        startingEquipment: equipmentFromJson(row.startingEquipment),
        suggestedCharacteristics: suggestedCharacteristicsFromJson(row.suggestedCharacteristics),
        characterUsageCount: row._count.characters,
    }));
}

/** Returns all feat browse rows visible to the caller. */
export async function compendiumFeats(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const rows = await prisma.feat.findMany({
        where: visibleReferenceWhere(userId),
        include: featInclude(userId),
        orderBy: { name: 'asc' },
    });

    return rows.map((row) => {
        const prerequisites = row.prerequisites.map((prerequisite) => ({
            abilityIndex: prerequisite.abilityScore.srdIndex ?? prerequisite.abilityScore.id,
            abilityName: prerequisite.abilityScore.fullName,
            minimumScore: prerequisite.minimumScore,
        }));

        return {
            id: row.id,
            value: valueOf(row),
            srdIndex: row.srdIndex,
            name: row.name,
            isCustom: row.ownerUserId != null,
            sourceBook: row.sourceBook,
            description: row.description,
            prerequisites,
            prerequisiteSummary: prerequisites.length === 0
                ? 'Open to all'
                : prerequisites.map(({ abilityName, minimumScore }) => `${abilityName} ${minimumScore} or higher`).join(' and '),
            characterUsageCount: row._count.characterFeats,
        };
    });
}

/** Returns all language browse rows and batched best-effort caller usage counts. */
export async function compendiumLanguages(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const rows = await prisma.language.findMany({
        where: visibleReferenceWhere(userId),
        include: languageInclude(userId),
        orderBy: { name: 'asc' },
    });
    const visibleLanguageIds = rows.map(({ id }) => id);
    const characters = visibleLanguageIds.length === 0
        ? []
        : await prisma.character.findMany({
            where: { ownerUserId: userId },
            select: {
                raceRef: {
                    select: {
                        languages: {
                            where: { id: { in: visibleLanguageIds } },
                            select: { id: true },
                        },
                    },
                },
                languages: {
                    where: { languageId: { in: visibleLanguageIds } },
                    select: { languageId: true },
                },
            },
        });
    const usageCounts = new Map<string, number>();

    for (const character of characters) {
        const languageIds = new Set([
            ...(character.raceRef?.languages ?? []).map(({ id }) => id),
            ...character.languages.map(({ languageId }) => languageId),
        ]);
        for (const languageId of languageIds) {
            usageCounts.set(languageId, (usageCounts.get(languageId) ?? 0) + 1);
        }
    }

    return rows.map((row) => ({
        id: row.id,
        value: valueOf(row),
        srdIndex: row.srdIndex,
        name: row.name,
        isCustom: row.ownerUserId != null,
        sourceBook: row.sourceBook,
        type: row.type,
        script: row.script,
        typicalSpeakers: row.typicalSpeakers,
        description: row.description,
        grantingRaces: row.races.map(referenceOf),
        grantingBackgrounds: row.backgrounds.map(referenceOf),
        grantingTraits: row.traits.map(referenceOf),
        sameScriptLanguages: sameScriptPeersOf(row, rows).map(referenceOf),
        characterUsageCount: usageCounts.get(row.id) ?? 0,
    }));
}
