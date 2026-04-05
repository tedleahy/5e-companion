import type { Prisma } from "@prisma/client";
import type { Context } from "../..";
import type {
    MutationSaveCharacterSheetArgs,
    SaveCharacterSheetClassInput,
    SaveCharacterSheetFeatureInput,
    SaveCharacterSheetInventoryItemInput,
    SaveCharacterSheetWeaponInput,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter } from "./helpers";
import {
    deriveHitDicePools,
    deriveProficiencyBonus,
    deriveSpellSlots,
    deriveSpellcastingProfiles,
    findStartingClassIndex,
    resolveCharacterClasses,
    validateClassAllocations,
    type CharacterAbilityScores,
    type CharacterClassAllocation,
    type CharacterClassReference,
    type CharacterSubclassReference,
    type DerivedHitDicePool,
    type DerivedSpellSlot,
    type DerivedSpellcastingProfile,
    type ResolvedCharacterClass,
} from "./multiclassRules";
import { reconcileCharacterSheetCollection } from "./reconcileSheetCollection";

/**
 * Persisted hit-dice state needed to carry spent dice forward through a level-up.
 */
type PersistedHitDicePoolState = {
    classId: string;
    total: number;
    remaining: number;
};

/**
 * Persisted spell-slot state needed to preserve used slots when totals change.
 */
type PersistedSpellSlotState = {
    kind: string;
    level: number;
    total: number;
    used: number;
};

/**
 * Persisted hit-dice row payload created during character-sheet saves.
 */
type SavedHitDicePool = {
    classId: string;
    total: number;
    remaining: number;
    die: string;
};

/**
 * Writes the full editable character sheet in one atomic transaction.
 *
 * Chunk 7 extends this save path so level-up class rows also persist here. The
 * server re-derives hit dice, spell slots, proficiency bonus, and single-class
 * spellcasting scalars from the submitted class rows rather than trusting the
 * client to calculate them.
 */
export async function saveCharacterSheet(
    _parent: unknown,
    { characterId, input }: MutationSaveCharacterSheetArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const submittedClasses = normaliseSubmittedClasses(input.classes);
    const startingClassId = extractStartingClassId(input.classes);
    const resolvedClasses = await resolveSaveCharacterClasses(submittedClasses, startingClassId);
    const startingClassIndex = findStartingClassIndex(submittedClasses, startingClassId);
    const proficiencyBonus = deriveProficiencyBonus(
        submittedClasses.reduce((total, classRow) => total + classRow.level, 0),
    );
    const spellcastingProfiles = deriveSpellcastingProfiles(
        resolvedClasses,
        input.abilityScores as CharacterAbilityScores,
        proficiencyBonus,
    );
    const singleSpellcastingProfile = spellcastingProfiles.length === 1
        ? spellcastingProfiles[0]
        : null;
    const derivedHitDicePools = deriveHitDicePools(resolvedClasses);
    const derivedSpellSlots = deriveSpellSlots(resolvedClasses);

    return await prisma.$transaction(async (tx) => {
        const [stats, existingHitDicePools, existingSpellSlots] = await Promise.all([
            tx.characterStats.findUnique({
                where: { characterId },
            }),
            tx.hitDicePool.findMany({
                where: { characterId },
            }),
            tx.spellSlot.findMany({
                where: { characterId },
            }),
        ]);

        if (!stats) {
            throw new Error("Character stats not found.");
        }

        const nextHitDicePools = mergeDerivedHitDicePools(
            derivedHitDicePools,
            existingHitDicePools,
            resolvedClasses,
        );
        const nextSpellSlots = mergeDerivedSpellSlots(
            derivedSpellSlots,
            existingSpellSlots,
        );

        const updatedCharacter = await tx.character.update({
            where: { id: characterId },
            data: {
                ac: input.ac,
                speed: input.speed,
                initiative: input.initiative,
                conditions: input.conditions,
                proficiencyBonus,
                spellcastingAbility: singleSpellcastingProfile?.spellcastingAbility ?? null,
                spellSaveDC: singleSpellcastingProfile?.spellSaveDC ?? null,
                spellAttackBonus: singleSpellcastingProfile?.spellAttackBonus ?? null,
                classes: {
                    deleteMany: {},
                    create: buildSavedClassRows(resolvedClasses, startingClassIndex),
                },
                hitDicePools: {
                    deleteMany: {},
                    create: nextHitDicePools,
                },
                spellSlots: {
                    deleteMany: {},
                    create: nextSpellSlots,
                },
            },
        });

        await tx.characterStats.update({
            where: { id: stats.id },
            data: {
                hp: input.hp,
                abilityScores: input.abilityScores,
                currency: input.currency,
                traits: input.traits,
            },
        });

        await reconcileWeapons(tx, characterId, input.weapons);
        await reconcileInventory(tx, characterId, input.inventory);
        await reconcileFeatures(tx, characterId, input.features);

        return updatedCharacter;
    });
}

/**
 * Normalises save-input class rows into the pure multiclass helper shape.
 */
function normaliseSubmittedClasses(
    classes: SaveCharacterSheetClassInput[],
): CharacterClassAllocation[] {
    return classes.map((classRow) => ({
        classId: classRow.classId,
        subclassId: classRow.subclassId ?? null,
        level: classRow.level,
    }));
}

/**
 * Extracts the one starting class from the submitted save payload.
 */
function extractStartingClassId(classes: SaveCharacterSheetClassInput[]): string {
    const startingClasses = classes.filter((classRow) => classRow.isStartingClass);

    if (startingClasses.length !== 1) {
        throw new Error("Exactly one starting class is required.");
    }

    return startingClasses[0]!.classId;
}

/**
 * Resolves submitted class rows against seeded reference data and validates them.
 */
async function resolveSaveCharacterClasses(
    classes: CharacterClassAllocation[],
    startingClassId: string,
): Promise<ResolvedCharacterClass[]> {
    const subclassIds = classes
        .map((classRow) => classRow.subclassId)
        .filter((subclassId): subclassId is string => typeof subclassId === "string");

    const [classRefs, subclassRefs] = await Promise.all([
        prisma.class.findMany({
            where: {
                srdIndex: {
                    in: classes.map((classRow) => classRow.classId),
                },
            },
        }),
        subclassIds.length === 0
            ? Promise.resolve([])
            : prisma.subclass.findMany({
                  where: {
                      srdIndex: {
                          in: subclassIds,
                      },
                  },
              }),
    ]);

    const classRefsBySrdIndex = new Map<string, CharacterClassReference>();
    for (const classRef of classRefs) {
        if (classRef.srdIndex) {
            classRefsBySrdIndex.set(classRef.srdIndex, classRef);
        }
    }

    const subclassRefsBySrdIndex = new Map<string, CharacterSubclassReference>();
    for (const subclassRef of subclassRefs) {
        if (subclassRef.srdIndex) {
            subclassRefsBySrdIndex.set(subclassRef.srdIndex, subclassRef);
        }
    }

    validateClassAllocations(classes, classRefsBySrdIndex, subclassRefsBySrdIndex, startingClassId);

    return resolveCharacterClasses(classes, classRefsBySrdIndex, subclassRefsBySrdIndex);
}

/**
 * Builds nested class-row creates for the character update payload.
 */
function buildSavedClassRows(
    resolvedClasses: ResolvedCharacterClass[],
    startingClassIndex: number,
) {
    return resolvedClasses.map((resolvedClass, classIndex) => ({
        classId: resolvedClass.classRef.id,
        subclassId: resolvedClass.subclassRef?.id ?? null,
        level: resolvedClass.classRow.level,
        isStartingClass: classIndex === startingClassIndex,
    }));
}

/**
 * Carries expended hit dice forward while replacing pools with re-derived totals.
 */
function mergeDerivedHitDicePools(
    derivedHitDicePools: DerivedHitDicePool[],
    existingHitDicePools: PersistedHitDicePoolState[],
    resolvedClasses: ResolvedCharacterClass[],
): SavedHitDicePool[] {
    const classIdBySrdIndex = new Map(
        resolvedClasses.map((resolvedClass) => [
            resolvedClass.classRow.classId,
            resolvedClass.classRef.id,
        ]),
    );

    return derivedHitDicePools.map((derivedPool) => {
        const persistedClassId = classIdBySrdIndex.get(derivedPool.classId);
        if (!persistedClassId) {
            throw new Error(`Unknown class while saving hit dice: ${derivedPool.classId}`);
        }

        const existingPool = existingHitDicePools.find((candidate) => candidate.classId === persistedClassId);
        const spentDice = existingPool
            ? Math.max(existingPool.total - existingPool.remaining, 0)
            : 0;

        return {
            classId: persistedClassId,
            total: derivedPool.total,
            remaining: Math.max(0, derivedPool.total - spentDice),
            die: derivedPool.die,
        };
    });
}

/**
 * Carries expended spell slots forward while replacing rows with re-derived totals.
 */
function mergeDerivedSpellSlots(
    derivedSpellSlots: DerivedSpellSlot[],
    existingSpellSlots: PersistedSpellSlotState[],
): DerivedSpellSlot[] {
    return derivedSpellSlots.map((derivedSpellSlot) => {
        const existingSpellSlot = findPersistedSpellSlotMatch(derivedSpellSlot, existingSpellSlots);

        return {
            ...derivedSpellSlot,
            used: Math.min(existingSpellSlot?.used ?? 0, derivedSpellSlot.total),
        };
    });
}

/**
 * Finds the persisted slot row that should preserve usage for a re-derived slot.
 */
function findPersistedSpellSlotMatch(
    derivedSpellSlot: DerivedSpellSlot,
    existingSpellSlots: PersistedSpellSlotState[],
): PersistedSpellSlotState | undefined {
    const directMatch = existingSpellSlots.find((candidate) => (
        candidate.kind === derivedSpellSlot.kind
        && candidate.level === derivedSpellSlot.level
    ));

    if (directMatch) {
        return directMatch;
    }

    if (derivedSpellSlot.kind !== "PACT_MAGIC") {
        return undefined;
    }

    return existingSpellSlots.find((candidate) => candidate.kind === "PACT_MAGIC");
}

/**
 * Reconciles the persisted weapon rows against the submitted sheet payload.
 */
async function reconcileWeapons(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextWeapons: SaveCharacterSheetWeaponInput[],
) {
    await reconcileCharacterSheetCollection({
        delegate: tx.weapon,
        characterId,
        nextItems: nextWeapons,
        notFoundMessage: "Weapon not found.",
        buildUpdateData(weapon) {
            return {
                name: weapon.name,
                attackBonus: weapon.attackBonus,
                damage: weapon.damage,
                type: weapon.type,
            };
        },
        buildCreateData(weapon, currentCharacterId) {
            return {
                characterId: currentCharacterId,
                name: weapon.name,
                attackBonus: weapon.attackBonus,
                damage: weapon.damage,
                type: weapon.type,
            };
        },
    });
}

/**
 * Reconciles the persisted inventory rows against the submitted sheet payload.
 */
async function reconcileInventory(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextInventory: SaveCharacterSheetInventoryItemInput[],
) {
    await reconcileCharacterSheetCollection({
        delegate: tx.inventoryItem,
        characterId,
        nextItems: nextInventory,
        notFoundMessage: "Inventory item not found.",
        buildUpdateData(item) {
            return {
                name: item.name,
                quantity: item.quantity,
                weight: item.weight ?? null,
                description: item.description ?? null,
                equipped: item.equipped,
                magical: item.magical,
            };
        },
        buildCreateData(item, currentCharacterId) {
            return {
                characterId: currentCharacterId,
                name: item.name,
                quantity: item.quantity,
                weight: item.weight ?? null,
                description: item.description ?? null,
                equipped: item.equipped,
                magical: item.magical,
            };
        },
    });
}

/**
 * Reconciles the persisted feature rows against the submitted sheet payload.
 */
async function reconcileFeatures(
    tx: Prisma.TransactionClient,
    characterId: string,
    nextFeatures: SaveCharacterSheetFeatureInput[],
) {
    await reconcileCharacterSheetCollection({
        delegate: tx.characterFeature,
        characterId,
        nextItems: nextFeatures,
        notFoundMessage: "Feature not found.",
        buildUpdateData(feature) {
            return {
                name: feature.name,
                source: feature.source,
                description: feature.description,
                usesMax: feature.usesMax ?? null,
                usesRemaining: feature.usesRemaining ?? null,
                recharge: feature.recharge ?? null,
            };
        },
        buildCreateData(feature, currentCharacterId) {
            return {
                characterId: currentCharacterId,
                name: feature.name,
                source: feature.source,
                description: feature.description,
                usesMax: feature.usesMax ?? null,
                usesRemaining: feature.usesRemaining ?? null,
                recharge: feature.recharge ?? null,
            };
        },
    });
}
