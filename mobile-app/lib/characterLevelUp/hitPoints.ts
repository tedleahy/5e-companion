import { HIT_DIE_MAP } from '@/lib/characterCreation/classRules';
import { abilityModifier } from '@/lib/characterSheetUtils';
import type { LevelUpHitPointsMethod, LevelUpHitPointsState } from './types';

/**
 * Returns the hit-die size used by one class during level-up.
 */
export function levelUpHitDieSize(classId: string): number {
    return HIT_DIE_MAP[classId] ?? 0;
}

/**
 * Returns the fixed-average HP value for one class hit die.
 *
 * In 5e this is `floor(dieSize / 2) + 1`.
 */
export function averageLevelUpHitDieValue(classId: string): number {
    const hitDieSize = levelUpHitDieSize(classId);

    if (hitDieSize <= 0) {
        return 1;
    }

    return Math.floor(hitDieSize / 2) + 1;
}

/**
 * Rolls one class hit die using the provided random source.
 */
export function rollLevelUpHitDieValue(
    classId: string,
    randomSource: () => number = Math.random,
): number {
    const hitDieSize = levelUpHitDieSize(classId);

    if (hitDieSize <= 0) {
        return 1;
    }

    return Math.floor(randomSource() * hitDieSize) + 1;
}

/**
 * Applies the D&D minimum-one HP gain rule after Constitution.
 */
export function calculateLevelUpHpGain(
    hitDieValue: number,
    constitutionModifier: number,
): number {
    return Math.max(1, hitDieValue + constitutionModifier);
}

/**
 * Builds the stored HP-gain result for the active level-up class.
 */
export function createLevelUpHitPointsState(
    classId: string,
    constitutionScore: number,
    method: LevelUpHitPointsMethod,
    randomSource?: () => number,
): LevelUpHitPointsState {
    const hitDieSize = levelUpHitDieSize(classId);
    const constitutionModifier = abilityModifier(constitutionScore);
    const hitDieValue = method === 'average'
        ? averageLevelUpHitDieValue(classId)
        : rollLevelUpHitDieValue(classId, randomSource);

    return {
        method,
        hitDieSize,
        hitDieValue,
        constitutionModifier,
        hpGained: calculateLevelUpHpGain(hitDieValue, constitutionModifier),
    };
}
