import {
    isNamedTraitProficiencyType,
    splitProficiencyRules,
    type ClassProficiencyChoiceGroupBase,
} from '@/lib/characterCreation/classRules';
import type { DraftProficiencyChoice } from '@/lib/characterCreation/proficiencyChoiceDraft';
import { findSkillDefinitionByLabel } from '@/lib/characterSheetUtils';
import type { LevelUpWizardSelectedClass } from './types';

/**
 * Stable skill option value matching server `srdIndex` (`skill-athletics`).
 */
function skillSrdIndexFromLabel(label: string): string {
    return `skill-${label.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Builds a SKILL choice-group option with a server-aligned identity value.
 */
function skillChoiceOption(label: string): { value: string; name: string; type: 'SKILL' } {
    return {
        value: skillSrdIndexFromLabel(label),
        name: label,
        type: 'SKILL',
    };
}

/**
 * Multiclass proficiency gains per class (SRD rules).
 */
export type MulticlassProficiencyGains = {
    armor: string[];
    weapons: string[];
    tools: string[];
    /** Skill proficiencies granted automatically (no choice involved). */
    automaticSkills: string[];
    /** Independently limited choice groups of every type (skills + non-skills). */
    choiceGroups: ClassProficiencyChoiceGroupBase[];
};

/**
 * SRD multiclass proficiency gain table used when a class definition has not
 * loaded configured MULTICLASS proficiency rules.
 */
const MULTICLASS_PROFICIENCY_TABLE: Record<string, MulticlassProficiencyGains> = {
    barbarian: {
        armor: ['Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    bard: {
        armor: ['Light armour'],
        weapons: ['Simple weapons'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [
            {
                choiceGroup: 1,
                pick: 1,
                type: 'SKILL',
                options: [
                    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
                    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
                    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
                    'Sleight of Hand', 'Stealth', 'Survival',
                ].map(skillChoiceOption),
            },
            {
                choiceGroup: 2,
                pick: 1,
                type: 'TOOL',
                options: [
                    'Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Lute',
                    'Lyre', 'Horn', 'Pan flute', 'Shawm', 'Viol',
                ].map((name) => ({
                    value: name.toLowerCase().replace(/\s+/g, '-'),
                    name,
                    type: 'TOOL',
                })),
            },
        ],
    },
    cleric: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: [],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    druid: {
        armor: ['Light armour', 'Medium armour', 'Shields (non-metal)'],
        weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
        tools: ['Herbalism kit'],
        automaticSkills: [],
        choiceGroups: [],
    },
    fighter: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    monk: {
        armor: [],
        weapons: ['Simple weapons', 'Shortswords'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    paladin: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    ranger: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [{
            choiceGroup: 1,
            pick: 1,
            type: 'SKILL',
            options: [
                'Animal Handling', 'Athletics', 'Insight', 'Investigation',
                'Nature', 'Perception', 'Stealth', 'Survival',
            ].map(skillChoiceOption),
        }],
    },
    rogue: {
        armor: ['Light armour'],
        weapons: [],
        tools: ["Thieves' tools"],
        automaticSkills: [],
        choiceGroups: [{
            choiceGroup: 1,
            pick: 1,
            type: 'SKILL',
            options: [
                'Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation',
                'Investigation', 'Perception', 'Performance', 'Persuasion',
                'Sleight of Hand', 'Stealth',
            ].map(skillChoiceOption),
        }],
    },
    sorcerer: {
        armor: [],
        weapons: [],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    warlock: {
        armor: ['Light armour'],
        weapons: ['Simple weapons'],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
    wizard: {
        armor: [],
        weapons: [],
        tools: [],
        automaticSkills: [],
        choiceGroups: [],
    },
};

/**
 * Builds gains from configured MULTICLASS proficiency rules on a class definition.
 */
function gainsFromConfiguredRules(
    configured: Array<{ value: string; name: string; type: string; choiceGroup?: number | null; choiceCount?: number | null }>,
): MulticlassProficiencyGains {
    const { automatic, choiceGroups } = splitProficiencyRules(configured);

    return {
        armor: automatic.filter((rule) => rule.type === 'ARMOR').map((rule) => rule.name),
        weapons: automatic.filter((rule) => rule.type === 'WEAPON').map((rule) => rule.name),
        tools: automatic
            .filter((rule) => rule.type === 'TOOL' || rule.type === 'OTHER')
            .map((rule) => rule.name),
        automaticSkills: automatic.filter((rule) => rule.type === 'SKILL').map((rule) => rule.name),
        choiceGroups,
    };
}

/**
 * Returns the multiclass proficiency gains for a given class id, or null if
 * the class has no SRD multiclass proficiency entry.
 */
export function getMulticlassProficiencyGains(classId: string, selectedClass?: LevelUpWizardSelectedClass): MulticlassProficiencyGains | null {
    const configured = selectedClass?.classDefinition?.proficiencies.filter((rule) => rule.grant === 'MULTICLASS') ?? [];
    if (configured.length > 0) {
        return gainsFromConfiguredRules(configured);
    }
    return MULTICLASS_PROFICIENCY_TABLE[classId] ?? null;
}

/**
 * Returns non-skill choice groups that need a picker on the multiclass step.
 */
export function getNonSkillMulticlassChoiceGroups(gains: MulticlassProficiencyGains): ClassProficiencyChoiceGroupBase[] {
    return gains.choiceGroups.filter((group) => isNamedTraitProficiencyType(group.type));
}

/**
 * Returns SKILL choice groups that need a picker on the multiclass step.
 */
export function getSkillMulticlassChoiceGroups(gains: MulticlassProficiencyGains): ClassProficiencyChoiceGroupBase[] {
    return gains.choiceGroups.filter((group) => group.type === 'SKILL');
}

/**
 * Selected option values for one choice group in level-up proficiency state.
 */
export function selectedMulticlassProficiencyValues(
    state: LevelUpMulticlassProficiencyState,
    choiceGroup: number,
): string[] {
    return state.selections.find((entry) => entry.choiceGroup === choiceGroup)?.values ?? [];
}

/**
 * Builds save/create-shaped proficiency choice provenance for the selected class.
 */
export function buildPendingMulticlassProficiencyChoices(
    classId: string,
    state: LevelUpMulticlassProficiencyState,
): DraftProficiencyChoice[] {
    return state.selections
        .filter((selection) => selection.values.length > 0)
        .map((selection) => ({
            classId,
            choiceGroup: selection.choiceGroup,
            values: [...selection.values],
        }));
}

/**
 * Display labels for selected options across every choice group.
 */
export function labelsForMulticlassProficiencySelections(
    gains: MulticlassProficiencyGains,
    state: LevelUpMulticlassProficiencyState,
): string[] {
    return gains.choiceGroups.flatMap((group) => {
        const selected = new Set(selectedMulticlassProficiencyValues(state, group.choiceGroup));
        return group.options
            .filter((option) => selected.has(option.value))
            .map((option) => option.name);
    });
}

/**
 * Returns a flat list of automatic (non-choice) proficiency labels for display.
 */
export function getAutomaticProficiencyLabels(gains: MulticlassProficiencyGains): string[] {
    return [...gains.armor, ...gains.weapons, ...gains.tools, ...gains.automaticSkills];
}

/**
 * Returns whether a class grants any proficiencies at all when multiclassing.
 */
export function hasAnyMulticlassProficiencies(classId: string, selectedClass?: LevelUpWizardSelectedClass): boolean {
    const gains = getMulticlassProficiencyGains(classId, selectedClass);

    if (!gains) {
        return false;
    }

    return gains.armor.length > 0
        || gains.weapons.length > 0
        || gains.tools.length > 0
        || gains.automaticSkills.length > 0
        || gains.choiceGroups.length > 0;
}

/**
 * Returns whether the multiclass proficiencies step should appear.
 * Only shown when adding a brand-new class (not an existing class).
 */
export function needsMulticlassProficienciesStep(selectedClass: LevelUpWizardSelectedClass): boolean {
    return !selectedClass.isExistingClass;
}

/**
 * Route-local state for multiclass proficiency choices.
 * Same identity shape as create/save `ProficiencyChoiceSelectionInput`
 * (`choiceGroup` + option values); `classId` is attached when building pending
 * draft/save provenance.
 */
export type LevelUpMulticlassProficiencyState = {
    selections: Array<{
        choiceGroup: number;
        values: string[];
    }>;
};

/**
 * Creates the initial multiclass proficiency state.
 */
export function createLevelUpMulticlassProficiencyState(): LevelUpMulticlassProficiencyState {
    return { selections: [] };
}

/**
 * Toggles one option inside a choice group (SKILL or named), respecting pick.
 */
export function toggleMulticlassProficiencyChoice(
    state: LevelUpMulticlassProficiencyState,
    choiceGroup: number,
    value: string,
    maxChoices: number,
): LevelUpMulticlassProficiencyState {
    const currentValues = selectedMulticlassProficiencyValues(state, choiceGroup);
    const isSelected = currentValues.includes(value);
    const nextValues = isSelected
        ? currentValues.filter((entry) => entry !== value)
        : currentValues.length >= maxChoices
            ? currentValues
            : [...currentValues, value];

    const otherSelections = state.selections.filter((entry) => entry.choiceGroup !== choiceGroup);
    if (nextValues.length === 0) {
        return { selections: otherSelections };
    }

    return {
        selections: [...otherSelections, { choiceGroup, values: nextValues }],
    };
}

/**
 * @deprecated Prefer {@link toggleMulticlassProficiencyChoice} with skill srdIndex values.
 * Resolves a display label to its skill option value, then toggles that group.
 */
export function toggleMulticlassProficiencySkill(
    state: LevelUpMulticlassProficiencyState,
    skillLabel: string,
    maxChoices: number,
    choiceGroup = 1,
): LevelUpMulticlassProficiencyState {
    const value = findSkillDefinitionByLabel(skillLabel)
        ? skillSrdIndexFromLabel(skillLabel)
        : skillLabel;
    return toggleMulticlassProficiencyChoice(state, choiceGroup, value, maxChoices);
}

/**
 * Returns whether the user can continue from the multiclass proficiencies step.
 */
export function canContinueFromMulticlassProficiencies(
    selectedClass: LevelUpWizardSelectedClass,
    state: LevelUpMulticlassProficiencyState,
): boolean {
    const gains = getMulticlassProficiencyGains(selectedClass.classId, selectedClass);

    if (!gains) {
        return true;
    }

    return gains.choiceGroups.every((group) => (
        selectedMulticlassProficiencyValues(state, group.choiceGroup).length === group.pick
    ));
}
