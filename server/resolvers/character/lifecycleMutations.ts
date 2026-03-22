import { ProficiencyType } from "@prisma/client";
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
    resolveCharacterClasses,
    validateClassAllocations,
    type CharacterAbilityScores,
} from "./multiclassRules";

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
        startingClassIndex,
        race,
        background,
        ...characterFields
    } = input;

    const subclassIds = classes
        .map((classRow) => classRow.subclassId)
        .filter((subclassId): subclassId is string => subclassId !== null && subclassId !== undefined);

    const [classRefs, subclassRefs, raceRef, backgroundRef] = await Promise.all([
        prisma.class.findMany({
            where: {
                srdIndex: {
                    in: classes.map((classRow) => classRow.classId),
                },
            },
            include: {
                proficiencies: true,
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

    const subclassRefsBySrdIndex = new Map<string, (typeof subclassRefs)[number]>();
    for (const subclassRef of subclassRefs) {
        if (subclassRef.srdIndex) {
            subclassRefsBySrdIndex.set(subclassRef.srdIndex, subclassRef);
        }
    }

    validateClassAllocations(classes, classRefsBySrdIndex, subclassRefsBySrdIndex, startingClassIndex);

    const resolvedClasses = resolveCharacterClasses(classes, classRefsBySrdIndex, subclassRefsBySrdIndex);
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
    const singleSpellcastingProfile = spellcastingProfiles.length === 1 ? spellcastingProfiles[0] : null;
    const namedClassProficiencies = deriveNamedClassProficiencies(resolvedClasses, startingClassIndex);
    const namedReferenceProficiencies = deriveReferenceProficiencies(raceRef, backgroundRef);
    const languageNames = deriveLanguageNames(raceRef, backgroundRef);

    return await prisma.character.create({
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
                    order: index,
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
        },
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
        if (proficiency.type === ProficiencyType.ARMOR) armor.add(proficiency.name);
        if (proficiency.type === ProficiencyType.WEAPON) weapons.add(proficiency.name);
        if (proficiency.type === ProficiencyType.TOOL) tools.add(proficiency.name);
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
