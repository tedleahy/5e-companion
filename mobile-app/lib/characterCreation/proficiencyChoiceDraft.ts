import {
    proficiencyChoiceKey,
    type ClassProficiencyChoiceGroup,
} from '@/lib/characterCreation/classRules';
import type { CharacterClassDraft } from '@/lib/characterCreation/multiclass';

export type DraftProficiencyChoice = {
    classId: string;
    choiceGroup: number;
    values: string[];
};

/**
 * Stable identity for the class composition that owns proficiency draft picks.
 */
export function classCompositionKey(
    classes: readonly CharacterClassDraft[],
    startingClassId: string,
): string {
    return `${classes.map((classRow) => classRow.classId).join('|')}::${startingClassId}`;
}

/**
 * Returns true when classes or the starting-class designation changed enough
 * that proficiency draft picks must be cleared.
 */
export function didClassCompositionChange(
    previousClasses: readonly CharacterClassDraft[],
    previousStartingClassId: string,
    nextClasses: readonly CharacterClassDraft[],
    nextStartingClassId: string,
): boolean {
    return classCompositionKey(previousClasses, previousStartingClassId)
        !== classCompositionKey(nextClasses, nextStartingClassId);
}

/**
 * Drops proficiency-choice selections that are no longer valid for the current
 * class-scoped option groups (wrong class, unknown group, or values outside
 * the group's option list). Preserves still-valid unique values up to `pick`.
 */
export function reconcileProficiencyChoices(
    selections: readonly DraftProficiencyChoice[],
    groups: readonly ClassProficiencyChoiceGroup[],
): DraftProficiencyChoice[] {
    const groupsByKey = new Map(
        groups.map((group) => [proficiencyChoiceKey(group.classId, group.choiceGroup), group]),
    );

    return selections.flatMap((selection) => {
        const group = groupsByKey.get(proficiencyChoiceKey(selection.classId, selection.choiceGroup));
        if (!group) return [];

        const allowed = new Set(group.options.map((option) => option.value));
        const nextValues: string[] = [];
        for (const value of selection.values) {
            if (!allowed.has(value) || nextValues.includes(value)) continue;
            if (nextValues.length >= group.pick) continue;
            nextValues.push(value);
        }

        return nextValues.length > 0
            ? [{ classId: selection.classId, choiceGroup: selection.choiceGroup, values: nextValues }]
            : [];
    });
}

/**
 * Returns whether two proficiency-choice lists are identical in content/order.
 */
export function proficiencyChoicesEqual(
    left: readonly DraftProficiencyChoice[],
    right: readonly DraftProficiencyChoice[],
): boolean {
    if (left.length !== right.length) return false;
    return left.every((selection, index) => {
        const other = right[index];
        if (!other) return false;
        if (selection.classId !== other.classId || selection.choiceGroup !== other.choiceGroup) {
            return false;
        }
        if (selection.values.length !== other.values.length) return false;
        return selection.values.every((value, valueIndex) => value === other.values[valueIndex]);
    });
}

/**
 * Returns whether a proficiency-choice selection exactly fills its group with
 * unique members of that group's option list.
 */
export function isProficiencyChoiceGroupComplete(
    selection: DraftProficiencyChoice | undefined,
    group: ClassProficiencyChoiceGroup,
): boolean {
    const values = selection?.values ?? [];
    const uniqueValues = [...new Set(values)];
    if (uniqueValues.length !== values.length || uniqueValues.length !== group.pick) {
        return false;
    }

    const allowed = new Set(group.options.map((option) => option.value));
    return uniqueValues.every((value) => allowed.has(value));
}

/**
 * Returns whether every required proficiency choice group is complete and the
 * draft contains no unexpected class/group selections.
 */
export function areProficiencyChoicesComplete(
    selections: readonly DraftProficiencyChoice[],
    groups: readonly ClassProficiencyChoiceGroup[],
): boolean {
    const requiredKeys = new Set(
        groups.map((group) => proficiencyChoiceKey(group.classId, group.choiceGroup)),
    );
    if (selections.some((selection) => (
        !requiredKeys.has(proficiencyChoiceKey(selection.classId, selection.choiceGroup))
    ))) {
        return false;
    }

    return groups.every((group) => {
        const selection = selections.find((entry) => (
            entry.classId === group.classId && entry.choiceGroup === group.choiceGroup
        ));
        return isProficiencyChoiceGroupComplete(selection, group);
    });
}
