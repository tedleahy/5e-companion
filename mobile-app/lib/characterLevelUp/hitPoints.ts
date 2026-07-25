import { HIT_DIE_MAP } from '@/lib/characterCreation/classRules';
import { abilityModifier } from '@/lib/characterSheetUtils';
import type { LevelUpHitPointsMethod, LevelUpHitPointsState } from './types';

/**
 * Resolves the hit-die size from a configured class definition, falling back to SRD maps.
 */
export function resolveLevelUpHitDieSize(
    classId: string,
    configuredHitDieSize?: number | null,
): number {
    if (configuredHitDieSize != null && configuredHitDieSize > 0) {
        return configuredHitDieSize;
    }

    return HIT_DIE_MAP[classId] ?? 0;
}

/**
 * Returns the hit-die size used by one class during level-up.
 */
export function levelUpHitDieSize(
    classId: string,
    configuredHitDieSize?: number | null,
): number {
    return resolveLevelUpHitDieSize(classId, configuredHitDieSize);
}

/**
 * Returns the display label for one hit-die size (e.g. `d10`), or `d?` when unknown.
 */
export function levelUpHitDieLabelFromSize(hitDieSize: number): string {
    if (hitDieSize <= 0) {
        return 'd?';
    }

    return `d${hitDieSize}`;
}

/**
 * Formats the hit-die label from a class id and optional configured custom hit die.
 */
export function formatLevelUpHitDieLabel(
    classId: string,
    configuredHitDieSize?: number | null,
): string {
    return levelUpHitDieLabelFromSize(resolveLevelUpHitDieSize(classId, configuredHitDieSize));
}

/**
 * Returns the fixed-average HP value for one hit-die size.
 *
 * In 5e this is `floor(dieSize / 2) + 1`.
 */
export function averageLevelUpHitDieValueFromSize(hitDieSize: number): number {
    if (hitDieSize <= 0) {
        return 1;
    }

    return Math.floor(hitDieSize / 2) + 1;
}

/**
 * Returns the fixed-average HP value for one class hit die.
 *
 * In 5e this is `floor(dieSize / 2) + 1`.
 */
export function averageLevelUpHitDieValue(
    classId: string,
    configuredHitDieSize?: number | null,
): number {
    return averageLevelUpHitDieValueFromSize(resolveLevelUpHitDieSize(classId, configuredHitDieSize));
}

/**
 * Rolls one class hit die using the provided random source.
 */
export function rollLevelUpHitDieValue(
    classId: string,
    randomSource: () => number = Math.random,
    configuredHitDieSize?: number | null,
): number {
    const hitDieSize = resolveLevelUpHitDieSize(classId, configuredHitDieSize);

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
    configuredHitDieSize?: number,
): LevelUpHitPointsState {
    const hitDieSize = resolveLevelUpHitDieSize(classId, configuredHitDieSize);
    const constitutionModifier = abilityModifier(constitutionScore);
    const hitDieValue = method === 'average'
        ? averageLevelUpHitDieValueFromSize(hitDieSize)
        : rollLevelUpHitDieValue(classId, randomSource ?? Math.random, configuredHitDieSize);

    return {
        method,
        hitDieSize,
        hitDieValue,
        constitutionModifier,
        hpGained: calculateLevelUpHpGain(hitDieValue, constitutionModifier),
    };
}
