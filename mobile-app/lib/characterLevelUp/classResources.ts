/**
 * One resource change shown in the class resources step.
 */
export type ClassResourceChange = {
    key: string;
    label: string;
    previousValue: string;
    nextValue: string;
    changed: boolean;
};

/**
 * Barbarian rage count by class level.
 */
function barbarianRages(level: number): number | null {
    if (level < 1) return null;
    if (level >= 20) return Infinity;
    if (level >= 17) return 6;
    if (level >= 12) return 5;
    if (level >= 6) return 4;
    if (level >= 3) return 3;
    return 2;
}

/**
 * Barbarian rage damage bonus by class level.
 */
function barbarianRageDamage(level: number): number | null {
    if (level < 1) return null;
    if (level >= 16) return 4;
    if (level >= 9) return 3;
    return 2;
}

/**
 * Monk martial arts die by class level.
 */
function monkMartialArtsDie(level: number): string | null {
    if (level < 1) return null;
    if (level >= 17) return '1d10';
    if (level >= 11) return '1d8';
    if (level >= 5) return '1d6';
    return '1d4';
}

/**
 * Monk ki points by class level (equal to level, available from level 2).
 */
function monkKiPoints(level: number): number | null {
    if (level < 2) return null;
    return level;
}

/**
 * Monk unarmoured movement bonus by class level.
 */
function monkUnarmouredMovement(level: number): string | null {
    if (level < 2) return null;
    if (level >= 18) return '+30 ft';
    if (level >= 14) return '+25 ft';
    if (level >= 10) return '+20 ft';
    if (level >= 6) return '+15 ft';
    return '+10 ft';
}

/**
 * Rogue sneak attack dice by class level.
 */
function rogueSneakAttack(level: number): string | null {
    if (level < 1) return null;
    const dice = Math.ceil(level / 2);
    return `${dice}d6`;
}

/**
 * Sorcerer sorcery points by class level (equal to level, available from level 2).
 */
function sorcererSorceryPoints(level: number): number | null {
    if (level < 2) return null;
    return level;
}

/**
 * Warlock invocations known by class level.
 */
function warlockInvocations(level: number): number | null {
    if (level < 2) return null;
    if (level >= 18) return 8;
    if (level >= 15) return 7;
    if (level >= 12) return 6;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    return 2;
}

/**
 * Resource progression definitions keyed by class id.
 * Each entry is a function returning resource values at a given level.
 */
type ResourceDefinition = {
    key: string;
    label: string;
    valueAt: (level: number) => string | number | null;
};

const CLASS_RESOURCE_DEFINITIONS: Record<string, ResourceDefinition[]> = {
    barbarian: [
        {
            key: 'barbarian-rages',
            label: 'Rages',
            valueAt: (level) => {
                const rages = barbarianRages(level);
                if (rages == null) return null;
                return rages === Infinity ? '∞' : rages;
            },
        },
        {
            key: 'barbarian-rage-damage',
            label: 'Rage Damage',
            valueAt: (level) => {
                const damage = barbarianRageDamage(level);
                return damage == null ? null : `+${damage}`;
            },
        },
    ],
    monk: [
        {
            key: 'monk-martial-arts',
            label: 'Martial Arts',
            valueAt: monkMartialArtsDie,
        },
        {
            key: 'monk-ki',
            label: 'Ki Points',
            valueAt: monkKiPoints,
        },
        {
            key: 'monk-movement',
            label: 'Unarmoured Movement',
            valueAt: monkUnarmouredMovement,
        },
    ],
    rogue: [
        {
            key: 'rogue-sneak-attack',
            label: 'Sneak Attack',
            valueAt: rogueSneakAttack,
        },
    ],
    sorcerer: [
        {
            key: 'sorcerer-sorcery-points',
            label: 'Sorcery Points',
            valueAt: sorcererSorceryPoints,
        },
    ],
    warlock: [
        {
            key: 'warlock-invocations',
            label: 'Invocations Known',
            valueAt: warlockInvocations,
        },
    ],
};

/**
 * Formats a resource value to a display string.
 */
function formatResourceValue(value: string | number | null): string {
    if (value == null) return '—';
    return String(value);
}

/**
 * Returns the list of resource changes for a given class levelling from
 * currentLevel to newLevel.
 */
export function getClassResourceChanges(classId: string, currentLevel: number, newLevel: number): ClassResourceChange[] {
    const definitions = CLASS_RESOURCE_DEFINITIONS[classId];

    if (!definitions) {
        return [];
    }

    return definitions.map((definition) => {
        const previousRaw = definition.valueAt(currentLevel);
        const nextRaw = definition.valueAt(newLevel);
        const previousValue = formatResourceValue(previousRaw);
        const nextValue = formatResourceValue(nextRaw);

        return {
            key: definition.key,
            label: definition.label,
            previousValue,
            nextValue,
            changed: previousValue !== nextValue,
        };
    });
}

/**
 * Returns whether any class resources change at the given level transition.
 */
export function hasClassResourceChanges(classId: string, currentLevel: number, newLevel: number): boolean {
    return getClassResourceChanges(classId, currentLevel, newLevel).some((change) => change.changed);
}
