import {
    SUBCLASS_UNLOCK_LEVEL_BY_CLASS,
} from '@/lib/characterCreation/classRules';
import {
    CLASS_OPTIONS,
    SUBCLASS_OPTIONS,
    type OptionItem,
} from '@/lib/characterCreation/options';

/** One class row in the local create-character draft. */
export type CharacterClassDraft = {
    classId: string;
    subclassId: string;
    level: number;
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
export function classOptionById(classId: string): OptionItem | null {
    return CLASS_OPTIONS.find((option) => option.value === classId) ?? null;
}

/**
 * Returns the display label for a class id, or a fallback.
 */
export function classLabel(classId: string): string {
    return classOptionById(classId)?.label ?? 'Unknown class';
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
 * Returns the configured subclass unlock level for the given class.
 */
export function subclassUnlockLevel(classId: string): number {
    return SUBCLASS_UNLOCK_LEVEL_BY_CLASS[classId] ?? 3;
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

    return classRow.level >= subclassUnlockLevel(classRow.classId);
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

    if (!isSubclassUnlocked(classRow, subclassOptionsByClassId)) {
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
): OptionItem[] {
    const selectedClassIds = new Set(classRows.map((classRow) => classRow.classId));

    return CLASS_OPTIONS.filter((option) => !selectedClassIds.has(option.value));
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

        if (classRow.subclassId && !isSubclassUnlocked(classRow, subclassOptionsByClassId)) {
            errors.push(
                `${classLabel(classRow.classId)} reaches its subclass at level ${subclassUnlockLevel(classRow.classId)}.`,
            );
            break;
        }

        if (!classRow.subclassId && isSubclassUnlocked(classRow, subclassOptionsByClassId)) {
            errors.push(`Choose a subclass for ${classLabel(classRow.classId)}.`);
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
