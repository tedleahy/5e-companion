import type {
    CharacterSheetDraft,
    CharacterSheetDraftClass,
} from '@/lib/character-sheet/characterSheetDraft';
import { createDraftEntityId } from '@/lib/character-sheet/characterSheetDraft';
import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import type {
    LevelUpAsiOrFeatState,
    LevelUpFeature,
    LevelUpHitPointsState,
    LevelUpWizardSelectedClass,
} from './types';

/**
 * Maximum score allowed after applying this chunk's ASI / feat bonuses.
 */
const LEVEL_UP_SCORE_CAP = 20;

/**
 * Payload required to apply the currently implemented level-up results.
 */
export type ApplyLevelUpDraftInput = {
    selectedClass: LevelUpWizardSelectedClass;
    hitPointsState: LevelUpHitPointsState;
    asiOrFeatState: LevelUpAsiOrFeatState | null;
    features: LevelUpFeature[];
};

/**
 * Applies the current level-up result into the local character-sheet draft.
 */
export function applyLevelUpToDraft(
    draft: CharacterSheetDraft,
    input: ApplyLevelUpDraftInput,
): CharacterSheetDraft {
    const classes = applyLevelUpClasses(draft.classes, input.selectedClass);
    const abilityScores = applyLevelUpAbilityScores(draft.abilityScores, input.asiOrFeatState);
    const hp = {
        ...draft.hp,
        current: draft.hp.current + input.hitPointsState.hpGained,
        max: draft.hp.max + input.hitPointsState.hpGained,
    };

    return {
        ...draft,
        level: draft.level + 1,
        classes,
        abilityScores,
        hp,
        features: applyLevelUpFeatures(draft.features, input.asiOrFeatState, input.features),
    };
}

/**
 * Applies the one-level class gain for the chosen class.
 */
function applyLevelUpClasses(
    classes: CharacterSheetDraftClass[],
    selectedClass: LevelUpWizardSelectedClass,
): CharacterSheetDraftClass[] {
    const existingClassIndex = classes.findIndex((classRow) => classRow.classId === selectedClass.classId);

    if (existingClassIndex >= 0) {
        return classes.map((classRow, classIndex) => (
            classIndex === existingClassIndex
                ? {
                    ...classRow,
                    level: classRow.level + 1,
                    subclassId: selectedClass.subclassId,
                    subclassName: selectedClass.subclassName,
                    customSubclass: selectedClass.customSubclass ?? null,
                }
                : classRow
        ));
    }

    return [
        ...classes,
        {
            id: createDraftEntityId('class'),
            classId: selectedClass.classId,
            className: selectedClass.className,
            subclassId: selectedClass.subclassId,
            subclassName: selectedClass.subclassName,
            customSubclass: selectedClass.customSubclass ?? null,
            level: 1,
            isStartingClass: false,
        },
    ];
}

/**
 * Applies ASI or feat-driven ability-score increases into the draft.
 */
function applyLevelUpAbilityScores(
    abilityScores: CharacterSheetDraft['abilityScores'],
    asiOrFeatState: LevelUpAsiOrFeatState | null,
): CharacterSheetDraft['abilityScores'] {
    if (asiOrFeatState == null) {
        return abilityScores;
    }

    const nextScores = { ...abilityScores };

    if (asiOrFeatState.mode === 'asi') {
        for (const ability of ABILITY_KEYS) {
            nextScores[ability] = clampLevelUpScore(
                nextScores[ability] + asiOrFeatState.allocations[ability],
            );
        }

        return nextScores;
    }

    if (asiOrFeatState.feat.abilityIncrease) {
        const ability = asiOrFeatState.feat.abilityIncrease;
        nextScores[ability] = clampLevelUpScore(nextScores[ability] + 1);
    }

    return nextScores;
}

/**
 * Adds level-up-created features to the existing draft feature list.
 */
function applyLevelUpFeatures(
    existingFeatures: CharacterSheetDraft['features'],
    asiOrFeatState: LevelUpAsiOrFeatState | null,
    features: LevelUpFeature[],
): CharacterSheetDraft['features'] {
    const nextFeatures = [...existingFeatures];

    if (asiOrFeatState != null && asiOrFeatState.mode === 'feat') {
        nextFeatures.push({
            id: createDraftEntityId('feature'),
            name: asiOrFeatState.feat.name.trim(),
            source: 'Feat',
            description: featDescriptionWithAbilityIncrease(
                asiOrFeatState.feat.description,
                asiOrFeatState.feat.abilityIncrease,
            ),
            usesMax: null,
            usesRemaining: null,
            recharge: null,
            customSubclassFeature: null,
        });
    }

    for (const feature of features) {
        nextFeatures.push({
            id: createDraftEntityId('feature'),
            name: feature.name.trim(),
            source: feature.source,
            description: feature.description.trim(),
            usesMax: null,
            usesRemaining: null,
            recharge: null,
            customSubclassFeature: feature.customSubclassFeature,
        });
    }

    return nextFeatures;
}

/**
 * Appends the optional feat ability increase to the saved feature text.
 */
function featDescriptionWithAbilityIncrease(
    description: string,
    abilityIncrease: AbilityKey | null,
): string {
    const trimmedDescription = description.trim();

    if (abilityIncrease == null) {
        return trimmedDescription;
    }

    const label = abilityIncreaseLabel(abilityIncrease);

    if (trimmedDescription.length === 0) {
        return `${label} +1`;
    }

    return `${trimmedDescription}\n\n${label} +1`;
}

/**
 * Returns the UI label for one ability name.
 */
function abilityIncreaseLabel(ability: AbilityKey): string {
    return ability.charAt(0).toUpperCase() + ability.slice(1);
}

/**
 * Enforces the standard 5e level-up ability-score cap used in this chunk.
 */
function clampLevelUpScore(value: number): number {
    return Math.min(LEVEL_UP_SCORE_CAP, value);
}
