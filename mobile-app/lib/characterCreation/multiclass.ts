import {
    CLASS_OPTIONS,
    SUBCLASS_OPTIONS,
    type OptionItem,
} from '@/lib/characterCreation/options';
import { CLASS_SAVING_THROWS } from '@/lib/characterCreation/classRules';
import type { AbilityKey } from '@/lib/characterSheetUtils';

/** One class row in the local create-character draft. */
export type CharacterClassDraft = {
    classId: string;
    subclassId: string;
    level: number;
};

/**
 * Server-resolved presentation for a selected class in the create wizard.
 * Carries display name and saving-throw indexes (`str`, `dex`, …) so Skills
 * and Review do not fall back to hard-coded SRD maps for custom classes.
 */
export type CreateClassPresentation = {
    name: string;
    savingThrowIndexes: string[];
};

const ABILITY_KEY_BY_INDEX: Record<string, AbilityKey> = {
    str: 'strength',
    dex: 'dexterity',
    con: 'constitution',
    int: 'intelligence',
    wis: 'wisdom',
    cha: 'charisma',
};

/** Validation summary for the multiclass allocation step. */
export type CharacterClassDraftValidation = {
    errors: string[];
    remainingLevels: number;
    isValid: boolean;
};

/**
 * Creates one default draft class row.
 */
export function createCharacterClassDraft(
    classId = '',
    level = 1,
): CharacterClassDraft {
    return {
        classId,
        subclassId: '',
        level,
    };
}

/**
 * Returns all class rows' allocated levels.
 */
export function totalAllocatedClassLevels(classRows: CharacterClassDraft[]): number {
    return classRows.reduce((total, classRow) => total + classRow.level, 0);
}

/**
 * Returns the class-allocation difference from the chosen character level.
 */
export function remainingClassLevels(
    classRows: CharacterClassDraft[],
    totalLevel: number,
): number {
    return totalLevel - totalAllocatedClassLevels(classRows);
}

/**
 * Returns the class option metadata for a class id, or `null`.
 */
export function classOptionById(classId: string, classOptions: OptionItem[] = CLASS_OPTIONS): OptionItem | null {
    return classOptions.find((option) => option.value === classId) ?? null;
}

/**
 * Returns the display label for a class id, or a fallback.
 */
export function classLabel(classId: string, classOptions: OptionItem[] = CLASS_OPTIONS): string {
    return classOptionById(classId, classOptions)?.label ?? 'Unknown class';
}

/**
 * Captures server-resolved presentation for a selected available class.
 */
export function createClassPresentation(
    classRef: Pick<CreateClassPresentation, 'name' | 'savingThrowIndexes'>,
): CreateClassPresentation {
    return {
        name: classRef.name,
        savingThrowIndexes: [...classRef.savingThrowIndexes],
    };
}

/**
 * Upserts presentation for `classId` from the loaded available-class list.
 */
export function withClassPresentation(
    previous: Record<string, CreateClassPresentation>,
    classId: string,
    availableClasses: ReadonlyArray<{ value: string } & CreateClassPresentation>,
): Record<string, CreateClassPresentation> {
    const classRef = availableClasses.find((entry) => entry.value === classId);
    if (!classRef) return previous;
    return {
        ...previous,
        [classId]: createClassPresentation(classRef),
    };
}

/**
 * Drops presentation entries for class ids that are no longer selected.
 */
export function pruneClassPresentation(
    previous: Record<string, CreateClassPresentation>,
    classIds: readonly string[],
): Record<string, CreateClassPresentation> {
    const keep = new Set(classIds.filter((classId) => classId.trim().length > 0));
    return Object.fromEntries(
        Object.entries(previous).filter(([classId]) => keep.has(classId)),
    );
}

/**
 * Resolves a class display label from draft presentation, falling back to SRD options.
 */
export function presentationClassLabel(
    classId: string,
    presentationById: Record<string, CreateClassPresentation>,
): string {
    return presentationById[classId]?.name ?? classLabel(classId);
}

/**
 * Resolves starting saving throws from draft presentation, falling back to SRD maps.
 */
export function presentationSavingThrows(
    classId: string,
    presentationById: Record<string, CreateClassPresentation>,
): AbilityKey[] {
    const indexes = presentationById[classId]?.savingThrowIndexes;
    if (indexes != null) {
        return indexes.flatMap((index) => {
            const ability = ABILITY_KEY_BY_INDEX[index];
            return ability ? [ability] : [];
        });
    }
    return CLASS_SAVING_THROWS[classId] ?? [];
}

/**
 * Class-row label using draft presentation for the class name.
 */
export function formatPresentedClassRowLabel(
    classRow: CharacterClassDraft,
    presentationById: Record<string, CreateClassPresentation>,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): string {
    const currentClassLabel = presentationClassLabel(classRow.classId, presentationById);
    const currentSubclassLabel = subclassLabel(
        classRow.classId,
        classRow.subclassId,
        subclassOptionsByClassId,
    );
    if (currentSubclassLabel) {
        return `${currentSubclassLabel} ${currentClassLabel}`;
    }
    return currentClassLabel;
}

/**
 * Compact multiclass summary using draft presentation labels.
 */
export function formatPresentedClassSummary(
    classRows: CharacterClassDraft[],
    startingClassId = '',
    presentationById: Record<string, CreateClassPresentation> = {},
): string {
    if (classRows.length === 0) {
        return 'No classes selected';
    }

    const sortedClassRows = sortClassRowsForDisplay(classRows, startingClassId);
    if (sortedClassRows.length === 1) {
        return formatPresentedClassRowLabel(sortedClassRows[0]!, presentationById);
    }

    return sortedClassRows
        .map((classRow) => `${presentationClassLabel(classRow.classId, presentationById)} ${classRow.level}`)
        .join(' / ');
}

/**
 * Returns the subclass option metadata for a class/subclass pair, or `null`.
 */
export function subclassOptionById(
    classId: string,
    subclassId: string,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): OptionItem | null {
    return (subclassOptionsByClassId[classId] ?? []).find((option) => option.value === subclassId) ?? null;
}

/**
 * Returns the display label for a subclass id, or `null`.
 */
export function subclassLabel(
    classId: string,
    subclassId: string,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): string | null {
    return subclassOptionById(classId, subclassId, subclassOptionsByClassId)?.label ?? null;
}

/**
 * Returns whether the class has any selectable subclasses in the current SRD data.
 */
export function classHasSubclassOptions(
    classId: string,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): boolean {
    return (subclassOptionsByClassId[classId] ?? []).length > 0;
}

/**
 * Returns whether the class row may choose a subclass at its current level.
 */
export function isSubclassUnlocked(
    classRow: CharacterClassDraft,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): boolean {
    if (!classHasSubclassOptions(classRow.classId, subclassOptionsByClassId)) {
        return false;
    }

    return (subclassOptionsByClassId[classRow.classId] ?? []).some(
        (option) => classRow.level >= (option.selectionLevel ?? 1),
    );
}

/**
 * Clears stale subclass selections after class or level changes.
 */
export function sanitiseCharacterClassRow(
    classRow: CharacterClassDraft,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): CharacterClassDraft {
    if (!classRow.classId) {
        return {
            ...classRow,
            subclassId: '',
        };
    }

    if (!classHasSubclassOptions(classRow.classId, subclassOptionsByClassId)) {
        return {
            ...classRow,
            subclassId: '',
        };
    }

    if (!classRow.subclassId) {
        return classRow;
    }

    if (!subclassOptionById(classRow.classId, classRow.subclassId, subclassOptionsByClassId)) {
        return {
            ...classRow,
            subclassId: '',
        };
    }

    const selectedSubclass = subclassOptionById(
        classRow.classId,
        classRow.subclassId,
        subclassOptionsByClassId,
    );
    if (classRow.level < (selectedSubclass?.selectionLevel ?? 1)) {
        return {
            ...classRow,
            subclassId: '',
        };
    }

    return classRow;
}

/**
 * Sorts draft class rows by level, then starting-class status, then class label.
 */
export function sortClassRowsForDisplay<T extends CharacterClassDraft>(
    classRows: T[],
    startingClassId: string,
): T[] {
    return [...classRows].sort((left, right) => {
        if (left.level !== right.level) {
            return right.level - left.level;
        }

        const leftIsStartingClass = left.classId === startingClassId;
        const rightIsStartingClass = right.classId === startingClassId;
        if (leftIsStartingClass !== rightIsStartingClass) {
            return leftIsStartingClass ? -1 : 1;
        }

        return classLabel(left.classId).localeCompare(classLabel(right.classId));
    });
}

/**
 * Returns the first fully selected class row in display order, or `null`.
 */
function firstDisplayableClassRow(
    classRows: CharacterClassDraft[],
): CharacterClassDraft | null {
    return sortClassRowsForDisplay(
        classRows.filter((classRow) => classRow.classId !== ''),
        '',
    )[0] ?? null;
}

/**
 * Returns a safe starting-class id for the current class list.
 */
export function normaliseStartingClassId(
    classRows: CharacterClassDraft[],
    startingClassId: string,
): string {
    if (classRows.length === 0) {
        return '';
    }

    if (startingClassId && classRows.some((classRow) => classRow.classId === startingClassId)) {
        return startingClassId;
    }

    return firstDisplayableClassRow(classRows)?.classId ?? '';
}

/**
 * Returns the selected starting class row, or `null`.
 */
export function startingClassRow(
    classRows: CharacterClassDraft[],
    startingClassId: string,
): CharacterClassDraft | null {
    return classRows.find((classRow) => classRow.classId === normaliseStartingClassId(classRows, startingClassId)) ?? null;
}

/**
 * Returns the remaining selectable classes in SRD display order.
 */
export function availableClassOptions(
    classRows: CharacterClassDraft[],
    classOptions: OptionItem[] = CLASS_OPTIONS,
): OptionItem[] {
    const selectedClassIds = new Set(classRows.map((classRow) => classRow.classId));

    return classOptions.filter((option) => !selectedClassIds.has(option.value));
}

/**
 * Returns one human-readable class-row label for review and editor summaries.
 */
export function formatClassRowLabel(
    classRow: CharacterClassDraft,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): string {
    const currentClassLabel = classLabel(classRow.classId);
    const currentSubclassLabel = subclassLabel(classRow.classId, classRow.subclassId, subclassOptionsByClassId);

    if (currentSubclassLabel) {
        return `${currentSubclassLabel} ${currentClassLabel}`;
    }

    return currentClassLabel;
}

/**
 * Returns a compact class summary for the draft review screen.
 */
export function formatDraftClassSummary(
    classRows: CharacterClassDraft[],
    startingClassId = '',
): string {
    if (classRows.length === 0) {
        return 'No classes selected';
    }

    const sortedClassRows = sortClassRowsForDisplay(classRows, startingClassId);

    if (sortedClassRows.length === 1) {
        return formatClassRowLabel(sortedClassRows[0]);
    }

    return sortedClassRows
        .map((classRow) => `${classLabel(classRow.classId)} ${classRow.level}`)
        .join(' / ');
}

/**
 * Validates the multiclass draft against the phase 3 UI rules.
 */
export function validateCharacterClassDraft(
    classRows: CharacterClassDraft[],
    totalLevel: number,
    startingClassId: string,
    subclassOptionsByClassId: Record<string, OptionItem[]> = SUBCLASS_OPTIONS,
): CharacterClassDraftValidation {
    const errors: string[] = [];
    const seenClassIds = new Set<string>();
    const remainingLevelsCount = remainingClassLevels(classRows, totalLevel);

    if (classRows.length === 0) {
        errors.push('Add at least one class.');
    }

    if (classRows.some((classRow) => classRow.classId === '')) {
        errors.push('Every class row must have a class selected.');
    }

    for (const classRow of classRows) {
        if (seenClassIds.has(classRow.classId)) {
            errors.push('Duplicate classes are not allowed.');
            break;
        }

        seenClassIds.add(classRow.classId);

        if (classRow.level < 1 || !Number.isInteger(classRow.level)) {
            errors.push('Each class row must have at least 1 level.');
            break;
        }

        if (classRow.subclassId && !subclassOptionById(classRow.classId, classRow.subclassId, subclassOptionsByClassId)) {
            errors.push(`Selected subclass is not valid for ${classLabel(classRow.classId)}.`);
            break;
        }

        const selectedSubclass = subclassOptionById(
            classRow.classId,
            classRow.subclassId,
            subclassOptionsByClassId,
        );
        if (selectedSubclass && classRow.level < (selectedSubclass.selectionLevel ?? 1)) {
            errors.push(
                `${selectedSubclass.label} requires ${classLabel(classRow.classId)} level ${selectedSubclass.selectionLevel ?? 1}.`,
            );
            break;
        }
    }

    if (remainingLevelsCount !== 0) {
        if (remainingLevelsCount > 0) {
            errors.push(`Allocate ${remainingLevelsCount} more level${remainingLevelsCount === 1 ? '' : 's'}.`);
        } else {
            errors.push(`Remove ${Math.abs(remainingLevelsCount)} allocated level${remainingLevelsCount === -1 ? '' : 's'}.`);
        }
    }

    if (classRows.length > 0 && !classRows.some((classRow) => classRow.classId === startingClassId)) {
        errors.push('Choose which class is your starting class.');
    }

    if (totalLevel === 1 && classRows.length !== 1) {
        errors.push('Level 1 characters must have exactly one class row.');
    }

    return {
        errors,
        remainingLevels: remainingLevelsCount,
        isValid: errors.length === 0,
    };
}
