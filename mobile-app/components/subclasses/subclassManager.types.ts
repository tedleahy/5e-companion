import type { AvailableSubclassesQuery } from '@/types/generated_graphql_types';

export type SubclassManagerRow = AvailableSubclassesQuery['availableSubclasses'][number] & {
    characterUsageCount: number;
};

export type CustomSubclassFormDraft = {
    name: string;
    classId: string;
    description: string;
    selectionLevel: string;
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

function customSubclassFeatureDraftKey(feature: CustomSubclassFeatureDraft): string {
    return feature.id ?? feature.clientId;
}

/**
 * Returns true when two subclass form drafts contain the same field values.
 */
export function areCustomSubclassDraftsEqual(
    left: CustomSubclassFormDraft,
    right: CustomSubclassFormDraft,
): boolean {
    const leftFeaturesByKey = new Map(
        left.features.map((feature) => [customSubclassFeatureDraftKey(feature), feature]),
    );
    const rightFeaturesByKey = new Map(
        right.features.map((feature) => [customSubclassFeatureDraftKey(feature), feature]),
    );

    return left.name === right.name
        && left.classId === right.classId
        && left.description === right.description
        && left.selectionLevel === right.selectionLevel
        && left.features.length === right.features.length
        && leftFeaturesByKey.size === left.features.length
        && rightFeaturesByKey.size === right.features.length
        && Array.from(leftFeaturesByKey).every(([featureKey, feature]) => {
            const rightFeature = rightFeaturesByKey.get(featureKey);

            return rightFeature != null
                && feature.name === rightFeature.name
                && feature.description === rightFeature.description
                && feature.level === rightFeature.level;
        });
}
