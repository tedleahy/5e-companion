import type { CharacterClassDraft } from '@/lib/characterCreation/multiclass';
import {
    invocationGainCount,
    SRD_INVOCATIONS,
    SRD_METAMAGIC_OPTIONS,
} from '@/lib/characterLevelUp/advancedClassChoices';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import { LEVEL_UP_SRD_FEATURES } from '@/lib/characterLevelUp/levelUpSrdData.generated';

type GeneratedSrdFeature = (typeof LEVEL_UP_SRD_FEATURES)[number];

export type SrdFeatureChoiceOptionDefinition = {
    childSrdIndex: string;
    name: string;
    subclassId?: string | null;
    prerequisite?: string | null;
};

export type SrdFeatureChoiceDefinition = {
    parentSrdIndex: string;
    parentName: string;
    classId: string;
    level: number;
    subclassId: string | null;
    chooseCount: number | ((classLevel: number) => number);
    allowUnavailableOptions?: boolean;
    createOnly?: boolean;
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
    prerequisite: string | null;
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
        parentSrdIndex: 'additional-fighting-style',
        parentName: 'Additional Fighting Style',
        classId: 'fighter',
        level: 10,
        subclassId: 'champion',
        chooseCount: 1,
        options: [
            { childSrdIndex: 'fighter-fighting-style-archery', name: 'Fighting Style: Archery', subclassId: null },
            { childSrdIndex: 'fighter-fighting-style-defense', name: 'Fighting Style: Defense', subclassId: null },
            { childSrdIndex: 'fighter-fighting-style-dueling', name: 'Fighting Style: Dueling', subclassId: null },
            { childSrdIndex: 'fighter-fighting-style-great-weapon-fighting', name: 'Fighting Style: Great Weapon Fighting', subclassId: null },
            { childSrdIndex: 'fighter-fighting-style-protection', name: 'Fighting Style: Protection', subclassId: null },
            { childSrdIndex: 'fighter-fighting-style-two-weapon-fighting', name: 'Fighting Style: Two-Weapon Fighting', subclassId: null },
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
        parentSrdIndex: 'metamagic-1',
        parentName: 'Metamagic',
        classId: 'sorcerer',
        level: 3,
        subclassId: null,
        chooseCount: 2,
        createOnly: true,
        options: SRD_METAMAGIC_OPTIONS.map((option) => ({
            childSrdIndex: `metamagic-${option.id}`,
            name: `Metamagic: ${option.name}`,
        })),
    },
    {
        parentSrdIndex: 'metamagic-2',
        parentName: 'Metamagic',
        classId: 'sorcerer',
        level: 10,
        subclassId: null,
        chooseCount: 1,
        createOnly: true,
        options: SRD_METAMAGIC_OPTIONS.map((option) => ({
            childSrdIndex: `metamagic-${option.id}`,
            name: `Metamagic: ${option.name}`,
        })),
    },
    {
        parentSrdIndex: 'metamagic-3',
        parentName: 'Metamagic',
        classId: 'sorcerer',
        level: 17,
        subclassId: null,
        chooseCount: 1,
        createOnly: true,
        options: SRD_METAMAGIC_OPTIONS.map((option) => ({
            childSrdIndex: `metamagic-${option.id}`,
            name: `Metamagic: ${option.name}`,
        })),
    },
    {
        parentSrdIndex: 'eldritch-invocations',
        parentName: 'Eldritch Invocations',
        classId: 'warlock',
        level: 2,
        subclassId: null,
        chooseCount: (classLevel) => invocationGainCount(0, classLevel),
        allowUnavailableOptions: true,
        createOnly: true,
        options: SRD_INVOCATIONS.map((option) => ({
            childSrdIndex: `eldritch-invocation-${option.id}`,
            name: `Eldritch Invocation: ${option.name}`,
            prerequisite: option.prerequisite,
        })),
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
            .map((definition) => resolveFeatureChoiceDefinition(definition, classRow.level))
            .filter((group): group is ResolvedSrdFeatureChoiceGroup => group !== null)
    ));
}

/**
 * Returns all simple SRD parent/child feature choice groups unlocked by the current level-up.
 */
export function getLevelUpFeatureChoiceGroups(
    selectedClass: Pick<LevelUpWizardSelectedClass, 'classId' | 'newLevel' | 'subclassId' | 'subclassSelectedThisLevel'>,
): ResolvedSrdFeatureChoiceGroup[] {
    return SRD_FEATURE_CHOICE_DEFINITIONS
        .filter((definition) => definition.classId === selectedClass.classId)
        .filter((definition) => !definition.createOnly)
        .filter((definition) => definition.level === selectedClass.newLevel
            || (selectedClass.subclassSelectedThisLevel
                && definition.subclassId != null
                && definition.level <= selectedClass.newLevel))
        .filter((definition) => definition.subclassId == null || definition.subclassId === normaliseSubclassId(selectedClass.subclassId))
        .map((definition) => resolveFeatureChoiceDefinition(definition, selectedClass.newLevel))
        .filter((group): group is ResolvedSrdFeatureChoiceGroup => group !== null);
}

/**
 * Removes feature-choice selections that no longer apply to the current create flow draft.
 */
export function reconcileCreateFeatureChoices(
    featureChoices: readonly { parentSrdIndex: string; chosenChildSrdIndex: string }[],
    applicableGroups: readonly Pick<ResolvedSrdFeatureChoiceGroup, 'parentSrdIndex' | 'chooseCount' | 'options'>[],
): Array<{ parentSrdIndex: string; chosenChildSrdIndex: string }> {
    const groupsByParent = new Map(
        applicableGroups.map((group) => [
            group.parentSrdIndex,
            {
                chooseCount: group.chooseCount,
                validOptions: new Set(group.options.map((option) => option.childSrdIndex)),
            },
        ]),
    );
    const seenChoicesByParent = new Map<string, Set<string>>();

    return featureChoices.filter((choice) => {
        const group = groupsByParent.get(choice.parentSrdIndex);

        if (!group?.validOptions.has(choice.chosenChildSrdIndex)) {
            return false;
        }

        const seenChoices = seenChoicesByParent.get(choice.parentSrdIndex) ?? new Set<string>();

        if (seenChoices.has(choice.chosenChildSrdIndex) || seenChoices.size >= group.chooseCount) {
            return false;
        }

        seenChoices.add(choice.chosenChildSrdIndex);
        seenChoicesByParent.set(choice.parentSrdIndex, seenChoices);
        return true;
    });
}

/**
 * Resolves one static SRD choice-group definition against the generated feature data.
 */
function resolveFeatureChoiceDefinition(
    definition: SrdFeatureChoiceDefinition,
    classLevel: number,
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
        const optionSubclassId = option.subclassId === undefined
            ? definition.subclassId
            : option.subclassId;
        const feature = findGeneratedFeatureAtOrBelow(
            definition.classId,
            classLevel,
            option.name,
            optionSubclassId,
        );

        if (!feature) {
            return [];
        }

        return [{
            childSrdIndex: option.childSrdIndex,
            name: option.name,
            description: feature.description,
            prerequisite: option.prerequisite ?? null,
        }];
    });

    if (options.length === 0 || (!definition.allowUnavailableOptions && options.length !== definition.options.length)) {
        return null;
    }

    return {
        parentSrdIndex: definition.parentSrdIndex,
        chooseCount: typeof definition.chooseCount === 'function'
            ? definition.chooseCount(classLevel)
            : definition.chooseCount,
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
 * Finds one generated feature entry available at or before the given class level.
 */
function findGeneratedFeatureAtOrBelow(
    classId: string,
    maxLevel: number,
    name: string,
    subclassId: string | null,
): GeneratedSrdFeature | null {
    return LEVEL_UP_SRD_FEATURES.find((feature) => (
        feature.classId === classId
        && feature.level <= maxLevel
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
