import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { sortCharacterClasses } from '@/lib/characterClassSummary';
import type {
    LevelUpWizardCharacter,
    LevelUpWizardSelectedClass,
    LevelUpWizardStep,
    LevelUpWizardStepId,
} from './types';

/**
 * ASI levels keyed by class id.
 */
export const ASI_LEVELS_BY_CLASS_ID: Record<string, readonly number[]> = {
    barbarian: [4, 8, 12, 16, 19],
    bard: [4, 8, 12, 16, 19],
    cleric: [4, 8, 12, 16, 19],
    druid: [4, 8, 12, 16, 19],
    fighter: [4, 6, 8, 12, 14, 16, 19],
    monk: [4, 8, 12, 16, 19],
    paladin: [4, 8, 12, 16, 19],
    ranger: [4, 8, 12, 16, 19],
    rogue: [4, 8, 10, 12, 16, 19],
    sorcerer: [4, 8, 12, 16, 19],
    warlock: [4, 8, 12, 16, 19],
    wizard: [4, 8, 12, 16, 19],
};

/**
 * Placeholder spellcasting unlock levels keyed by class id.
 */
export const SPELLCASTING_UNLOCK_LEVEL_BY_CLASS_ID: Record<string, number> = {
    bard: 1,
    cleric: 1,
    druid: 1,
    paladin: 2,
    ranger: 2,
    sorcerer: 1,
    warlock: 1,
    wizard: 1,
};

/**
 * Placeholder resource unlock levels keyed by class id.
 */
export const CLASS_RESOURCE_UNLOCK_LEVEL_BY_CLASS_ID: Record<string, number> = {
    barbarian: 1,
    bard: 1,
    cleric: 2,
    druid: 2,
    fighter: 1,
    monk: 2,
    paladin: 1,
    ranger: 1,
    sorcerer: 2,
    warlock: 1,
    wizard: 1,
};

/**
 * Subclass unlock levels keyed by class id.
 */
export const SUBCLASS_UNLOCK_LEVEL_BY_CLASS_ID: Record<string, number> = {
    barbarian: 3,
    bard: 3,
    cleric: 1,
    druid: 2,
    fighter: 3,
    monk: 3,
    paladin: 3,
    ranger: 3,
    rogue: 3,
    sorcerer: 1,
    warlock: 1,
    wizard: 2,
};

/**
 * Human-readable step metadata keyed by wizard step id.
 */
export const LEVEL_UP_WIZARD_STEP_CONTENT: Record<LevelUpWizardStepId, Omit<LevelUpWizardStep, 'id'>> = {
    choose_class: {
        title: 'Choose Class',
        description: 'Select which class gains the new level so the rest of the wizard can assemble the right follow-up steps.',
    },
    hit_points: {
        title: 'Hit Points',
        description: 'This placeholder step will later capture the hit-die roll or average HP gain for the selected class.',
    },
    asi_or_feat: {
        title: 'ASI / Feat',
        description: 'This placeholder step marks levels where the class earns an ability score improvement or feat choice.',
    },
    subclass_selection: {
        title: 'Subclass Selection',
        description: 'This placeholder step appears when the selected class reaches its subclass choice level without a subclass yet assigned.',
    },
    new_features: {
        title: 'New Class Features',
        description: 'This placeholder step reserves space for feature gains unlocked by the selected class level-up.',
    },
    spellcasting_updates: {
        title: 'Spellcasting Updates',
        description: 'This placeholder step covers spell-slot, spells-known, or prepared-caster changes driven by the new level.',
    },
    multiclass_proficiencies: {
        title: 'Multiclass Proficiencies',
        description: 'This placeholder step will later summarise proficiencies gained when adding a brand-new class.',
    },
    class_resources: {
        title: 'Class Resources',
        description: 'This placeholder step reserves resource changes such as Arcane Recovery, Ki, or other class-limited features.',
    },
    summary: {
        title: 'Summary',
        description: 'This placeholder step will become the final review before applying the level-up into the local character-sheet draft.',
    },
};

/**
 * Returns one fallback class option id when the character has no class rows yet.
 */
function fallbackClassId(): string {
    return CLASS_OPTIONS[0]?.value ?? 'wizard';
}

/**
 * Returns the default class id that should be pre-selected when the wizard opens.
 */
export function defaultLevelUpClassId(character: LevelUpWizardCharacter | null | undefined): string {
    if (!character) {
        return fallbackClassId();
    }

    return sortCharacterClasses(character.classes)[0]?.classId ?? fallbackClassId();
}

/**
 * Returns the class metadata for one selected level-up target.
 */
export function selectedLevelUpClass(
    character: LevelUpWizardCharacter | null | undefined,
    selectedClassId: string,
): LevelUpWizardSelectedClass {
    const matchingClassRow = character?.classes.find((classRow) => classRow.classId === selectedClassId) ?? null;
    const classOption = CLASS_OPTIONS.find((option) => option.value === selectedClassId) ?? null;

    if (matchingClassRow) {
        return {
            classId: matchingClassRow.classId,
            className: matchingClassRow.className,
            currentLevel: matchingClassRow.level,
            newLevel: matchingClassRow.level + 1,
            isExistingClass: true,
            subclassId: matchingClassRow.subclassId ?? null,
            subclassName: matchingClassRow.subclassName ?? null,
        };
    }

    return {
        classId: selectedClassId,
        className: classOption?.label ?? 'Unknown class',
        currentLevel: 0,
        newLevel: 1,
        isExistingClass: false,
        subclassId: null,
        subclassName: null,
    };
}

/**
 * Returns whether the selected class level grants an ASI placeholder step.
 */
export function isAsiLevel(classId: string, newClassLevel: number): boolean {
    return (ASI_LEVELS_BY_CLASS_ID[classId] ?? []).includes(newClassLevel);
}

/**
 * Returns whether the selected class should show a subclass placeholder step.
 */
export function needsSubclassSelectionStep(selectedClass: LevelUpWizardSelectedClass): boolean {
    const unlockLevel = SUBCLASS_UNLOCK_LEVEL_BY_CLASS_ID[selectedClass.classId];

    if (!unlockLevel) {
        return false;
    }

    return selectedClass.newLevel >= unlockLevel && selectedClass.subclassId == null;
}

/**
 * Returns whether the selected class should show a spellcasting placeholder step.
 */
export function hasSpellcastingUpdatesStep(classId: string, newClassLevel: number): boolean {
    const unlockLevel = SPELLCASTING_UNLOCK_LEVEL_BY_CLASS_ID[classId];

    if (!unlockLevel) {
        return false;
    }

    return newClassLevel >= unlockLevel;
}

/**
 * Returns whether the selected class should show a class-resources placeholder step.
 */
export function hasClassResourceStep(classId: string, newClassLevel: number): boolean {
    const unlockLevel = CLASS_RESOURCE_UNLOCK_LEVEL_BY_CLASS_ID[classId];

    if (!unlockLevel) {
        return false;
    }

    return newClassLevel >= unlockLevel;
}

/**
 * Returns whether the selected level-up is adding a brand-new class.
 */
export function isNewMulticlass(selectedClass: LevelUpWizardSelectedClass): boolean {
    return !selectedClass.isExistingClass;
}

/**
 * Returns whether the placeholder features step should appear.
 *
 * This is intentionally broad for chunk 2 so the dynamic step registry is
 * exercised before the feature data source is implemented in a later chunk.
 */
export function hasNewFeaturesStep(selectedClass: LevelUpWizardSelectedClass): boolean {
    return selectedClass.newLevel > 1;
}

/**
 * Builds the active step list for the current class selection.
 */
export function buildLevelUpStepList(
    character: LevelUpWizardCharacter | null | undefined,
    selectedClassId: string,
): LevelUpWizardStep[] {
    const selectedClass = selectedLevelUpClass(character, selectedClassId);
    const stepIds: LevelUpWizardStepId[] = ['choose_class', 'hit_points'];

    if (isAsiLevel(selectedClass.classId, selectedClass.newLevel)) {
        stepIds.push('asi_or_feat');
    }

    if (needsSubclassSelectionStep(selectedClass)) {
        stepIds.push('subclass_selection');
    }

    if (hasNewFeaturesStep(selectedClass)) {
        stepIds.push('new_features');
    }

    if (hasSpellcastingUpdatesStep(selectedClass.classId, selectedClass.newLevel)) {
        stepIds.push('spellcasting_updates');
    }

    if (isNewMulticlass(selectedClass)) {
        stepIds.push('multiclass_proficiencies');
    }

    if (hasClassResourceStep(selectedClass.classId, selectedClass.newLevel)) {
        stepIds.push('class_resources');
    }

    stepIds.push('summary');

    return stepIds.map((stepId) => ({
        id: stepId,
        ...LEVEL_UP_WIZARD_STEP_CONTENT[stepId],
    }));
}
