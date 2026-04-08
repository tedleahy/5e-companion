import type { CharacterSheetFieldsFragment } from '@/types/generated_graphql_types';
import type { AbilityKey } from '@/lib/characterSheetUtils';
import type { AvailableSubclassFeature } from '@/lib/subclasses';

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
    stats: Pick<NonNullable<CharacterSheetFieldsFragment['stats']>, 'abilityScores' | 'hp'> | null;
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
    subclassDescription: string | null;
    subclassIsCustom: boolean;
    subclassFeatures: AvailableSubclassFeature[];
    customSubclass: {
        name: string;
        description: string;
    } | null;
};

/**
 * One supported hit-points selection mode for the level-up wizard.
 */
export type LevelUpHitPointsMethod = 'roll' | 'average';

/**
 * Captured hit-points result for the current level-up session.
 */
export type LevelUpHitPointsState = {
    method: LevelUpHitPointsMethod;
    hitDieSize: number;
    hitDieValue: number;
    constitutionModifier: number;
    hpGained: number;
};

/**
 * Active mode for the ASI / feat step.
 */
export type LevelUpAsiOrFeatMode = 'asi' | 'feat';

/**
 * Per-ability ASI increases assigned during one level-up.
 */
export type LevelUpAsiAllocation = Record<AbilityKey, number>;

/**
 * Captured custom feat draft for one level-up.
 */
export type LevelUpFeatState = {
    name: string;
    description: string;
    abilityIncrease: AbilityKey | null;
};

/**
 * Route-local state for the ASI / feat step.
 */
export type LevelUpAsiOrFeatState = {
    mode: LevelUpAsiOrFeatMode;
    allocations: LevelUpAsiAllocation;
    feat: LevelUpFeatState;
};

/**
 * Choose-class step display mode.
 */
export type LevelUpClassSelectionMode = 'current_class' | 'multiclass_picker';

/**
 * Route-local choose-class step state.
 */
export type LevelUpClassSelectionState = {
    currentClassId: string;
    mode: LevelUpClassSelectionMode;
    selectedClassId: string | null;
};

/**
 * Supported subclass selection modes for the level-up flow.
 */
export type LevelUpSubclassSelectionMode = 'none' | 'srd' | 'custom';

/**
 * Route-local subclass selection state.
 */
export type LevelUpSubclassSelectionState = {
    mode: LevelUpSubclassSelectionMode;
    selectedSubclassId: string | null;
    selectedSubclassName: string | null;
    selectedSubclassDescription: string;
    selectedSubclassIsCustom: boolean;
    selectedSubclassFeatures: AvailableSubclassFeature[];
    customSubclassName: string;
    customSubclassDescription: string;
};

/**
 * One custom subclass feature drafted during the level-up flow.
 */
export type LevelUpCustomFeatureDraft = {
    id: string;
    name: string;
    description: string;
};

/**
 * One display-ready class or subclass feature shown in the wizard.
 */
export type LevelUpFeature = {
    key: string;
    name: string;
    description: string;
    source: string;
    classId: string;
    level: number;
    subclassId: string | null;
    subclassName: string | null;
    kind: 'class' | 'subclass' | 'spell_slot' | 'custom';
    customSubclassFeature: {
        classId: string;
        level: number;
    } | null;
};
