import { HIT_DIE_MAP } from '@/lib/characterCreation/classRules';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { ABILITY_ABBREVIATIONS, type AbilityKey } from '@/lib/characterSheetUtils';
import type {
    LevelUpClassSelectionState,
    LevelUpWizardCharacter,
    LevelUpWizardSelectedClass,
} from './types';
import { selectedLevelUpClass } from './stepAssembly';

/**
 * One prerequisite ruleset for multiclassing into or out of a class.
 */
type MulticlassPrerequisiteRule = {
    requirementText: string;
    validate: (abilityScores: Record<AbilityKey, number>) => boolean;
    failingScores: (abilityScores: Record<AbilityKey, number>) => string[];
};

/**
 * Multiclass prerequisites keyed by class id.
 */
export const MULTICLASS_PREREQUISITES_BY_CLASS_ID: Record<string, MulticlassPrerequisiteRule> = {
    barbarian: createSingleAbilityRule('STR', 'strength'),
    bard: createSingleAbilityRule('CHA', 'charisma'),
    cleric: createSingleAbilityRule('WIS', 'wisdom'),
    druid: createSingleAbilityRule('WIS', 'wisdom'),
    fighter: {
        requirementText: 'STR 13 or DEX 13',
        validate(abilityScores) {
            return abilityScores.strength >= 13 || abilityScores.dexterity >= 13;
        },
        failingScores(abilityScores) {
            return [
                formatAbilityScore('strength', abilityScores.strength),
                formatAbilityScore('dexterity', abilityScores.dexterity),
            ];
        },
    },
    monk: createDualAbilityRule(['dexterity', 'wisdom']),
    paladin: createDualAbilityRule(['strength', 'charisma']),
    ranger: createDualAbilityRule(['dexterity', 'wisdom']),
    rogue: createSingleAbilityRule('DEX', 'dexterity'),
    sorcerer: createSingleAbilityRule('CHA', 'charisma'),
    warlock: createSingleAbilityRule('CHA', 'charisma'),
    wizard: createSingleAbilityRule('INT', 'intelligence'),
};

/**
 * Creates the default choose-class state for one wizard session.
 */
export function createLevelUpClassSelectionState(
    currentClassId: string,
): LevelUpClassSelectionState {
    return {
        currentClassId,
        mode: 'current_class',
        selectedClassId: currentClassId,
    };
}

/**
 * Returns the class id currently driving the wizard step list.
 */
export function effectiveLevelUpClassId(
    classSelection: LevelUpClassSelectionState,
): string {
    return classSelection.selectedClassId ?? classSelection.currentClassId;
}

/**
 * Opens the expanded multiclass picker with no preselected class.
 */
export function enterMulticlassPicker(
    classSelection: LevelUpClassSelectionState,
): LevelUpClassSelectionState {
    return {
        ...classSelection,
        mode: 'multiclass_picker',
        selectedClassId: null,
    };
}

/**
 * Applies one selected class inside the expanded multiclass picker.
 */
export function selectMulticlassLevelUpClass(
    classSelection: LevelUpClassSelectionState,
    classId: string,
): LevelUpClassSelectionState {
    return {
        ...classSelection,
        mode: 'multiclass_picker',
        selectedClassId: classId,
    };
}

/**
 * Returns from the multiclass picker to the default current-class view.
 */
export function resetToCurrentClassSelection(
    classSelection: LevelUpClassSelectionState,
): LevelUpClassSelectionState {
    return {
        currentClassId: classSelection.currentClassId,
        mode: 'current_class',
        selectedClassId: classSelection.currentClassId,
    };
}

/**
 * Returns whether step 1 may continue from the current choose-class state.
 */
export function canContinueFromChooseClass(
    classSelection: LevelUpClassSelectionState,
): boolean {
    if (classSelection.mode === 'current_class') {
        return true;
    }

    return classSelection.selectedClassId != null;
}

/**
 * Returns one display-ready current-class record for the default view card.
 */
export function currentLevelUpClass(
    character: LevelUpWizardCharacter | null | undefined,
    currentClassId: string,
): LevelUpWizardSelectedClass {
    return selectedLevelUpClass(character, currentClassId);
}

/**
 * Returns the shared class option metadata for one class id.
 */
export function levelUpClassOption(classId: string) {
    return CLASS_OPTIONS.find((option) => option.value === classId) ?? null;
}

/**
 * Returns the hit-die label for one class id.
 */
export function levelUpHitDieLabel(classId: string): string {
    const hitDie = HIT_DIE_MAP[classId];

    if (!hitDie) {
        return 'd?';
    }

    return `d${hitDie}`;
}

/**
 * Returns non-blocking multiclass prerequisite warnings for the selected class.
 */
export function multiclassPrerequisiteWarnings(
    character: LevelUpWizardCharacter | null | undefined,
    currentClassId: string,
    targetClassId: string | null,
): string[] {
    if (!character?.stats?.abilityScores || !targetClassId || targetClassId === currentClassId) {
        return [];
    }

    const abilityScores = character.stats.abilityScores;
    const warnings: string[] = [];

    appendPrerequisiteWarning(warnings, currentClassId, abilityScores, 'Current class');
    appendPrerequisiteWarning(warnings, targetClassId, abilityScores, 'New class');

    return warnings;
}

/**
 * Creates one single-ability prerequisite rule.
 */
function createSingleAbilityRule(
    label: string,
    ability: AbilityKey,
): MulticlassPrerequisiteRule {
    return {
        requirementText: `${label} 13`,
        validate(abilityScores) {
            return abilityScores[ability] >= 13;
        },
        failingScores(abilityScores) {
            return [formatAbilityScore(ability, abilityScores[ability])];
        },
    };
}

/**
 * Creates one "both abilities required" prerequisite rule.
 */
function createDualAbilityRule(
    abilities: [AbilityKey, AbilityKey],
): MulticlassPrerequisiteRule {
    const [leftAbility, rightAbility] = abilities;

    return {
        requirementText: `${ABILITY_ABBREVIATIONS[leftAbility]} 13 and ${ABILITY_ABBREVIATIONS[rightAbility]} 13`,
        validate(abilityScores) {
            return abilityScores[leftAbility] >= 13 && abilityScores[rightAbility] >= 13;
        },
        failingScores(abilityScores) {
            return abilities
                .filter((ability) => abilityScores[ability] < 13)
                .map((ability) => formatAbilityScore(ability, abilityScores[ability]));
        },
    };
}

/**
 * Formats one abbreviated ability score fragment for warning text.
 */
function formatAbilityScore(
    ability: AbilityKey,
    score: number,
): string {
    return `${ABILITY_ABBREVIATIONS[ability]} ${score}`;
}

/**
 * Appends one warning message when a class prerequisite rule is not met.
 */
function appendPrerequisiteWarning(
    warnings: string[],
    classId: string,
    abilityScores: Record<AbilityKey, number>,
    prefix: string,
) {
    const prerequisiteRule = MULTICLASS_PREREQUISITES_BY_CLASS_ID[classId];

    if (!prerequisiteRule || prerequisiteRule.validate(abilityScores)) {
        return;
    }

    const classLabel = levelUpClassOption(classId)?.label ?? 'Unknown class';
    const failingScores = prerequisiteRule.failingScores(abilityScores).join(', ');
    warnings.push(
        `${prefix} multiclass requirement not met for ${classLabel}: ${prerequisiteRule.requirementText}. Current scores: ${failingScores}.`,
    );
}
