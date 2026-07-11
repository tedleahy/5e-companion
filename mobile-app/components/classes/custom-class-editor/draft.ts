import type { ClassDetailsFieldsFragment, ManagedCustomClassInput } from '@/types/generated_graphql_types';
import type { Draft, DraftEquipment, DraftLevel, IdentityFieldErrors } from './types';

let equipmentKeySeq = 0;

/** Stable client key for an equipment row (stripped on serialise). */
export function newEquipmentKey(): string {
    equipmentKeySeq += 1;
    return `equipment-${Date.now()}-${equipmentKeySeq}`;
}

export function emptyProgression(): DraftLevel[] {
    return Array.from({ length: 20 }, (_, index) => ({
        level: index + 1,
        abilityScoreImprovement: false,
        spellSlots: Array(9).fill(0),
        cantripsKnown: null,
        spellsKnown: null,
        preparedSpellCount: null,
        addSpellcastingAbility: false,
        displayValues: [],
    }));
}

/** True when spellcasting fields still match an empty progression row. */
export function hasDefaultSpellcasting(level: DraftLevel): boolean {
    return level.spellSlots.every((slot) => slot === 0)
        && level.cantripsKnown == null
        && level.spellsKnown == null
        && level.preparedSpellCount == null
        && !level.addSpellcastingAbility;
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
        addSpellcastingAbility: source.addSpellcastingAbility,
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
    if (!source || !target || !hasDefaultSpellcasting(target)) return progression;
    return progression.map((item) =>
        item.level === toLevel ? copySpellcastingFrom(source, item) : item,
    );
}

export function createDraft(initial?: ClassDetailsFieldsFragment | null): Draft {
    if (!initial) {
        return {
            name: '',
            description: '',
            hitDie: 8,
            primaryAbilityIndexes: [],
            savingThrowIndexes: [],
            multiclassPrerequisites: [],
            proficiencies: [],
            equipment: [],
            spellcastingMode: 'NONE',
            spellcastingAbility: null,
            progression: emptyProgression(),
            features: [],
            spells: [],
        };
    }
    return {
        name: initial.name,
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

export function serialiseDraft(draft: Draft): ManagedCustomClassInput {
    const { spells, features, equipment, ...rest } = draft;
    return {
        ...rest,
        features: features.map(({ key: _key, ...feature }) => feature),
        equipment: equipment.map(({ key: _key, ...item }) => item),
        spellIds: spells.map((spell) => spell.id),
    };
}

/** Per-field identity validation used for inline errors after Continue is pressed. */
export function identityFieldErrors(draft: Draft): IdentityFieldErrors {
    const errors: IdentityFieldErrors = {};
    if (!draft.name.trim()) errors.name = 'Class name is required.';
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

/** Fixed (non-choice) proficiency values for a grant. */
export function fixedProficiencyValues(draft: Draft, grant: string): string[] {
    return draft.proficiencies
        .filter((item) => item.grant === grant && item.choiceGroup == null)
        .map((item) => item.value);
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
