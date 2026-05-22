import type { CharacterClassDraft } from '@/lib/characterCreation/multiclass';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import { LEVEL_UP_SRD_FEATURES } from '@/lib/characterLevelUp/levelUpSrdData.generated';

type GeneratedSrdFeature = (typeof LEVEL_UP_SRD_FEATURES)[number];

export type SrdFeatureChoiceOptionDefinition = {
    childSrdIndex: string;
    name: string;
};

export type SrdFeatureChoiceDefinition = {
    parentSrdIndex: string;
    parentName: string;
    classId: string;
    level: number;
    subclassId: string | null;
    chooseCount: number;
    options: readonly SrdFeatureChoiceOptionDefinition[];
};

export type ResolvedSrdFeatureChoiceFeature = {
    srdIndex: string;
    name: string;
    description: string;
    classId: string;
    className: string;
    level: number;
    subclassId: string | null;
    subclassName: string | null;
};

export type ResolvedSrdFeatureChoiceOption = {
    childSrdIndex: string;
    name: string;
    description: string;
};

export type ResolvedSrdFeatureChoiceGroup = {
    parentSrdIndex: string;
    chooseCount: number;
    parentFeature: ResolvedSrdFeatureChoiceFeature;
    options: ResolvedSrdFeatureChoiceOption[];
};

const SRD_FEATURE_CHOICE_DEFINITIONS: readonly SrdFeatureChoiceDefinition[] = [
    {
        parentSrdIndex: 'fighter-fighting-style',
        parentName: 'Fighting Style',
        classId: 'fighter',
        level: 1,
        subclassId: null,
        chooseCount: 1,
        options: [
            { childSrdIndex: 'fighter-fighting-style-archery', name: 'Fighting Style: Archery' },
            { childSrdIndex: 'fighter-fighting-style-defense', name: 'Fighting Style: Defense' },
            { childSrdIndex: 'fighter-fighting-style-dueling', name: 'Fighting Style: Dueling' },
            { childSrdIndex: 'fighter-fighting-style-great-weapon-fighting', name: 'Fighting Style: Great Weapon Fighting' },
            { childSrdIndex: 'fighter-fighting-style-protection', name: 'Fighting Style: Protection' },
            { childSrdIndex: 'fighter-fighting-style-two-weapon-fighting', name: 'Fighting Style: Two-Weapon Fighting' },
        ],
    },
    {
        parentSrdIndex: 'circle-of-the-land',
        parentName: 'Circle of the Land',
        classId: 'druid',
        level: 2,
        subclassId: 'land',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'circle-of-the-land-arctic', name: 'Circle of the Land: Arctic' },
            { childSrdIndex: 'circle-of-the-land-coast', name: 'Circle of the Land: Coast' },
            { childSrdIndex: 'circle-of-the-land-desert', name: 'Circle of the Land: Desert' },
            { childSrdIndex: 'circle-of-the-land-forest', name: 'Circle of the Land: Forest' },
            { childSrdIndex: 'circle-of-the-land-grassland', name: 'Circle of the Land: Grassland' },
            { childSrdIndex: 'circle-of-the-land-mountain', name: 'Circle of the Land: Mountain' },
            { childSrdIndex: 'circle-of-the-land-swamp', name: 'Circle of the Land: Swamp' },
        ],
    },
    {
        parentSrdIndex: 'paladin-fighting-style',
        parentName: 'Fighting Style',
        classId: 'paladin',
        level: 2,
        subclassId: null,
        chooseCount: 1,
        options: [
            { childSrdIndex: 'paladin-fighting-style-defense', name: 'Fighting Style: Defense' },
            { childSrdIndex: 'paladin-fighting-style-dueling', name: 'Fighting Style: Dueling' },
            { childSrdIndex: 'paladin-fighting-style-great-weapon-fighting', name: 'Fighting Style: Great Weapon Fighting' },
            { childSrdIndex: 'paladin-fighting-style-protection', name: 'Fighting Style: Protection' },
        ],
    },
    {
        parentSrdIndex: 'ranger-fighting-style',
        parentName: 'Fighting Style',
        classId: 'ranger',
        level: 2,
        subclassId: null,
        chooseCount: 1,
        options: [
            { childSrdIndex: 'ranger-fighting-style-archery', name: 'Fighting Style: Archery' },
            { childSrdIndex: 'ranger-fighting-style-defense', name: 'Fighting Style: Defense' },
            { childSrdIndex: 'ranger-fighting-style-dueling', name: 'Fighting Style: Dueling' },
            { childSrdIndex: 'ranger-fighting-style-two-weapon-fighting', name: 'Fighting Style: Two-Weapon Fighting' },
        ],
    },
    {
        parentSrdIndex: 'hunters-prey',
        parentName: "Hunter's Prey",
        classId: 'ranger',
        level: 3,
        subclassId: 'hunter',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'hunters-prey-colossus-slayer', name: 'Colossus Slayer' },
            { childSrdIndex: 'hunters-prey-giant-killer', name: 'Giant Killer' },
            { childSrdIndex: 'hunters-prey-horde-breaker', name: 'Horde Breaker' },
        ],
    },
    {
        parentSrdIndex: 'pact-boon',
        parentName: 'Pact Boon',
        classId: 'warlock',
        level: 3,
        subclassId: null,
        chooseCount: 1,
        options: [
            { childSrdIndex: 'pact-of-the-chain', name: 'Pact of the Chain' },
            { childSrdIndex: 'pact-of-the-blade', name: 'Pact of the Blade' },
            { childSrdIndex: 'pact-of-the-tome', name: 'Pact of the Tome' },
        ],
    },
    {
        parentSrdIndex: 'dragon-ancestor',
        parentName: 'Dragon Ancestor',
        classId: 'sorcerer',
        level: 1,
        subclassId: 'draconic',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'dragon-ancestor-black---acid-damage', name: 'Dragon Ancestor: Black - Acid Damage' },
            { childSrdIndex: 'dragon-ancestor-blue---lightning-damage', name: 'Dragon Ancestor: Blue - Lightning Damage' },
            { childSrdIndex: 'dragon-ancestor-brass---fire-damage', name: 'Dragon Ancestor: Brass - Fire Damage' },
            { childSrdIndex: 'dragon-ancestor-bronze---lightning-damage', name: 'Dragon Ancestor: Bronze - Lightning Damage' },
            { childSrdIndex: 'dragon-ancestor-copper---acid-damage', name: 'Dragon Ancestor: Copper - Acid Damage' },
            { childSrdIndex: 'dragon-ancestor-gold---fire-damage', name: 'Dragon Ancestor: Gold - Fire Damage' },
            { childSrdIndex: 'dragon-ancestor-green---poison-damage', name: 'Dragon Ancestor: Green - Poison Damage' },
            { childSrdIndex: 'dragon-ancestor-red---fire-damage', name: 'Dragon Ancestor: Red - Fire Damage' },
            { childSrdIndex: 'dragon-ancestor-silver---cold-damage', name: 'Dragon Ancestor: Silver - Cold Damage' },
            { childSrdIndex: 'dragon-ancestor-white---cold-damage', name: 'Dragon Ancestor: White - Cold Damage' },
        ],
    },
    {
        parentSrdIndex: 'defensive-tactics',
        parentName: 'Defensive Tactics',
        classId: 'ranger',
        level: 7,
        subclassId: 'hunter',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'defensive-tactics-escape-the-horde', name: 'Escape the Horde' },
            { childSrdIndex: 'defensive-tactics-multiattack-defense', name: 'Multiattack Defense' },
            { childSrdIndex: 'defensive-tactics-steel-will', name: 'Steel Will' },
        ],
    },
    {
        parentSrdIndex: 'multiattack',
        parentName: 'Multiattack',
        classId: 'ranger',
        level: 11,
        subclassId: 'hunter',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'multiattack-volley', name: 'Volley' },
            { childSrdIndex: 'multiattack-whirlwind-attack', name: 'Whirlwind Attack' },
        ],
    },
    {
        parentSrdIndex: 'superior-hunters-defense',
        parentName: "Superior Hunter's Defense",
        classId: 'ranger',
        level: 15,
        subclassId: 'hunter',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'superior-hunters-defense-evasion', name: 'Evasion' },
            { childSrdIndex: 'superior-hunters-defense-stand-against-the-tide', name: 'Stand Against the Tide' },
            { childSrdIndex: 'superior-hunters-defense-uncanny-dodge', name: 'Uncanny Dodge' },
        ],
    },
] as const;

/**
 * Returns all simple SRD parent/child feature choice groups available during character creation.
 */
export function getCreateFeatureChoiceGroups(
    classRows: readonly Pick<CharacterClassDraft, 'classId' | 'level' | 'subclassId'>[],
): ResolvedSrdFeatureChoiceGroup[] {
    return classRows.flatMap((classRow) => (
        SRD_FEATURE_CHOICE_DEFINITIONS
            .filter((definition) => definition.classId === classRow.classId)
            .filter((definition) => definition.level <= classRow.level)
            .filter((definition) => definition.subclassId == null || definition.subclassId === normaliseSubclassId(classRow.subclassId))
            .map(resolveFeatureChoiceDefinition)
            .filter((group): group is ResolvedSrdFeatureChoiceGroup => group !== null)
    ));
}

/**
 * Returns all simple SRD parent/child feature choice groups unlocked by the current level-up.
 */
export function getLevelUpFeatureChoiceGroups(
    selectedClass: Pick<LevelUpWizardSelectedClass, 'classId' | 'newLevel' | 'subclassId'>,
): ResolvedSrdFeatureChoiceGroup[] {
    return SRD_FEATURE_CHOICE_DEFINITIONS
        .filter((definition) => definition.classId === selectedClass.classId)
        .filter((definition) => definition.level === selectedClass.newLevel)
        .filter((definition) => definition.subclassId == null || definition.subclassId === normaliseSubclassId(selectedClass.subclassId))
        .map(resolveFeatureChoiceDefinition)
        .filter((group): group is ResolvedSrdFeatureChoiceGroup => group !== null);
}

/**
 * Removes feature-choice selections that no longer apply to the current create flow draft.
 */
export function reconcileCreateFeatureChoices(
    featureChoices: readonly { parentSrdIndex: string; chosenChildSrdIndex: string }[],
    applicableGroups: readonly Pick<ResolvedSrdFeatureChoiceGroup, 'parentSrdIndex' | 'options'>[],
): Array<{ parentSrdIndex: string; chosenChildSrdIndex: string }> {
    const validOptionsByParent = new Map(
        applicableGroups.map((group) => [
            group.parentSrdIndex,
            new Set(group.options.map((option) => option.childSrdIndex)),
        ]),
    );

    return featureChoices.filter((choice) => {
        const validOptions = validOptionsByParent.get(choice.parentSrdIndex);
        return validOptions?.has(choice.chosenChildSrdIndex) ?? false;
    });
}

/**
 * Resolves one static SRD choice-group definition against the generated feature data.
 */
function resolveFeatureChoiceDefinition(
    definition: SrdFeatureChoiceDefinition,
): ResolvedSrdFeatureChoiceGroup | null {
    const parentFeature = findGeneratedFeature(
        definition.classId,
        definition.level,
        definition.parentName,
        definition.subclassId,
    );

    if (!parentFeature) {
        return null;
    }

    const options = definition.options.flatMap((option) => {
        const feature = findGeneratedFeature(
            definition.classId,
            definition.level,
            option.name,
            definition.subclassId,
        );

        if (!feature) {
            return [];
        }

        return [{
            childSrdIndex: option.childSrdIndex,
            name: option.name,
            description: feature.description,
        }];
    });

    if (options.length !== definition.options.length) {
        return null;
    }

    return {
        parentSrdIndex: definition.parentSrdIndex,
        chooseCount: definition.chooseCount,
        parentFeature: {
            srdIndex: definition.parentSrdIndex,
            name: parentFeature.name,
            description: parentFeature.description,
            classId: parentFeature.classId,
            className: parentFeature.className,
            level: parentFeature.level,
            subclassId: parentFeature.subclassId,
            subclassName: parentFeature.subclassName,
        },
        options,
    };
}

/**
 * Finds one generated feature entry by its class, level, name, and optional subclass.
 */
function findGeneratedFeature(
    classId: string,
    level: number,
    name: string,
    subclassId: string | null,
): GeneratedSrdFeature | null {
    return LEVEL_UP_SRD_FEATURES.find((feature) => (
        feature.classId === classId
        && feature.level === level
        && feature.name === name
        && feature.subclassId === subclassId
    )) ?? null;
}

/**
 * Normalises legacy subclass ids used by a few mobile callers.
 */
function normaliseSubclassId(subclassId: string | null | undefined): string | null {
    if (!subclassId) {
        return null;
    }

    if (subclassId === 'school-of-evocation') {
        return 'evocation';
    }

    if (subclassId === 'draconic-bloodline') {
        return 'draconic';
    }

    return subclassId;
}
