import type { CharacterSheetFieldsFragment } from '@/types/generated_graphql_types';

/**
 * Ordered step ids supported by the level-up wizard.
 */
export const LEVEL_UP_WIZARD_STEP_IDS = [
    'choose_class',
    'hit_points',
    'asi_or_feat',
    'subclass_selection',
    'new_features',
    'spellcasting_updates',
    'multiclass_proficiencies',
    'class_resources',
    'summary',
] as const;

/**
 * One supported level-up wizard step id.
 */
export type LevelUpWizardStepId = (typeof LEVEL_UP_WIZARD_STEP_IDS)[number];

/**
 * One display-ready wizard step.
 */
export type LevelUpWizardStep = {
    id: LevelUpWizardStepId;
    title: string;
    description: string;
};

/**
 * Minimal character shape needed by the mobile level-up wizard.
 */
export type LevelUpWizardCharacter = Pick<
    CharacterSheetFieldsFragment,
    'id' | 'name' | 'level' | 'classes' | 'spellcastingProfiles'
> & {
    stats: Pick<NonNullable<CharacterSheetFieldsFragment['stats']>, 'abilityScores'> | null;
};

/**
 * Selected class details derived from the current wizard state.
 */
export type LevelUpWizardSelectedClass = {
    classId: string;
    className: string;
    currentLevel: number;
    newLevel: number;
    isExistingClass: boolean;
    subclassId: string | null;
    subclassName: string | null;
};
