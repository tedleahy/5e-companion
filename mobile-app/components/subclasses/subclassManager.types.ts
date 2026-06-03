import type { CustomSubclassesQuery } from '@/types/generated_graphql_types';

export type CustomSubclassManagerRow = CustomSubclassesQuery['customSubclasses'][number];

export type CustomSubclassFormDraft = {
    name: string;
    classId: string;
    description: string;
};

export type CustomSubclassFormMode = 'create' | 'edit';

