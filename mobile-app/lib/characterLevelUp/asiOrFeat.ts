import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import type {
    LevelUpAsiAllocation,
    LevelUpAsiOrFeatMode,
    LevelUpAsiOrFeatState,
} from './types';

/**
 * Maximum ASI points granted by one standard level-up.
 */
export const LEVEL_UP_ASI_TOTAL_POINTS = 2;

/**
 * Maximum points that may be assigned to one ability in a single ASI.
 */
export const LEVEL_UP_ASI_MAX_PER_ABILITY = 2;

/**
 * Highest legal post-ASI ability score in standard 5e levelling.
 */
export const LEVEL_UP_ASI_SCORE_CAP = 20;

/**
 * Human-readable ability labels for the ASI / feat step UI.
 */
export const LEVEL_UP_ABILITY_LABELS: Record<AbilityKey, string> = {
    strength: 'Strength',
    dexterity: 'Dexterity',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    charisma: 'Charisma',
};

/**
 * Returns an empty ASI allocation object in standard ability order.
 */
export function createEmptyAsiAllocation(): LevelUpAsiAllocation {
    return ABILITY_KEYS.reduce((allocation, ability) => {
        allocation[ability] = 0;
        return allocation;
    }, {} as LevelUpAsiAllocation);
}

/**
 * Creates the default state for the ASI / feat step.
 */
export function createLevelUpAsiOrFeatState(): LevelUpAsiOrFeatState {
    return {
        mode: 'asi',
        allocations: createEmptyAsiAllocation(),
        feat: {
            name: '',
            description: '',
            abilityIncrease: null,
        },
    };
}

/**
 * Returns the total ASI points currently allocated across all abilities.
 */
export function allocatedLevelUpAsiPoints(
    allocations: LevelUpAsiAllocation,
): number {
    return ABILITY_KEYS.reduce((total, ability) => total + allocations[ability], 0);
}

/**
 * Returns the remaining ASI points available for allocation.
 */
export function remainingLevelUpAsiPoints(
    allocations: LevelUpAsiAllocation,
): number {
    return LEVEL_UP_ASI_TOTAL_POINTS - allocatedLevelUpAsiPoints(allocations);
}

/**
 * Returns whether one ability can be increased by another point.
 */
export function canIncreaseLevelUpAbilityScore(
    allocations: LevelUpAsiAllocation,
    ability: AbilityKey,
    baseScore: number,
): boolean {
    const currentIncrease = allocations[ability];

    if (remainingLevelUpAsiPoints(allocations) <= 0) {
        return false;
    }

    if (currentIncrease >= LEVEL_UP_ASI_MAX_PER_ABILITY) {
        return false;
    }

    return baseScore + currentIncrease + 1 <= LEVEL_UP_ASI_SCORE_CAP;
}

/**
 * Returns whether one ability can be reduced by one allocated ASI point.
 */
export function canDecreaseLevelUpAbilityScore(
    allocations: LevelUpAsiAllocation,
    ability: AbilityKey,
): boolean {
    return allocations[ability] > 0;
}

/**
 * Applies one ASI increment when it remains within the allocation rules.
 */
export function incrementLevelUpAsiAllocation(
    state: LevelUpAsiOrFeatState,
    ability: AbilityKey,
    baseScore: number,
): LevelUpAsiOrFeatState {
    if (!canIncreaseLevelUpAbilityScore(state.allocations, ability, baseScore)) {
        return state;
    }

    return {
        ...state,
        allocations: {
            ...state.allocations,
            [ability]: state.allocations[ability] + 1,
        },
    };
}

/**
 * Removes one allocated ASI point from the chosen ability when possible.
 */
export function decrementLevelUpAsiAllocation(
    state: LevelUpAsiOrFeatState,
    ability: AbilityKey,
): LevelUpAsiOrFeatState {
    if (!canDecreaseLevelUpAbilityScore(state.allocations, ability)) {
        return state;
    }

    return {
        ...state,
        allocations: {
            ...state.allocations,
            [ability]: state.allocations[ability] - 1,
        },
    };
}

/**
 * Switches the ASI / feat step between its two top-level modes.
 */
export function setLevelUpAsiOrFeatMode(
    state: LevelUpAsiOrFeatState,
    mode: LevelUpAsiOrFeatMode,
): LevelUpAsiOrFeatState {
    if (state.mode === mode) {
        return state;
    }

    return {
        ...state,
        mode,
    };
}

/**
 * Stores the current custom feat name.
 */
export function setLevelUpFeatName(
    state: LevelUpAsiOrFeatState,
    name: string,
): LevelUpAsiOrFeatState {
    return {
        ...state,
        feat: {
            ...state.feat,
            name,
        },
    };
}

/**
 * Stores the current custom feat description.
 */
export function setLevelUpFeatDescription(
    state: LevelUpAsiOrFeatState,
    description: string,
): LevelUpAsiOrFeatState {
    return {
        ...state,
        feat: {
            ...state.feat,
            description,
        },
    };
}

/**
 * Stores the optional +1 ability increase chosen for a custom feat.
 */
export function setLevelUpFeatAbilityIncrease(
    state: LevelUpAsiOrFeatState,
    ability: AbilityKey | null,
): LevelUpAsiOrFeatState {
    return {
        ...state,
        feat: {
            ...state.feat,
            abilityIncrease: ability,
        },
    };
}

/**
 * Returns whether the current ASI / feat state is complete enough to continue.
 */
export function canContinueFromAsiOrFeat(
    state: LevelUpAsiOrFeatState,
): boolean {
    if (state.mode === 'asi') {
        return remainingLevelUpAsiPoints(state.allocations) === 0;
    }

    return state.feat.name.trim().length > 0 && state.feat.description.trim().length > 0;
}
