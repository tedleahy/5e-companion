import { ProficiencyType } from "@prisma/client";

/**
 * Ability score record used by derived multiclass calculations.
 */
export type CharacterAbilityScores = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
};

/**
 * Raw class row submitted when creating a character.
 */
export type CharacterClassAllocation = {
    classId: string;
    subclassId?: string | null;
    level: number;
};

/**
 * Minimal class reference data needed for multiclass derivation.
 */
export type CharacterClassReference = {
    id: string;
    srdIndex: string | null;
    name: string;
    hitDie: number | null;
    spellcastingAbility: string | null;
    proficiencies?: Array<{
        srdIndex: string | null;
        name: string;
        type: ProficiencyType;
    }>;
};

/**
 * Minimal subclass reference data needed for multiclass derivation.
 */
export type CharacterSubclassReference = {
    id: string;
    srdIndex: string | null;
    name: string;
    classId: string;
};

/**
 * Normalised class row paired with resolved DB references.
 */
export type ResolvedCharacterClass = {
    classRow: CharacterClassAllocation;
    classRef: CharacterClassReference;
    subclassRef: CharacterSubclassReference | null;
};

/**
 * Display-ready hit-dice pool derived from a class row.
 */
export type DerivedHitDicePool = {
    classId: string;
    total: number;
    remaining: number;
    die: string;
};

/**
 * Persisted spell-slot row derived from multiclass spellcasting rules.
 */
export type DerivedSpellSlot = {
    kind: 'STANDARD' | 'PACT_MAGIC';
    level: number;
    total: number;
    used: number;
};

/**
 * Derived spellcasting profile exposed by GraphQL.
 */
export type DerivedSpellcastingProfile = {
    classId: string;
    className: string;
    subclassId: string | null;
    subclassName: string | null;
    classLevel: number;
    spellcastingAbility: keyof CharacterAbilityScores;
    spellSaveDC: number;
    spellAttackBonus: number;
    slotKind: 'STANDARD' | 'PACT_MAGIC';
};

/**
 * Deterministic armour / weapon / tool proficiency labels for multiclassing.
 */
export type DerivedNamedProficiencies = {
    armor: string[];
    weapons: string[];
    tools: string[];
};

/**
 * Subclass unlock levels for 2014 PHB/SRD classes.
 */
export const SUBCLASS_UNLOCK_LEVEL_BY_CLASS_SRD_INDEX: Record<string, number> = {
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
 * Multiclass-only non-skill proficiencies granted when adding a new class.
 */
export const MULTICLASS_PROFICIENCIES_BY_CLASS_SRD_INDEX: Record<string, DerivedNamedProficiencies> = {
    barbarian: {
        armor: ['Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
    },
    bard: {
        armor: ['Light armour'],
        weapons: ['Simple weapons'],
        tools: ['One musical instrument of your choice'],
    },
    cleric: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: [],
        tools: [],
    },
    druid: {
        armor: ['Light armour', 'Medium armour', 'Shields (non-metal)'],
        weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
        tools: ['Herbalism kit'],
    },
    fighter: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
    },
    monk: {
        armor: [],
        weapons: ['Simple weapons', 'Shortswords'],
        tools: [],
    },
    paladin: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
    },
    ranger: {
        armor: ['Light armour', 'Medium armour', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: [],
    },
    rogue: {
        armor: ['Light armour'],
        weapons: [],
        tools: ["Thieves' tools"],
    },
    sorcerer: {
        armor: [],
        weapons: [],
        tools: [],
    },
    warlock: {
        armor: ['Light armour'],
        weapons: ['Simple weapons'],
        tools: [],
    },
    wizard: {
        armor: [],
        weapons: [],
        tools: [],
    },
};

/**
 * Standard multiclass spell-slot table keyed by effective caster level.
 */
export const STANDARD_SPELL_SLOT_TABLE: ReadonlyArray<readonly number[]> = [
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
 * Half-caster single-class slot progression keyed by class level.
 */
export const HALF_CASTER_SINGLE_CLASS_SLOT_TABLE: ReadonlyArray<readonly number[]> = [
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
 * Third-caster single-class slot progression keyed by class level.
 */
export const THIRD_CASTER_SINGLE_CLASS_SLOT_TABLE: ReadonlyArray<readonly number[]> = [
    [],
    [],
    [],
    [2, 0, 0, 0],
    [3, 0, 0, 0],
    [3, 0, 0, 0],
    [3, 0, 0, 0],
    [4, 2, 0, 0],
    [4, 2, 0, 0],
    [4, 2, 0, 0],
    [4, 3, 0, 0],
    [4, 3, 0, 0],
    [4, 3, 0, 0],
    [4, 3, 2, 0],
    [4, 3, 2, 0],
    [4, 3, 2, 0],
    [4, 3, 3, 0],
    [4, 3, 3, 0],
    [4, 3, 3, 0],
    [4, 3, 3, 1],
    [4, 3, 3, 1],
];

/**
 * Warlock pact-magic slot progression keyed by warlock level.
 */
export const PACT_MAGIC_SLOT_TABLE: ReadonlyArray<{ level: number; total: number }> = [
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
 * Abilities stored on class refs use short SRD identifiers; GraphQL uses long names.
 */
const ABILITY_KEY_BY_SRD_INDEX: Record<string, keyof CharacterAbilityScores> = {
    str: 'strength',
    dex: 'dexterity',
    con: 'constitution',
    int: 'intelligence',
    wis: 'wisdom',
    cha: 'charisma',
};

/**
 * Full casters contribute one slot-caster level per class level.
 */
const FULL_CASTER_CLASS_IDS = new Set(['bard', 'cleric', 'druid', 'sorcerer', 'wizard']);

/**
 * Half casters contribute half their class level, rounded down.
 */
const HALF_CASTER_CLASS_IDS = new Set(['paladin', 'ranger']);

/**
 * Third casters only contribute when the subclass grants spellcasting.
 */
const THIRD_CASTER_SUBCLASS_IDS = new Set(['eldritch-knight', 'arcane-trickster']);

/**
 * Standard spellcasting classes unlock Spellcasting at these class levels.
 */
const SPELLCASTING_UNLOCK_LEVEL_BY_CLASS_SRD_INDEX: Record<string, number> = {
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
 * Returns the 5e ability modifier for an ability score.
 */
export function abilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Returns the total character level from ordered class rows.
 */
export function deriveTotalLevel(classRows: CharacterClassAllocation[]): number {
    return classRows.reduce((total, classRow) => total + classRow.level, 0);
}

/**
 * Returns the standard 5e proficiency bonus for a character level.
 */
export function deriveProficiencyBonus(totalLevel: number): number {
    return 2 + Math.floor(Math.max(0, totalLevel - 1) / 4);
}

/**
 * Validates class rows, subclass ownership, duplicate classes, and starting class rules.
 */
export function validateClassAllocations(
    classRows: CharacterClassAllocation[],
    classRefsBySrdIndex: Map<string, CharacterClassReference>,
    subclassRefsBySrdIndex: Map<string, CharacterSubclassReference>,
    startingClassIndex: number,
) {
    if (classRows.length === 0) {
        throw new Error('At least one class row is required.');
    }

    if (startingClassIndex < 0 || startingClassIndex >= classRows.length) {
        throw new Error('Starting class index is out of range.');
    }

    const seenClassIds = new Set<string>();

    for (const classRow of classRows) {
        if (!Number.isInteger(classRow.level) || classRow.level < 1) {
            throw new Error('Each class row level must be an integer of at least 1.');
        }

        if (seenClassIds.has(classRow.classId)) {
            throw new Error('Duplicate class rows are not allowed.');
        }

        seenClassIds.add(classRow.classId);

        const classRef = classRefsBySrdIndex.get(classRow.classId);
        if (!classRef) {
            throw new Error(`Unknown class: ${classRow.classId}`);
        }

        const unlockLevel = SUBCLASS_UNLOCK_LEVEL_BY_CLASS_SRD_INDEX[classRow.classId] ?? 3;

        if (!classRow.subclassId) {
            if (classRow.level >= unlockLevel) {
                throw new Error(`Class ${classRow.classId} requires a subclass at level ${unlockLevel}.`);
            }

            continue;
        }

        const subclassRef = subclassRefsBySrdIndex.get(classRow.subclassId);
        if (!subclassRef) {
            throw new Error(`Unknown subclass: ${classRow.subclassId}`);
        }

        if (subclassRef.classId !== classRef.id) {
            throw new Error(`Subclass ${classRow.subclassId} does not belong to class ${classRow.classId}.`);
        }

        if (classRow.level < unlockLevel) {
            throw new Error(
                `Subclass ${classRow.subclassId} requires ${classRow.classId} level ${unlockLevel}.`,
            );
        }
    }

    if (deriveTotalLevel(classRows) === 1 && classRows.length !== 1) {
        throw new Error('Level 1 characters must have exactly one class row.');
    }
}

/**
 * Pairs ordered class rows with their resolved DB references.
 */
export function resolveCharacterClasses(
    classRows: CharacterClassAllocation[],
    classRefsBySrdIndex: Map<string, CharacterClassReference>,
    subclassRefsBySrdIndex: Map<string, CharacterSubclassReference>,
): ResolvedCharacterClass[] {
    return classRows.map((classRow) => {
        const classRef = classRefsBySrdIndex.get(classRow.classId);
        if (!classRef) {
            throw new Error(`Unknown class: ${classRow.classId}`);
        }

        const subclassRef = classRow.subclassId
            ? subclassRefsBySrdIndex.get(classRow.subclassId) ?? null
            : null;

        return {
            classRow,
            classRef,
            subclassRef,
        };
    });
}

/**
 * Derives multiclass starting HP using max at first level and average gains after that.
 */
export function deriveStartingHp(
    classes: ResolvedCharacterClass[],
    startingClassIndex: number,
    abilityScores: CharacterAbilityScores,
): number {
    const constitutionModifier = abilityModifier(abilityScores.constitution);
    let maxHp = 0;

    for (const [index, resolvedClass] of classes.entries()) {
        const hitDie = resolvedClass.classRef.hitDie ?? 8;
        const averageGain = Math.max(1, Math.floor(hitDie / 2) + 1 + constitutionModifier);

        if (index === startingClassIndex) {
            maxHp += Math.max(1, hitDie + constitutionModifier);
            maxHp += Math.max(0, resolvedClass.classRow.level - 1) * averageGain;
            continue;
        }

        maxHp += resolvedClass.classRow.level * averageGain;
    }

    return maxHp;
}

/**
 * Derives saving throw proficiencies from the starting class.
 */
export function deriveSavingThrowProficiencies(
    startingClass: CharacterClassReference,
): Array<keyof CharacterAbilityScores> {
    const savingThrowProficiencies = (startingClass.proficiencies ?? [])
        .filter((proficiency) => proficiency.type === ProficiencyType.SAVING_THROW)
        .map((proficiency) => {
            const suffix = proficiency.srdIndex?.replace('saving-throw-', '') ?? '';
            return ABILITY_KEY_BY_SRD_INDEX[suffix];
        })
        .filter((abilityKey): abilityKey is keyof CharacterAbilityScores => abilityKey !== undefined);

    return Array.from(new Set(savingThrowProficiencies));
}

/**
 * Derives ordered hit-dice pools for each class row.
 */
export function deriveHitDicePools(classes: ResolvedCharacterClass[]): DerivedHitDicePool[] {
    return classes.map((resolvedClass) => {
        const hitDie = resolvedClass.classRef.hitDie ?? 8;

        return {
            classId: resolvedClass.classRow.classId,
            total: resolvedClass.classRow.level,
            remaining: resolvedClass.classRow.level,
            die: `d${hitDie}`,
        };
    });
}

/**
 * Derives displayable non-skill proficiencies for starting and multiclass class rows.
 */
export function deriveNamedClassProficiencies(
    classes: ResolvedCharacterClass[],
    startingClassIndex: number,
): DerivedNamedProficiencies {
    const armor = new Set<string>();
    const weapons = new Set<string>();
    const tools = new Set<string>();

    for (const [index, resolvedClass] of classes.entries()) {
        if (index === startingClassIndex) {
            for (const proficiency of resolvedClass.classRef.proficiencies ?? []) {
                if (proficiency.type === ProficiencyType.ARMOR) armor.add(proficiency.name);
                if (proficiency.type === ProficiencyType.WEAPON) weapons.add(proficiency.name);
                if (proficiency.type === ProficiencyType.TOOL) tools.add(proficiency.name);
            }
            continue;
        }

        const derivedProficiencies = MULTICLASS_PROFICIENCIES_BY_CLASS_SRD_INDEX[resolvedClass.classRow.classId];
        if (!derivedProficiencies) continue;

        for (const value of derivedProficiencies.armor) armor.add(value);
        for (const value of derivedProficiencies.weapons) weapons.add(value);
        for (const value of derivedProficiencies.tools) tools.add(value);
    }

    return {
        armor: sortValuesOrNone(Array.from(armor)),
        weapons: sortValuesOrNone(Array.from(weapons)),
        tools: sortValuesOrNone(Array.from(tools)),
    };
}

/**
 * Derives spell-slot rows for standard multiclass casting and warlock pact magic.
 */
export function deriveSpellSlots(classes: ResolvedCharacterClass[]): DerivedSpellSlot[] {
    const spellSlots: DerivedSpellSlot[] = [];
    const standardSlots = deriveStandardSpellSlots(classes);

    for (const [index, total] of standardSlots.entries()) {
        if (total <= 0) continue;

        spellSlots.push({
            kind: 'STANDARD',
            level: index + 1,
            total,
            used: 0,
        });
    }

    const warlockLevel = classes.find((resolvedClass) => resolvedClass.classRow.classId === 'warlock')?.classRow.level ?? 0;
    const pactMagic = PACT_MAGIC_SLOT_TABLE[warlockLevel] ?? { level: 0, total: 0 };
    if (pactMagic.total > 0 && pactMagic.level > 0) {
        spellSlots.push({
            kind: 'PACT_MAGIC',
            level: pactMagic.level,
            total: pactMagic.total,
            used: 0,
        });
    }

    return sortSpellSlots(spellSlots);
}

/**
 * Derives all spellcasting profiles for the character from class rows and ability scores.
 */
export function deriveSpellcastingProfiles(
    classes: ResolvedCharacterClass[],
    abilityScores: CharacterAbilityScores,
    proficiencyBonus: number,
): DerivedSpellcastingProfile[] {
    return classes
        .map((resolvedClass) => {
            const spellcastingAbility = deriveSpellcastingAbility(resolvedClass);
            if (!spellcastingAbility) return null;

            const spellAttackBonus = proficiencyBonus + abilityModifier(abilityScores[spellcastingAbility]);

            return {
                classId: resolvedClass.classRow.classId,
                className: resolvedClass.classRef.name,
                subclassId: resolvedClass.subclassRef?.srdIndex ?? null,
                subclassName: resolvedClass.subclassRef?.name ?? null,
                classLevel: resolvedClass.classRow.level,
                spellcastingAbility,
                spellSaveDC: 8 + spellAttackBonus,
                spellAttackBonus,
                slotKind: resolvedClass.classRow.classId === 'warlock' ? 'PACT_MAGIC' : 'STANDARD',
            };
        })
        .filter((profile): profile is DerivedSpellcastingProfile => profile !== null);
}

/**
 * Sorts spell slots so standard slots render before pact slots, then by level.
 */
export function sortSpellSlots<T extends { kind: string; level: number }>(spellSlots: T[]): T[] {
    return [...spellSlots].sort((left, right) => {
        if (left.kind !== right.kind) {
            return left.kind === 'STANDARD' ? -1 : 1;
        }

        return left.level - right.level;
    });
}

/**
 * Recovers hit dice across ordered class pools until the recovery budget is spent.
 */
export function recoverHitDicePools<T extends { classId: string; total: number; remaining: number }>(
    hitDicePools: T[],
    orderedClassIds: string[],
    amount: number,
): Array<{ id: string | undefined; classId: string; remaining: number }> {
    let remainingRecovery = amount;
    const updates = hitDicePools.map((hitDicePool) => ({
        id: 'id' in hitDicePool && typeof hitDicePool.id === 'string' ? hitDicePool.id : undefined,
        classId: hitDicePool.classId,
        remaining: hitDicePool.remaining,
        total: hitDicePool.total,
    }));

    for (const classId of orderedClassIds) {
        if (remainingRecovery <= 0) break;

        const hitDicePool = updates.find((candidate) => candidate.classId === classId);
        if (!hitDicePool) continue;

        const recoverable = Math.min(hitDicePool.total - hitDicePool.remaining, remainingRecovery);
        hitDicePool.remaining += recoverable;
        remainingRecovery -= recoverable;
    }

    return updates.map((update) => ({
        id: update.id,
        classId: update.classId,
        remaining: update.remaining,
    }));
}

/**
 * Returns the long-form GraphQL ability key for a resolved class row, if it casts spells.
 */
function deriveSpellcastingAbility(
    resolvedClass: ResolvedCharacterClass,
): keyof CharacterAbilityScores | null {
    if (resolvedClass.classRow.classId === 'fighter' && resolvedClass.classRow.subclassId === 'eldritch-knight') {
        return resolvedClass.classRow.level >= 3 ? 'intelligence' : null;
    }

    if (resolvedClass.classRow.classId === 'rogue' && resolvedClass.classRow.subclassId === 'arcane-trickster') {
        return resolvedClass.classRow.level >= 3 ? 'intelligence' : null;
    }

    if (!resolvedClass.classRef.spellcastingAbility) {
        return null;
    }

    const unlockLevel = SPELLCASTING_UNLOCK_LEVEL_BY_CLASS_SRD_INDEX[resolvedClass.classRow.classId] ?? 1;
    if (resolvedClass.classRow.level < unlockLevel) {
        return null;
    }

    return ABILITY_KEY_BY_SRD_INDEX[resolvedClass.classRef.spellcastingAbility] ?? null;
}

/**
 * Returns standard spell slots for either a pure caster table or multiclass caster level.
 */
function deriveStandardSpellSlots(classes: ResolvedCharacterClass[]): readonly number[] {
    if (classes.length !== 1) {
        return STANDARD_SPELL_SLOT_TABLE[deriveStandardCasterLevel(classes)] ?? [];
    }

    return deriveSingleClassStandardSlots(classes[0]!);
}

/**
 * Returns single-class standard slots for full, half, and third casters.
 */
function deriveSingleClassStandardSlots(resolvedClass: ResolvedCharacterClass): readonly number[] {
    const { classId, level, subclassId } = resolvedClass.classRow;

    if (FULL_CASTER_CLASS_IDS.has(classId)) {
        return STANDARD_SPELL_SLOT_TABLE[level] ?? [];
    }

    if (HALF_CASTER_CLASS_IDS.has(classId)) {
        return HALF_CASTER_SINGLE_CLASS_SLOT_TABLE[level] ?? [];
    }

    if (subclassId && THIRD_CASTER_SUBCLASS_IDS.has(subclassId)) {
        return THIRD_CASTER_SINGLE_CLASS_SLOT_TABLE[level] ?? [];
    }

    return [];
}

/**
 * Returns the effective standard spellcaster level used by multiclass slot rules.
 */
function deriveStandardCasterLevel(classes: ResolvedCharacterClass[]): number {
    let casterLevel = 0;

    for (const resolvedClass of classes) {
        const { classId, level, subclassId } = resolvedClass.classRow;

        if (FULL_CASTER_CLASS_IDS.has(classId)) {
            casterLevel += level;
            continue;
        }

        if (HALF_CASTER_CLASS_IDS.has(classId)) {
            casterLevel += Math.floor(level / 2);
            continue;
        }

        if (subclassId && THIRD_CASTER_SUBCLASS_IDS.has(subclassId)) {
            casterLevel += Math.floor(level / 3);
        }
    }

    return casterLevel;
}

/**
 * Returns a stable, sorted value list or a single "None" entry for empty sets.
 */
function sortValuesOrNone(values: string[]): string[] {
    const uniqueValues = Array.from(new Set(values.filter((value) => value.trim().length > 0)))
        .sort((left, right) => left.localeCompare(right));

    if (uniqueValues.length === 0) {
        return ['None'];
    }

    return uniqueValues;
}
