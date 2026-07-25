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

export const PROFICIENCY_TYPE = {
    ARMOR: 'ARMOR',
    WEAPON: 'WEAPON',
    TOOL: 'TOOL',
    SKILL: 'SKILL',
    SAVING_THROW: 'SAVING_THROW',
    OTHER: 'OTHER',
} as const;

export type ProficiencyType = (typeof PROFICIENCY_TYPE)[keyof typeof PROFICIENCY_TYPE];

/**
 * Raw class row submitted when creating a character.
 */
export type CharacterClassAllocation = {
    classId: string;
    subclassId?: string | null;
    customSubclass?: {
        name: string;
        description: string;
        selectionLevel: number;
    } | null;
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
    spellcastingMode?: 'NONE' | 'STANDARD' | 'PACT_MAGIC';
    savingThrowIndexes?: string[];
    proficiencyRules?: Array<{
        grant: 'STARTING' | 'MULTICLASS';
        choiceGroup: number | null;
        choiceCount?: number | null;
        proficiencyRef: {
            id?: string | null;
            srdIndex: string | null;
            name: string;
            type: ProficiencyType;
        };
    }>;
    progression?: Array<{
        level: number;
        spellSlots: number[];
        abilityScoreImprovement: boolean;
        cantripsKnown: number | null;
        spellsKnown: number | null;
        preparedSpellCount: number | null;
    }>;
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
    ownerUserId?: string | null;
    srdIndex: string | null;
    name: string;
    classId: string;
    selectionLevel: number;
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
 * Minimal class row shape used for deterministic display sorting.
 */
export type DisplaySortableClassRow = {
    className: string;
    isStartingClass: boolean;
    level: number;
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
        // Instrument proficiency is a MULTICLASS choice group, not a fixed grant.
        tools: [],
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
 * Maps SKILL proficiency SRD indexes to their `SkillProficiencies` schema field keys.
 */
const SKILL_KEY_BY_SRD_INDEX: Record<string, string> = {
    'skill-acrobatics': 'acrobatics',
    'skill-animal-handling': 'animalHandling',
    'skill-arcana': 'arcana',
    'skill-athletics': 'athletics',
    'skill-deception': 'deception',
    'skill-history': 'history',
    'skill-insight': 'insight',
    'skill-intimidation': 'intimidation',
    'skill-investigation': 'investigation',
    'skill-medicine': 'medicine',
    'skill-nature': 'nature',
    'skill-perception': 'perception',
    'skill-performance': 'performance',
    'skill-persuasion': 'persuasion',
    'skill-religion': 'religion',
    'skill-sleight-of-hand': 'sleightOfHand',
    'skill-stealth': 'stealth',
    'skill-survival': 'survival',
};

/**
 * One independently limited SKILL choice group derived from class rules,
 * scoped to the class selection value used in create/level-up inputs.
 */
export type ClassScopedSkillChoiceGroup = {
    classId: string;
    choiceGroup: number;
    pick: number;
    optionKeys: string[];
};

/**
 * Fixed SKILL grants plus independently limited choice groups across the
 * character's class rows, expressed as `SkillProficiencies` schema field keys.
 */
export type CreationSkillRequirements = {
    automaticSkillKeys: string[];
    choiceGroups: ClassScopedSkillChoiceGroup[];
};

/**
 * @deprecated Prefer {@link CreationSkillRequirements}. Kept as an alias for
 * starting-class-only call sites and tests.
 */
export type StartingSkillChoiceGroup = Omit<ClassScopedSkillChoiceGroup, 'classId'>;

/**
 * @deprecated Prefer {@link CreationSkillRequirements}.
 */
export type StartingSkillRequirements = {
    automaticSkillKeys: string[];
    choiceGroups: StartingSkillChoiceGroup[];
};

/** One independently limited named (non-skill) proficiency choice group. */
export type ClassScopedProficiencyChoiceGroup = {
    classId: string;
    choiceGroup: number;
    pick: number;
    options: Array<{ value: string; name: string; type: ProficiencyType }>;
};

/**
 * @deprecated Prefer {@link ClassScopedProficiencyChoiceGroup}.
 */
export type StartingProficiencyChoiceGroup = Omit<ClassScopedProficiencyChoiceGroup, 'classId'>;

/** One submitted pick-N selection from a class-scoped proficiency choice group. */
export type SubmittedProficiencyChoice = {
    classId: string;
    choiceGroup: number;
    values: string[];
};

/**
 * Stable option value for a proficiency ref: SRD index when present, otherwise
 * the owned custom proficiency database id. Never falls back to the display name.
 */
export function proficiencyOptionValue(ref: {
    id?: string | null;
    srdIndex: string | null;
}): string | null {
    return ref.srdIndex ?? ref.id ?? null;
}

/**
 * Map key for a class-scoped choice submission.
 */
export function proficiencyChoiceKey(classId: string, choiceGroup: number): string {
    return `${classId}::${choiceGroup}`;
}

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
 * Sorts class-like rows for display by level, then starting-class status, then class name.
 */
export function sortClassRowsForDisplay<T extends DisplaySortableClassRow>(classRows: T[]): T[] {
    return [...classRows].sort((left, right) => {
        if (left.level !== right.level) {
            return right.level - left.level;
        }

        if (left.isStartingClass !== right.isStartingClass) {
            return left.isStartingClass ? -1 : 1;
        }

        return left.className.localeCompare(right.className);
    });
}

/**
 * Returns the starting class index for a submitted class-id selection.
 */
export function findStartingClassIndex(
    classRows: CharacterClassAllocation[],
    startingClassId: string,
): number {
    return classRows.findIndex((classRow) => classRow.classId === startingClassId);
}

/**
 * Validates class rows, subclass ownership, duplicate classes, and starting class rules.
 */
export function validateClassAllocations(
    classRows: CharacterClassAllocation[],
    classRefsBySrdIndex: Map<string, CharacterClassReference>,
    subclassRefsBySelectionValue: Map<string, CharacterSubclassReference>,
    startingClassId: string,
    options: { allowedUnderLevelSubclassIds?: ReadonlySet<string> } = {},
) {
    if (classRows.length === 0) {
        throw new Error('At least one class row is required.');
    }

    if (findStartingClassIndex(classRows, startingClassId) === -1) {
        throw new Error('Starting class must match one of the selected classes.');
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

        if (classRow.subclassId && classRow.customSubclass) {
            throw new Error(`Class ${classRow.classId} cannot submit both subclassId and customSubclass.`);
        }

        if (!classRow.subclassId && !classRow.customSubclass) {
            continue;
        }

        if (classRow.customSubclass) {
            const selectionLevel = Number(classRow.customSubclass.selectionLevel);
            if (!Number.isInteger(selectionLevel) || selectionLevel < 1 || selectionLevel > 20) {
                throw new Error('Custom subclass selection level must be an integer from 1 to 20.');
            }

            if (classRow.level < selectionLevel) {
                throw new Error(
                    `Custom subclass ${classRow.customSubclass.name} requires ${classRow.classId} level ${selectionLevel}.`,
                );
            }

            if (classRow.customSubclass.name.trim().length === 0) {
                throw new Error(`Custom subclass for ${classRow.classId} must include a name.`);
            }

            if (classRow.customSubclass.description.trim().length === 0) {
                throw new Error(`Custom subclass ${classRow.customSubclass.name} must include a description.`);
            }

            continue;
        }

        const subclassId = classRow.subclassId;
        if (!subclassId) continue;

        const subclassRef = subclassRefsBySelectionValue.get(subclassId);
        if (!subclassRef) {
            throw new Error(`Unknown subclass: ${subclassId}`);
        }

        if (subclassRef.classId !== classRef.id) {
            throw new Error(`Subclass ${subclassId} does not belong to class ${classRow.classId}.`);
        }

        const isGrandfathered = options.allowedUnderLevelSubclassIds?.has(subclassRef.id) ?? false;
        if (classRow.level < subclassRef.selectionLevel && !isGrandfathered) {
            throw new Error(
                `Subclass ${subclassId} requires ${classRow.classId} level ${subclassRef.selectionLevel}.`,
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
    subclassRefsBySelectionValue: Map<string, CharacterSubclassReference>,
): ResolvedCharacterClass[] {
    return classRows.map((classRow) => {
        const classRef = classRefsBySrdIndex.get(classRow.classId);
        if (!classRef) {
            throw new Error(`Unknown class: ${classRow.classId}`);
        }

        const subclassRef = classRow.subclassId
            ? subclassRefsBySelectionValue.get(classRow.subclassId) ?? null
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
    const configuredSavingThrows = (startingClass.savingThrowIndexes ?? [])
        .map((abilityIndex) => ABILITY_KEY_BY_SRD_INDEX[abilityIndex])
        .filter((abilityKey): abilityKey is keyof CharacterAbilityScores => abilityKey !== undefined);
    const savingThrowProficiencies = (startingClass.proficiencies ?? [])
        .filter((proficiency) => proficiency.type === PROFICIENCY_TYPE.SAVING_THROW)
        .map((proficiency) => {
            const suffix = proficiency.srdIndex?.replace('saving-throw-', '') ?? '';
            return ABILITY_KEY_BY_SRD_INDEX[suffix];
        })
        .filter((abilityKey): abilityKey is keyof CharacterAbilityScores => abilityKey !== undefined);

    return Array.from(new Set([...configuredSavingThrows, ...savingThrowProficiencies]));
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
 * Returns whether a proficiency type contributes to armour/weapon/tool trait lists.
 * SRD kit indexes typed as OTHER (e.g. thieves' tools) display with tools.
 */
export function isNamedTraitProficiencyType(type: ProficiencyType): boolean {
    return type === PROFICIENCY_TYPE.ARMOR
        || type === PROFICIENCY_TYPE.WEAPON
        || type === PROFICIENCY_TYPE.TOOL
        || type === PROFICIENCY_TYPE.OTHER;
}

/**
 * Adds one proficiency label to the matching trait bucket.
 */
function addNamedProficiency(
    target: { armor: Set<string>; weapons: Set<string>; tools: Set<string> },
    type: ProficiencyType,
    name: string,
): void {
    if (type === PROFICIENCY_TYPE.ARMOR) target.armor.add(name);
    if (type === PROFICIENCY_TYPE.WEAPON) target.weapons.add(name);
    if (type === PROFICIENCY_TYPE.TOOL || type === PROFICIENCY_TYPE.OTHER) target.tools.add(name);
}

/**
 * Derives displayable non-skill proficiencies for starting and multiclass class rows.
 * Only fixed grants (`choiceGroup == null`) are included; choice-group picks are
 * applied separately from the client's validated selections.
 */
export function deriveNamedClassProficiencies(
    classes: ResolvedCharacterClass[],
    startingClassIndex: number,
): DerivedNamedProficiencies {
    const armor = new Set<string>();
    const weapons = new Set<string>();
    const tools = new Set<string>();
    const buckets = { armor, weapons, tools };

    for (const [index, resolvedClass] of classes.entries()) {
        const configuredRules = (resolvedClass.classRef.proficiencyRules ?? [])
            .filter((rule) => rule.choiceGroup == null && rule.grant === (index === startingClassIndex ? 'STARTING' : 'MULTICLASS'));
        if (configuredRules.length > 0) {
            for (const { proficiencyRef } of configuredRules) {
                addNamedProficiency(buckets, proficiencyRef.type, proficiencyRef.name);
            }
            continue;
        }
        if (index === startingClassIndex) {
            for (const proficiency of resolvedClass.classRef.proficiencies ?? []) {
                addNamedProficiency(buckets, proficiency.type, proficiency.name);
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
 * Derives SKILL proficiency requirements for one class ref and grant type:
 * fixed grants (`choiceGroup == null`) and independently limited choice groups.
 */
export function deriveSkillRequirementsForGrant(
    classRef: CharacterClassReference,
    grant: 'STARTING' | 'MULTICLASS',
    classId: string,
): CreationSkillRequirements {
    const skillRules = (classRef.proficiencyRules ?? []).filter((rule) => (
        rule.grant === grant && rule.proficiencyRef.type === PROFICIENCY_TYPE.SKILL
    ));

    const automaticSkillKeys = skillRules
        .filter((rule) => rule.choiceGroup == null)
        .flatMap((rule) => skillKeyForSrdIndex(rule.proficiencyRef.srdIndex));

    const choiceRules = skillRules.filter((rule) => rule.choiceGroup != null);
    const rulesByGroup = new Map<number, typeof choiceRules>();
    for (const rule of choiceRules) {
        const group = rulesByGroup.get(rule.choiceGroup!) ?? [];
        group.push(rule);
        rulesByGroup.set(rule.choiceGroup!, group);
    }

    const choiceGroups = [...rulesByGroup.entries()]
        .sort(([leftGroup], [rightGroup]) => leftGroup - rightGroup)
        .map(([choiceGroup, groupRules]) => ({
            classId,
            choiceGroup,
            pick: Math.max(...groupRules.map((rule) => rule.choiceCount ?? 0)),
            optionKeys: [...new Set(groupRules.flatMap((rule) => skillKeyForSrdIndex(rule.proficiencyRef.srdIndex)))],
        }));

    return { automaticSkillKeys, choiceGroups };
}

/**
 * Derives creation-time SKILL requirements: STARTING grants on the starting
 * class plus MULTICLASS grants on every secondary class. Fixed grants are
 * collected for automatic merge; choice groups stay independently limited.
 */
export function deriveCreationSkillRequirements(
    classes: ResolvedCharacterClass[],
    startingClassIndex: number,
): CreationSkillRequirements {
    const automaticSkillKeys: string[] = [];
    const choiceGroups: ClassScopedSkillChoiceGroup[] = [];

    for (const [index, resolvedClass] of classes.entries()) {
        const grant = index === startingClassIndex ? 'STARTING' : 'MULTICLASS';
        const classId = resolvedClass.classRow.classId;
        const requirements = deriveSkillRequirementsForGrant(resolvedClass.classRef, grant, classId);
        automaticSkillKeys.push(...requirements.automaticSkillKeys);
        choiceGroups.push(...requirements.choiceGroups);
    }

    return {
        automaticSkillKeys: [...new Set(automaticSkillKeys)],
        choiceGroups,
    };
}

/**
 * Derives the starting class's SKILL proficiency requirements.
 */
export function deriveStartingSkillRequirements(
    startingClassRef: CharacterClassReference,
    classId: string = startingClassRef.srdIndex ?? startingClassRef.id,
): StartingSkillRequirements {
    const { automaticSkillKeys, choiceGroups } = deriveSkillRequirementsForGrant(
        startingClassRef,
        'STARTING',
        classId,
    );

    return {
        automaticSkillKeys,
        choiceGroups: choiceGroups.map(({ choiceGroup, pick, optionKeys }) => ({
            choiceGroup,
            pick,
            optionKeys,
        })),
    };
}

/**
 * Derives fixed SKILL proficiency grants from a background reference.
 */
export function deriveBackgroundSkillKeys(
    backgroundRef: { proficiencies: Array<{ srdIndex: string | null; type: ProficiencyType }> },
): string[] {
    return backgroundRef.proficiencies
        .filter((proficiency) => proficiency.type === PROFICIENCY_TYPE.SKILL)
        .flatMap((proficiency) => skillKeyForSrdIndex(proficiency.srdIndex));
}

/**
 * @deprecated Creation validates SKILL groups via {@link validateCreationProficiencyChoices}
 * on class-scoped `proficiencyChoices`. Kept for older call sites: excludes
 * fixed/background keys from choice quotas and only counts non-fixed submitted skills.
 */
export function validateCreationSkillProficiencies(
    requirements: CreationSkillRequirements | StartingSkillRequirements,
    backgroundSkillKeys: string[],
    submittedSkillProficiencies: Record<string, string | null | undefined>,
): void {
    const fixedKeys = new Set([...requirements.automaticSkillKeys, ...backgroundSkillKeys]);
    const selectedKeys = new Set(
        Object.entries(submittedSkillProficiencies)
            .filter(([, level]) => level != null && level !== 'none')
            .map(([key]) => key)
            .filter((key) => !fixedKeys.has(key)),
    );
    const allowedChoiceKeys = new Set(requirements.choiceGroups.flatMap((group) => group.optionKeys));

    for (const key of selectedKeys) {
        if (!allowedChoiceKeys.has(key)) {
            throw new Error(`Skill proficiency "${key}" is not granted by the selected classes or background.`);
        }
    }

    for (const group of requirements.choiceGroups) {
        const selectedInGroup = group.optionKeys.filter((key) => selectedKeys.has(key));
        if (selectedInGroup.length !== group.pick) {
            throw new Error(
                `Choose exactly ${group.pick} skill proficienc${group.pick === 1 ? 'y' : 'ies'} from the class skill list.`,
            );
        }
    }
}

/**
 * @deprecated Prefer {@link validateCreationSkillProficiencies}.
 */
export function validateStartingSkillProficiencies(
    requirements: StartingSkillRequirements | CreationSkillRequirements,
    backgroundSkillKeys: string[],
    submittedSkillProficiencies: Record<string, string | null | undefined>,
): void {
    validateCreationSkillProficiencies(requirements, backgroundSkillKeys, submittedSkillProficiencies);
}

/**
 * Derives independently limited proficiency choice groups for one class ref and
 * grant type. Option values use {@link proficiencyOptionValue} (`srdIndex ?? id`).
 * Pass `namedOnly` to exclude SKILL groups (creation named-choice path).
 */
export function deriveProficiencyChoiceRequirementsForGrant(
    classRef: CharacterClassReference,
    grant: 'STARTING' | 'MULTICLASS',
    classId: string,
    namedOnly = false,
): ClassScopedProficiencyChoiceGroup[] {
    const choiceRules = (classRef.proficiencyRules ?? []).filter((rule) => (
        rule.grant === grant
        && rule.choiceGroup != null
        && (!namedOnly || isNamedTraitProficiencyType(rule.proficiencyRef.type))
    ));

    const rulesByGroup = new Map<number, typeof choiceRules>();
    for (const rule of choiceRules) {
        const group = rulesByGroup.get(rule.choiceGroup!) ?? [];
        group.push(rule);
        rulesByGroup.set(rule.choiceGroup!, group);
    }

    return [...rulesByGroup.entries()]
        .sort(([leftGroup], [rightGroup]) => leftGroup - rightGroup)
        .map(([choiceGroup, groupRules]) => {
            const optionsByValue = new Map<string, { value: string; name: string; type: ProficiencyType }>();
            for (const rule of groupRules) {
                const value = proficiencyOptionValue(rule.proficiencyRef);
                if (!value || optionsByValue.has(value)) continue;
                optionsByValue.set(value, {
                    value,
                    name: rule.proficiencyRef.name,
                    type: rule.proficiencyRef.type,
                });
            }

            return {
                classId,
                choiceGroup,
                pick: Math.max(...groupRules.map((rule) => rule.choiceCount ?? 0)),
                options: [...optionsByValue.values()],
            };
        })
        .filter((group) => group.options.length > 0);
}

/**
 * Derives independently limited named proficiency choice groups
 * (armor/weapon/tool/other) for one class ref and grant type.
 */
export function deriveNamedProficiencyChoiceRequirementsForGrant(
    classRef: CharacterClassReference,
    grant: 'STARTING' | 'MULTICLASS',
    classId: string,
): ClassScopedProficiencyChoiceGroup[] {
    return deriveProficiencyChoiceRequirementsForGrant(classRef, grant, classId, true);
}

/**
 * Derives MULTICLASS choice groups (SKILL + named) for every newly added class.
 */
export function deriveNewlyAddedMulticlassProficiencyChoiceRequirements(
    newlyAddedClasses: ResolvedCharacterClass[],
): ClassScopedProficiencyChoiceGroup[] {
    return newlyAddedClasses.flatMap((resolvedClass) => (
        deriveProficiencyChoiceRequirementsForGrant(
            resolvedClass.classRef,
            'MULTICLASS',
            resolvedClass.classRow.classId,
        )
    ));
}

/**
 * Returns submitted class rows whose selection value is not already persisted
 * on the character. Existing rows are matched by class DB id or SRD index.
 */
export function findNewlyAddedClassRows<T extends { classId: string }>(
    submittedClasses: T[],
    existingClassDbIds: readonly string[],
    classRefsBySelectionValue: Map<string, CharacterClassReference>,
): T[] {
    const existingSelectionValues = new Set<string>();
    for (const dbId of existingClassDbIds) {
        const classRef = classRefsBySelectionValue.get(dbId);
        if (!classRef) {
            existingSelectionValues.add(dbId);
            continue;
        }
        existingSelectionValues.add(classRef.id);
        if (classRef.srdIndex) {
            existingSelectionValues.add(classRef.srdIndex);
        }
    }

    return submittedClasses.filter((classRow) => !existingSelectionValues.has(classRow.classId));
}

/**
 * Derives all proficiency choice groups for character creation (SKILL + named):
 * STARTING on the starting class and MULTICLASS on every secondary class.
 */
export function deriveCreationProficiencyChoiceRequirements(
    classes: ResolvedCharacterClass[],
    startingClassIndex: number,
): ClassScopedProficiencyChoiceGroup[] {
    return classes.flatMap((resolvedClass, index) => {
        const grant = index === startingClassIndex ? 'STARTING' : 'MULTICLASS';
        return deriveProficiencyChoiceRequirementsForGrant(
            resolvedClass.classRef,
            grant,
            resolvedClass.classRow.classId,
            false,
        );
    });
}

/**
 * Derives named-only proficiency choice groups for character creation.
 * Prefer {@link deriveCreationProficiencyChoiceRequirements} for the unified path.
 */
export function deriveCreationNamedProficiencyChoiceRequirements(
    classes: ResolvedCharacterClass[],
    startingClassIndex: number,
): ClassScopedProficiencyChoiceGroup[] {
    return classes.flatMap((resolvedClass, index) => {
        const grant = index === startingClassIndex ? 'STARTING' : 'MULTICLASS';
        return deriveNamedProficiencyChoiceRequirementsForGrant(
            resolvedClass.classRef,
            grant,
            resolvedClass.classRow.classId,
        );
    });
}

/**
 * Collects SkillProficiencies field keys from validated SKILL options in
 * class-scoped proficiency choice submissions.
 */
export function skillKeysFromValidatedChoices(
    groups: ClassScopedProficiencyChoiceGroup[],
    submitted: SubmittedProficiencyChoice[] | null | undefined,
): string[] {
    const submittedByKey = new Map(
        (submitted ?? []).map((selection) => [
            proficiencyChoiceKey(selection.classId, selection.choiceGroup),
            selection.values,
        ]),
    );
    const keys = new Set<string>();

    for (const group of groups) {
        const selectedValues = submittedByKey.get(proficiencyChoiceKey(group.classId, group.choiceGroup)) ?? [];
        for (const value of selectedValues) {
            const option = group.options.find((candidate) => candidate.value === value);
            if (!option || option.type !== PROFICIENCY_TYPE.SKILL) continue;
            for (const key of skillKeyForSrdIndex(value.startsWith('skill-') ? value : option.value)) {
                keys.add(key);
            }
        }
    }

    return [...keys];
}

/**
 * Builds the persisted creation skill map from fixed grants, background grants,
 * and validated class-scoped SKILL choice picks. Does not treat client
 * `skillProficiencies` as choice provenance.
 */
export function derivePersistedCreationSkillProficiencies(args: {
    automaticSkillKeys: readonly string[];
    backgroundSkillKeys: readonly string[];
    choiceSkillKeys: readonly string[];
    defaults?: Record<string, string>;
}): Record<string, string> {
    const {
        automaticSkillKeys,
        backgroundSkillKeys,
        choiceSkillKeys,
        defaults = {},
    } = args;

    const next = { ...defaults };
    for (const key of [...automaticSkillKeys, ...backgroundSkillKeys, ...choiceSkillKeys]) {
        next[key] = 'proficient';
    }
    return next;
}

/**
 * Derives independently limited non-skill STARTING proficiency choice groups
 * from the starting class definition.
 */
export function deriveStartingProficiencyChoiceRequirements(
    startingClassRef: CharacterClassReference,
    classId: string = startingClassRef.srdIndex ?? startingClassRef.id,
): StartingProficiencyChoiceGroup[] {
    return deriveNamedProficiencyChoiceRequirementsForGrant(startingClassRef, 'STARTING', classId)
        .map(({ choiceGroup, pick, options }) => ({ choiceGroup, pick, options }));
}

/**
 * Validates submitted named proficiency choices against class-scoped pick-N
 * groups. Each group must submit exactly `pick` unique values drawn from that
 * group's option list. Identity is `(classId, choiceGroup)`.
 */
export function validateCreationProficiencyChoices(
    groups: ClassScopedProficiencyChoiceGroup[],
    submitted: SubmittedProficiencyChoice[] | null | undefined,
): void {
    const submittedByKey = new Map<string, string[]>();
    for (const selection of submitted ?? []) {
        const key = proficiencyChoiceKey(selection.classId, selection.choiceGroup);
        if (submittedByKey.has(key)) {
            throw new Error(
                `Duplicate proficiency choice submission for ${selection.classId} group ${selection.choiceGroup}.`,
            );
        }
        submittedByKey.set(key, selection.values);
    }

    if (groups.length === 0) {
        if ((submitted ?? []).length > 0) {
            throw new Error('Selected classes do not grant proficiency choices.');
        }
        return;
    }

    for (const group of groups) {
        const key = proficiencyChoiceKey(group.classId, group.choiceGroup);
        const values = submittedByKey.get(key) ?? [];
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length !== values.length) {
            throw new Error(
                `Proficiency choice group ${group.choiceGroup} for ${group.classId} contains duplicate selections.`,
            );
        }
        if (uniqueValues.length !== group.pick) {
            throw new Error(
                `Choose exactly ${group.pick} proficienc${group.pick === 1 ? 'y' : 'ies'} from ${group.classId} choice group ${group.choiceGroup}.`,
            );
        }

        const allowed = new Set(group.options.map((option) => option.value));
        for (const value of uniqueValues) {
            if (!allowed.has(value)) {
                throw new Error(
                    `Proficiency "${value}" is not an option in ${group.classId} choice group ${group.choiceGroup}.`,
                );
            }
        }
        submittedByKey.delete(key);
    }

    if (submittedByKey.size > 0) {
        const unexpected = [...submittedByKey.keys()].join(', ');
        throw new Error(`Unexpected proficiency choice group(s): ${unexpected}.`);
    }
}

/**
 * Validates starting-class-only named choices. Accepts legacy submissions that
 * omit `classId` by attributing them to the provided starting class id.
 */
export function validateStartingProficiencyChoices(
    groups: StartingProficiencyChoiceGroup[],
    submitted: Array<{ classId?: string; choiceGroup: number; values: string[] }> | null | undefined,
    startingClassId = 'starting',
): void {
    validateCreationProficiencyChoices(
        groups.map((group) => ({ ...group, classId: startingClassId })),
        (submitted ?? []).map((selection) => ({
            classId: selection.classId ?? startingClassId,
            choiceGroup: selection.choiceGroup,
            values: selection.values,
        })),
    );
}

/**
 * Resolves validated named proficiency choices into trait-list labels.
 */
export function namedProficienciesFromChoices(
    groups: ClassScopedProficiencyChoiceGroup[] | StartingProficiencyChoiceGroup[],
    submitted: Array<{ classId?: string; choiceGroup: number; values: string[] }> | null | undefined,
    fallbackClassId = 'starting',
): DerivedNamedProficiencies {
    const armor = new Set<string>();
    const weapons = new Set<string>();
    const tools = new Set<string>();
    const buckets = { armor, weapons, tools };
    const scopedGroups: ClassScopedProficiencyChoiceGroup[] = groups.map((group) => (
        'classId' in group
            ? group
            : { ...group, classId: fallbackClassId }
    ));
    const submittedByKey = new Map(
        (submitted ?? []).map((selection) => [
            proficiencyChoiceKey(selection.classId ?? fallbackClassId, selection.choiceGroup),
            selection.values,
        ]),
    );

    for (const group of scopedGroups) {
        const selectedValues = new Set(
            submittedByKey.get(proficiencyChoiceKey(group.classId, group.choiceGroup)) ?? [],
        );
        for (const option of group.options) {
            if (selectedValues.has(option.value)) {
                addNamedProficiency(buckets, option.type, option.name);
            }
        }
    }

    return {
        armor: sortValuesOrNone(Array.from(armor)),
        weapons: sortValuesOrNone(Array.from(weapons)),
        tools: sortValuesOrNone(Array.from(tools)),
    };
}

/**
 * Returns the `SkillProficiencies` schema field key for one SKILL proficiency
 * SRD index, or an empty list when the index is unrecognised.
 */
function skillKeyForSrdIndex(srdIndex: string | null): string[] {
    const key = srdIndex ? SKILL_KEY_BY_SRD_INDEX[srdIndex] : undefined;
    return key ? [key] : [];
}

/** Trait proficiency lists mutated when applying multiclass grants on save. */
export type SheetTraitProficiencies = {
    armorProficiencies: string[];
    weaponProficiencies: string[];
    toolProficiencies: string[];
};

/**
 * Unions unique non-"None" labels, preserving existing order then appending new.
 */
function unionTraitLabels(existing: readonly string[], additions: readonly string[]): string[] {
    const next = existing.filter((label) => label !== 'None');
    const seen = new Set(next.map((label) => label.toLowerCase()));
    for (const label of additions) {
        if (!label || label === 'None') continue;
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(label);
    }
    return next.length > 0 ? next : ['None'];
}

/**
 * Applies fixed MULTICLASS grants and validated choice picks for newly added
 * classes into submitted skill/trait maps. Existing proficient/expert skills
 * and trait labels are preserved (never downgraded or removed).
 */
export function applyNewlyAddedMulticlassProficiencyGrants(args: {
    newlyAddedClasses: ResolvedCharacterClass[];
    choiceGroups: ClassScopedProficiencyChoiceGroup[];
    submittedChoices: SubmittedProficiencyChoice[] | null | undefined;
    skillProficiencies: Record<string, string>;
    traits: SheetTraitProficiencies;
}): {
    skillProficiencies: Record<string, string>;
    traits: SheetTraitProficiencies;
} {
    const {
        newlyAddedClasses,
        choiceGroups,
        submittedChoices,
        skillProficiencies,
        traits,
    } = args;

    const nextSkills = { ...skillProficiencies };
    const grantSkill = (key: string) => {
        const current = nextSkills[key];
        if (current == null || current === 'none') {
            nextSkills[key] = 'proficient';
        }
    };

    for (const resolvedClass of newlyAddedClasses) {
        const skillRequirements = deriveSkillRequirementsForGrant(
            resolvedClass.classRef,
            'MULTICLASS',
            resolvedClass.classRow.classId,
        );
        for (const key of skillRequirements.automaticSkillKeys) {
            grantSkill(key);
        }
    }

    const chosenNamed = namedProficienciesFromChoices(choiceGroups, submittedChoices);
    const fixedNamed = deriveNamedClassProficiencies(
        newlyAddedClasses.map((resolvedClass) => resolvedClass),
        // Treat every newly added row as a secondary class so STARTING grants
        // are never applied here.
        -1,
    );

    for (const group of choiceGroups) {
        const selection = (submittedChoices ?? []).find((entry) => (
            entry.classId === group.classId && entry.choiceGroup === group.choiceGroup
        ));
        if (!selection) continue;
        for (const value of selection.values) {
            const option = group.options.find((candidate) => candidate.value === value);
            if (!option || option.type !== PROFICIENCY_TYPE.SKILL) continue;
            for (const key of skillKeyForSrdIndex(value)) {
                grantSkill(key);
            }
        }
    }

    return {
        skillProficiencies: nextSkills,
        traits: {
            armorProficiencies: unionTraitLabels(
                traits.armorProficiencies,
                [...fixedNamed.armor, ...chosenNamed.armor],
            ),
            weaponProficiencies: unionTraitLabels(
                traits.weaponProficiencies,
                [...fixedNamed.weapons, ...chosenNamed.weapons],
            ),
            toolProficiencies: unionTraitLabels(
                traits.toolProficiencies,
                [...fixedNamed.tools, ...chosenNamed.tools],
            ),
        },
    };
}

/**
 * Derives spell-slot rows for standard multiclass casting and warlock pact magic.
 */
export function deriveSpellSlots(classes: ResolvedCharacterClass[]): DerivedSpellSlot[] {
    const spellSlots: DerivedSpellSlot[] = [];
    const pactSlotsByLevel = new Map<number, number>();
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

    for (const resolvedClass of classes.filter((entry) => entry.classRef.spellcastingMode === 'PACT_MAGIC' || entry.classRef.srdIndex === 'warlock')) {
        const configured = resolvedClass.classRef.progression?.find((row) => row.level === resolvedClass.classRow.level)?.spellSlots;
        if (configured) {
            configured.forEach((total, index) => {
                if (total > 0) pactSlotsByLevel.set(index + 1, (pactSlotsByLevel.get(index + 1) ?? 0) + total);
            });
            continue;
        }
        const pactMagic = PACT_MAGIC_SLOT_TABLE[resolvedClass.classRow.level] ?? { level: 0, total: 0 };
        if (pactMagic.total > 0 && pactMagic.level > 0) {
            pactSlotsByLevel.set(pactMagic.level, (pactSlotsByLevel.get(pactMagic.level) ?? 0) + pactMagic.total);
        }
    }

    for (const [level, total] of pactSlotsByLevel) {
        spellSlots.push({ kind: 'PACT_MAGIC', level, total, used: 0 });
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
                subclassId: resolvedClass.subclassRef?.srdIndex ?? resolvedClass.subclassRef?.id ?? null,
                subclassName: resolvedClass.subclassRef?.name ?? null,
                classLevel: resolvedClass.classRow.level,
                spellcastingAbility,
                spellSaveDC: 8 + spellAttackBonus,
                spellAttackBonus,
                slotKind: resolvedClass.classRef.spellcastingMode === 'PACT_MAGIC' || resolvedClass.classRef.srdIndex === 'warlock' ? 'PACT_MAGIC' : 'STANDARD',
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

    if (resolvedClass.classRef.spellcastingMode === 'STANDARD'
        && resolvedClass.classRef.srdIndex == null
        && resolvedClass.classRef.progression) {
        return resolvedClass.classRef.progression.find((row) => row.level === level)?.spellSlots ?? [];
    }

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

        if (resolvedClass.classRef.spellcastingMode === 'STANDARD' && resolvedClass.classRef.srdIndex == null) {
            casterLevel += deriveConfiguredStandardCasterLevel(resolvedClass);
            continue;
        }

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
 * Infers a custom standard caster's multiclass contribution from its authored
 * slot progression. Canonical full, half, and third progressions retain their
 * 5e rounding rules; other authored tables use the equivalent standard row.
 */
function deriveConfiguredStandardCasterLevel(resolvedClass: ResolvedCharacterClass): number {
    const progression = resolvedClass.classRef.progression ?? [];
    const classLevel = resolvedClass.classRow.level;

    if (progressionMatchesSlotTable(progression, HALF_CASTER_SINGLE_CLASS_SLOT_TABLE)) {
        return Math.floor(classLevel / 2);
    }
    if (progressionMatchesSlotTable(progression, THIRD_CASTER_SINGLE_CLASS_SLOT_TABLE)) {
        return Math.floor(classLevel / 3);
    }
    if (progressionMatchesSlotTable(progression, STANDARD_SPELL_SLOT_TABLE)) {
        return classLevel;
    }

    const configuredSlots = progression.find((row) => row.level === classLevel)?.spellSlots ?? [];
    if (configuredSlots.every((total) => total === 0)) return 0;

    let equivalentCasterLevel = 1;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let level = 1; level < STANDARD_SPELL_SLOT_TABLE.length; level += 1) {
        const distance = spellSlotRowDistance(configuredSlots, STANDARD_SPELL_SLOT_TABLE[level] ?? []);
        if (distance < closestDistance) {
            closestDistance = distance;
            equivalentCasterLevel = level;
        }
    }
    return equivalentCasterLevel;
}

function progressionMatchesSlotTable(
    progression: NonNullable<CharacterClassReference['progression']>,
    slotTable: ReadonlyArray<readonly number[]>,
): boolean {
    return progression.length >= 20 && progression.every((row) => (
        spellSlotRowsEqual(row.spellSlots, slotTable[row.level] ?? [])
    ));
}

function spellSlotRowsEqual(left: readonly number[], right: readonly number[]): boolean {
    return Array.from({ length: 9 }, (_, index) => left[index] ?? 0)
        .every((total, index) => total === (right[index] ?? 0));
}

function spellSlotRowDistance(left: readonly number[], right: readonly number[]): number {
    return Array.from({ length: 9 }, (_, index) => Math.abs((left[index] ?? 0) - (right[index] ?? 0)))
        .reduce((total, difference) => total + difference, 0);
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
