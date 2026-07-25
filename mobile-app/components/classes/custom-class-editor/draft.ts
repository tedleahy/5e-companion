import type { ClassDetailsFieldsFragment, ManagedCustomClassInput } from '@/types/generated_graphql_types';
import { emptySpellSlots, pactFromSpellSlots, spellSlotsFromPact } from './spellSlots';
import type { Draft, DraftEquipment, DraftLevel, IdentityFieldErrors } from './types';

let equipmentKeySeq = 0;

/** Highest class level supported by custom-class progression. */
export const MAX_CLASS_LEVEL = 20;

/** Stable client key for an equipment row (stripped on serialise). */
export function newEquipmentKey(): string {
    equipmentKeySeq += 1;
    return `equipment-${Date.now()}-${equipmentKeySeq}`;
}

export function emptyProgression(): DraftLevel[] {
    return Array.from({ length: MAX_CLASS_LEVEL }, (_, index) => ({
        level: index + 1,
        abilityScoreImprovement: false,
        spellSlots: Array(9).fill(0),
        cantripsKnown: null,
        spellsKnown: null,
        preparedSpellCount: null,
        displayValues: [],
    }));
}

/** True when spellcasting fields still match an empty progression row. */
export function hasDefaultSpellcasting(level: DraftLevel): boolean {
    return level.spellSlots.every((slot) => slot === 0)
        && level.cantripsKnown == null
        && level.spellsKnown == null
        && level.preparedSpellCount == null;
}

/**
 * Copy spellcasting fields from one progression row onto another, preserving
 * level, ASI, and display values on the target.
 */
export function copySpellcastingFrom(source: DraftLevel, target: DraftLevel): DraftLevel {
    return {
        ...target,
        spellSlots: [...source.spellSlots],
        cantripsKnown: source.cantripsKnown,
        spellsKnown: source.spellsKnown,
        preparedSpellCount: source.preparedSpellCount,
    };
}

/**
 * When advancing to the next class level, prefill untouched spellcasting fields
 * from the previous level. Does not overwrite levels that already have values.
 */
export function withPrefillOnLevelAdvance(
    progression: DraftLevel[],
    fromLevel: number,
    toLevel: number,
): DraftLevel[] {
    if (toLevel !== fromLevel + 1) return progression;
    const source = progression[fromLevel - 1];
    const target = progression[toLevel - 1];
    if (!source || !target
        || hasDefaultSpellcasting(source)
        || !hasDefaultSpellcasting(target)) return progression;
    return progression.map((item) =>
        item.level === toLevel ? copySpellcastingFrom(source, item) : item,
    );
}

/**
 * Always copy spellcasting fields from level N−1 onto level N (overwrites).
 * No-op when N is 1 or either row is missing.
 */
export function withCopyFromPreviousLevel(
    progression: DraftLevel[],
    level: number,
): DraftLevel[] {
    if (level <= 1) return progression;
    const source = progression[level - 2];
    const target = progression[level - 1];
    if (!source || !target) return progression;
    return progression.map((item) =>
        item.level === level ? copySpellcastingFrom(source, item) : item,
    );
}

/**
 * Compact slot summary for progression overview (e.g. "4/3/3/1" or "—").
 * Keeps leading/intermediate zeroes through the highest populated level so
 * position still maps to spell level (e.g. `[0, 2]` → "0/2", not "2").
 */
export function shortSpellSlots(slots: readonly number[]): string {
    let highest = -1;
    for (let index = 0; index < slots.length; index += 1) {
        if ((slots[index] ?? 0) > 0) highest = index;
    }
    if (highest < 0) return '—';
    return slots.slice(0, highest + 1).join('/');
}

/** True when any spell slot count is greater than zero. */
export function hasSpellSlots(level: DraftLevel): boolean {
    return level.spellSlots.some((slot) => slot > 0);
}

export function createDraft(initial?: ClassDetailsFieldsFragment | null): Draft {
    if (!initial) {
        return {
            name: '',
            emoji: '⚔️',
            description: '',
            hitDie: 8,
            primaryAbilityIndexes: [],
            savingThrowIndexes: [],
            multiclassPrerequisites: [],
            proficiencies: [],
            equipment: [],
            spellcastingMode: 'NONE',
            spellcastingAbility: null,
            addSpellcastingAbility: false,
            progression: emptyProgression(),
            features: [],
            spells: [],
        };
    }
    return {
        name: initial.name,
        emoji: initial.emoji,
        description: initial.description.join('\n\n'),
        hitDie: initial.hitDie,
        primaryAbilityIndexes: [...initial.primaryAbilityIndexes],
        savingThrowIndexes: [...initial.savingThrowIndexes],
        multiclassPrerequisites: initial.multiclassPrerequisites.map((item) => ({ ...item })),
        proficiencies: initial.proficiencies.map(({ value, grant, choiceGroup, choiceCount }) => ({
            value,
            grant,
            choiceGroup,
            choiceCount,
        })),
        equipment: initial.equipment.map((item) => ({ ...item, key: newEquipmentKey() })),
        spellcastingMode: initial.spellcastingMode,
        spellcastingAbility: initial.spellcastingAbility,
        addSpellcastingAbility: initial.addSpellcastingAbility,
        progression: initial.progression.map(({ displayValues, ...level }) => ({
            ...level,
            spellSlots: [...level.spellSlots],
            displayValues: displayValues.map((item) => ({ ...item })),
        })),
        features: initial.features.map((feature) => ({
            id: feature.id,
            key: feature.id,
            name: feature.name,
            description: feature.description,
            level: feature.level,
        })),
        spells: initial.spells.map((spell) => ({
            id: spell.id,
            name: spell.name,
            level: spell.level,
        })),
    };
}

/**
 * Canonicalises progression levels for submission based on spellcasting mode,
 * without mutating the draft the editor keeps in state. This lets the user
 * switch spellcasting modes back and forth in the UI while only ever sending
 * the server data that matches the currently selected mode:
 * - `NONE` strips spell slots/known/prepared counts to their empty shape so
 *   leftover draft data from a previous STANDARD/PACT_MAGIC selection never
 *   reaches the "non-spellcasting class" server validation.
 * - `PACT_MAGIC` collapses each level's spell slots down to the single valid
 *   pact slot level + count, in case leftover STANDARD-mode data left more
 *   than one populated slot level.
 * - `STANDARD` is sent unchanged.
 */
export function canonicaliseProgressionForSubmit(
    progression: readonly DraftLevel[],
    spellcastingMode: Draft['spellcastingMode'],
): DraftLevel[] {
    if (spellcastingMode === 'NONE') {
        return progression.map((level) => ({
            ...level,
            spellSlots: emptySpellSlots(),
            cantripsKnown: null,
            spellsKnown: null,
            preparedSpellCount: null,
        }));
    }
    if (spellcastingMode === 'PACT_MAGIC') {
        return progression.map((level) => {
            const pact = pactFromSpellSlots(level.spellSlots);
            return { ...level, spellSlots: spellSlotsFromPact(pact.level, pact.count) };
        });
    }
    return progression.map((level) => ({ ...level }));
}

export function serialiseDraft(draft: Draft): ManagedCustomClassInput {
    const { spells, features, equipment, progression, ...rest } = draft;
    return {
        ...rest,
        features: features.map(({ key: _key, ...feature }) => feature),
        equipment: equipment.map(({ key: _key, ...item }) => item),
        progression: canonicaliseProgressionForSubmit(progression, draft.spellcastingMode),
        spellIds: spells.map((spell) => spell.id),
    };
}

/** Per-field identity validation used for inline errors after Continue is pressed. */
export function identityFieldErrors(draft: Draft): IdentityFieldErrors {
    const errors: IdentityFieldErrors = {};
    if (!draft.name.trim()) errors.name = 'Class name is required.';
    if (!draft.emoji.trim()) errors.emoji = 'Emoji is required.';
    if (!draft.description.trim()) errors.description = 'Description is required.';
    if (draft.primaryAbilityIndexes.length === 0) {
        errors.primaryAbilities = 'Choose at least one primary ability.';
    }
    if (draft.savingThrowIndexes.length !== 2) {
        errors.savingThrows = 'Choose exactly two saving throws.';
    }
    return errors;
}

export function stageError(stage: number, draft: Draft): string | null {
    if (stage === 0) {
        const errors = identityFieldErrors(draft);
        return errors.name
            ?? errors.emoji
            ?? errors.description
            ?? errors.primaryAbilities
            ?? errors.savingThrows
            ?? null;
    }
    if (stage === 2) {
        if (draft.equipment.some((item) => !item.name.trim() || item.quantity < 1)) {
            return 'Every equipment entry needs a name and a quantity of at least 1.';
        }
        const groups = equipmentChoiceGroups(draft);
        if (groups.some((group) => group.items.length === 0 || group.choiceCount > group.items.length)) {
            return 'Each equipment choice group needs enough options for its choose count.';
        }
    }
    if (stage === 3 && draft.spellcastingMode !== 'NONE' && !draft.spellcastingAbility) {
        return 'Choose a spellcasting ability.';
    }
    if (stage === 4 && draft.features.some((feature) => !feature.name.trim() || !feature.description.trim())) {
        return 'Every feature needs a name and description.';
    }
    return null;
}

export type ProficiencyChoiceGroup = {
    choiceGroup: number;
    choiceCount: number;
    values: string[];
};

export type ProficiencyCategoryType = 'ARMOR' | 'WEAPON' | 'SKILL' | 'TOOL' | 'OTHER';

export const PROFICIENCY_CATEGORIES: ReadonlyArray<{
    type: ProficiencyCategoryType;
    label: string;
    icon: string;
}> = [
    // Prefer emoji presentation (FE0F) so icons stay colorful on Android/web, not thin text glyphs.
    { type: 'ARMOR', label: 'Armor', icon: '🛡️' },
    { type: 'WEAPON', label: 'Weapons', icon: '⚔️' },
    { type: 'SKILL', label: 'Skills', icon: '🎯' },
    { type: 'TOOL', label: 'Tools', icon: '🔧' },
    { type: 'OTHER', label: 'Other', icon: '✨' },
];

export type EquipmentEntry = {
    key: string;
    name: string;
    quantity: number;
};

export type EquipmentChoiceGroup = {
    choiceGroup: number;
    choiceCount: number;
    items: EquipmentEntry[];
};

/** Resolve a proficiency value's category; unknown values fall into Other. */
export function proficiencyCategoryForValue(
    value: string,
    typeByValue: ReadonlyMap<string, string>,
): ProficiencyCategoryType {
    const type = typeByValue.get(value);
    if (type === 'ARMOR' || type === 'WEAPON' || type === 'SKILL' || type === 'TOOL') return type;
    return 'OTHER';
}

/** Fixed (non-choice) proficiency values for a grant. */
export function fixedProficiencyValues(draft: Draft, grant: string): string[] {
    return draft.proficiencies
        .filter((item) => item.grant === grant && item.choiceGroup == null)
        .map((item) => item.value);
}

/** Fixed proficiency values for one grant + category. */
export function fixedProficiencyValuesForType(
    draft: Draft,
    grant: string,
    type: ProficiencyCategoryType,
    typeByValue: ReadonlyMap<string, string>,
): string[] {
    return fixedProficiencyValues(draft, grant).filter(
        (value) => proficiencyCategoryForValue(value, typeByValue) === type,
    );
}

/** Choice groups for a grant, sorted by group id. */
export function proficiencyChoiceGroups(draft: Draft, grant: string): ProficiencyChoiceGroup[] {
    const groups = new Map<number, ProficiencyChoiceGroup>();
    for (const item of draft.proficiencies) {
        if (item.grant !== grant || item.choiceGroup == null || item.choiceCount == null) continue;
        const existing = groups.get(item.choiceGroup);
        if (existing) {
            existing.values.push(item.value);
        } else {
            // First member wins when choiceCount disagrees within a group.
            groups.set(item.choiceGroup, {
                choiceGroup: item.choiceGroup,
                choiceCount: item.choiceCount,
                values: [item.value],
            });
        }
    }
    return [...groups.values()].sort((left, right) => left.choiceGroup - right.choiceGroup);
}

/**
 * Single choice pool for a grant + category (v1: one pool per type).
 * When legacy drafts have multiple same-type groups, they are merged.
 */
export function proficiencyChoiceGroupForType(
    draft: Draft,
    grant: string,
    type: ProficiencyCategoryType,
    typeByValue: ReadonlyMap<string, string>,
): ProficiencyChoiceGroup | null {
    const ofType = proficiencyChoiceGroups(draft, grant).filter((group) =>
        group.values.some((value) => proficiencyCategoryForValue(value, typeByValue) === type),
    );
    if (ofType.length === 0) return null;
    const [first, ...rest] = ofType;
    if (!first) return null;
    if (rest.length === 0) {
        return {
            ...first,
            values: first.values.filter(
                (value) => proficiencyCategoryForValue(value, typeByValue) === type,
            ),
        };
    }
    const values = ofType.flatMap((group) =>
        group.values.filter((value) => proficiencyCategoryForValue(value, typeByValue) === type),
    );
    return {
        choiceGroup: first.choiceGroup,
        choiceCount: Math.min(
            Math.max(1, first.choiceCount),
            Math.max(1, values.length),
        ),
        values,
    };
}

/** Replace fixed proficiency values for a grant, preserving choice groups. */
export function withFixedProficiencies(
    draft: Draft,
    grant: string,
    values: string[],
): Draft['proficiencies'] {
    return [
        ...draft.proficiencies.filter((item) => item.grant !== grant || item.choiceGroup != null),
        ...values.map((value) => ({
            value,
            grant,
            choiceGroup: null,
            choiceCount: null,
        })),
    ];
}

/** Replace fixed values for one category, preserving other fixed values and all choice groups. */
export function withFixedProficienciesForType(
    draft: Draft,
    grant: string,
    type: ProficiencyCategoryType,
    values: string[],
    typeByValue: ReadonlyMap<string, string>,
): Draft['proficiencies'] {
    const keptFixed = fixedProficiencyValues(draft, grant).filter(
        (value) => proficiencyCategoryForValue(value, typeByValue) !== type,
    );
    return withFixedProficiencies(draft, grant, [...keptFixed, ...values]);
}

/** Replace choice groups for a grant, preserving fixed values. */
export function withChoiceGroups(
    draft: Draft,
    grant: string,
    groups: ProficiencyChoiceGroup[],
): Draft['proficiencies'] {
    return [
        ...draft.proficiencies.filter((item) => item.grant !== grant || item.choiceGroup == null),
        ...groups.flatMap((group) =>
            group.values.map((value) => ({
                value,
                grant,
                choiceGroup: group.choiceGroup,
                choiceCount: group.choiceCount,
            })),
        ),
    ];
}

/**
 * Set or clear the single choice pool for a grant + category.
 * Pass null to remove all choice groups of that type.
 */
export function withChoiceGroupForType(
    draft: Draft,
    grant: string,
    type: ProficiencyCategoryType,
    group: ProficiencyChoiceGroup | null,
    typeByValue: ReadonlyMap<string, string>,
): Draft['proficiencies'] {
    const kept = proficiencyChoiceGroups(draft, grant).filter(
        (entry) =>
            !entry.values.some((value) => proficiencyCategoryForValue(value, typeByValue) === type),
    );
    if (group && group.values.length > 0) {
        return withChoiceGroups(draft, grant, [...kept, group]);
    }
    return withChoiceGroups(draft, grant, kept);
}

/** Next unused choice-group id. */
export function nextChoiceGroupId(groups: { choiceGroup: number }[]): number {
    return groups.reduce((max, group) => Math.max(max, group.choiceGroup), 0) + 1;
}

/** Fixed (non-choice) starting equipment entries. */
export function fixedEquipment(draft: Draft): EquipmentEntry[] {
    return draft.equipment
        .filter((item) => item.choiceGroup == null)
        .map(({ key, name, quantity }) => ({ key, name, quantity }));
}

/** Choice groups for starting equipment, sorted by group id. */
export function equipmentChoiceGroups(draft: Draft): EquipmentChoiceGroup[] {
    const groups = new Map<number, EquipmentChoiceGroup>();
    for (const item of draft.equipment) {
        if (item.choiceGroup == null || item.choiceCount == null) continue;
        const existing = groups.get(item.choiceGroup);
        if (existing) {
            existing.items.push({ key: item.key, name: item.name, quantity: item.quantity });
        } else {
            // First member wins when choiceCount disagrees within a group.
            groups.set(item.choiceGroup, {
                choiceGroup: item.choiceGroup,
                choiceCount: item.choiceCount,
                items: [{ key: item.key, name: item.name, quantity: item.quantity }],
            });
        }
    }
    return [...groups.values()].sort((left, right) => left.choiceGroup - right.choiceGroup);
}

function toDraftEquipment(
    item: EquipmentEntry,
    choiceGroup: number | null,
    choiceCount: number | null,
): DraftEquipment {
    return {
        key: item.key,
        name: item.name,
        quantity: item.quantity,
        choiceGroup,
        choiceCount,
    };
}

/** Replace fixed equipment, preserving choice groups. */
export function withFixedEquipment(draft: Draft, items: EquipmentEntry[]): Draft['equipment'] {
    return [
        ...draft.equipment.filter((item) => item.choiceGroup != null),
        ...items.map((item) => toDraftEquipment(item, null, null)),
    ];
}

/** Replace equipment choice groups, preserving fixed entries. */
export function withEquipmentChoiceGroups(
    draft: Draft,
    groups: EquipmentChoiceGroup[],
): Draft['equipment'] {
    return [
        ...draft.equipment.filter((item) => item.choiceGroup == null),
        ...groups.flatMap((group) =>
            group.items.map((item) => toDraftEquipment(item, group.choiceGroup, group.choiceCount)),
        ),
    ];
}
