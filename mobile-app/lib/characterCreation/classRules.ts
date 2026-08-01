import { SKILL_DEFINITIONS, type AbilityKey, type SkillKey } from '@/lib/characterSheetUtils';
import type { ClassDetailsFieldsFragment } from '@/types/generated_graphql_types';

/** Hit die size by class, used to derive starting HP and hit dice. */
export const HIT_DIE_MAP: Record<string, number> = {
    barbarian: 12,
    fighter: 10,
    paladin: 10,
    ranger: 10,
    bard: 8,
    cleric: 8,
    druid: 8,
    monk: 8,
    rogue: 8,
    warlock: 8,
    sorcerer: 6,
    wizard: 6,
};

/** Armour proficiencies granted by each class. */
export const CLASS_ARMOUR_PROFICIENCIES: Record<string, string[]> = {
    barbarian: ['Light armour', 'Medium armour', 'Shields'],
    bard: ['Light armour'],
    cleric: ['Light armour', 'Medium armour', 'Shields'],
    druid: ['Light armour', 'Medium armour', 'Shields (non-metal)'],
    fighter: ['All armour', 'Shields'],
    monk: [],
    paladin: ['All armour', 'Shields'],
    ranger: ['Light armour', 'Medium armour', 'Shields'],
    rogue: ['Light armour'],
    sorcerer: [],
    warlock: ['Light armour'],
    wizard: [],
};

/** Weapon proficiencies granted by each class. */
export const CLASS_WEAPON_PROFICIENCIES: Record<string, string[]> = {
    barbarian: ['Simple weapons', 'Martial weapons'],
    bard: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    cleric: ['Simple weapons'],
    druid: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    fighter: ['Simple weapons', 'Martial weapons'],
    monk: ['Simple weapons', 'Shortswords'],
    paladin: ['Simple weapons', 'Martial weapons'],
    ranger: ['Simple weapons', 'Martial weapons'],
    rogue: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    sorcerer: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    warlock: ['Simple weapons'],
    wizard: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
};

/** Background skill proficiencies that are auto-selected and locked. */
export const BACKGROUND_SKILL_PROFICIENCIES: Record<string, SkillKey[]> = {
    acolyte: ['insight', 'religion'],
    Acolyte: ['insight', 'religion'],
    Sage: ['arcana', 'history'],
    Soldier: ['athletics', 'intimidation'],
    Noble: ['history', 'persuasion'],
    Outlander: ['athletics', 'survival'],
    Entertainer: ['acrobatics', 'performance'],
};

/**
 * Class skill options available during character creation.
 * `pick` is how many the player may choose from `options`.
 */
export const CLASS_SKILL_OPTIONS: Record<string, { pick: number; options: SkillKey[] }> = {
    barbarian: { pick: 2, options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    bard: { pick: 3, options: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'] },
    cleric: { pick: 2, options: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    druid: { pick: 2, options: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
    fighter: { pick: 2, options: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    monk: { pick: 2, options: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
    paladin: { pick: 2, options: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    ranger: { pick: 3, options: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
    rogue: { pick: 4, options: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'] },
    sorcerer: { pick: 2, options: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    warlock: { pick: 2, options: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    wizard: { pick: 2, options: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'] },
};

/** Maps character skill keys to SRD proficiency indexes used as choice values. */
export const SKILL_SRD_INDEX_BY_KEY: Record<SkillKey, string> = {
    acrobatics: 'skill-acrobatics',
    animalHandling: 'skill-animal-handling',
    arcana: 'skill-arcana',
    athletics: 'skill-athletics',
    deception: 'skill-deception',
    history: 'skill-history',
    insight: 'skill-insight',
    intimidation: 'skill-intimidation',
    investigation: 'skill-investigation',
    medicine: 'skill-medicine',
    nature: 'skill-nature',
    perception: 'skill-perception',
    performance: 'skill-performance',
    persuasion: 'skill-persuasion',
    religion: 'skill-religion',
    sleightOfHand: 'skill-sleight-of-hand',
    stealth: 'skill-stealth',
    survival: 'skill-survival',
};

/** Maps SRD skill proficiency indexes back to character skill keys. */
export const SKILL_KEY_BY_SRD_INDEX: Record<string, SkillKey> = Object.fromEntries(
    Object.entries(SKILL_SRD_INDEX_BY_KEY).map(([key, srdIndex]) => [srdIndex, key as SkillKey]),
) as Record<string, SkillKey>;

/**
 * Returns the character skill key for a proficiency option value, if it is a skill.
 */
export function skillKeyFromProficiencyValue(value: string): SkillKey | null {
    return SKILL_KEY_BY_SRD_INDEX[value] ?? null;
}

/** One independently limited class skill choice group. */
export type ClassSkillOptionGroup = {
    /** Class selection value (SRD srdIndex or owned custom class id). */
    classId: string;
    choiceGroup: number;
    pick: number;
    options: SkillKey[];
};

/** One selectable option inside a non-skill proficiency choice group. */
export type ClassProficiencyChoiceOption = {
    value: string;
    name: string;
    type: string;
};

/** One independently limited proficiency choice group before class scoping. */
export type ClassProficiencyChoiceGroupBase = {
    choiceGroup: number;
    pick: number;
    /** Dominant option type for labelling; mixed groups still share one pick count. */
    type: string;
    options: ClassProficiencyChoiceOption[];
};

/** One independently limited proficiency choice group scoped to a class. */
export type ClassProficiencyChoiceGroup = ClassProficiencyChoiceGroupBase & {
    /** Class selection value (SRD srdIndex or owned custom class id). */
    classId: string;
};

/** One class proficiency rule shape shared across STARTING and MULTICLASS grants. */
export type ClassProficiencyRuleLike = {
    /** Stable option identity: `srdIndex ?? id` from ClassDetails. Never the display name. */
    value?: string | null;
    type: string;
    choiceGroup?: number | null;
    choiceCount?: number | null;
    name: string;
};

/** Stable map key for a class-scoped proficiency choice group. */
export function proficiencyChoiceKey(classId: string, choiceGroup: number): string {
    return `${classId}::${choiceGroup}`;
}

/** Fixed automatic skill grants and independently limited skill choice groups for one grant type. */
export type SkillProficiencySplit = {
    automaticSkillLabels: string[];
    choiceGroups: Array<{ choiceGroup: number; pick: number; labels: string[] }>;
};

/** Fixed automatic grants plus all independently limited choice groups for one grant type. */
export type ProficiencyRuleSplit = {
    automatic: ClassProficiencyRuleLike[];
    choiceGroups: ClassProficiencyChoiceGroupBase[];
};

const NAMED_TRAIT_PROFICIENCY_TYPES = new Set(['ARMOR', 'WEAPON', 'TOOL', 'OTHER']);

/**
 * Returns whether a proficiency type belongs in armour/weapon/tool trait lists.
 */
export function isNamedTraitProficiencyType(type: string): boolean {
    return NAMED_TRAIT_PROFICIENCY_TYPES.has(type);
}

/**
 * Splits proficiency rules (already filtered to one grant type) into fixed
 * automatic grants and independently limited choice groups of every type.
 */
export function splitProficiencyRules(
    rules: readonly ClassProficiencyRuleLike[],
): ProficiencyRuleSplit {
    const automatic = rules.filter((rule) => rule.choiceGroup == null);
    const choiceRules = rules.filter((rule) => rule.choiceGroup != null);
    const rulesByGroup = new Map<number, ClassProficiencyRuleLike[]>();

    for (const rule of choiceRules) {
        const group = rulesByGroup.get(rule.choiceGroup!) ?? [];
        group.push(rule);
        rulesByGroup.set(rule.choiceGroup!, group);
    }

    const choiceGroups = [...rulesByGroup.entries()]
        .sort(([leftGroup], [rightGroup]) => leftGroup - rightGroup)
        .map(([choiceGroup, groupRules]) => {
            const optionsByValue = new Map<string, ClassProficiencyChoiceOption>();
            for (const rule of groupRules) {
                // Prefer the GraphQL `value` (`srdIndex ?? id`). Never fall back to
                // the display name — custom proficiencies are identified by id.
                const value = rule.value?.trim() ? rule.value : null;
                if (!value || optionsByValue.has(value)) continue;
                optionsByValue.set(value, { value, name: rule.name, type: rule.type });
            }
            const options = [...optionsByValue.values()];
            const typeCounts = new Map<string, number>();
            for (const option of options) {
                typeCounts.set(option.type, (typeCounts.get(option.type) ?? 0) + 1);
            }
            const dominantType = [...typeCounts.entries()]
                .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0]
                ?? 'OTHER';

            return {
                choiceGroup,
                pick: Math.max(...groupRules.map((rule) => rule.choiceCount ?? 0)),
                type: dominantType,
                options,
            };
        })
        .filter((group) => group.options.length > 0);

    return { automatic, choiceGroups };
}

/**
 * Splits a class's SKILL proficiency rules into fixed automatic grants and
 * independently limited skill choice groups.
 */
export function splitSkillProficiencyRules(
    rules: readonly ClassProficiencyRuleLike[],
): SkillProficiencySplit {
    const { automatic, choiceGroups } = splitProficiencyRules(
        rules.filter((rule) => rule.type === 'SKILL'),
    );

    return {
        automaticSkillLabels: automatic.map((rule) => rule.name),
        choiceGroups: choiceGroups.map((group) => ({
            choiceGroup: group.choiceGroup,
            pick: group.pick,
            labels: group.options.map((option) => option.name),
        })),
    };
}

/**
 * Returns author-configured skill choice groups for one grant type, or null
 * when the class has no configured skill-choice group.
 */
export function configuredClassSkillOptionsForGrant(
    classDefinition: ClassDetailsFieldsFragment | null | undefined,
    grant: 'STARTING' | 'MULTICLASS',
    classId: string,
): ClassSkillOptionGroup[] | null {
    const rules = classDefinition?.proficiencies.filter((rule) => rule.grant === grant) ?? [];
    const { choiceGroups } = splitSkillProficiencyRules(rules);

    if (choiceGroups.length === 0) return null;

    return choiceGroups.map((group) => ({
        classId,
        choiceGroup: group.choiceGroup,
        pick: group.pick,
        options: mapSkillLabelsToKeys(group.labels),
    }));
}

/**
 * Returns author-configured starting skill choices, or null when the class has
 * no configured skill-choice group and the SRD fallback should be used.
 */
export function configuredStartingClassSkillOptions(
    classDefinition?: ClassDetailsFieldsFragment | null,
    classId: string = classDefinition?.value ?? '',
): ClassSkillOptionGroup[] | null {
    return configuredClassSkillOptionsForGrant(classDefinition, 'STARTING', classId);
}

/**
 * Returns author-configured fixed skill grants (`choiceGroup == null`) for one grant type.
 */
export function configuredFixedSkillsForGrant(
    classDefinition: ClassDetailsFieldsFragment | null | undefined,
    grant: 'STARTING' | 'MULTICLASS',
): SkillKey[] {
    const rules = classDefinition?.proficiencies.filter((rule) => rule.grant === grant) ?? [];
    const { automaticSkillLabels } = splitSkillProficiencyRules(rules);

    return mapSkillLabelsToKeys(automaticSkillLabels);
}

/**
 * Returns author-configured fixed starting skill grants (`choiceGroup == null`).
 * These are auto-selected and, like locked background skills, must not be
 * choosable away in the skills step.
 */
export function configuredStartingFixedSkills(
    classDefinition?: ClassDetailsFieldsFragment | null,
): SkillKey[] {
    return configuredFixedSkillsForGrant(classDefinition, 'STARTING');
}

/**
 * Returns author-configured choice groups (SKILL + named) for one grant type.
 * Option values are proficiency identities (`srdIndex ?? id`).
 */
export function configuredProficiencyChoiceGroupsForGrant(
    classDefinition: ClassDetailsFieldsFragment | null | undefined,
    grant: 'STARTING' | 'MULTICLASS',
    classId: string,
): ClassProficiencyChoiceGroup[] {
    const rules = (classDefinition?.proficiencies.filter((rule) => rule.grant === grant) ?? [])
        .filter((rule) => rule.type === 'SKILL' || isNamedTraitProficiencyType(rule.type));
    const { choiceGroups } = splitProficiencyRules(rules);
    return choiceGroups.map((group) => ({ ...group, classId }));
}

/**
 * Returns author-configured non-skill STARTING choice groups (armor/weapon/tool/other).
 */
export function configuredStartingProficiencyChoiceGroups(
    classDefinition?: ClassDetailsFieldsFragment | null,
    classId: string = classDefinition?.value ?? '',
): ClassProficiencyChoiceGroup[] {
    return configuredProficiencyChoiceGroupsForGrant(classDefinition, 'STARTING', classId)
        .filter((group) => isNamedTraitProficiencyType(group.type));
}

/**
 * Builds a SKILL choice group from the static SRD skill table fallback.
 */
export function fallbackStartingSkillChoiceGroup(
    classId: string,
): ClassProficiencyChoiceGroup | null {
    const fallback = CLASS_SKILL_OPTIONS[classId];
    if (!fallback) return null;

    return {
        classId,
        choiceGroup: 1,
        pick: fallback.pick,
        type: 'SKILL',
        options: fallback.options.map((skillKey) => {
            const skill = SKILL_DEFINITIONS.find((candidate) => candidate.key === skillKey);
            return {
                value: SKILL_SRD_INDEX_BY_KEY[skillKey],
                name: skill?.label ?? skillKey,
                type: 'SKILL',
            };
        }),
    };
}

/**
 * Skill keys granted by validated SKILL options in draft proficiency choices.
 */
export function skillKeysFromProficiencyChoices(
    selections: ReadonlyArray<{ classId: string; choiceGroup: number; values: string[] }>,
    groups: readonly ClassProficiencyChoiceGroup[],
): SkillKey[] {
    const groupsByKey = new Map(
        groups.map((group) => [proficiencyChoiceKey(group.classId, group.choiceGroup), group]),
    );
    const keys = new Set<SkillKey>();

    for (const selection of selections) {
        const group = groupsByKey.get(proficiencyChoiceKey(selection.classId, selection.choiceGroup));
        if (!group) continue;
        for (const value of selection.values) {
            const option = group.options.find((candidate) => candidate.value === value);
            if (!option || option.type !== 'SKILL') continue;
            const skillKey = skillKeyFromProficiencyValue(value);
            if (skillKey) keys.add(skillKey);
        }
    }

    return [...keys];
}

/**
 * Human-readable labels for selected named proficiency choices, in draft order.
 */
export function labelsForProficiencyChoices(
    selections: ReadonlyArray<{ classId: string; choiceGroup: number; values: string[] }>,
    groups: readonly ClassProficiencyChoiceGroup[],
): string[] {
    const optionNameByKey = new Map<string, string>();
    for (const group of groups) {
        for (const option of group.options) {
            optionNameByKey.set(proficiencyChoiceKey(group.classId, group.choiceGroup) + '::' + option.value, option.name);
        }
    }

    return selections.flatMap((selection) => (
        selection.values.map((value) => (
            optionNameByKey.get(
                `${proficiencyChoiceKey(selection.classId, selection.choiceGroup)}::${value}`,
            ) ?? value
        ))
    ));
}

/**
 * Human label for a proficiency type used in choice-group headings.
 */
export function proficiencyTypeLabel(type: string): string {
    switch (type) {
        case 'ARMOR':
            return 'Armour';
        case 'WEAPON':
            return 'Weapon';
        case 'TOOL':
            return 'Tool';
        case 'OTHER':
            return 'Proficiency';
        case 'SKILL':
            return 'Skill';
        default:
            return 'Proficiency';
    }
}

/** Maps skill display labels to their internal skill keys, skipping unresolved labels. */
function mapSkillLabelsToKeys(labels: readonly string[]): SkillKey[] {
    return labels.flatMap((label) => {
        const skill = SKILL_DEFINITIONS.find((candidate) => (
            candidate.label.localeCompare(label, undefined, { sensitivity: 'accent' }) === 0
        ));
        return skill ? [skill.key] : [];
    });
}

/** Saving throw proficiencies granted by each class. */
export const CLASS_SAVING_THROWS: Record<string, AbilityKey[]> = {
    barbarian: ['strength', 'constitution'],
    bard: ['dexterity', 'charisma'],
    cleric: ['wisdom', 'charisma'],
    druid: ['intelligence', 'wisdom'],
    fighter: ['strength', 'constitution'],
    monk: ['strength', 'dexterity'],
    paladin: ['wisdom', 'charisma'],
    ranger: ['strength', 'dexterity'],
    rogue: ['dexterity', 'intelligence'],
    sorcerer: ['constitution', 'charisma'],
    warlock: ['wisdom', 'charisma'],
    wizard: ['intelligence', 'wisdom'],
};

/** Spellcasting ability by class for classes that cast spells. */
export const CLASS_SPELLCASTING_ABILITY_MAP: Record<string, AbilityKey> = {
    bard: 'charisma',
    cleric: 'wisdom',
    druid: 'wisdom',
    sorcerer: 'charisma',
    warlock: 'charisma',
    wizard: 'intelligence',
    paladin: 'charisma',
};

/**
 * Preferred ability score order per class, from highest to lowest priority.
 * Used by the "Suggested for [Class]" button to reorder rolled scores.
 */
export const CLASS_ABILITY_PRIORITY: Record<string, AbilityKey[]> = {
    barbarian: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    bard: ['charisma', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'strength'],
    cleric: ['wisdom', 'constitution', 'strength', 'dexterity', 'charisma', 'intelligence'],
    druid: ['wisdom', 'constitution', 'dexterity', 'intelligence', 'charisma', 'strength'],
    fighter: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    monk: ['dexterity', 'wisdom', 'constitution', 'strength', 'charisma', 'intelligence'],
    paladin: ['strength', 'charisma', 'constitution', 'wisdom', 'dexterity', 'intelligence'],
    ranger: ['dexterity', 'wisdom', 'constitution', 'strength', 'intelligence', 'charisma'],
    rogue: ['dexterity', 'constitution', 'charisma', 'intelligence', 'wisdom', 'strength'],
    sorcerer: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    warlock: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    wizard: ['intelligence', 'constitution', 'dexterity', 'wisdom', 'strength', 'charisma'],
};
