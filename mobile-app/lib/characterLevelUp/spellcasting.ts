import type {
    CharacterSpellbookEntryFieldsFragment,
    SpellSlot,
    SpellcastingProfile,
} from '@/types/generated_graphql_types';
import type { AbilityKey } from '@/lib/characterSheetUtils';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import type {
    LevelUpSpellSelection,
    LevelUpSpellSlotComparison,
    LevelUpSpellcastingState,
    LevelUpSpellcastingSummary,
    LevelUpWizardCharacter,
    LevelUpWizardSelectedClass,
} from './types';

/**
 * Standard multiclass spell-slot table keyed by effective caster level.
 */
const STANDARD_SPELL_SLOT_TABLE: ReadonlyArray<readonly number[]> = [
    [],
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/**
 * Half-caster single-class slot table keyed by class level.
 */
const HALF_CASTER_SINGLE_CLASS_SLOT_TABLE: ReadonlyArray<readonly number[]> = [
    [],
    [],
    [2, 0, 0, 0, 0],
    [3, 0, 0, 0, 0],
    [3, 0, 0, 0, 0],
    [4, 2, 0, 0, 0],
    [4, 2, 0, 0, 0],
    [4, 3, 0, 0, 0],
    [4, 3, 0, 0, 0],
    [4, 3, 2, 0, 0],
    [4, 3, 2, 0, 0],
    [4, 3, 3, 0, 0],
    [4, 3, 3, 0, 0],
    [4, 3, 3, 1, 0],
    [4, 3, 3, 1, 0],
    [4, 3, 3, 2, 0],
    [4, 3, 3, 2, 0],
    [4, 3, 3, 3, 1],
    [4, 3, 3, 3, 1],
    [4, 3, 3, 3, 2],
    [4, 3, 3, 3, 2],
];

/**
 * Warlock pact-magic slot table keyed by warlock level.
 */
const PACT_MAGIC_SLOT_TABLE: ReadonlyArray<{ level: number; total: number }> = [
    { level: 0, total: 0 },
    { level: 1, total: 1 },
    { level: 1, total: 2 },
    { level: 2, total: 2 },
    { level: 2, total: 2 },
    { level: 3, total: 2 },
    { level: 3, total: 2 },
    { level: 4, total: 2 },
    { level: 4, total: 2 },
    { level: 5, total: 2 },
    { level: 5, total: 2 },
    { level: 5, total: 3 },
    { level: 5, total: 3 },
    { level: 5, total: 3 },
    { level: 5, total: 3 },
    { level: 5, total: 3 },
    { level: 5, total: 3 },
    { level: 5, total: 4 },
    { level: 5, total: 4 },
    { level: 5, total: 4 },
    { level: 5, total: 4 },
];

/**
 * Spells-known progression keyed by class id and class level.
 */
const KNOWN_SPELLS_BY_CLASS_ID: Record<string, readonly number[]> = {
    bard: [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
    ranger: [0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
    sorcerer: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
    warlock: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
};

/**
 * Cantrip progression keyed by class id and class level.
 */
const CANTRIPS_KNOWN_BY_CLASS_ID: Record<string, readonly number[]> = {
    bard: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    cleric: [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    druid: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    sorcerer: [0, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    warlock: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    wizard: [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
};

/**
 * Class ids grouped by spellcasting rules.
 */
const FULL_CASTER_CLASS_IDS = new Set(['bard', 'cleric', 'druid', 'sorcerer', 'wizard']);
const HALF_CASTER_CLASS_IDS = new Set(['paladin', 'ranger']);
const KNOWN_CASTER_CLASS_IDS = new Set(['bard', 'ranger', 'sorcerer', 'warlock']);
const PREPARED_CASTER_CLASS_IDS = new Set(['cleric', 'druid', 'paladin']);

/**
 * Spellcasting ability keyed by class id for prepared-limit and profile previews.
 */
const SPELLCASTING_ABILITY_BY_CLASS_ID: Record<string, AbilityKey> = {
    bard: 'charisma',
    cleric: 'wisdom',
    druid: 'wisdom',
    paladin: 'charisma',
    ranger: 'wisdom',
    sorcerer: 'charisma',
    warlock: 'charisma',
    wizard: 'intelligence',
};

type ClassRow = LevelUpWizardCharacter['classes'][number];

/**
 * Returns a blank route-local spellcasting state.
 */
export function createLevelUpSpellcastingState(): LevelUpSpellcastingState {
    return {
        learnedSpells: [],
        cantripSpells: [],
        swapOutSpellId: null,
        swapReplacementSpell: null,
    };
}

/**
 * Builds the spellcasting summary for the selected class and current character state.
 */
export function buildLevelUpSpellcastingSummary(
    character: LevelUpWizardCharacter | null | undefined,
    selectedClass: LevelUpWizardSelectedClass,
): LevelUpSpellcastingSummary {
    if (!character) {
        return {
            mode: 'none',
            hasChanges: false,
            slotComparisons: [],
            previousMaxSpellLevel: 0,
            nextMaxSpellLevel: 0,
            newSpellLevelUnlocked: false,
            previousKnownSpells: null,
            nextKnownSpells: null,
            learnedSpellCount: 0,
            previousPreparedSpellLimit: null,
            nextPreparedSpellLimit: null,
            previousCantripsKnown: null,
            nextCantripsKnown: null,
            cantripCountGain: 0,
            eligibleSpellLevels: [],
            currentKnownSpells: [],
            currentKnownSpellIds: [],
        };
    }

    const previousClasses = character.classes;
    const nextClasses = applySelectedClassLevel(previousClasses, selectedClass);
    const previousSlotRows = deriveSpellSlotsForClasses(previousClasses);
    const nextSlotRows = deriveSpellSlotsForClasses(nextClasses);
    const slotComparisons = buildSpellSlotComparisons(previousSlotRows, nextSlotRows);
    const previousClassSlots = deriveClassSpellSlots(selectedClass.classId, selectedClass.currentLevel, selectedClass.subclassId);
    const nextClassSlots = deriveClassSpellSlots(selectedClass.classId, selectedClass.newLevel, selectedClass.subclassId);
    const previousMaxSpellLevel = highestSpellLevel(previousClassSlots);
    const nextMaxSpellLevel = highestSpellLevel(nextClassSlots);
    const previousKnownSpells = knownSpellCount(selectedClass.classId, selectedClass.currentLevel);
    const nextKnownSpells = knownSpellCount(selectedClass.classId, selectedClass.newLevel);
    const learnedSpellCount = selectedClass.classId === 'wizard'
        ? (selectedClass.newLevel >= 1 ? 2 : 0)
        : Math.max(0, (nextKnownSpells ?? 0) - (previousKnownSpells ?? 0));
    const previousCantripsKnown = cantripCount(selectedClass.classId, selectedClass.currentLevel);
    const nextCantripsKnown = cantripCount(selectedClass.classId, selectedClass.newLevel);
    const cantripCountGain = Math.max(0, (nextCantripsKnown ?? 0) - (previousCantripsKnown ?? 0));
    const currentKnownSpells = character.spellbook.filter((entry) => (
        entry.spell.classIndexes.includes(selectedClass.classId)
    ));
    const currentKnownSpellIds = currentKnownSpells.map((entry) => entry.spell.id);
    const previousPreparedSpellLimit = preparedSpellLimit(selectedClass.classId, selectedClass.currentLevel, character);
    const nextPreparedSpellLimit = preparedSpellLimit(selectedClass.classId, selectedClass.newLevel, character);
    const mode = spellcastingMode(selectedClass.classId);
    const hasChanges = slotComparisons.some((comparison) => comparison.changed)
        || learnedSpellCount > 0
        || cantripCountGain > 0
        || nextMaxSpellLevel > previousMaxSpellLevel
        || previousPreparedSpellLimit !== nextPreparedSpellLimit;

    return {
        mode,
        hasChanges,
        slotComparisons,
        previousMaxSpellLevel,
        nextMaxSpellLevel,
        newSpellLevelUnlocked: nextMaxSpellLevel > previousMaxSpellLevel,
        previousKnownSpells,
        nextKnownSpells,
        learnedSpellCount,
        previousPreparedSpellLimit,
        nextPreparedSpellLimit,
        previousCantripsKnown,
        nextCantripsKnown,
        cantripCountGain,
        eligibleSpellLevels: buildEligibleSpellLevels(nextMaxSpellLevel),
        currentKnownSpells,
        currentKnownSpellIds,
    };
}

/**
 * Returns whether the wizard can continue past spellcasting updates.
 */
export function canContinueFromSpellcastingUpdates(
    summary: LevelUpSpellcastingSummary,
    state: LevelUpSpellcastingState,
): boolean {
    if (!summary.hasChanges) {
        return true;
    }

    if (summary.learnedSpellCount > 0 && state.learnedSpells.length !== summary.learnedSpellCount) {
        return false;
    }

    if (summary.cantripCountGain > 0 && state.cantripSpells.length !== summary.cantripCountGain) {
        return false;
    }

    if (state.swapOutSpellId && state.swapReplacementSpell == null) {
        return false;
    }

    return true;
}

/**
 * Adds one spell to the requested local spell selection bucket.
 */
export function addLevelUpSpellSelection(
    state: LevelUpSpellcastingState,
    bucket: 'learnedSpells' | 'cantripSpells',
    spell: LevelUpSpellSelection,
    maximum: number,
): LevelUpSpellcastingState {
    const currentBucket = state[bucket].filter((currentSpell) => currentSpell.id !== spell.id);
    const nextBucket = [...currentBucket, spell].slice(0, maximum);

    return {
        ...state,
        [bucket]: nextBucket,
    };
}

/**
 * Removes one spell from the requested local spell selection bucket.
 */
export function removeLevelUpSpellSelection(
    state: LevelUpSpellcastingState,
    bucket: 'learnedSpells' | 'cantripSpells',
    spellId: string,
): LevelUpSpellcastingState {
    return {
        ...state,
        [bucket]: state[bucket].filter((spell) => spell.id !== spellId),
    };
}

/**
 * Selects or clears the currently swapped-out known spell.
 */
export function setLevelUpSwapOutSpell(
    state: LevelUpSpellcastingState,
    spellId: string | null,
): LevelUpSpellcastingState {
    if (spellId === state.swapOutSpellId) {
        return {
            ...state,
            swapOutSpellId: null,
            swapReplacementSpell: null,
        };
    }

    return {
        ...state,
        swapOutSpellId: spellId,
        swapReplacementSpell: null,
    };
}

/**
 * Sets the replacement spell chosen for an optional swap.
 */
export function setLevelUpSwapReplacementSpell(
    state: LevelUpSpellcastingState,
    spell: LevelUpSpellSelection | null,
): LevelUpSpellcastingState {
    return {
        ...state,
        swapReplacementSpell: spell,
    };
}

/**
 * Applies the selected spellcasting updates to a spellbook snapshot.
 */
export function applyLevelUpSpellbookChanges(
    spellbook: CharacterSpellbookEntryFieldsFragment[],
    state: LevelUpSpellcastingState,
): CharacterSpellbookEntryFieldsFragment[] {
    const nextSpellbook = state.swapOutSpellId
        ? spellbook.filter((entry) => entry.spell.id !== state.swapOutSpellId)
        : [...spellbook];

    const selectedSpells = [
        ...state.learnedSpells,
        ...state.cantripSpells,
        ...(state.swapReplacementSpell ? [state.swapReplacementSpell] : []),
    ];

    for (const spell of selectedSpells) {
        if (nextSpellbook.some((entry) => entry.spell.id === spell.id)) {
            continue;
        }

        nextSpellbook.push({
            __typename: 'CharacterSpell',
            prepared: false,
            spell: {
                __typename: 'Spell',
                id: spell.id,
                name: spell.name,
                level: spell.level,
                schoolIndex: spell.schoolIndex,
                classIndexes: spell.classIndexes,
                range: spell.range ?? null,
                concentration: spell.concentration,
                ritual: spell.ritual,
                castingTime: spell.castingTime,
            },
        });
    }

    return nextSpellbook;
}

/**
 * Derives preview spell slots from class rows after local draft changes.
 */
export function derivePreviewSpellSlots(
    classes: LevelUpWizardCharacter['classes'],
    currentSpellSlots: SpellSlot[] = [],
): SpellSlot[] {
    return deriveSpellSlotsForClasses(classes).map((slot) => {
        const previousSlot = currentSpellSlots.find((currentSlot) => (
            currentSlot.kind === slot.kind && currentSlot.level === slot.level
        ));

        return {
            __typename: 'SpellSlot',
            id: `draft-spell-slot-${slot.kind}-${slot.level}`,
            kind: slot.kind,
            level: slot.level,
            total: slot.total,
            used: Math.min(previousSlot?.used ?? 0, slot.total),
        };
    });
}

/**
 * Derives preview spellcasting profiles from class rows and ability scores.
 */
export function derivePreviewSpellcastingProfiles(
    classes: LevelUpWizardCharacter['classes'],
    abilityScores: NonNullable<LevelUpWizardCharacter['stats']>['abilityScores'],
): SpellcastingProfile[] {
    const totalLevel = classes.reduce((sum, classRow) => sum + classRow.level, 0);
    const proficiencyBonus = 2 + Math.floor(Math.max(0, totalLevel - 1) / 4);

    return classes
        .map((classRow) => {
            const spellcastingAbility = SPELLCASTING_ABILITY_BY_CLASS_ID[classRow.classId];
            const classSlots = deriveClassSpellSlots(classRow.classId, classRow.level, classRow.subclassId ?? null);
            const pactMagic = classRow.classId === 'warlock' && (PACT_MAGIC_SLOT_TABLE[classRow.level]?.total ?? 0) > 0;

            if (!spellcastingAbility) {
                return null;
            }

            if (highestSpellLevel(classSlots) === 0 && !pactMagic) {
                return null;
            }

            const abilityModifier = modifier(abilityScores[spellcastingAbility]);
            const spellAttackBonus = proficiencyBonus + abilityModifier;

            const profile: SpellcastingProfile = {
                __typename: 'SpellcastingProfile',
                classId: classRow.classId,
                className: classRow.className,
                subclassId: classRow.subclassId ?? null,
                subclassName: classRow.subclassName ?? null,
                classLevel: classRow.level,
                spellcastingAbility,
                spellSaveDC: 8 + spellAttackBonus,
                spellAttackBonus,
                slotKind: classRow.classId === 'warlock' ? 'PACT_MAGIC' as never : 'STANDARD' as never,
            };

            return profile;
        })
        .filter((profile): profile is SpellcastingProfile => profile != null);
}

/**
 * Returns the wizard-facing spellcasting mode for one class.
 */
function spellcastingMode(classId: string): LevelUpSpellcastingSummary['mode'] {
    if (classId === 'wizard') {
        return 'wizard';
    }

    if (KNOWN_CASTER_CLASS_IDS.has(classId)) {
        return 'known';
    }

    if (PREPARED_CASTER_CLASS_IDS.has(classId)) {
        return 'prepared';
    }

    return 'none';
}

/**
 * Returns known-spell count for one class level, when applicable.
 */
function knownSpellCount(classId: string, classLevel: number): number | null {
    const table = KNOWN_SPELLS_BY_CLASS_ID[classId];
    if (!table) {
        return null;
    }

    return table[classLevel] ?? 0;
}

/**
 * Returns cantrips-known count for one class level, when applicable.
 */
function cantripCount(classId: string, classLevel: number): number | null {
    const table = CANTRIPS_KNOWN_BY_CLASS_ID[classId];
    if (!table) {
        return null;
    }

    return table[classLevel] ?? 0;
}

/**
 * Returns the prepared-spell limit for one prepared caster, when applicable.
 */
function preparedSpellLimit(
    classId: string,
    classLevel: number,
    character: LevelUpWizardCharacter,
): number | null {
    const stats = character.stats;
    const abilityKey = SPELLCASTING_ABILITY_BY_CLASS_ID[classId];
    if (!stats || !abilityKey || !PREPARED_CASTER_CLASS_IDS.has(classId)) {
        return null;
    }

    const abilityScore = stats.abilityScores[abilityKey];
    const abilityModifier = modifier(abilityScore);
    const base = classId === 'paladin'
        ? Math.floor(classLevel / 2)
        : classLevel;

    return Math.max(1, base + abilityModifier);
}

/**
 * Returns the class-specific spell-slot totals used for spell-level eligibility.
 */
function deriveClassSpellSlots(
    classId: string,
    classLevel: number,
    subclassId: string | null,
): readonly number[] {
    if (FULL_CASTER_CLASS_IDS.has(classId)) {
        return STANDARD_SPELL_SLOT_TABLE[classLevel] ?? [];
    }

    if (HALF_CASTER_CLASS_IDS.has(classId)) {
        return HALF_CASTER_SINGLE_CLASS_SLOT_TABLE[classLevel] ?? [];
    }

    if (classId === 'warlock') {
        const pactMagic = PACT_MAGIC_SLOT_TABLE[classLevel] ?? { level: 0, total: 0 };
        if (pactMagic.level === 0 || pactMagic.total === 0) {
            return [];
        }

        const nextSlots = Array.from({ length: pactMagic.level }, (_, index) => (
            index + 1 === pactMagic.level ? pactMagic.total : 0
        ));

        return nextSlots;
    }

    if (classId === 'fighter' && subclassId === 'eldritch-knight') {
        return [];
    }

    if (classId === 'rogue' && subclassId === 'arcane-trickster') {
        return [];
    }

    return [];
}

/**
 * Applies the selected one-level class change to a class list.
 */
function applySelectedClassLevel(
    classes: readonly ClassRow[],
    selectedClass: LevelUpWizardSelectedClass,
): ClassRow[] {
    const existingClassIndex = classes.findIndex((classRow) => classRow.classId === selectedClass.classId);

    if (existingClassIndex === -1) {
        return [
            ...classes,
            {
                __typename: 'CharacterClass',
                id: `draft-class-${selectedClass.classId}`,
                classId: selectedClass.classId,
                className: selectedClass.className,
                subclassId: selectedClass.subclassId,
                subclassName: selectedClass.subclassName,
                level: 1,
                isStartingClass: false,
            },
        ];
    }

    return classes.map((classRow, classIndex) => (
        classIndex === existingClassIndex
            ? {
                ...classRow,
                level: classRow.level + 1,
                subclassId: selectedClass.subclassId,
                subclassName: selectedClass.subclassName,
            }
            : classRow
    ));
}

/**
 * Derives overall standard and pact spell slots for one class allocation.
 */
function deriveSpellSlotsForClasses(classes: readonly ClassRow[]): Array<Pick<SpellSlot, 'kind' | 'level' | 'total'>> {
    const spellSlots: Array<Pick<SpellSlot, 'kind' | 'level' | 'total'>> = [];
    const standardSlots = classes.length === 1
        ? deriveClassSpellSlots(classes[0]!.classId, classes[0]!.level, classes[0]!.subclassId ?? null)
        : (STANDARD_SPELL_SLOT_TABLE[deriveStandardCasterLevel(classes)] ?? []);

    for (const [index, total] of standardSlots.entries()) {
        if (total <= 0) {
            continue;
        }

        spellSlots.push({
            kind: 'STANDARD' as never,
            level: index + 1,
            total,
        });
    }

    const warlockLevel = classes.find((classRow) => classRow.classId === 'warlock')?.level ?? 0;
    const pactMagic = PACT_MAGIC_SLOT_TABLE[warlockLevel] ?? { level: 0, total: 0 };
    if (pactMagic.level > 0 && pactMagic.total > 0) {
        spellSlots.push({
            kind: 'PACT_MAGIC' as never,
            level: pactMagic.level,
            total: pactMagic.total,
        });
    }

    return spellSlots.sort((left, right) => {
        if (left.kind !== right.kind) {
            return left.kind === 'STANDARD' ? -1 : 1;
        }

        return left.level - right.level;
    });
}

/**
 * Returns the effective multiclass caster level for standard slots.
 */
function deriveStandardCasterLevel(classes: readonly ClassRow[]): number {
    let casterLevel = 0;

    for (const classRow of classes) {
        if (FULL_CASTER_CLASS_IDS.has(classRow.classId)) {
            casterLevel += classRow.level;
            continue;
        }

        if (HALF_CASTER_CLASS_IDS.has(classRow.classId)) {
            casterLevel += Math.floor(classRow.level / 2);
        }
    }

    return casterLevel;
}

/**
 * Builds before/after slot-comparison rows for the spellcasting step.
 */
function buildSpellSlotComparisons(
    previousSlots: Array<Pick<SpellSlot, 'kind' | 'level' | 'total'>>,
    nextSlots: Array<Pick<SpellSlot, 'kind' | 'level' | 'total'>>,
): LevelUpSpellSlotComparison[] {
    const keys = new Set<string>([
        ...previousSlots.map((slot) => `${slot.kind}-${slot.level}`),
        ...nextSlots.map((slot) => `${slot.kind}-${slot.level}`),
    ]);

    return Array.from(keys)
        .map((key) => {
            const [kind, levelValue] = key.split('-');
            const level = Number(levelValue);
            const previousTotal = previousSlots.find((slot) => slot.kind === kind && slot.level === level)?.total ?? 0;
            const nextTotal = nextSlots.find((slot) => slot.kind === kind && slot.level === level)?.total ?? 0;

            return {
                key,
                kind: kind as LevelUpSpellSlotComparison['kind'],
                level,
                previousTotal,
                nextTotal,
                changed: previousTotal !== nextTotal,
            };
        })
        .sort((left, right) => {
            if (left.kind !== right.kind) {
                return left.kind === 'STANDARD' ? -1 : 1;
            }

            return left.level - right.level;
        });
}

/**
 * Returns the highest spell level currently unlocked by one slot row.
 */
function highestSpellLevel(slots: readonly number[]): number {
    for (let index = slots.length - 1; index >= 0; index -= 1) {
        if ((slots[index] ?? 0) > 0) {
            return index + 1;
        }
    }

    return 0;
}

/**
 * Builds the list of selectable spell levels for the add-spell sheet.
 */
function buildEligibleSpellLevels(maxSpellLevel: number): number[] {
    if (maxSpellLevel <= 0) {
        return [];
    }

    return Array.from({ length: maxSpellLevel }, (_, index) => index + 1);
}

/**
 * Returns the 5e ability modifier for a score.
 */
function modifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Returns the display name for one class id.
 */
export function classDisplayName(classId: string): string {
    return CLASS_OPTIONS.find((option) => option.value === classId)?.label ?? classId;
}
