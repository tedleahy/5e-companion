import prisma from "../../prisma/prisma";
import { SpellSlotKind as GraphqlSpellSlotKind } from "../../generated/graphql";
import type { CharacterDetail, CharacterFieldParent } from "./detailLoad";
import {
    deriveProficiencyBonus,
    deriveSpellcastingProfiles,
    deriveTotalLevel,
    sortClassRowsForDisplay,
    sortSpellSlots,
    type CharacterAbilityScores,
    type CharacterClassReference,
    type CharacterSubclassReference,
    type ResolvedCharacterClass,
} from "./multiclassRules";

type LoadedCharacterClassRow = Awaited<ReturnType<typeof loadCharacterClasses>>[number];

/**
 * Returns true when the parent already includes the named relation.
 */
function hasLoadedRelation(
    parent: CharacterFieldParent,
    relation: 'stats' | 'classes' | 'weapons' | 'inventory' | 'features' | 'spellSlots' | 'spellbook',
): parent is CharacterDetail {
    return relation in parent;
}

/**
 * Field resolver for Character.level.
 */
export async function characterLevel(parent: CharacterFieldParent): Promise<number> {
    const classes = hasLoadedRelation(parent, 'classes')
        ? parent.classes
        : await loadCharacterClasses(parent.id);

    return deriveTotalLevel(classes.map((classRow) => ({ classId: classRow.classRef.srdIndex ?? classRow.classId, subclassId: classRow.subclassRef?.srdIndex ?? classRow.subclassId ?? null, level: classRow.level })));
}

/**
 * Field resolver for Character.proficiencyBonus.
 */
export async function characterProficiencyBonus(parent: CharacterFieldParent): Promise<number> {
    return deriveProficiencyBonus(await characterLevel(parent));
}

/**
 * Field resolver for Character.classes.
 */
export async function characterClasses(parent: CharacterFieldParent) {
    const classes = hasLoadedRelation(parent, 'classes')
        ? parent.classes
        : await loadCharacterClasses(parent.id);

    return sortClassRowsForDisplay(classes.map((classRow) => ({
        id: classRow.id,
        classId: classRow.classRef.srdIndex ?? classRow.classId,
        className: classRow.classRef.name,
        subclassId: classRow.subclassRef?.srdIndex ?? classRow.subclassId ?? null,
        subclassName: classRow.subclassRef?.name ?? null,
        level: classRow.level,
        isStartingClass: classRow.isStartingClass,
    })));
}

/**
 * Field resolver for Character.spellcastingProfiles.
 */
export async function characterSpellcastingProfiles(parent: CharacterFieldParent) {
    const classes = hasLoadedRelation(parent, 'classes')
        ? parent.classes
        : await loadCharacterClasses(parent.id);
    const stats = hasLoadedRelation(parent, 'stats')
        ? parent.stats
        : await prisma.characterStats.findUnique({ where: { characterId: parent.id } });

    if (!stats) {
        return [];
    }

    const resolvedClasses = toResolvedCharacterClasses(classes);
    const abilityScores = stats.abilityScores as CharacterAbilityScores;
    const proficiencyBonus = deriveProficiencyBonus(
        deriveTotalLevel(resolvedClasses.map((resolvedClass) => resolvedClass.classRow)),
    );

    return deriveSpellcastingProfiles(resolvedClasses, abilityScores, proficiencyBonus)
        .map((profile) => ({
            ...profile,
            slotKind: toGraphqlSpellSlotKind(profile.slotKind),
        }));
}

/**
 * Field resolver for Character.stats.
 */
export async function characterStats(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['stats']> {
    if (hasLoadedRelation(parent, 'stats')) {
        return parent.stats;
    }

    return await prisma.characterStats.findUnique({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for CharacterStats.hitDicePools.
 */
export async function characterStatsHitDicePools(
    parent: { characterId: string },
) {
    const [classRows, hitDicePools] = await Promise.all([
        prisma.characterClass.findMany({
            where: { characterId: parent.characterId },
            include: { classRef: true },
        }),
        prisma.hitDicePool.findMany({
            where: { characterId: parent.characterId },
            include: { classRef: true },
        }),
    ]);

    const sortedClassIds = sortClassRowsForDisplay(
        classRows.map((classRow) => ({
            classId: classRow.classId,
            className: classRow.classRef.name,
            isStartingClass: classRow.isStartingClass,
            level: classRow.level,
        })),
    ).map((classRow) => classRow.classId);
    const classIndexById = new Map(sortedClassIds.map((classId, index) => [classId, index]));

    return [...hitDicePools]
        .sort((left, right) => {
            const leftIndex = classIndexById.get(left.classId) ?? Number.MAX_SAFE_INTEGER;
            const rightIndex = classIndexById.get(right.classId) ?? Number.MAX_SAFE_INTEGER;
            return leftIndex - rightIndex;
        })
        .map((hitDicePool) => ({
            id: hitDicePool.id,
            classId: hitDicePool.classRef.srdIndex ?? hitDicePool.classId,
            className: hitDicePool.classRef.name,
            total: hitDicePool.total,
            remaining: hitDicePool.remaining,
            die: hitDicePool.die,
        }));
}

/**
 * Field resolver for Character.weapons.
 */
export async function characterWeapons(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['weapons']> {
    if (hasLoadedRelation(parent, 'weapons')) {
        return parent.weapons;
    }

    return await prisma.weapon.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.inventory.
 */
export async function characterInventory(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['inventory']> {
    if (hasLoadedRelation(parent, 'inventory')) {
        return parent.inventory;
    }

    return await prisma.inventoryItem.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.features.
 */
export async function characterFeatures(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['features']> {
    if (hasLoadedRelation(parent, 'features')) {
        return parent.features;
    }

    return await prisma.characterFeature.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.spellSlots.
 */
export async function characterSpellSlots(
    parent: CharacterFieldParent,
) {
    if (hasLoadedRelation(parent, 'spellSlots')) {
        return mapSpellSlots(sortSpellSlots(parent.spellSlots));
    }

    const spellSlots = await prisma.spellSlot.findMany({
        where: { characterId: parent.id },
    });

    return mapSpellSlots(sortSpellSlots(spellSlots));
}

/**
 * Field resolver for Character.spellbook.
 */
export async function characterSpellbook(
    parent: CharacterFieldParent,
): Promise<CharacterDetail['spellbook']> {
    if (hasLoadedRelation(parent, 'spellbook')) {
        return parent.spellbook;
    }

    return await prisma.characterSpell.findMany({
        where: { characterId: parent.id },
        include: { spell: true },
    });
}

/**
 * Loads class rows with the reference data needed for display and derivation.
 */
async function loadCharacterClasses(characterId: string) {
    return await prisma.characterClass.findMany({
        where: { characterId },
        include: {
            classRef: true,
            subclassRef: true,
        },
    });
}

/**
 * Converts loaded Prisma class rows into the pure derivation shape.
 */
function toResolvedCharacterClasses(classRows: LoadedCharacterClassRow[]): ResolvedCharacterClass[] {
    return classRows.map((classRow) => ({
        classRow: {
            classId: classRow.classRef.srdIndex ?? classRow.classId,
            subclassId: classRow.subclassRef?.srdIndex ?? classRow.subclassId ?? null,
            level: classRow.level,
        },
        classRef: {
            id: classRow.classRef.id,
            srdIndex: classRow.classRef.srdIndex,
            name: classRow.classRef.name,
            hitDie: classRow.classRef.hitDie,
            spellcastingAbility: classRow.classRef.spellcastingAbility,
        } satisfies CharacterClassReference,
        subclassRef: classRow.subclassRef
            ? {
                  id: classRow.subclassRef.id,
                  srdIndex: classRow.subclassRef.srdIndex,
                  name: classRow.subclassRef.name,
                  classId: classRow.subclassRef.classId,
              } satisfies CharacterSubclassReference
            : null,
    }));
}

/**
 * Converts persisted spell-slot rows into the GraphQL enum shape.
 */
function mapSpellSlots(
    spellSlots: Array<{ id: string; characterId: string; kind: string; level: number; total: number; used: number }>,
) {
    return spellSlots.map((spellSlot) => ({
        ...spellSlot,
        kind: toGraphqlSpellSlotKind(spellSlot.kind),
    }));
}

/**
 * Normalises internal / Prisma slot kind values into the generated GraphQL enum.
 */
function toGraphqlSpellSlotKind(kind: string): GraphqlSpellSlotKind {
    if (kind === 'PACT_MAGIC') {
        return GraphqlSpellSlotKind.PactMagic;
    }

    return GraphqlSpellSlotKind.Standard;
}
