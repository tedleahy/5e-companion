import { FeatureKind, ProficiencyType } from '@prisma/client';
import prisma from '../prisma';

type SeedSpell = {
    name: string;
    prepared: boolean;
};

type CustomFeatSeed = {
    name: string;
    description: string;
};

const OWNER_USER_ID = 'demo-user';
const CHARACTER_NAME = 'Vaelindra';
const CHARACTER_CLASS = 'Wizard';
const CHARACTER_SUBCLASS = 'Evocation';
const CHARACTER_RACE = 'Elf';
const CHARACTER_SUBRACE = 'High Elf';
const CHARACTER_BACKGROUND = 'Acolyte';

const CUSTOM_FEATS: CustomFeatSeed[] = [
    {
        name: 'War Caster',
        description: 'Advantage on Constitution saves to maintain concentration, and somatic components can be performed while hands are occupied.',
    },
    {
        name: 'Alert',
        description: 'Gain +5 to initiative, cannot be surprised while conscious, and hidden attackers gain no advantage on you.',
    },
];

const EXTRA_LANGUAGE_NAMES = ['Draconic', 'Sylvan', 'Celestial'];

const SPELLBOOK: SeedSpell[] = [
    { name: 'Fire Bolt', prepared: true },
    { name: 'Mage Hand', prepared: true },
    { name: 'Shield', prepared: true },
    { name: 'Magic Missile', prepared: true },
    { name: 'Misty Step', prepared: true },
    { name: 'Counterspell', prepared: true },
    { name: 'Fireball', prepared: true },
    { name: 'Lightning Bolt', prepared: false },
    { name: 'Dimension Door', prepared: true },
    { name: 'Greater Invisibility', prepared: false },
    { name: 'Wall of Force', prepared: true },
    { name: 'Teleportation Circle', prepared: false },
];

type CharacterFeatureSeed = {
    featureId?: string;
    name: string;
    source: string;
    description: string;
    usesMax?: number;
    usesRemaining?: number;
    recharge?: string;
};

type DerivedProficiencies = {
    armor: string[];
    weapons: string[];
    tools: string[];
};

function uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

function valuesOrNone(values: string[]): string[] {
    const uniqueValues = uniqueSorted(values.filter((value) => value.trim().length > 0));
    if (uniqueValues.length === 0) return ['None'];
    return uniqueValues;
}

function deriveProficiencies(proficiencies: Array<{ name: string; type: ProficiencyType }>): DerivedProficiencies {
    const armor: string[] = [];
    const weapons: string[] = [];
    const tools: string[] = [];

    for (const proficiency of proficiencies) {
        if (proficiency.type === ProficiencyType.ARMOR) armor.push(proficiency.name);
        if (proficiency.type === ProficiencyType.WEAPON) weapons.push(proficiency.name);
        if (proficiency.type === ProficiencyType.TOOL) tools.push(proficiency.name);
    }

    return {
        armor: valuesOrNone(armor),
        weapons: valuesOrNone(weapons),
        tools: valuesOrNone(tools),
    };
}

function toCharacterFeatureSeed(
    feature: {
        id: string;
        name: string;
        description: string[];
        sourceLabel: string | null;
        kind: FeatureKind;
    },
    raceLabel: string,
): CharacterFeatureSeed {
    const description = feature.description.join(' ') || 'No description available.';
    const defaultSource = feature.kind === FeatureKind.TRAIT_FEATURE ? raceLabel : feature.sourceLabel ?? 'Feature';

    const baseFeature: CharacterFeatureSeed = {
        featureId: feature.id,
        name: feature.name,
        source: defaultSource,
        description,
    };

    if (feature.name.toLowerCase() === 'arcane recovery') {
        return {
            ...baseFeature,
            usesMax: 1,
            usesRemaining: 1,
            recharge: 'long',
        };
    }

    return baseFeature;
}

async function findOrCreateCustomFeat(ownerUserId: string, feat: CustomFeatSeed) {
    const existingFeat = await prisma.feat.findFirst({
        where: {
            ownerUserId,
            srdIndex: null,
            name: feat.name,
        },
    });
    if (existingFeat) return existingFeat;

    return await prisma.feat.create({
        data: {
            ownerUserId,
            name: feat.name,
            description: [feat.description],
            sourceBook: 'Custom',
        },
    });
}

async function findOrCreateCustomFeatFeature(ownerUserId: string, featId: string, feat: CustomFeatSeed) {
    const existingFeature = await prisma.feature.findFirst({
        where: {
            ownerUserId,
            srdIndex: null,
            featId,
            kind: FeatureKind.FEAT_FEATURE,
        },
    });
    if (existingFeature) return existingFeature;

    return await prisma.feature.create({
        data: {
            ownerUserId,
            name: feat.name,
            description: [feat.description],
            kind: FeatureKind.FEAT_FEATURE,
            sourceLabel: 'Feat',
            sourceBook: 'Custom',
            featId,
        },
    });
}

export default async function seedCharacter() {
    try {
        const [
            classRef,
            subclassRef,
            raceRef,
            subraceRef,
            backgroundRef,
        ] = await Promise.all([
            prisma.class.findFirst({
                where: { srdIndex: 'wizard' },
                include: { proficiencies: true },
            }),
            prisma.subclass.findFirst({
                where: { srdIndex: 'evocation' },
            }),
            prisma.race.findFirst({
                where: { srdIndex: 'elf' },
                include: {
                    languages: true,
                    traits: {
                        include: {
                            proficiencies: true,
                        },
                    },
                },
            }),
            prisma.subrace.findFirst({
                where: { srdIndex: 'high-elf' },
                include: {
                    traits: {
                        include: {
                            proficiencies: true,
                        },
                    },
                },
            }),
            prisma.background.findFirst({
                where: { srdIndex: 'acolyte' },
                include: { proficiencies: true },
            }),
        ]);

        if (!classRef) throw new Error('Missing Class reference: wizard');
        if (!raceRef) throw new Error('Missing Race reference: elf');
        if (!backgroundRef) throw new Error('Missing Background reference: acolyte');

        const classFeatureFilters: Array<{ kind: FeatureKind; classId?: string; subclassId?: string }> = [
            { kind: FeatureKind.CLASS_FEATURE, classId: classRef.id },
        ];
        if (subclassRef) {
            classFeatureFilters.push({ kind: FeatureKind.SUBCLASS_FEATURE, subclassId: subclassRef.id });
        }

        const classFeatureDefinitions = await prisma.feature.findMany({
            where: {
                OR: classFeatureFilters.map((filter) => ({
                    kind: filter.kind,
                    classId: filter.classId,
                    subclassId: filter.subclassId,
                    level: { lte: 12 },
                })),
            },
            orderBy: [{ level: 'asc' }, { name: 'asc' }],
        });

        const traitIds = uniqueSorted([
            ...raceRef.traits.map((trait) => trait.id),
            ...(subraceRef?.traits.map((trait) => trait.id) ?? []),
        ]);

        const traitFeatureDefinitions = traitIds.length === 0
            ? []
            : await prisma.feature.findMany({
                where: {
                    kind: FeatureKind.TRAIT_FEATURE,
                    traitId: { in: traitIds },
                },
                orderBy: [{ name: 'asc' }],
            });

        const backgroundFeatureDefinitions = await prisma.feature.findMany({
            where: {
                kind: FeatureKind.BACKGROUND_FEATURE,
                backgroundId: backgroundRef.id,
            },
            orderBy: [{ name: 'asc' }],
        });

        const customFeats = await Promise.all(
            CUSTOM_FEATS.map(async (customFeat) => {
                const feat = await findOrCreateCustomFeat(OWNER_USER_ID, customFeat);
                const feature = await findOrCreateCustomFeatFeature(OWNER_USER_ID, feat.id, customFeat);
                return { feat, feature };
            }),
        );

        const characterFeatureRows = [
            ...classFeatureDefinitions,
            ...traitFeatureDefinitions,
            ...backgroundFeatureDefinitions,
            ...customFeats.map(({ feature }) => feature),
        ].map((feature) => toCharacterFeatureSeed(feature, CHARACTER_SUBRACE));

        const classProficiencies = classRef.proficiencies;
        const raceTraitProficiencies = raceRef.traits.flatMap((trait) => trait.proficiencies);
        const subraceTraitProficiencies = subraceRef?.traits.flatMap((trait) => trait.proficiencies) ?? [];
        const backgroundProficiencies = backgroundRef.proficiencies;

        const allProficiencies = [
            ...classProficiencies,
            ...raceTraitProficiencies,
            ...subraceTraitProficiencies,
            ...backgroundProficiencies,
        ];

        const proficiencyById = new Map(allProficiencies.map((proficiency) => [proficiency.id, proficiency]));
        const uniqueProficiencyRecords = Array.from(proficiencyById.values());
        const derivedProficiencies = deriveProficiencies(uniqueProficiencyRecords);

        const languageRecords = [
            ...raceRef.languages,
            ...await prisma.language.findMany({
                where: {
                    name: {
                        in: EXTRA_LANGUAGE_NAMES,
                    },
                },
            }),
        ];
        const languageById = new Map(languageRecords.map((language) => [language.id, language]));
        const uniqueLanguages = Array.from(languageById.values());
        const languageNames = uniqueSorted(uniqueLanguages.map((language) => language.name));
        if (backgroundRef.languageChoiceCount && backgroundRef.languageChoiceCount > 0) {
            languageNames.push(`Choice (${backgroundRef.languageChoiceCount})`);
        }

        await prisma.character.deleteMany({
            where: {
                ownerUserId: OWNER_USER_ID,
                name: CHARACTER_NAME,
            },
        });

        const createdCharacter = await prisma.character.create({
            data: {
                ownerUserId: OWNER_USER_ID,
                name: CHARACTER_NAME,
                race: CHARACTER_SUBRACE,
                class: CHARACTER_CLASS,
                subclass: 'School of Evocation',
                level: 12,
                alignment: 'Chaotic Good',
                background: CHARACTER_BACKGROUND,
                classId: classRef.id,
                subclassId: subclassRef?.id ?? null,
                raceId: raceRef.id,
                subraceId: subraceRef?.id ?? null,
                backgroundId: backgroundRef.id,
                proficiencyBonus: 4,
                inspiration: false,
                ac: 17,
                speed: 35,
                initiative: 3,
                spellcastingAbility: 'intelligence',
                spellSaveDC: 17,
                spellAttackBonus: 9,
                conditions: [],
                notes: 'Phase 3 seed character for character sheet UI and backend flows.',
                stats: {
                    create: {
                        abilityScores: {
                            strength: 8,
                            dexterity: 16,
                            constitution: 14,
                            intelligence: 20,
                            wisdom: 13,
                            charisma: 11,
                        },
                        hp: {
                            current: 76,
                            max: 76,
                            temp: 0,
                        },
                        deathSaves: {
                            successes: 0,
                            failures: 0,
                        },
                        hitDice: {
                            total: 12,
                            remaining: 12,
                            die: 'd6',
                        },
                        savingThrowProficiencies: ['intelligence', 'wisdom'],
                        skillProficiencies: {
                            acrobatics: 'none',
                            animalHandling: 'none',
                            arcana: 'expert',
                            athletics: 'none',
                            deception: 'none',
                            history: 'expert',
                            insight: 'proficient',
                            intimidation: 'none',
                            investigation: 'expert',
                            medicine: 'none',
                            nature: 'proficient',
                            perception: 'proficient',
                            performance: 'none',
                            persuasion: 'none',
                            religion: 'proficient',
                            sleightOfHand: 'none',
                            stealth: 'proficient',
                            survival: 'none',
                        },
                        traits: {
                            personality: 'Quietly curious and always taking notes.',
                            ideals: 'Knowledge should be preserved and shared responsibly.',
                            bonds: 'My spellbook contains my life\'s work.',
                            flaws: 'I overestimate my ability to control dangerous magic.',
                            armorProficiencies: derivedProficiencies.armor,
                            weaponProficiencies: derivedProficiencies.weapons,
                            toolProficiencies: derivedProficiencies.tools,
                            languages: languageNames,
                        },
                        currency: {
                            cp: 0,
                            sp: 14,
                            ep: 0,
                            gp: 847,
                            pp: 3,
                        },
                    },
                },
                attacks: {
                    create: [
                        {
                            name: 'Dagger',
                            attackBonus: '+7',
                            damage: '1d4+3 P',
                            type: 'melee',
                        },
                        {
                            name: 'Fire Bolt',
                            attackBonus: '+9',
                            damage: '3d10 F',
                            type: 'spell',
                        },
                    ],
                },
                inventory: {
                    create: [
                        {
                            name: 'Arcane Focus Wand',
                            quantity: 1,
                            equipped: true,
                            magical: true,
                        },
                        {
                            name: 'Spellbook',
                            quantity: 1,
                            weight: 3,
                            description: 'Leather-bound spellbook with silver filigree.',
                            equipped: true,
                            magical: false,
                        },
                        {
                            name: 'Healing Potion',
                            quantity: 3,
                            magical: true,
                            equipped: false,
                        },
                    ],
                },
                features: {
                    create: characterFeatureRows,
                },
                feats: {
                    create: customFeats.map(({ feat }) => ({
                        featId: feat.id,
                    })),
                },
                languages: {
                    create: uniqueLanguages.map((language) => ({
                        languageId: language.id,
                    })),
                },
                proficiencies: {
                    create: uniqueProficiencyRecords.map((proficiency) => ({
                        proficiencyId: proficiency.id,
                    })),
                },
                spellSlots: {
                    create: [
                        { level: 1, total: 4, used: 0 },
                        { level: 2, total: 3, used: 0 },
                        { level: 3, total: 3, used: 0 },
                        { level: 4, total: 3, used: 0 },
                        { level: 5, total: 2, used: 0 },
                        { level: 6, total: 1, used: 0 },
                        { level: 7, total: 0, used: 0 },
                        { level: 8, total: 0, used: 0 },
                        { level: 9, total: 0, used: 0 },
                    ],
                },
            },
        });

        const spellNames = SPELLBOOK.map((item) => item.name);
        const spells = await prisma.spell.findMany({
            where: { name: { in: spellNames } },
            select: { id: true, name: true },
        });

        const spellIdByName = new Map(spells.map((spell) => [spell.name, spell.id]));

        const characterSpellRows = SPELLBOOK
            .map((seedSpell) => {
                const spellId = spellIdByName.get(seedSpell.name);
                if (!spellId) return null;
                return {
                    characterId: createdCharacter.id,
                    spellId,
                    prepared: seedSpell.prepared,
                };
            })
            .filter((row): row is { characterId: string; spellId: string; prepared: boolean } => row !== null);

        if (characterSpellRows.length > 0) {
            await prisma.characterSpell.createMany({
                data: characterSpellRows,
                skipDuplicates: true,
            });
        }

        const missingSpellCount = SPELLBOOK.length - characterSpellRows.length;
        if (missingSpellCount > 0) {
            console.warn(
                `Character seeded, but ${missingSpellCount} spell(s) were not found in Spell table and were skipped.`,
            );
        }

        console.log(`Seeded character '${CHARACTER_NAME}' with ${characterSpellRows.length} spellbook entries.`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
