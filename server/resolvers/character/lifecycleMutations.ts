import type { FeatureKind } from "@prisma/client";
import type { Context } from "../..";
import type {
    MutationCreateCharacterArgs,
    MutationDeleteCharacterArgs,
    MutationToggleInspirationArgs,
    MutationUpdateCharacterArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import {
    DEFAULT_CURRENCY,
    DEFAULT_SKILL_PROFICIENCIES,
    DEFAULT_TRAITS,
    findOwnedCharacter,
    stripNullishFields,
} from "./helpers";
import {
    deriveHitDicePools,
    deriveNamedClassProficiencies,
    deriveProficiencyBonus,
    deriveSavingThrowProficiencies,
    deriveSpellSlots,
    deriveSpellcastingProfiles,
    deriveStartingHp,
    findStartingClassIndex,
    PROFICIENCY_TYPE,
    type ProficiencyType,
    validateClassAllocations,
    type CharacterAbilityScores,
} from "./multiclassRules";
import {
    loadVisibleSubclassReferences,
    mapSubclassReferencesBySelectionValue,
    materialiseResolvedCharacterClasses,
    normaliseCustomSubclassInput,
    type SubmittedCharacterClassAllocation,
} from "./subclassReferences";

const FEATURE_KIND = {
    CLASS_FEATURE: "CLASS_FEATURE",
    SUBCLASS_FEATURE: "SUBCLASS_FEATURE",
    TRAIT_FEATURE: "TRAIT_FEATURE",
    BACKGROUND_FEATURE: "BACKGROUND_FEATURE",
    FEAT_FEATURE: "FEAT_FEATURE",
    CUSTOM_FEATURE: "CUSTOM_FEATURE",
} as const satisfies Record<FeatureKind, FeatureKind>;

/**
 * Creates a multiclass-aware character and nested stats row with server-derived rules.
 */
export async function createCharacter(
    _parent: unknown,
    { input }: MutationCreateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const {
        abilityScores,
        skillProficiencies,
        traits,
        currency,
        classes,
        startingClassId,
        race,
        background,
        ...characterFields
    } = input;

    const submittedClasses: SubmittedCharacterClassAllocation[] = classes.map((classRow) => ({
        classId: classRow.classId,
        subclassId: classRow.subclassId ?? null,
        customSubclass: normaliseCustomSubclassInput(classRow.customSubclass),
        level: classRow.level,
    }));
    const subclassSelectionValues = submittedClasses
        .map((classRow) => classRow.subclassId)
        .filter((subclassId): subclassId is string => subclassId !== null && subclassId !== undefined);

    const [classRefs, subclassRefs, raceRef, backgroundRef] = await Promise.all([
        prisma.class.findMany({
            where: {
                srdIndex: {
                    in: submittedClasses.map((classRow) => classRow.classId),
                },
            },
            include: {
                proficiencies: true,
            },
        }),
        subclassSelectionValues.length === 0
            ? Promise.resolve([])
            : loadVisibleSubclassReferences(userId, subclassSelectionValues),
        prisma.race.findFirst({
            where: {
                OR: [
                    { name: race },
                    { srdIndex: race },
                ],
            },
            include: {
                languages: true,
                traits: {
                    include: {
                        proficiencies: true,
                    },
                },
            },
        }),
        prisma.background.findFirst({
            where: {
                OR: [
                    { name: background },
                    { srdIndex: background },
                ],
            },
            include: {
                proficiencies: true,
                languages: true,
            },
        }),
    ]);

    if (!raceRef) {
        throw new Error(`Unknown race: ${race}`);
    }

    if (!backgroundRef) {
        throw new Error(`Unknown background: ${background}`);
    }

    const classRefsBySrdIndex = new Map<string, (typeof classRefs)[number]>();
    for (const classRef of classRefs) {
        if (classRef.srdIndex) {
            classRefsBySrdIndex.set(classRef.srdIndex, classRef);
        }
    }

    const subclassRefsBySelectionValue = mapSubclassReferencesBySelectionValue(subclassRefs);

    validateClassAllocations(
        submittedClasses,
        classRefsBySrdIndex,
        subclassRefsBySelectionValue,
        startingClassId,
    );

    const namedReferenceProficiencies = deriveReferenceProficiencies(raceRef, backgroundRef);
    const languageNames = deriveLanguageNames(raceRef, backgroundRef);

    return await prisma.$transaction(async (tx) => {
        const resolvedClasses = await materialiseResolvedCharacterClasses(
            tx,
            userId,
            submittedClasses,
            classRefsBySrdIndex,
            subclassRefsBySelectionValue,
        );
        const startingClassIndex = findStartingClassIndex(
            resolvedClasses.map((resolvedClass) => resolvedClass.classRow),
            startingClassId,
        );
        const totalLevel = resolvedClasses.reduce((total, resolvedClass) => total + resolvedClass.classRow.level, 0);
        const proficiencyBonus = deriveProficiencyBonus(totalLevel);
        const startingHp = deriveStartingHp(
            resolvedClasses,
            startingClassIndex,
            abilityScores as CharacterAbilityScores,
        );
        const savingThrowProficiencies = deriveSavingThrowProficiencies(
            resolvedClasses[startingClassIndex]!.classRef,
        );
        const hitDicePools = deriveHitDicePools(resolvedClasses);
        const spellSlots = deriveSpellSlots(resolvedClasses);
        const spellcastingProfiles = deriveSpellcastingProfiles(
            resolvedClasses,
            abilityScores as CharacterAbilityScores,
            proficiencyBonus,
        );
        const classAndSubclassFeatures = await loadClassAndSubclassFeatures(
            tx,
            resolvedClasses,
        );
        const singleSpellcastingProfile = spellcastingProfiles.length === 1 ? spellcastingProfiles[0] : null;
        const namedClassProficiencies = deriveNamedClassProficiencies(resolvedClasses, startingClassIndex);

        return await tx.character.create({
            data: {
                ...characterFields,
                ownerUserId: userId,
                race: raceRef.name,
                alignment: characterFields.alignment,
                background: backgroundRef.name,
                raceId: raceRef.id,
                backgroundId: backgroundRef.id,
                proficiencyBonus,
                spellcastingAbility: singleSpellcastingProfile?.spellcastingAbility ?? null,
                spellSaveDC: singleSpellcastingProfile?.spellSaveDC ?? null,
                spellAttackBonus: singleSpellcastingProfile?.spellAttackBonus ?? null,
                stats: {
                    create: {
                        abilityScores,
                        hp: {
                            current: startingHp,
                            max: startingHp,
                            temp: 0,
                        },
                        deathSaves: { successes: 0, failures: 0 },
                        savingThrowProficiencies,
                        skillProficiencies: { ...DEFAULT_SKILL_PROFICIENCIES, ...skillProficiencies },
                        traits: {
                            ...DEFAULT_TRAITS,
                            ...(traits ?? {}),
                            armorProficiencies: mergeNamedValues(
                                namedClassProficiencies.armor,
                                namedReferenceProficiencies.armor,
                            ),
                            weaponProficiencies: mergeNamedValues(
                                namedClassProficiencies.weapons,
                                namedReferenceProficiencies.weapons,
                            ),
                            toolProficiencies: mergeNamedValues(
                                namedClassProficiencies.tools,
                                namedReferenceProficiencies.tools,
                            ),
                            languages: languageNames,
                        },
                        currency: currency ?? DEFAULT_CURRENCY,
                    },
                },
                classes: {
                    create: resolvedClasses.map((resolvedClass, index) => ({
                        classId: resolvedClass.classRef.id,
                        subclassId: resolvedClass.subclassRef?.id ?? null,
                        level: resolvedClass.classRow.level,
                        isStartingClass: index === startingClassIndex,
                    })),
                },
                hitDicePools: {
                    create: hitDicePools.map((hitDicePool) => ({
                        classId: classRefsBySrdIndex.get(hitDicePool.classId)!.id,
                        total: hitDicePool.total,
                        remaining: hitDicePool.remaining,
                        die: hitDicePool.die,
                    })),
                },
                spellSlots: {
                    create: spellSlots,
                },
                features: {
                    create: classAndSubclassFeatures,
                },
            },
        });
    });
}

/**
 * Updates character top-level fields that are provided in input.
 */
export async function updateCharacter(
    _parent: unknown,
    { id, input }: MutationUpdateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const existing = await findOwnedCharacter(id, userId);

    const data = stripNullishFields(input);

    return await prisma.character.update({
        where: { id: existing.id },
        data,
    });
}

/**
 * Deletes an owned character by id.
 */
export async function deleteCharacter(
    _parent: unknown,
    { id }: MutationDeleteCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const result = await prisma.character.deleteMany({
        where: { id, ownerUserId: userId },
    });

    if (result.count === 0) throw new Error('Character not found.');

    return true;
}

/**
 * Toggles inspiration on/off for an owned character.
 */
export async function toggleInspiration(
    _parent: unknown,
    { characterId }: MutationToggleInspirationArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const existing = await findOwnedCharacter(characterId, userId);

    return await prisma.character.update({
        where: { id: existing.id },
        data: { inspiration: !existing.inspiration },
    });
}

/**
 * Derives named armour / weapon / tool proficiencies supplied by race traits and backgrounds.
 */
function deriveReferenceProficiencies(
    raceRef: {
        traits: Array<{ proficiencies: Array<{ name: string; type: ProficiencyType }> }>;
    },
    backgroundRef: {
        proficiencies: Array<{ name: string; type: ProficiencyType }>;
    },
) {
    const armor = new Set<string>();
    const weapons = new Set<string>();
    const tools = new Set<string>();

    const referenceProficiencies = [
        ...raceRef.traits.flatMap((trait) => trait.proficiencies),
        ...backgroundRef.proficiencies,
    ];

    for (const proficiency of referenceProficiencies) {
        if (proficiency.type === PROFICIENCY_TYPE.ARMOR) armor.add(proficiency.name);
        if (proficiency.type === PROFICIENCY_TYPE.WEAPON) weapons.add(proficiency.name);
        if (proficiency.type === PROFICIENCY_TYPE.TOOL) tools.add(proficiency.name);
    }

    return {
        armor: Array.from(armor),
        weapons: Array.from(weapons),
        tools: Array.from(tools),
    };
}

/**
 * Derives displayable language names from race and background references.
 */
function deriveLanguageNames(
    raceRef: {
        languages: Array<{ name: string }>;
    },
    backgroundRef: {
        languages: Array<{ name: string }>;
        languageChoiceCount: number | null;
    },
) {
    const languageNames = new Set<string>([
        ...raceRef.languages.map((language) => language.name),
        ...backgroundRef.languages.map((language) => language.name),
    ]);

    if (backgroundRef.languageChoiceCount && backgroundRef.languageChoiceCount > 0) {
        languageNames.add(`Choice (${backgroundRef.languageChoiceCount})`);
    }

    return mergeNamedValues(Array.from(languageNames));
}

/**
 * Loads all class and subclass feature definitions available to the created character.
 */
async function loadClassAndSubclassFeatures(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    resolvedClasses: Awaited<ReturnType<typeof materialiseResolvedCharacterClasses>>,
) {
    const filters = resolvedClasses.flatMap((resolvedClass) => {
        const classFilters: Array<{
            kind: FeatureKind;
            classId?: string;
            subclassId?: string;
            level: { lte: number };
        }> = [
            {
                kind: FEATURE_KIND.CLASS_FEATURE,
                classId: resolvedClass.classRef.id,
                level: { lte: resolvedClass.classRow.level },
            },
        ];

        if (resolvedClass.subclassRef) {
            classFilters.push({
                kind: FEATURE_KIND.SUBCLASS_FEATURE,
                subclassId: resolvedClass.subclassRef.id,
                level: { lte: resolvedClass.classRow.level },
            });
        }

        return classFilters;
    });

    if (filters.length === 0) {
        return [];
    }

    const featureDefinitions = await tx.feature.findMany({
        where: {
            OR: filters,
        },
        orderBy: [{ level: "asc" }, { name: "asc" }],
    });

    return featureDefinitions.map((feature) => {
        const resolvedClass = resolvedClasses.find((candidate) => (
            (feature.kind === FEATURE_KIND.SUBCLASS_FEATURE && candidate.subclassRef?.id === feature.subclassId)
            || (feature.kind === FEATURE_KIND.CLASS_FEATURE && candidate.classRef.id === feature.classId)
        ));

        if (!resolvedClass) {
            throw new Error(`Could not match feature ${feature.name} to a created class row.`);
        }

        return mapFeatureDefinitionToCharacterFeature(feature, resolvedClass);
    });
}

/**
 * Converts one persisted feature definition into a nested CharacterFeature create.
 */
function mapFeatureDefinitionToCharacterFeature(
    feature: {
        id: string;
        name: string;
        description: string[];
        sourceLabel: string | null;
        kind: FeatureKind;
        level: number | null;
        classId: string | null;
        subclassId: string | null;
    },
    resolvedClass: Awaited<ReturnType<typeof materialiseResolvedCharacterClasses>>[number],
) {
    const description = feature.description.join("\n\n") || "No description available.";
    const source = feature.sourceLabel
        ?? (feature.kind === FEATURE_KIND.SUBCLASS_FEATURE && resolvedClass.subclassRef && feature.level != null
            ? `${resolvedClass.subclassRef.name} ${resolvedClass.classRef.name} ${feature.level}`
            : feature.kind === FEATURE_KIND.CLASS_FEATURE && feature.level != null
                ? `${resolvedClass.classRef.name} ${feature.level}`
                : "Feature");
    const baseFeature = {
        featureId: feature.id,
        name: feature.name,
        source,
        description,
    };

    if (feature.name.toLowerCase() === "arcane recovery") {
        return {
            ...baseFeature,
            usesMax: 1,
            usesRemaining: 1,
            recharge: "long",
        };
    }

    return baseFeature;
}

/**
 * Returns a stable, sorted value list or a single "None" entry for empty sets.
 */
function mergeNamedValues(...valueSets: string[][]): string[] {
    const values = Array.from(
        new Set(valueSets.flat().filter((value) => value.trim().length > 0 && value !== 'None')),
    ).sort((left, right) => left.localeCompare(right));

    if (values.length === 0) {
        return ['None'];
    }

    return values;
}
