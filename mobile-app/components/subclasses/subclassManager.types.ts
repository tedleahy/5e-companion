import type { CustomSubclassesQuery } from '@/types/generated_graphql_types';

export type CustomSubclassManagerRow = CustomSubclassesQuery['customSubclasses'][number];

export type CustomSubclassFormDraft = {
    name: string;
    classId: string;
    description: string;
};

export type CustomSubclassFormMode = 'create' | 'edit';

/**
 * Returns true when two subclass form drafts contain the same field values.
 */
export function areCustomSubclassDraftsEqual(
    left: CustomSubclassFormDraft,
    right: CustomSubclassFormDraft,
): boolean {
    return left.name === right.name
        && left.classId === right.classId
        && left.description === right.description;
}

