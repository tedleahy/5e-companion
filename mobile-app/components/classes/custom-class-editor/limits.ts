import {
    CUSTOM_CLASS_DESCRIPTION_MAX_LENGTH,
    CUSTOM_CLASS_EMOJI_MAX_LENGTH,
    CUSTOM_CLASS_EQUIPMENT_MAX_COUNT,
    CUSTOM_CLASS_EQUIPMENT_NAME_MAX_LENGTH,
    CUSTOM_CLASS_FEATURE_DESCRIPTION_MAX_LENGTH,
    CUSTOM_CLASS_FEATURE_MAX_COUNT,
    CUSTOM_CLASS_FEATURE_NAME_MAX_LENGTH,
    CUSTOM_CLASS_NAME_MAX_LENGTH,
    CUSTOM_CLASS_PROFICIENCY_MAX_COUNT,
    CUSTOM_CLASS_SPELL_LIST_MAX_COUNT,
} from '@shared/constants/customClassLimits';
import type { Draft } from './types';

export {
    CUSTOM_CLASS_DESCRIPTION_MAX_LENGTH,
    CUSTOM_CLASS_EMOJI_MAX_LENGTH,
    CUSTOM_CLASS_EQUIPMENT_MAX_COUNT,
    CUSTOM_CLASS_EQUIPMENT_NAME_MAX_LENGTH,
    CUSTOM_CLASS_FEATURE_DESCRIPTION_MAX_LENGTH,
    CUSTOM_CLASS_FEATURE_MAX_COUNT,
    CUSTOM_CLASS_FEATURE_NAME_MAX_LENGTH,
    CUSTOM_CLASS_NAME_MAX_LENGTH,
    CUSTOM_CLASS_PROFICIENCY_MAX_COUNT,
    CUSTOM_CLASS_SPELL_LIST_MAX_COUNT,
};

/** Reference-only equipment intro shown in the Equipment stage. */
export const STARTING_EQUIPMENT_REFERENCE_COPY =
    "Reference-only starting gear and pick-N choice groups. These definitions are not automatically added to a character's inventory.";

/**
 * Returns a domain error when the draft exceeds shared custom-class payload limits.
 */
export function draftLimitError(draft: Draft): string | null {
    if (draft.name.trim().length > CUSTOM_CLASS_NAME_MAX_LENGTH) {
        return `Class name must be ${CUSTOM_CLASS_NAME_MAX_LENGTH} characters or fewer.`;
    }
    if (draft.emoji.trim().length > CUSTOM_CLASS_EMOJI_MAX_LENGTH) {
        return `Emoji must be ${CUSTOM_CLASS_EMOJI_MAX_LENGTH} characters or fewer.`;
    }
    if (draft.description.trim().length > CUSTOM_CLASS_DESCRIPTION_MAX_LENGTH) {
        return `Description must be ${CUSTOM_CLASS_DESCRIPTION_MAX_LENGTH} characters or fewer.`;
    }
    if (draft.equipment.length > CUSTOM_CLASS_EQUIPMENT_MAX_COUNT) {
        return `Starting equipment is limited to ${CUSTOM_CLASS_EQUIPMENT_MAX_COUNT} entries.`;
    }
    if (draft.equipment.some((item) => item.name.trim().length > CUSTOM_CLASS_EQUIPMENT_NAME_MAX_LENGTH)) {
        return `Equipment names must be ${CUSTOM_CLASS_EQUIPMENT_NAME_MAX_LENGTH} characters or fewer.`;
    }
    if (draft.proficiencies.length > CUSTOM_CLASS_PROFICIENCY_MAX_COUNT) {
        return `Proficiency rules are limited to ${CUSTOM_CLASS_PROFICIENCY_MAX_COUNT} entries.`;
    }
    if (draft.features.length > CUSTOM_CLASS_FEATURE_MAX_COUNT) {
        return `Class features are limited to ${CUSTOM_CLASS_FEATURE_MAX_COUNT}.`;
    }
    for (const [index, feature] of draft.features.entries()) {
        if (feature.name.trim().length > CUSTOM_CLASS_FEATURE_NAME_MAX_LENGTH) {
            return `Feature ${index + 1} name must be ${CUSTOM_CLASS_FEATURE_NAME_MAX_LENGTH} characters or fewer.`;
        }
        if (feature.description.trim().length > CUSTOM_CLASS_FEATURE_DESCRIPTION_MAX_LENGTH) {
            return `Feature ${index + 1} description must be ${CUSTOM_CLASS_FEATURE_DESCRIPTION_MAX_LENGTH} characters or fewer.`;
        }
    }
    if (draft.spells.length > CUSTOM_CLASS_SPELL_LIST_MAX_COUNT) {
        return `Class spell list is limited to ${CUSTOM_CLASS_SPELL_LIST_MAX_COUNT} spells.`;
    }
    return null;
}

/** True when another equipment entry can be added under the shared count cap. */
export function canAddEquipmentEntry(currentCount: number): boolean {
    return currentCount < CUSTOM_CLASS_EQUIPMENT_MAX_COUNT;
}

/** True when another class feature can be added under the shared count cap. */
export function canAddFeature(currentCount: number): boolean {
    return currentCount < CUSTOM_CLASS_FEATURE_MAX_COUNT;
}

/** True when another spell can be added under the shared spell-list cap. */
export function canAddSpell(currentCount: number): boolean {
    return currentCount < CUSTOM_CLASS_SPELL_LIST_MAX_COUNT;
}

/**
 * Max values the proficiency picker may hold for the category currently being
 * edited. Counts rules outside this selection against the shared class-wide
 * cap so adding new options cannot push `draft.proficiencies` over the limit,
 * while already-selected values remain removable.
 */
export function maxSelectableProficiencies(
    totalProficiencyCount: number,
    editingSelectionCount: number,
): number {
    const outsideCount = Math.max(0, totalProficiencyCount - editingSelectionCount);
    return Math.max(0, CUSTOM_CLASS_PROFICIENCY_MAX_COUNT - outsideCount);
}

/** True when restoring `incomingCount` rules onto a draft of `baseCount` stays within the cap. */
export function canFitProficiencies(baseCount: number, incomingCount: number): boolean {
    return baseCount + incomingCount <= CUSTOM_CLASS_PROFICIENCY_MAX_COUNT;
}
