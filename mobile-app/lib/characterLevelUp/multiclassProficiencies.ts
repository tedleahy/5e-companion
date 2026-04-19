import type { LevelUpWizardSelectedClass } from './types';

/**
 * Multiclass proficiency gains per class (SRD rules).
 */
export type MulticlassProficiencyGains = {
    armor: string[];
    weapons: string[];
    tools: string[];
    skillChoices: number;
    skillOptions: string[];
};

/**
 * SRD multiclass proficiency gain table.
 */
const MULTICLASS_PROFICIENCY_TABLE: Record<string, MulticlassProficiencyGains> = {
    barbarian: {
        armor: ['Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    bard: {
        armor: ['Light armour'],
        weapons: ['Simple weapons'],
        tools: ['One musical instrument of your choice'],
        skillChoices: 1,
        skillOptions: [
            'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
            'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
            'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
            'Sleight of Hand', 'Stealth', 'Survival',
        ],
    },
    cleric: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: [],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    druid: {
        armor: ['Light armour', 'Medium armour', 'Shields (non-metal)'],
        weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
        tools: ['Herbalism kit'],
        skillChoices: 0,
        skillOptions: [],
    },
    fighter: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    monk: {
        armor: [],
        weapons: ['Simple weapons', 'Shortswords'],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    paladin: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    ranger: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
        skillChoices: 1,
        skillOptions: [
            'Animal Handling', 'Athletics', 'Insight', 'Investigation',
            'Nature', 'Perception', 'Stealth', 'Survival',
        ],
    },
    rogue: {
        armor: ['Light armour'],
        weapons: [],
        tools: ["Thieves' tools"],
        skillChoices: 1,
        skillOptions: [
            'Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation',
            'Investigation', 'Perception', 'Performance', 'Persuasion',
            'Sleight of Hand', 'Stealth',
        ],
    },
    sorcerer: {
        armor: [],
        weapons: [],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    warlock: {
        armor: ['Light armour'],
        weapons: ['Simple weapons'],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
    wizard: {
        armor: [],
        weapons: [],
        tools: [],
        skillChoices: 0,
        skillOptions: [],
    },
};

/**
 * Returns the multiclass proficiency gains for a given class id, or null if
 * the class has no SRD multiclass proficiency entry.
 */
export function getMulticlassProficiencyGains(classId: string): MulticlassProficiencyGains | null {
    return MULTICLASS_PROFICIENCY_TABLE[classId] ?? null;
}

/**
 * Returns a flat list of automatic (non-choice) proficiency labels for display.
 */
export function getAutomaticProficiencyLabels(gains: MulticlassProficiencyGains): string[] {
    return [...gains.armor, ...gains.weapons, ...gains.tools];
}

/**
 * Returns whether a class grants any proficiencies at all when multiclassing.
 */
export function hasAnyMulticlassProficiencies(classId: string): boolean {
    const gains = MULTICLASS_PROFICIENCY_TABLE[classId];

    if (!gains) {
        return false;
    }

    return gains.armor.length > 0
        || gains.weapons.length > 0
        || gains.tools.length > 0
        || gains.skillChoices > 0;
}

/**
 * Returns whether the multiclass proficiencies step should appear.
 * Only shown when adding a brand-new class (not an existing class).
 */
export function needsMulticlassProficienciesStep(selectedClass: LevelUpWizardSelectedClass): boolean {
    return !selectedClass.isExistingClass;
}

/**
 * Route-local state for the multiclass proficiency skill choice.
 */
export type LevelUpMulticlassProficiencyState = {
    selectedSkills: string[];
};

/**
 * Creates the initial multiclass proficiency state.
 */
export function createLevelUpMulticlassProficiencyState(): LevelUpMulticlassProficiencyState {
    return { selectedSkills: [] };
}

/**
 * Toggles a skill in the selected list, respecting the maximum choice count.
 */
export function toggleMulticlassProficiencySkill(
    state: LevelUpMulticlassProficiencyState,
    skill: string,
    maxChoices: number,
): LevelUpMulticlassProficiencyState {
    const isSelected = state.selectedSkills.includes(skill);

    if (isSelected) {
        return {
            selectedSkills: state.selectedSkills.filter((s) => s !== skill),
        };
    }

    if (state.selectedSkills.length >= maxChoices) {
        return state;
    }

    return {
        selectedSkills: [...state.selectedSkills, skill],
    };
}

/**
 * Returns whether the user can continue from the multiclass proficiencies step.
 */
export function canContinueFromMulticlassProficiencies(
    selectedClass: LevelUpWizardSelectedClass,
    state: LevelUpMulticlassProficiencyState,
): boolean {
    const gains = getMulticlassProficiencyGains(selectedClass.classId);

    if (!gains || gains.skillChoices === 0) {
        return true;
    }

    return state.selectedSkills.length === gains.skillChoices;
}
