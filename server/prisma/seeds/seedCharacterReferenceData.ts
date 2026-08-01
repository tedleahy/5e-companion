import { ClassSpellcastingMode, FeatureKind, Prisma, ProficiencyType } from '@prisma/client';
import prisma from '../prisma';
import { baseClassProgressionLevels } from './classProgressionSeed';
import {
    classMulticlassPrerequisites,
    classMulticlassProficiencyRules,
    classProficiencyChoiceRules,
    type SrdMulticlassing,
    type SrdProficiencyChoiceOption,
} from './classPrerequisiteSeed';

type SrdReference = {
    index: string;
    name: string;
};

type SrdLanguage = {
    index: string;
    name: string;
    type?: string;
    script?: string;
    desc?: string;
};

type SrdProficiency = {
    index: string;
    name: string;
    type?: string;
};

type SrdClass = {
    index: string;
    name: string;
    hit_die?: number;
    spellcasting?: {
        spellcasting_ability?: {
            index: string;
        };
    };
    proficiencies?: SrdReference[];
    proficiency_choices?: Array<{
        choose?: number;
        from?: { options?: SrdProficiencyChoiceOption[] };
    }>;
    saving_throws?: SrdReference[];
    starting_equipment?: Array<{ equipment: SrdReference; quantity: number }>;
    starting_equipment_options?: Array<{ desc?: string; choose?: number }>;
    multi_classing?: SrdMulticlassing;
};

type SrdLevel = {
    level: number;
    ability_score_bonuses?: number;
    class: SrdReference;
    subclass?: SrdReference;
    spellcasting?: Record<string, number>;
    class_specific?: Record<string, unknown>;
};

type SrdSpellReference = {
    index: string;
    classes?: SrdReference[];
};

type SrdSubclass = {
    index: string;
    name: string;
    desc: string[];
    class: SrdReference;
};

type SrdBackground = {
    index: string;
    name: string;
    starting_proficiencies?: SrdReference[];
    language_options?: {
        choose?: number;
    };
    feature?: {
        name: string;
        desc?: string[];
    };
};

type SrdSubrace = {
    index: string;
    name: string;
    desc?: string;
    race: SrdReference;
    racial_traits?: SrdReference[];
};

type SrdTrait = {
    index: string;
    name: string;
    desc?: string[];
    races?: SrdReference[];
    subraces?: SrdReference[];
    proficiencies?: SrdReference[];
    proficiency_choices?: {
        choose?: number;
        type?: string;
        from?: {
            option_set_type?: string;
            options?: Array<{
                option_type?: string;
                item?: SrdReference;
            }>;
        };
    };
};

type SrdFeat = {
    index: string;
    name: string;
    desc?: string[];
};

type SrdFeature = {
    index: string;
    name: string;
    level?: number;
    desc?: string[];
    class?: SrdReference;
    subclass?: SrdReference;
    parent?: SrdReference;
    feature_specific?: {
        subfeature_options?: {
            choose?: number;
        };
    };
};

type SrdRace = {
    index: string;
    languages?: SrdReference[];
    traits?: SrdReference[];
};

export function proficiencyTypeFromSrd(type: string | undefined): ProficiencyType {
    const normalized = (type ?? '').trim().toLowerCase();

    if (normalized === 'armor') return ProficiencyType.ARMOR;
    if (normalized === 'weapon' || normalized === 'weapons') return ProficiencyType.WEAPON;
    if (
        normalized === 'tool'
        || normalized === 'tools'
        || normalized.includes('tool')
        || normalized.includes('gaming')
        || normalized.includes('musical')
        || normalized.includes('vehicle')
    ) {
        return ProficiencyType.TOOL;
    }
    if (normalized === 'skill' || normalized === 'skills') return ProficiencyType.SKILL;
    if (normalized.includes('saving')) return ProficiencyType.SAVING_THROW;
    return ProficiencyType.OTHER;
}

/** SRD skill proficiencies are named "Skill: Acrobatics"; store the bare skill name. */
export function proficiencyNameFromSrd(name: string): string {
    return name.replace(/^Skill:\s*/i, '');
}

async function loadJson<T>(relativePath: string): Promise<T> {
    const filePath = new URL(relativePath, import.meta.url).pathname;
    return (await Bun.file(filePath).json()) as T;
}

async function seedLanguages(languages: SrdLanguage[]) {
    for (const language of languages) {
        await prisma.language.upsert({
            where: { srdIndex: language.index },
            update: {
                name: language.name,
                type: language.type ?? null,
                script: language.script ?? null,
                description: language.desc ?? null,
                sourceBook: 'SRD',
                raw: language as Prisma.InputJsonValue,
            },
            create: {
                srdIndex: language.index,
                name: language.name,
                type: language.type ?? null,
                script: language.script ?? null,
                description: language.desc ?? null,
                sourceBook: 'SRD',
                raw: language as Prisma.InputJsonValue,
            },
        });
    }
}

async function seedProficiencies(proficiencies: SrdProficiency[]) {
    for (const proficiency of proficiencies) {
        const name = proficiencyNameFromSrd(proficiency.name);
        await prisma.proficiency.upsert({
            where: { srdIndex: proficiency.index },
            update: {
                name,
                type: proficiencyTypeFromSrd(proficiency.type),
                sourceBook: 'SRD',
                raw: proficiency as Prisma.InputJsonValue,
            },
            create: {
                srdIndex: proficiency.index,
                name,
                type: proficiencyTypeFromSrd(proficiency.type),
                sourceBook: 'SRD',
                raw: proficiency as Prisma.InputJsonValue,
            },
        });
    }
}

const SPELLCASTING_ABILITY_BY_CLASS: Record<string, string> = {
    bard: 'cha', cleric: 'wis', druid: 'wis', paladin: 'cha', ranger: 'wis',
    sorcerer: 'cha', warlock: 'cha', wizard: 'int',
};

/** Tile emoji for each SRD class. */
const CLASS_EMOJI_BY_INDEX: Record<string, string> = {
    barbarian: '💪',
    bard: '🎭',
    cleric: '🙏',
    druid: '🌿',
    fighter: '🗡',
    monk: '🌊',
    paladin: '🛡',
    ranger: '🏇',
    rogue: '🥷',
    sorcerer: '💫',
    warlock: '💥',
    wizard: '📖',
};

async function seedClasses(classes: SrdClass[], levels: SrdLevel[], spells: SrdSpellReference[]) {
    for (const srdClass of classes) {
        const proficiencyConnect = (srdClass.proficiencies ?? []).map((proficiency) => ({
            srdIndex: proficiency.index,
        }));

        const prerequisites = classMulticlassPrerequisites(srdClass.multi_classing);
        const spellcastingAbility = SPELLCASTING_ABILITY_BY_CLASS[srdClass.index] ?? null;
        const spellcastingMode: ClassSpellcastingMode = srdClass.index === 'warlock'
            ? ClassSpellcastingMode.PACT_MAGIC
            : spellcastingAbility
                ? ClassSpellcastingMode.STANDARD
                : ClassSpellcastingMode.NONE;
        const equipment = [
            ...(srdClass.starting_equipment ?? []).map((item) => ({
                name: item.equipment.name,
                quantity: item.quantity,
                choiceGroup: null,
                choiceCount: null,
            })),
            ...(srdClass.starting_equipment_options ?? []).map((option, index) => ({
                name: option.desc ?? `Equipment choice ${index + 1}`,
                quantity: 1,
                choiceGroup: index + 1,
                choiceCount: option.choose ?? 1,
            })),
        ];

        const classRef = await prisma.class.upsert({
            where: { srdIndex: srdClass.index },
            update: {
                name: srdClass.name,
                emoji: CLASS_EMOJI_BY_INDEX[srdClass.index] ?? '⚔️',
                hitDie: srdClass.hit_die ?? null,
                primaryAbilityIndexes: [...new Set(prerequisites.map((rule) => rule.abilityIndex))],
                savingThrowIndexes: (srdClass.saving_throws ?? []).map((ability) => ability.index),
                multiclassPrerequisites: prerequisites,
                startingEquipment: equipment,
                spellcastingMode,
                spellcastingAbility,
                sourceBook: 'SRD',
                raw: srdClass as Prisma.InputJsonValue,
                proficiencies: {
                    set: proficiencyConnect,
                },
            },
            create: {
                srdIndex: srdClass.index,
                name: srdClass.name,
                emoji: CLASS_EMOJI_BY_INDEX[srdClass.index] ?? '⚔️',
                hitDie: srdClass.hit_die ?? null,
                primaryAbilityIndexes: [...new Set(prerequisites.map((rule) => rule.abilityIndex))],
                savingThrowIndexes: (srdClass.saving_throws ?? []).map((ability) => ability.index),
                multiclassPrerequisites: prerequisites,
                startingEquipment: equipment,
                spellcastingMode,
                spellcastingAbility,
                sourceBook: 'SRD',
                raw: srdClass as Prisma.InputJsonValue,
                proficiencies: {
                    connect: proficiencyConnect,
                },
            },
        });

        const choiceRules = classProficiencyChoiceRules(srdClass.proficiency_choices, 'STARTING');
        const fixedRules = (srdClass.proficiencies ?? []).map((proficiency) => ({
            value: proficiency.index,
            grant: 'STARTING' as const,
            choiceGroup: null,
            choiceCount: null,
        }));
        const multiclassRules = classMulticlassProficiencyRules(srdClass.multi_classing);
        const rules = [...fixedRules, ...choiceRules, ...multiclassRules];
        const proficiencyRows = await prisma.proficiency.findMany({
            where: { srdIndex: { in: rules.map((rule) => rule.value) } },
            select: { id: true, srdIndex: true },
        });
        const proficiencyIdByIndex = new Map(proficiencyRows.map((row) => [row.srdIndex, row.id]));
        await prisma.classProficiency.deleteMany({ where: { classId: classRef.id } });
        await prisma.classProficiency.createMany({
            data: rules.flatMap((rule) => {
                const proficiencyId = proficiencyIdByIndex.get(rule.value);
                return proficiencyId ? [{ classId: classRef.id, proficiencyId, ...rule, value: undefined }] : [];
            }).map(({ value: _value, ...rule }) => rule),
            skipDuplicates: true,
        });

        const classLevels = baseClassProgressionLevels(levels, srdClass.index);
        await prisma.classLevelProgression.deleteMany({ where: { classId: classRef.id } });
        await prisma.classLevelProgression.createMany({
            data: classLevels.map((level) => ({
                classId: classRef.id,
                level: level.level,
                abilityScoreImprovement: (level.ability_score_bonuses ?? 0) > 0,
                spellSlots: Array.from({ length: 9 }, (_, index) => level.spellcasting?.[`spell_slots_level_${index + 1}`] ?? 0),
                cantripsKnown: level.spellcasting?.cantrips_known ?? null,
                spellsKnown: level.spellcasting?.spells_known ?? null,
                classSpecific: (level.class_specific ?? {}) as Prisma.InputJsonValue,
            })),
        });

        const classSpellIndexes = spells.filter((spell) => spell.classes?.some((entry) => entry.index === srdClass.index)).map((spell) => spell.index);
        const classSpellRows = await prisma.spell.findMany({ where: { srdIndex: { in: classSpellIndexes } }, select: { id: true } });
        await prisma.classSpell.deleteMany({ where: { classId: classRef.id } });
        await prisma.classSpell.createMany({ data: classSpellRows.map((spell) => ({ classId: classRef.id, spellId: spell.id })) });
    }
}

async function seedSubclasses(subclasses: SrdSubclass[]) {
    const selectionLevelByClass: Record<string, number> = {
        cleric: 1,
        sorcerer: 1,
        warlock: 1,
        druid: 2,
        wizard: 2,
    };

    for (const subclass of subclasses) {
        const selectionLevel = selectionLevelByClass[subclass.class.index] ?? 3;

        await prisma.subclass.upsert({
            where: { srdIndex: subclass.index },
            update: {
                name: subclass.name,
                description: subclass.desc ?? null,
                selectionLevel,
                classRef: {
                    connect: { srdIndex: subclass.class.index },
                },
                sourceBook: 'SRD',
                raw: subclass as Prisma.InputJsonValue,
            },
            create: {
                srdIndex: subclass.index,
                name: subclass.name,
                description: subclass.desc ?? null,
                selectionLevel,
                classRef: {
                    connect: { srdIndex: subclass.class.index },
                },
                sourceBook: 'SRD',
                raw: subclass as Prisma.InputJsonValue,
            },
        });
    }
}

async function seedBackgrounds(backgrounds: SrdBackground[]) {
    for (const background of backgrounds) {
        const proficiencyConnect = (background.starting_proficiencies ?? []).map((proficiency) => ({
            srdIndex: proficiency.index,
        }));

        await prisma.background.upsert({
            where: { srdIndex: background.index },
            update: {
                name: background.name,
                featureName: background.feature?.name ?? null,
                featureDescription: background.feature?.desc ?? [],
                languageChoiceCount: background.language_options?.choose ?? null,
                sourceBook: 'SRD',
                raw: background as Prisma.InputJsonValue,
                proficiencies: {
                    set: proficiencyConnect,
                },
                languages: {
                    set: [],
                },
            },
            create: {
                srdIndex: background.index,
                name: background.name,
                featureName: background.feature?.name ?? null,
                featureDescription: background.feature?.desc ?? [],
                languageChoiceCount: background.language_options?.choose ?? null,
                sourceBook: 'SRD',
                raw: background as Prisma.InputJsonValue,
                proficiencies: {
                    connect: proficiencyConnect,
                },
            },
        });
    }
}

async function seedSubraces(subraces: SrdSubrace[]) {
    for (const subrace of subraces) {
        await prisma.subrace.upsert({
            where: { srdIndex: subrace.index },
            update: {
                name: subrace.name,
                description: subrace.desc ?? null,
                raceRef: {
                    connect: {
                        srdIndex: subrace.race.index,
                    },
                },
                sourceBook: 'SRD',
                raw: subrace as Prisma.InputJsonValue,
            },
            create: {
                srdIndex: subrace.index,
                name: subrace.name,
                description: subrace.desc ?? null,
                raceRef: {
                    connect: {
                        srdIndex: subrace.race.index,
                    },
                },
                sourceBook: 'SRD',
                raw: subrace as Prisma.InputJsonValue,
            },
        });
    }
}

async function seedTraits(traits: SrdTrait[]) {
    for (const trait of traits) {
        const proficiencyConnect = (trait.proficiencies ?? []).map((proficiency) => ({
            srdIndex: proficiency.index,
        }));
        const languageConnect = (trait.proficiency_choices?.type === 'languages'
            ? (trait.proficiency_choices.from?.options ?? [])
                .filter((option) => option.option_type === 'reference' && option.item)
                .map((option) => option.item as SrdReference)
            : []
        ).map((language) => ({
            srdIndex: language.index,
        }));
        const raceConnect = (trait.races ?? []).map((race) => ({ srdIndex: race.index }));
        const subraceConnect = (trait.subraces ?? []).map((subrace) => ({ srdIndex: subrace.index }));

        await prisma.trait.upsert({
            where: { srdIndex: trait.index },
            update: {
                name: trait.name,
                description: trait.desc ?? [],
                languageChoiceCount: trait.proficiency_choices?.type === 'languages'
                    ? trait.proficiency_choices.choose ?? null
                    : null,
                sourceBook: 'SRD',
                raw: trait as Prisma.InputJsonValue,
                proficiencies: {
                    set: proficiencyConnect,
                },
                languages: {
                    set: languageConnect,
                },
                races: {
                    set: raceConnect,
                },
                subraces: {
                    set: subraceConnect,
                },
            },
            create: {
                srdIndex: trait.index,
                name: trait.name,
                description: trait.desc ?? [],
                languageChoiceCount: trait.proficiency_choices?.type === 'languages'
                    ? trait.proficiency_choices.choose ?? null
                    : null,
                sourceBook: 'SRD',
                raw: trait as Prisma.InputJsonValue,
                proficiencies: {
                    connect: proficiencyConnect,
                },
                languages: {
                    connect: languageConnect,
                },
                races: {
                    connect: raceConnect,
                },
                subraces: {
                    connect: subraceConnect,
                },
            },
        });
    }
}

async function seedRaceRelations(races: SrdRace[]) {
    for (const race of races) {
        await prisma.race.update({
            where: { srdIndex: race.index },
            data: {
                languages: {
                    set: (race.languages ?? []).map((language) => ({
                        srdIndex: language.index,
                    })),
                },
                traits: {
                    set: (race.traits ?? []).map((trait) => ({
                        srdIndex: trait.index,
                    })),
                },
            },
        });
    }
}

async function seedFeats(feats: SrdFeat[]) {
    for (const feat of feats) {
        await prisma.feat.upsert({
            where: { srdIndex: feat.index },
            update: {
                name: feat.name,
                description: feat.desc ?? [],
                sourceBook: 'SRD',
                raw: feat as Prisma.InputJsonValue,
            },
            create: {
                srdIndex: feat.index,
                name: feat.name,
                description: feat.desc ?? [],
                sourceBook: 'SRD',
                raw: feat as Prisma.InputJsonValue,
            },
        });
    }
}

function classFeatureSourceLabel(feature: SrdFeature): string | null {
    if (!feature.class || !feature.level) return null;
    if (!feature.subclass) return `${feature.class.name} ${feature.level}`;
    return `${feature.subclass.name} ${feature.class.name} ${feature.level}`;
}

async function seedFeatures(
    features: SrdFeature[],
    backgrounds: SrdBackground[],
    feats: SrdFeat[],
    traits: SrdTrait[],
) {
    for (const feature of features) {
        await prisma.feature.upsert({
            where: { srdIndex: feature.index },
            update: {
                name: feature.name,
                description: feature.desc ?? [],
                level: feature.level ?? null,
                kind: feature.subclass ? FeatureKind.SUBCLASS_FEATURE : FeatureKind.CLASS_FEATURE,
                sourceLabel: classFeatureSourceLabel(feature),
                sourceBook: 'SRD',
                raw: feature as Prisma.InputJsonValue,
                parentFeature: { disconnect: true },
                chooseCount: feature.feature_specific?.subfeature_options?.choose ?? null,
                classRef: feature.class
                    ? { connect: { srdIndex: feature.class.index } }
                    : { disconnect: true },
                subclassRef: feature.subclass
                    ? { connect: { srdIndex: feature.subclass.index } }
                    : { disconnect: true },
            },
            create: {
                srdIndex: feature.index,
                name: feature.name,
                description: feature.desc ?? [],
                level: feature.level ?? null,
                kind: feature.subclass ? FeatureKind.SUBCLASS_FEATURE : FeatureKind.CLASS_FEATURE,
                sourceLabel: classFeatureSourceLabel(feature),
                sourceBook: 'SRD',
                raw: feature as Prisma.InputJsonValue,
                chooseCount: feature.feature_specific?.subfeature_options?.choose ?? null,
                classRef: feature.class
                    ? { connect: { srdIndex: feature.class.index } }
                    : undefined,
                subclassRef: feature.subclass
                    ? { connect: { srdIndex: feature.subclass.index } }
                    : undefined,
            },
        });
    }

    for (const feature of features) {
        if (!feature.parent) {
            continue;
        }

        await prisma.feature.update({
            where: { srdIndex: feature.index },
            data: {
                parentFeature: {
                    connect: { srdIndex: feature.parent.index },
                },
            },
        });
    }

    for (const background of backgrounds) {
        if (!background.feature) continue;

        const featureIndex = `${background.index}-background-feature`;
        await prisma.feature.upsert({
            where: { srdIndex: featureIndex },
            update: {
                name: background.feature.name,
                description: background.feature.desc ?? [],
                kind: FeatureKind.BACKGROUND_FEATURE,
                sourceLabel: `${background.name} Background`,
                sourceBook: 'SRD',
                raw: background.feature as Prisma.InputJsonValue,
                backgroundRef: {
                    connect: { srdIndex: background.index },
                },
            },
            create: {
                srdIndex: featureIndex,
                name: background.feature.name,
                description: background.feature.desc ?? [],
                kind: FeatureKind.BACKGROUND_FEATURE,
                sourceLabel: `${background.name} Background`,
                sourceBook: 'SRD',
                raw: background.feature as Prisma.InputJsonValue,
                backgroundRef: {
                    connect: { srdIndex: background.index },
                },
            },
        });
    }

    for (const feat of feats) {
        const featureIndex = `${feat.index}-feat-feature`;

        await prisma.feature.upsert({
            where: { srdIndex: featureIndex },
            update: {
                name: feat.name,
                description: feat.desc ?? [],
                kind: FeatureKind.FEAT_FEATURE,
                sourceLabel: 'Feat',
                sourceBook: 'SRD',
                raw: feat as Prisma.InputJsonValue,
                featRef: {
                    connect: { srdIndex: feat.index },
                },
            },
            create: {
                srdIndex: featureIndex,
                name: feat.name,
                description: feat.desc ?? [],
                kind: FeatureKind.FEAT_FEATURE,
                sourceLabel: 'Feat',
                sourceBook: 'SRD',
                raw: feat as Prisma.InputJsonValue,
                featRef: {
                    connect: { srdIndex: feat.index },
                },
            },
        });
    }

    for (const trait of traits) {
        if (!trait.desc || trait.desc.length === 0) continue;

        const featureIndex = `${trait.index}-trait-feature`;
        await prisma.feature.upsert({
            where: { srdIndex: featureIndex },
            update: {
                name: trait.name,
                description: trait.desc,
                kind: FeatureKind.TRAIT_FEATURE,
                sourceLabel: trait.name,
                sourceBook: 'SRD',
                raw: trait as Prisma.InputJsonValue,
                traitRef: {
                    connect: { srdIndex: trait.index },
                },
            },
            create: {
                srdIndex: featureIndex,
                name: trait.name,
                description: trait.desc,
                kind: FeatureKind.TRAIT_FEATURE,
                sourceLabel: trait.name,
                sourceBook: 'SRD',
                raw: trait as Prisma.InputJsonValue,
                traitRef: {
                    connect: { srdIndex: trait.index },
                },
            },
        });
    }
}

export default async function seedCharacterReferenceData() {
    try {
        const [
            classes,
            subclasses,
            backgrounds,
            subraces,
            traits,
            feats,
            features,
            races,
            languages,
            proficiencies,
            levels,
            spells,
        ] = await Promise.all([
            loadJson<SrdClass[]>('../../srd-json-files/5e-SRD-Classes.json'),
            loadJson<SrdSubclass[]>('../../srd-json-files/5e-SRD-Subclasses.json'),
            loadJson<SrdBackground[]>('../../srd-json-files/5e-SRD-Backgrounds.json'),
            loadJson<SrdSubrace[]>('../../srd-json-files/5e-SRD-Subraces.json'),
            loadJson<SrdTrait[]>('../../srd-json-files/5e-SRD-Traits.json'),
            loadJson<SrdFeat[]>('../../srd-json-files/5e-SRD-Feats.json'),
            loadJson<SrdFeature[]>('../../srd-json-files/5e-SRD-Features.json'),
            loadJson<SrdRace[]>('../../srd-json-files/5e-SRD-Races.json'),
            loadJson<SrdLanguage[]>('../../srd-json-files/5e-SRD-Languages.json'),
            loadJson<SrdProficiency[]>('../../srd-json-files/5e-SRD-Proficiencies.json'),
            loadJson<SrdLevel[]>('../../srd-json-files/5e-SRD-Levels.json'),
            loadJson<SrdSpellReference[]>('../../srd-json-files/5e-SRD-Spells.json'),
        ]);

        await seedLanguages(languages);
        await seedProficiencies(proficiencies);
        await seedClasses(classes, levels, spells);
        await seedSubclasses(subclasses);
        await seedBackgrounds(backgrounds);
        await seedSubraces(subraces);
        await seedTraits(traits);
        await seedRaceRelations(races);
        await seedFeats(feats);
        await seedFeatures(features, backgrounds, feats, traits);

        console.log(
            `Seeded reference data: ${classes.length} classes, ${subclasses.length} subclasses, ${races.length} races, ${subraces.length} subraces, ${features.length} class features, ${traits.length} traits, ${backgrounds.length} backgrounds, ${feats.length} feats.`,
        );
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
