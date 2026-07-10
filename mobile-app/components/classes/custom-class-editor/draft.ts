import type { ClassDetailsFieldsFragment, ManagedCustomClassInput } from '@/types/generated_graphql_types';
import type { Draft, DraftLevel, IdentityFieldErrors } from './types';

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
            spellIds: [],
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
        equipment: initial.equipment.map((item) => ({ ...item })),
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
        spellIds: initial.spells.map((spell) => spell.id),
    };
}

export function serialiseDraft(draft: Draft): ManagedCustomClassInput {
    return {
        ...draft,
        features: draft.features.map(({ key: _key, ...feature }) => feature),
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

/** Next unused choice-group id for a grant. */
export function nextChoiceGroupId(groups: ProficiencyChoiceGroup[]): number {
    return groups.reduce((max, group) => Math.max(max, group.choiceGroup), 0) + 1;
}
