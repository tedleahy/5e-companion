import type { Prisma } from '@prisma/client';

type SrdRaceLanguageOptions = {
    language_options?: { choose?: number };
};

/** Returns the number of additional languages selected by a race, when any. */
export function raceLanguageChoiceCountFromSrd(race: SrdRaceLanguageOptions): number | null {
    return race.language_options?.choose ?? null;
}

/** One starting-equipment row stored on Class and Background (`startingEquipment` JSON). */
export type StartingEquipmentItem = {
    name: string;
    quantity: number;
    choiceGroup: number | null;
    choiceCount: number | null;
};

/** SRD `starting_equipment` entry. */
export type SrdStartingEquipmentItem = {
    equipment: { name: string };
    quantity: number;
};

/** SRD `starting_equipment_options` entry (class `desc`, or background category). */
export type SrdStartingEquipmentOption = {
    desc?: string;
    choose?: number;
    from?: {
        equipment_category?: { name: string };
    };
};

/** Maps SRD fixed grants and choice options into the class/background equipment JSON shape. */
export function startingEquipmentFromSrd(
    items: SrdStartingEquipmentItem[] | undefined,
    options: SrdStartingEquipmentOption[] | undefined,
): StartingEquipmentItem[] {
    return [
        ...(items ?? []).map((item) => ({
            name: item.equipment.name,
            quantity: item.quantity,
            choiceGroup: null,
            choiceCount: null,
        })),
        ...(options ?? []).map((option, index) => ({
            name: option.desc ?? option.from?.equipment_category?.name ?? `Equipment choice ${index + 1}`,
            quantity: 1,
            choiceGroup: index + 1,
            choiceCount: option.choose ?? 1,
        })),
    ];
}

type SrdFeatPrerequisite = {
    ability_score?: { index: string };
    minimum_score?: number;
};

export type SrdLanguage = {
    index: string;
    name: string;
    type?: string;
    script?: string;
    desc?: string;
    typical_speakers?: string[];
};

/** Builds the Language create/update scalar payload, including promoted typical speakers. */
export function languageSeedPayload(language: SrdLanguage) {
    return {
        name: language.name,
        type: language.type ?? null,
        script: language.script ?? null,
        description: language.desc ?? null,
        typicalSpeakers: language.typical_speakers ?? [],
        sourceBook: 'SRD',
        raw: language as Prisma.InputJsonValue,
    };
}

export type SrdFeat = {
    index: string;
    name: string;
    desc?: string[];
    prerequisites?: SrdFeatPrerequisite[];
};

/** Builds relational ability-score prerequisite rows from the SRD representation. */
function featPrerequisitesFromSrd(
    prerequisites: SrdFeatPrerequisite[] | undefined,
) {
    return (prerequisites ?? []).flatMap((entry) => (
        entry.ability_score?.index && entry.minimum_score != null
            ? [{
                minimumScore: entry.minimum_score,
                abilityScore: {
                    connect: { srdIndex: entry.ability_score.index },
                },
            }]
            : []
    ));
}

/** Builds the Feat create/update scalar payload, including promoted prerequisites. */
export function featSeedPayload(feat: SrdFeat) {
    return {
        name: feat.name,
        description: feat.desc ?? [],
        prerequisites: featPrerequisitesFromSrd(feat.prerequisites),
        sourceBook: 'SRD',
        raw: feat as Prisma.InputJsonValue,
    };
}

/** One choose-N prompt stored under Background `suggestedCharacteristics`. */
export type CharacteristicOptionSet = {
    choose: number;
    options: string[];
};

/** Personality traits / ideals / bonds / flaws stored on Background. */
export type SuggestedCharacteristics = {
    personalityTraits: CharacteristicOptionSet | null;
    ideals: CharacteristicOptionSet | null;
    bonds: CharacteristicOptionSet | null;
    flaws: CharacteristicOptionSet | null;
};

type SrdCharacteristicOption = {
    string?: string;
    desc?: string;
};

type SrdCharacteristicOptionSet = {
    choose?: number;
    from?: { options?: SrdCharacteristicOption[] };
};

/** SRD background fields that feed suggested-characteristic prompts. */
type SrdSuggestedCharacteristicsSource = {
    personality_traits?: SrdCharacteristicOptionSet;
    ideals?: SrdCharacteristicOptionSet;
    bonds?: SrdCharacteristicOptionSet;
    flaws?: SrdCharacteristicOptionSet;
};

export type SrdBackground = {
    index: string;
    name: string;
    starting_proficiencies?: Array<{ index: string; name: string }>;
    language_options?: {
        choose?: number;
    };
    feature?: {
        name: string;
        desc?: string[];
    };
    starting_equipment?: SrdStartingEquipmentItem[];
    starting_equipment_options?: SrdStartingEquipmentOption[];
} & SrdSuggestedCharacteristicsSource;

/** Maps one SRD choose-N option set, or null when the prompt is absent. */
function optionSetFromSrd(set: SrdCharacteristicOptionSet | undefined): CharacteristicOptionSet | null {
    if (!set) return null;

    const options = (set.from?.options ?? []).flatMap((option) => {
        const text = option.string ?? option.desc;
        return text ? [text] : [];
    });

    return { choose: set.choose ?? 0, options };
}

/**
 * Promotes SRD personality/ideal/bond/flaw option sets into typed JSON.
 * Returns null when the background has none of those prompts.
 */
function suggestedCharacteristicsFromSrd(
    background: SrdSuggestedCharacteristicsSource,
): SuggestedCharacteristics | null {
    const result: SuggestedCharacteristics = {
        personalityTraits: optionSetFromSrd(background.personality_traits),
        ideals: optionSetFromSrd(background.ideals),
        bonds: optionSetFromSrd(background.bonds),
        flaws: optionSetFromSrd(background.flaws),
    };

    if (!result.personalityTraits && !result.ideals && !result.bonds && !result.flaws) {
        return null;
    }

    return result;
}

/** Builds the Background create/update scalar payload, including promoted equipment and characteristics. */
export function backgroundSeedPayload(background: SrdBackground) {
    return {
        name: background.name,
        featureName: background.feature?.name ?? null,
        featureDescription: background.feature?.desc ?? [],
        languageChoiceCount: background.language_options?.choose ?? null,
        startingEquipment: startingEquipmentFromSrd(
            background.starting_equipment,
            background.starting_equipment_options,
        ),
        suggestedCharacteristics: suggestedCharacteristicsFromSrd(background),
        sourceBook: 'SRD',
        raw: background as Prisma.InputJsonValue,
    };
}

type SrdSubraceAbilityBonus = {
    ability_score: { index: string };
    bonus: number;
};

export type SrdSubrace = {
    index: string;
    name: string;
    desc?: string;
    race: { index: string; name: string };
    ability_bonuses?: SrdSubraceAbilityBonus[];
};

/** Builds the Subrace create/update scalar payload, including nested ability-bonus create data. */
export function subraceSeedPayload(subrace: SrdSubrace) {
    return {
        name: subrace.name,
        description: subrace.desc ?? null,
        raceRef: {
            connect: { srdIndex: subrace.race.index },
        },
        sourceBook: 'SRD',
        raw: subrace as Prisma.InputJsonValue,
        abilityBonuses: (subrace.ability_bonuses ?? []).map((entry) => ({
            bonus: entry.bonus,
            abilityScore: {
                connect: { srdIndex: entry.ability_score.index },
            },
        })),
    };
}
