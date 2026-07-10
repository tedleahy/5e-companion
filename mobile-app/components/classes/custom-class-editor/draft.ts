import type { ClassDetailsFieldsFragment, ManagedCustomClassInput } from '@/types/generated_graphql_types';
import type { Draft, DraftLevel } from './types';

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

export function stageError(stage: number, draft: Draft): string | null {
    if (stage === 0) {
        if (!draft.name.trim() || !draft.description.trim()) return 'Name and description are required.';
        if (draft.primaryAbilityIndexes.length === 0) return 'Choose at least one primary ability.';
        if (draft.savingThrowIndexes.length !== 2) return 'Choose exactly two saving throws.';
    }
    if (stage === 3 && draft.spellcastingMode !== 'NONE' && !draft.spellcastingAbility) {
        return 'Choose a spellcasting ability.';
    }
    if (stage === 4 && draft.features.some((feature) => !feature.name.trim() || !feature.description.trim())) {
        return 'Every feature needs a name and description.';
    }
    return null;
}

export function formatProficiencies(draft: Draft, grant: string) {
    return draft.proficiencies
        .filter((item) => item.grant === grant)
        .map((item) => [item.value, item.choiceGroup, item.choiceCount].filter((value) => value != null).join('|'))
        .join(', ');
}

export function parseProficiencies(text: string, grant: string) {
    return text
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const [value, group, count] = entry.split('|');
            return {
                value: value ?? '',
                grant,
                choiceGroup: group ? Number(group) : null,
                choiceCount: count ? Number(count) : null,
            };
        });
}
