import type { AvailableSubclassesQuery } from '@/types/generated_graphql_types';

export type SubclassManagerRow = AvailableSubclassesQuery['availableSubclasses'][number] & {
    characterUsageCount: number;
};

export type CustomSubclassFormDraft = {
    name: string;
    classId: string;
    description: string;
    features: CustomSubclassFeatureDraft[];
};

export type CustomSubclassFeatureDraft = {
    clientId: string;
    id?: string;
    name: string;
    description: string;
    level: string;
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
        && left.description === right.description
        && left.features.length === right.features.length
        && left.features.every((feature, index) => {
            const rightFeature = right.features[index];

            return rightFeature != null
                && feature.id === rightFeature.id
                && feature.name === rightFeature.name
                && feature.description === rightFeature.description
                && feature.level === rightFeature.level;
        });
}
