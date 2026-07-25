import { ClassProficiencyGrant, ClassSpellcastingMode, Prisma } from '@prisma/client';
import type { Context } from '../..';
import type {
    ManagedCustomClassInput,
    MutationArchiveCustomClassArgs,
    MutationCreateCustomClassArgs,
    MutationUpdateCustomClassArgs,
    QueryAttachedClassDetailsArgs,
    QueryClassDetailsArgs,
} from '../../generated/graphql';
import { requireUser } from '../../lib/auth';
import prisma from '../../prisma/prisma';

const ABILITY_INDEXES = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha']);
const SPELLCASTING_MODES = new Set<ClassSpellcastingMode>(['NONE', 'STANDARD', 'PACT_MAGIC']);
const PROFICIENCY_GRANTS = new Set<ClassProficiencyGrant>(['STARTING', 'MULTICLASS']);
const ACTIVE_CUSTOM_CLASS_NAME_EXISTS = 'An active custom class with this name already exists.';
/** Partial unique index from migrations/20260725140000_active_custom_class_subclass_name_uniqueness. */
export const ACTIVE_CUSTOM_CLASS_NAME_INDEX = 'Class_ownerUserId_lower_name_active_key';

/**
 * Collects Prisma unique-constraint target identifiers from a P2002 error.
 * Expression/partial indexes often omit `meta.modelName` and put the index name in `target`.
 */
export function uniqueConstraintTargets(error: Prisma.PrismaClientKnownRequestError): string[] {
    const target = error.meta?.target;
    if (typeof target === 'string') return [target];
    if (Array.isArray(target)) return target.map(String);
    return [];
}

/**
 * True when a P2002 is the active custom-class name unique index (not other Class uniques).
 */
export function isActiveCustomClassNameConflict(error: Prisma.PrismaClientKnownRequestError): boolean {
    if (error.code !== 'P2002') return false;
    const targets = uniqueConstraintTargets(error);
    if (targets.some((value) => value === ACTIVE_CUSTOM_CLASS_NAME_INDEX)) return true;
    return error.message.includes(ACTIVE_CUSTOM_CLASS_NAME_INDEX);
}

const CLASS_DETAILS_INCLUDE = {
    proficiencyRules: { include: { proficiencyRef: true }, orderBy: { proficiencyRef: { name: 'asc' as const } } },
    progression: { orderBy: { level: 'asc' as const } },
    features: { where: { kind: 'CLASS_FEATURE' as const }, orderBy: [{ level: 'asc' as const }, { name: 'asc' as const }] },
    spellList: { include: { spellRef: true }, orderBy: { spellRef: { name: 'asc' as const } } },
    _count: { select: { characterClasses: true } },
};

type ClassDetailsRow = Prisma.ClassGetPayload<{ include: typeof CLASS_DETAILS_INCLUDE }>;

type NormalisedClassInput = ReturnType<typeof normaliseClassInput>;

type LockedFeatureInput = Pick<NormalisedClassInput['features'][number], 'id'>;
type ExistingLockedFeature = { id: string };

function uniqueStrings(values: readonly string[], label: string): string[] {
    const normalised = values.map((value) => value.trim().toLowerCase()).filter(Boolean);
    if (new Set(normalised).size !== normalised.length) throw new Error(`${label} must not contain duplicates.`);
    return normalised;
}

type GroupedChoiceRow = {
    choiceGroup: number | null;
    choiceCount: number | null;
    optionKey: string;
};

/**
 * Validates pick-N choice groups: positive integer group/count, one count per group,
 * unique options within a group, and count never exceeding the option pool.
 */
export function assertGroupedChoiceInvariants(
    rows: readonly GroupedChoiceRow[],
    label: string,
): void {
    const groups = new Map<number, { choiceCount: number; optionKeys: string[] }>();

    for (const row of rows) {
        const hasGroup = row.choiceGroup != null;
        const hasCount = row.choiceCount != null;
        if (hasGroup !== hasCount) {
            throw new Error(`Invalid ${label}: choice group and count must both be set or both be omitted.`);
        }
        if (!hasGroup || !hasCount) continue;

        if (!Number.isInteger(row.choiceGroup) || row.choiceGroup! < 1
            || !Number.isInteger(row.choiceCount) || row.choiceCount! < 1) {
            throw new Error(`Invalid ${label}: choice group and count must be positive integers.`);
        }

        const existing = groups.get(row.choiceGroup!);
        if (!existing) {
            groups.set(row.choiceGroup!, { choiceCount: row.choiceCount!, optionKeys: [row.optionKey] });
            continue;
        }
        if (existing.choiceCount !== row.choiceCount) {
            throw new Error(`Invalid ${label}: choice group ${row.choiceGroup} has inconsistent choice counts.`);
        }
        if (existing.optionKeys.includes(row.optionKey)) {
            throw new Error(`Invalid ${label}: duplicate option in choice group ${row.choiceGroup}.`);
        }
        existing.optionKeys.push(row.optionKey);
    }

    for (const [group, { choiceCount, optionKeys }] of groups) {
        if (choiceCount > optionKeys.length) {
            throw new Error(`Invalid ${label}: choice group ${group} requests ${choiceCount} picks from ${optionKeys.length} options.`);
        }
    }
}

/**
 * Rejects Pact Magic progression rows that define more than one populated slot level.
 */
export function assertValidPactMagicSlots(spellSlots: readonly number[]): void {
    if (spellSlots.filter((slot) => slot > 0).length > 1) {
        throw new Error('Pact magic levels may only define a single spell-slot level at a time.');
    }
}

/**
 * Builds the owner-scoped proficiency lookup used when resolving class proficiency refs.
 * SRD indexes resolve only global rows; custom IDs resolve only for the caller.
 */
export function proficiencyReferenceWhere(userId: string, values: readonly string[]) {
    return {
        OR: [
            { srdIndex: { in: [...values] }, ownerUserId: null },
            { id: { in: [...values] }, ownerUserId: userId },
        ],
    };
}

/**
 * Translates a race on the active custom-class name unique index into a domain error.
 * Other unique violations (e.g. proficiency rules) are rethrown unchanged.
 */
export function translateActiveCustomClassNameConflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && isActiveCustomClassNameConflict(error)) {
        throw new Error(ACTIVE_CUSTOM_CLASS_NAME_EXISTS);
    }
    throw error;
}

export function normaliseClassInput(input: ManagedCustomClassInput) {
    const name = input.name.trim();
    const emoji = input.emoji.trim();
    const description = input.description.trim();
    const hitDie = Number(input.hitDie);
    const primaryAbilityIndexes = uniqueStrings(input.primaryAbilityIndexes, 'Primary abilities');
    const savingThrowIndexes = uniqueStrings(input.savingThrowIndexes, 'Saving throws');
    const spellcastingMode = input.spellcastingMode.trim().toUpperCase() as ClassSpellcastingMode;
    const spellcastingAbility = input.spellcastingAbility?.trim().toLowerCase() || null;
    const addSpellcastingAbility = spellcastingMode === 'NONE' ? false : Boolean(input.addSpellcastingAbility);

    if (!name || !emoji || !description) throw new Error('Name, emoji, and description are required.');
    if (emoji.length > 32) throw new Error('Emoji must be 32 characters or fewer.');
    if (![6, 8, 10, 12].includes(hitDie)) throw new Error('Hit die must be d6, d8, d10, or d12.');
    if (primaryAbilityIndexes.length === 0 || primaryAbilityIndexes.some((value) => !ABILITY_INDEXES.has(value))) {
        throw new Error('Primary abilities must use valid ability indexes.');
    }
    if (savingThrowIndexes.length !== 2 || savingThrowIndexes.some((value) => !ABILITY_INDEXES.has(value))) {
        throw new Error('Exactly two valid saving throws are required.');
    }
    if (!SPELLCASTING_MODES.has(spellcastingMode)) throw new Error('Invalid spellcasting mode.');
    if (spellcastingMode === 'NONE' && spellcastingAbility) throw new Error('A non-spellcasting class cannot have a spellcasting ability.');
    if (spellcastingMode !== 'NONE' && (!spellcastingAbility || !ABILITY_INDEXES.has(spellcastingAbility))) {
        throw new Error('Spellcasting classes require a valid spellcasting ability.');
    }

    const multiclassPrerequisites = input.multiclassPrerequisites.map((rule) => ({
        abilityIndex: rule.abilityIndex.trim().toLowerCase(),
        minimum: Number(rule.minimum),
        group: Number(rule.group),
    }));
    if (multiclassPrerequisites.some((rule) => !ABILITY_INDEXES.has(rule.abilityIndex)
        || !Number.isInteger(rule.minimum) || rule.minimum < 1 || rule.minimum > 30
        || !Number.isInteger(rule.group) || rule.group < 1)) {
        throw new Error('Invalid multiclass prerequisite.');
    }

    const proficiencies = input.proficiencies.map((rule) => ({
        value: rule.value.trim(),
        grant: rule.grant.trim().toUpperCase() as ClassProficiencyGrant,
        choiceGroup: rule.choiceGroup == null ? null : Number(rule.choiceGroup),
        choiceCount: rule.choiceCount == null ? null : Number(rule.choiceCount),
    }));
    if (proficiencies.some((rule) => !rule.value || !PROFICIENCY_GRANTS.has(rule.grant)
        || (rule.choiceGroup == null) !== (rule.choiceCount == null))) {
        throw new Error('Invalid class proficiency definition.');
    }
    const proficiencyKeys = proficiencies.map((rule) => `${rule.grant}:${rule.value}`);
    if (new Set(proficiencyKeys).size !== proficiencyKeys.length) {
        throw new Error('Duplicate proficiency rules are not allowed.');
    }
    // Choice-group numbers are scoped per grant (STARTING vs MULTICLASS), matching gameplay.
    for (const grant of PROFICIENCY_GRANTS) {
        assertGroupedChoiceInvariants(
            proficiencies
                .filter((rule) => rule.grant === grant)
                .map((rule) => ({
                    choiceGroup: rule.choiceGroup,
                    choiceCount: rule.choiceCount,
                    optionKey: rule.value,
                })),
            `${grant.toLowerCase()} proficiency definition`,
        );
    }

    const equipment = input.equipment.map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity),
        choiceGroup: item.choiceGroup == null ? null : Number(item.choiceGroup),
        choiceCount: item.choiceCount == null ? null : Number(item.choiceCount),
    }));
    if (equipment.some((item) => !item.name || !Number.isInteger(item.quantity) || item.quantity < 1
        || (item.choiceGroup == null) !== (item.choiceCount == null))) {
        throw new Error('Invalid starting equipment definition.');
    }
    assertGroupedChoiceInvariants(
        equipment.map((item) => ({
            choiceGroup: item.choiceGroup,
            choiceCount: item.choiceCount,
            optionKey: item.name.toLowerCase(),
        })),
        'starting equipment definition',
    );

    const levels = input.progression.map((level) => ({
        level: Number(level.level),
        abilityScoreImprovement: level.abilityScoreImprovement,
        spellSlots: level.spellSlots.map(Number),
        cantripsKnown: level.cantripsKnown == null ? null : Number(level.cantripsKnown),
        spellsKnown: level.spellsKnown == null ? null : Number(level.spellsKnown),
        preparedSpellCount: level.preparedSpellCount == null ? null : Number(level.preparedSpellCount),
        classSpecific: Object.fromEntries(level.displayValues.map(({ key, value }) => [key.trim(), value.trim()])),
    })).sort((left, right) => left.level - right.level);
    if (levels.length !== 20 || levels.some((level, index) => level.level !== index + 1)) {
        throw new Error('Progression must contain each class level from 1 through 20 exactly once.');
    }
    if (levels.some((level) => level.spellSlots.length !== 9
        || level.spellSlots.some((slot) => !Number.isInteger(slot) || slot < 0)
        || [level.cantripsKnown, level.spellsKnown, level.preparedSpellCount]
            .some((value) => value != null && (!Number.isInteger(value) || value < 0)))) {
        throw new Error('Invalid spellcasting progression.');
    }
    if (spellcastingMode === 'NONE' && levels.some((level) => level.spellSlots.some(Boolean)
        || level.cantripsKnown != null || level.spellsKnown != null || level.preparedSpellCount != null)) {
        throw new Error('A non-spellcasting class cannot define a spell progression.');
    }
    if (spellcastingMode === 'PACT_MAGIC') {
        for (const level of levels) assertValidPactMagicSlots(level.spellSlots);
    }

    const featureKeys = new Set<string>();
    const features = input.features.map((feature, index) => {
        const id = feature.id?.trim() || null;
        const featureName = feature.name.trim();
        const featureDescription = feature.description.trim();
        const level = Number(feature.level);
        const key = `${level}:${featureName.toLowerCase()}`;
        if (!featureName || !featureDescription || !Number.isInteger(level) || level < 1 || level > 20) {
            throw new Error(`Feature ${index + 1} is invalid.`);
        }
        if (featureKeys.has(key)) throw new Error(`Duplicate feature "${featureName}" at level ${level}.`);
        featureKeys.add(key);
        return { id, name: featureName, description: featureDescription, level };
    });

    return {
        name, emoji, description, hitDie, primaryAbilityIndexes, savingThrowIndexes,
        multiclassPrerequisites, proficiencies, equipment, spellcastingMode, spellcastingAbility,
        addSpellcastingAbility, levels, features, spellIds: uniqueStrings(input.spellIds, 'Spell list'),
    };
}

function jsonArray(value: Prisma.JsonValue | null): Array<Record<string, unknown>> {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => !!item && typeof item === 'object' && !Array.isArray(item)) as Array<Record<string, unknown>>;
}

export function mapClassDetails(row: ClassDetailsRow) {
    const characterUsageCount = row._count.characterClasses;
    return {
        id: row.id,
        value: row.srdIndex ?? row.id,
        srdIndex: row.srdIndex,
        name: row.name,
        emoji: row.emoji,
        description: row.description,
        hitDie: row.hitDie ?? 0,
        primaryAbilityIndexes: row.primaryAbilityIndexes,
        savingThrowIndexes: row.savingThrowIndexes,
        spellcastingMode: row.spellcastingMode,
        spellcastingAbility: row.spellcastingAbility,
        addSpellcastingAbility: row.addSpellcastingAbility,
        isCustom: row.ownerUserId != null,
        archived: row.archivedAt != null,
        sourceBook: row.sourceBook,
        multiclassPrerequisites: jsonArray(row.multiclassPrerequisites).map((rule) => ({
            abilityIndex: String(rule.abilityIndex ?? ''), minimum: Number(rule.minimum), group: Number(rule.group),
        })),
        proficiencies: row.proficiencyRules.map((rule) => ({
            value: rule.proficiencyRef.srdIndex ?? rule.proficiencyRef.id,
            name: rule.proficiencyRef.name,
            type: rule.proficiencyRef.type,
            grant: rule.grant,
            choiceGroup: rule.choiceGroup,
            choiceCount: rule.choiceCount,
        })),
        equipment: jsonArray(row.startingEquipment).map((item) => ({
            name: String(item.name ?? ''), quantity: Number(item.quantity),
            choiceGroup: item.choiceGroup == null ? null : Number(item.choiceGroup),
            choiceCount: item.choiceCount == null ? null : Number(item.choiceCount),
        })),
        progression: row.progression.map((level) => ({
            ...level,
            displayValues: Object.entries((level.classSpecific as Record<string, string> | null) ?? {}).map(([key, value]) => ({ key, value: String(value) })),
        })),
        features: row.features.map((feature) => ({
            id: feature.id, name: feature.name, description: feature.description.join('\n\n'), level: feature.level ?? 1,
        })),
        spells: row.spellList.map(({ spellRef }) => ({ id: spellRef.id, name: spellRef.name, level: spellRef.level })),
        characterUsageCount,
        mechanicsLocked: characterUsageCount > 0,
        mechanicsLockedReason: characterUsageCount > 0
            ? `Mechanics are locked because ${characterUsageCount} character(s) use this class.`
            : null,
    };
}

async function resolveReferences(userId: string, input: NormalisedClassInput) {
    const values = input.proficiencies.map((rule) => rule.value);
    const [proficiencies, spells] = await Promise.all([
        prisma.proficiency.findMany({
            where: proficiencyReferenceWhere(userId, values),
        }),
        prisma.spell.findMany({ where: { id: { in: input.spellIds } }, select: { id: true } }),
    ]);
    const proficiencyByValue = new Map(proficiencies.flatMap((row) => [[row.id, row], ...(row.srdIndex ? [[row.srdIndex, row] as const] : [])]));
    if (input.proficiencies.some((rule) => !proficiencyByValue.has(rule.value))) throw new Error('Unknown or inaccessible proficiency.');
    if (spells.length !== input.spellIds.length) throw new Error('Unknown spell in class spell list.');
    return { proficiencyByValue };
}

/**
 * Deterministically serialises a value for structural mechanics comparison.
 * Object keys are sorted recursively so Postgres jsonb key reordering (which
 * does not preserve original insertion order) can never produce a false
 * "mechanics changed" positive. Array element order is preserved as-is —
 * callers that need order-independent ("set-like") comparison should sort
 * the array with {@link sortByCanonicalForm} before it reaches this function.
 */
export function canonicaliseMechanicsValue(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map((item) => canonicaliseMechanicsValue(item)).join(',')}]`;
    }
    if (value !== null && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const entries = Object.keys(record).sort().map(
            (key) => `${JSON.stringify(key)}:${canonicaliseMechanicsValue(record[key])}`,
        );
        return `{${entries.join(',')}}`;
    }
    return JSON.stringify(value ?? null);
}

/**
 * Sorts a set-like collection by each item's canonical form so item order
 * (which jsonb storage and query results do not guarantee) cannot affect
 * structural equality.
 */
export function sortByCanonicalForm<T>(values: readonly T[]): T[] {
    return [...values].sort((left, right) => (
        canonicaliseMechanicsValue(left).localeCompare(canonicaliseMechanicsValue(right))
    ));
}

/** Structural mechanics fields compared to detect a locked class's mechanics changing. */
type MechanicsSnapshotInput = {
    name: string;
    hitDie: number;
    primaryAbilityIndexes: string[];
    savingThrowIndexes: string[];
    multiclassPrerequisites: unknown[];
    proficiencies: unknown[];
    equipment: unknown[];
    spellcastingMode: string;
    spellcastingAbility: string | null;
    addSpellcastingAbility: boolean;
    levels: unknown[];
    features: unknown[];
    spellIds: string[];
};

/** Builds the canonical mechanics snapshot for a freshly normalised class input. */
function mechanicsSnapshot(input: NormalisedClassInput): string {
    return canonicaliseMechanicsValue({
        name: input.name,
        hitDie: input.hitDie,
        primaryAbilityIndexes: [...input.primaryAbilityIndexes].sort(),
        savingThrowIndexes: [...input.savingThrowIndexes].sort(),
        multiclassPrerequisites: sortByCanonicalForm(input.multiclassPrerequisites),
        proficiencies: sortByCanonicalForm(input.proficiencies),
        equipment: sortByCanonicalForm(input.equipment),
        spellcastingMode: input.spellcastingMode,
        spellcastingAbility: input.spellcastingAbility,
        addSpellcastingAbility: input.addSpellcastingAbility,
        levels: input.levels.map(({ level, abilityScoreImprovement, spellSlots, cantripsKnown, spellsKnown, preparedSpellCount, classSpecific }) => ({ level, abilityScoreImprovement, spellSlots, cantripsKnown, spellsKnown, preparedSpellCount, classSpecific })),
        features: sortByCanonicalForm(input.features.map(({ id, level }) => ({ id, level }))),
        spellIds: [...input.spellIds].sort(),
    } satisfies MechanicsSnapshotInput);
}

/** Builds the canonical mechanics snapshot for a persisted class row. */
function rowMechanicsSnapshot(row: ClassDetailsRow): string {
    return canonicaliseMechanicsValue({
        name: row.name,
        hitDie: row.hitDie ?? 0,
        primaryAbilityIndexes: [...row.primaryAbilityIndexes].sort(),
        savingThrowIndexes: [...row.savingThrowIndexes].sort(),
        multiclassPrerequisites: sortByCanonicalForm(jsonArray(row.multiclassPrerequisites)),
        proficiencies: sortByCanonicalForm(row.proficiencyRules.map((rule) => ({ value: rule.proficiencyRef.srdIndex ?? rule.proficiencyRef.id, grant: rule.grant, choiceGroup: rule.choiceGroup, choiceCount: rule.choiceCount }))),
        equipment: sortByCanonicalForm(jsonArray(row.startingEquipment)),
        spellcastingMode: row.spellcastingMode,
        spellcastingAbility: row.spellcastingAbility,
        addSpellcastingAbility: row.addSpellcastingAbility,
        levels: row.progression.map((level) => ({
            level: level.level,
            abilityScoreImprovement: level.abilityScoreImprovement,
            spellSlots: level.spellSlots,
            cantripsKnown: level.cantripsKnown,
            spellsKnown: level.spellsKnown,
            preparedSpellCount: level.preparedSpellCount,
            classSpecific: (level.classSpecific as Record<string, string>) ?? {},
        })),
        features: sortByCanonicalForm(row.features.map((feature) => ({ id: feature.id, level: feature.level ?? 1 }))),
        spellIds: [...row.spellList.map((entry) => entry.spellId)].sort(),
    } satisfies MechanicsSnapshotInput);
}

/** Rejects feature membership changes after a class becomes mechanics-locked. */
export function assertLockedFeatureMembership(
    features: readonly LockedFeatureInput[],
    existingFeatures: readonly ExistingLockedFeature[],
): void {
    const existingIds = new Set(existingFeatures.map((feature) => feature.id));
    const submittedIds = features.map((feature) => feature.id);
    if (submittedIds.some((featureId) => featureId == null || !existingIds.has(featureId))
        || submittedIds.length !== existingIds.size
        || new Set(submittedIds).size !== submittedIds.length) {
        throw new Error('Class feature membership is locked because this class is used by a character.');
    }
}

async function writeClassRelations(tx: Prisma.TransactionClient, classId: string, userId: string, input: NormalisedClassInput, proficiencyByValue: Map<string, { id: string }>) {
    await Promise.all([
        tx.classLevelProgression.deleteMany({ where: { classId } }),
        tx.classProficiency.deleteMany({ where: { classId } }),
        tx.classSpell.deleteMany({ where: { classId } }),
        tx.feature.deleteMany({ where: { classId, ownerUserId: userId, kind: 'CLASS_FEATURE' } }),
    ]);
    await Promise.all([
        tx.classLevelProgression.createMany({ data: input.levels.map((level) => ({ ...level, classSpecific: level.classSpecific, classId })) }),
        tx.classProficiency.createMany({ data: input.proficiencies.map((rule) => ({ classId, proficiencyId: proficiencyByValue.get(rule.value)!.id, grant: rule.grant, choiceGroup: rule.choiceGroup, choiceCount: rule.choiceCount })) }),
        tx.classSpell.createMany({ data: input.spellIds.map((spellId) => ({ classId, spellId })) }),
        tx.feature.createMany({ data: input.features.map((feature) => ({ ownerUserId: userId, classId, kind: 'CLASS_FEATURE', name: feature.name, description: [feature.description], level: feature.level, sourceLabel: input.name })) }),
    ]);
}

export async function availableClasses(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const rows = await prisma.class.findMany({
        where: { archivedAt: null, OR: [{ ownerUserId: null }, { ownerUserId: userId }] },
        orderBy: { name: 'asc' },
    });
    return rows.map((row) => ({
        id: row.id, value: row.srdIndex ?? row.id, srdIndex: row.srdIndex, name: row.name,
        emoji: row.emoji,
        description: row.description, hitDie: row.hitDie ?? 0, primaryAbilityIndexes: row.primaryAbilityIndexes,
        savingThrowIndexes: row.savingThrowIndexes, spellcastingMode: row.spellcastingMode,
        spellcastingAbility: row.spellcastingAbility,
        multiclassPrerequisites: jsonArray(row.multiclassPrerequisites).map((rule) => ({ abilityIndex: String(rule.abilityIndex ?? ''), minimum: Number(rule.minimum), group: Number(rule.group) })),
        isCustom: row.ownerUserId != null,
    }));
}

export async function classDetails(_parent: unknown, { value }: QueryClassDetailsArgs, ctx: Context) {
    const userId = requireUser(ctx);
    const row = await prisma.class.findFirst({
        where: { OR: [{ srdIndex: value, ownerUserId: null }, { id: value, ownerUserId: userId }] },
        include: CLASS_DETAILS_INCLUDE,
    });
    return row ? mapClassDetails(row) : null;
}

/**
 * Batch-loads full class definitions for a character's attached class ids,
 * regardless of archived status. Unlike {@link availableClasses} and
 * {@link customClasses}, this does not filter out archived rows: a custom
 * class a character is already levelled into must keep exposing its full
 * mechanics (progression, features, spellcasting) even after the owner
 * archives it, so level-up derivation never silently loses data. Callers
 * resolve which ids to request by inspecting `Character.classes`, so this
 * never surfaces archived classes as options for a *new* class pick.
 */
export async function attachedClassDetails(_parent: unknown, { values }: QueryAttachedClassDetailsArgs, ctx: Context) {
    const userId = requireUser(ctx);
    if (values.length === 0) return [];
    const rows = await prisma.class.findMany({
        where: { OR: [{ srdIndex: { in: values }, ownerUserId: null }, { id: { in: values }, ownerUserId: userId }] },
        include: CLASS_DETAILS_INCLUDE,
    });
    return rows.map(mapClassDetails);
}

export async function customClasses(_parent: unknown, _args: unknown, ctx: Context) {
    const userId = requireUser(ctx);
    const rows = await prisma.class.findMany({ where: { ownerUserId: userId, archivedAt: null }, orderBy: { name: 'asc' }, include: CLASS_DETAILS_INCLUDE });
    return rows.map(mapClassDetails);
}

export async function createCustomClass(_parent: unknown, { input }: MutationCreateCustomClassArgs, ctx: Context) {
    const userId = requireUser(ctx);
    const values = normaliseClassInput(input);
    const { proficiencyByValue } = await resolveReferences(userId, values);
    const duplicate = await prisma.class.findFirst({ where: { ownerUserId: userId, archivedAt: null, name: { equals: values.name, mode: 'insensitive' } }, select: { id: true } });
    if (duplicate) throw new Error(ACTIVE_CUSTOM_CLASS_NAME_EXISTS);
    let classId: string;
    try {
        classId = await prisma.$transaction(async (tx) => {
            const row = await tx.class.create({ data: {
                ownerUserId: userId, name: values.name, emoji: values.emoji, description: [values.description], hitDie: values.hitDie,
                primaryAbilityIndexes: values.primaryAbilityIndexes, savingThrowIndexes: values.savingThrowIndexes,
                multiclassPrerequisites: values.multiclassPrerequisites, startingEquipment: values.equipment,
                spellcastingMode: values.spellcastingMode, spellcastingAbility: values.spellcastingAbility,
                addSpellcastingAbility: values.addSpellcastingAbility, sourceBook: 'Custom',
            } });
            await writeClassRelations(tx, row.id, userId, values, proficiencyByValue);
            return row.id;
        });
    } catch (error) {
        translateActiveCustomClassNameConflict(error);
    }
    const created = await classDetails({}, { value: classId }, ctx);
    if (!created) throw new Error('Failed to load the created custom class.');
    return created;
}

export async function updateCustomClass(_parent: unknown, { id, input }: MutationUpdateCustomClassArgs, ctx: Context) {
    const userId = requireUser(ctx);
    const values = normaliseClassInput(input);
    const current = await prisma.class.findFirst({ where: { id, ownerUserId: userId, archivedAt: null }, include: CLASS_DETAILS_INCLUDE });
    if (!current) throw new Error('Custom class not found.');
    const duplicate = await prisma.class.findFirst({ where: { ownerUserId: userId, archivedAt: null, id: { not: id }, name: { equals: values.name, mode: 'insensitive' } }, select: { id: true } });
    if (duplicate) throw new Error(ACTIVE_CUSTOM_CLASS_NAME_EXISTS);
    const mechanicsLocked = current._count.characterClasses > 0;
    if (mechanicsLocked) {
        assertLockedFeatureMembership(values.features, current.features);
        if (mechanicsSnapshot(values) !== rowMechanicsSnapshot(current)) {
            throw new Error('Class mechanics are locked because this class is used by a character.');
        }
    }
    const references = mechanicsLocked ? null : await resolveReferences(userId, values);
    try {
        await prisma.$transaction(async (tx) => {
            await tx.class.update({ where: { id }, data: { name: values.name, emoji: values.emoji, description: [values.description], ...(!mechanicsLocked ? {
                hitDie: values.hitDie, primaryAbilityIndexes: values.primaryAbilityIndexes, savingThrowIndexes: values.savingThrowIndexes,
                multiclassPrerequisites: values.multiclassPrerequisites, startingEquipment: values.equipment,
                spellcastingMode: values.spellcastingMode, spellcastingAbility: values.spellcastingAbility,
                addSpellcastingAbility: values.addSpellcastingAbility,
            } : {}) } });
            if (!mechanicsLocked) {
                await writeClassRelations(tx, id, userId, values, references!.proficiencyByValue);
            } else {
                for (const feature of values.features) {
                    await tx.feature.updateMany({ where: { id: feature.id!, classId: id, ownerUserId: userId, kind: 'CLASS_FEATURE' }, data: { name: feature.name, description: [feature.description] } });
                }
            }
        });
    } catch (error) {
        translateActiveCustomClassNameConflict(error);
    }
    const updated = await classDetails({}, { value: id }, ctx);
    if (!updated) throw new Error('Failed to load the updated custom class.');
    return updated;
}

export async function archiveCustomClass(_parent: unknown, { id }: MutationArchiveCustomClassArgs, ctx: Context) {
    const userId = requireUser(ctx);
    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.class.updateMany({ where: { id, ownerUserId: userId, archivedAt: null }, data: { archivedAt: new Date() } });
        if (updated.count > 0) await tx.subclass.updateMany({ where: { classId: id, ownerUserId: userId, archivedAt: null }, data: { archivedAt: new Date() } });
        return updated.count > 0;
    });
    if (!result) throw new Error('Custom class not found.');
    return true;
}
