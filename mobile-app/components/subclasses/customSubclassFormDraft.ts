import {
    CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH,
    CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH,
    CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH,
    CUSTOM_SUBCLASS_NAME_MAX_LENGTH,
} from '@shared/constants/customSubclassLimits';
import type { CustomSubclassFeatureDraft, CustomSubclassFormDraft } from './subclassManager.types';

export const CUSTOM_SUBCLASS_MAX_LEVEL = 20;

type CustomSubclassDraftValidation = {
    canSave: boolean;
    featureRowsAreValid: boolean;
};

function isPositiveIntegerText(value: string): boolean {
    const numberValue = Number(value);

    return Number.isInteger(numberValue) && numberValue >= 1;
}

function isIntegerTextInRange(value: string, max: number): boolean {
    const numberValue = Number(value);

    return Number.isInteger(numberValue) && numberValue >= 1 && numberValue <= max;
}

export function normaliseLevelInput(value: string, maxDigits = 2): string {
    return value.replace(/[^0-9]/g, '').slice(0, maxDigits);
}

export function buildBlankCustomSubclassFeatureDraft(clientId: string): CustomSubclassFeatureDraft {
    return {
        clientId,
        name: '',
        description: '',
        level: '',
    };
}

export function patchCustomSubclassDraft(
    draft: CustomSubclassFormDraft,
    updates: Partial<Omit<CustomSubclassFormDraft, 'features'>>,
): CustomSubclassFormDraft {
    return {
        ...draft,
        ...updates,
    };
}

export function addCustomSubclassFeatureDraft(
    draft: CustomSubclassFormDraft,
    feature: CustomSubclassFeatureDraft,
): CustomSubclassFormDraft {
    return {
        ...draft,
        features: [...draft.features, feature],
    };
}

export function patchCustomSubclassFeatureDraft(
    draft: CustomSubclassFormDraft,
    clientId: string,
    updates: Partial<CustomSubclassFeatureDraft>,
): CustomSubclassFormDraft {
    return {
        ...draft,
        features: draft.features.map((feature) => (
            feature.clientId === clientId ? { ...feature, ...updates } : feature
        )),
    };
}

export function removeCustomSubclassFeatureDraft(
    draft: CustomSubclassFormDraft,
    clientId: string,
): CustomSubclassFormDraft {
    return {
        ...draft,
        features: draft.features.filter((feature) => feature.clientId !== clientId),
    };
}

export function validateCustomSubclassDraft(
    draft: CustomSubclassFormDraft,
): CustomSubclassDraftValidation {
    const seenFeatureKeys = new Set<string>();
    const featureRowsAreValid = draft.features.every((feature) => {
        const name = feature.name.trim();

        if (
            name.length === 0
            || name.length > CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH
            || feature.description.trim().length === 0
            || feature.description.length > CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH
            || !isPositiveIntegerText(feature.level)
        ) {
            return false;
        }

        const duplicateKey = `${Number(feature.level)}:${name.toLowerCase()}`;

        if (seenFeatureKeys.has(duplicateKey)) {
            return false;
        }

        seenFeatureKeys.add(duplicateKey);

        return true;
    });

    return {
        featureRowsAreValid,
        canSave: draft.name.trim().length > 0
            && draft.name.length <= CUSTOM_SUBCLASS_NAME_MAX_LENGTH
            && draft.classId.trim().length > 0
            && draft.description.trim().length > 0
            && draft.description.length <= CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH
            && isIntegerTextInRange(draft.selectionLevel, CUSTOM_SUBCLASS_MAX_LEVEL)
            && featureRowsAreValid,
    };
}
