import { SUBCLASS_OPTIONS } from '@/lib/characterCreation/options';
import { SUBCLASS_UNLOCK_LEVEL_BY_CLASS } from '@/lib/characterCreation/classRules';
import type { AvailableSubclassOption } from '@/lib/subclasses';
import type {
    LevelUpCustomFeatureDraft,
    LevelUpFeature,
    LevelUpSubclassSelectionState,
    LevelUpWizardSelectedClass,
} from './types';
import {
    LEVEL_UP_SPELL_SLOTS_BY_CLASS,
    LEVEL_UP_SRD_FEATURES,
    LEVEL_UP_SRD_SUBCLASSES,
} from './levelUpSrdData.generated';

/**
 * Display-name overrides for subclasses whose SRD ids are shorter than the spec copy.
 */
const SUBCLASS_LABEL_OVERRIDES: Record<string, string> = {
    berserker: 'Path of the Berserker',
    lore: 'College of Lore',
    life: 'Life Domain',
    land: 'Circle of the Land',
    champion: 'Champion',
    'open-hand': 'Way of the Open Hand',
    devotion: 'Oath of Devotion',
    hunter: 'Hunter',
    thief: 'Thief',
    draconic: 'Draconic Bloodline',
    fiend: 'The Fiend',
    evocation: 'School of Evocation',
};

/**
 * Legacy subclass ids still present in some mobile mocks.
 */
const SUBCLASS_ID_ALIASES: Record<string, string> = {
    'school-of-evocation': 'evocation',
};

/**
 * Base-class feature names that should not render as separate feature cards.
 */
const FEATURE_NAME_EXCLUSIONS = new Set([
    'Ability Score Improvement',
    'Primal Path',
    'Bard College',
    'Divine Domain',
    'Druid Circle',
    'Martial Archetype',
    'Monastic Tradition',
    'Sacred Oath',
    'Ranger Archetype',
    'Roguish Archetype',
    'Sorcerous Origin',
    'Otherworldly Patron',
    'Arcane Tradition',
]);

/**
 * Generic placeholder feature names that the dedicated subclass step already covers.
 */
const FEATURE_NAME_SUFFIX_EXCLUSIONS = [' feature'];

/**
 * One SRD subclass choice supported by the wizard.
 */
export type LevelUpSrdSubclassOption = {
    classId: string;
    subclassId: string;
    name: string;
    category: string;
    description: string;
    icon: string;
};

type GeneratedSrdSubclass = (typeof LEVEL_UP_SRD_SUBCLASSES)[number];
type GeneratedSrdFeature = (typeof LEVEL_UP_SRD_FEATURES)[number];

/**
 * Returns an empty subclass selection state.
 */
export function createLevelUpSubclassSelectionState(): LevelUpSubclassSelectionState {
    return {
        mode: 'none',
        selectedSubclassId: null,
        selectedSubclassName: null,
        selectedSubclassDescription: '',
        selectedSubclassIsCustom: false,
        selectedSubclassFeatures: [],
        customSubclassName: '',
        customSubclassDescription: '',
    };
}

/**
 * Returns true when the selected class reaches a subclass-choice level.
 */
export function isSubclassChoiceLevel(classId: string, newClassLevel: number): boolean {
    return SUBCLASS_UNLOCK_LEVEL_BY_CLASS[classId] === newClassLevel;
}

/**
 * Returns true when the wizard must show the subclass selection step.
 */
export function needsSubclassSelectionStep(selectedClass: LevelUpWizardSelectedClass): boolean {
    return isSubclassChoiceLevel(selectedClass.classId, selectedClass.newLevel) && selectedClass.subclassId == null;
}

/**
 * Returns the subclass category label for one class.
 */
export function subclassCategoryName(classId: string): string {
    return findGeneratedSubclass(classId)?.category ?? 'Subclass';
}

/**
 * Returns the single SRD subclass option used in the current wizard spec.
 */
export function levelUpSrdSubclassOption(classId: string): LevelUpSrdSubclassOption | null {
    const subclass = findGeneratedSubclass(classId);
    const icon = SUBCLASS_OPTIONS[classId]?.[0]?.icon ?? '\u2726';

    if (!subclass) {
        return null;
    }

    return {
        classId: subclass.classId,
        subclassId: subclass.subclassId,
        name: subclassDisplayName(subclass.subclassId, subclass.name),
        category: subclass.category,
        description: subclass.description,
        icon,
    };
}

/**
 * Applies one SRD subclass choice into the current selection state.
 */
export function selectLevelUpExistingSubclass(
    state: LevelUpSubclassSelectionState,
    subclass: AvailableSubclassOption,
): LevelUpSubclassSelectionState {
    return {
        ...state,
        mode: 'srd',
        selectedSubclassId: subclass.value,
        selectedSubclassName: subclass.name,
        selectedSubclassDescription: subclass.description,
        selectedSubclassIsCustom: subclass.isCustom,
        selectedSubclassFeatures: subclass.features,
    };
}

/**
 * Switches the wizard into the custom-subclass branch.
 */
export function selectLevelUpCustomSubclass(
    state: LevelUpSubclassSelectionState,
): LevelUpSubclassSelectionState {
    return {
        ...state,
        mode: 'custom',
    };
}

/**
 * Updates the custom subclass name draft.
 */
export function setLevelUpCustomSubclassName(
    state: LevelUpSubclassSelectionState,
    value: string,
): LevelUpSubclassSelectionState {
    return {
        ...state,
        mode: 'custom',
        customSubclassName: value,
    };
}

/**
 * Updates the custom subclass description draft.
 */
export function setLevelUpCustomSubclassDescription(
    state: LevelUpSubclassSelectionState,
    value: string,
): LevelUpSubclassSelectionState {
    return {
        ...state,
        mode: 'custom',
        customSubclassDescription: value,
    };
}

/**
 * Returns whether the current subclass step has enough information to continue.
 */
export function canContinueFromSubclassSelection(
    state: LevelUpSubclassSelectionState,
): boolean {
    if (state.mode === 'srd') {
        return state.selectedSubclassId != null;
    }

    if (state.mode === 'custom') {
        return state.customSubclassName.trim().length > 0
            && (state.customSubclassDescription ?? '').trim().length > 0;
    }

    return false;
}

/**
 * Normalises a raw subclass id into the SRD ids used by the server save path.
 */
export function normaliseLevelUpSubclassId(subclassId: string | null | undefined): string | null {
    if (!subclassId) {
        return null;
    }

    return SUBCLASS_ID_ALIASES[subclassId] ?? subclassId;
}

/**
 * Resolves the class row subclass fields after wizard-local subclass selection.
 */
export function resolveSelectedClassSubclass(
    selectedClass: LevelUpWizardSelectedClass,
    subclassSelection: LevelUpSubclassSelectionState,
): Pick<LevelUpWizardSelectedClass, 'subclassId' | 'subclassName' | 'subclassDescription' | 'subclassIsCustom' | 'subclassFeatures' | 'customSubclass'> {
    if (subclassSelection.mode === 'srd' && subclassSelection.selectedSubclassId) {
        return {
            subclassId: subclassSelection.selectedSubclassId,
            subclassName: subclassSelection.selectedSubclassName,
            subclassDescription: subclassSelection.selectedSubclassDescription.trim() || null,
            subclassIsCustom: subclassSelection.selectedSubclassIsCustom,
            subclassFeatures: subclassSelection.selectedSubclassFeatures,
            customSubclass: null,
        };
    }

    if (subclassSelection.mode === 'custom') {
        return {
            subclassId: null,
            subclassName: subclassSelection.customSubclassName.trim() || 'Custom Subclass',
            subclassDescription: subclassSelection.customSubclassDescription.trim() || null,
            subclassIsCustom: true,
            subclassFeatures: [],
            customSubclass: {
                name: subclassSelection.customSubclassName.trim() || 'Custom Subclass',
                description: subclassSelection.customSubclassDescription.trim(),
            },
        };
    }

    return {
        subclassId: selectedClass.subclassId,
        subclassName: selectedClass.subclassName
            ? selectedClass.subclassName
            : subclassDisplayName(
                normaliseLevelUpSubclassId(selectedClass.subclassId),
                selectedClass.subclassName,
            ),
        subclassDescription: selectedClass.subclassDescription,
        subclassIsCustom: selectedClass.subclassIsCustom,
        subclassFeatures: selectedClass.subclassFeatures,
        customSubclass: selectedClass.customSubclass,
    };
}

/**
 * Returns all display-ready features gained at the selected class level.
 */
export function getLevelUpFeatures(selectedClass: LevelUpWizardSelectedClass): LevelUpFeature[] {
    const selectedSubclassId = normaliseLevelUpSubclassId(selectedClass.subclassId);
    const classFeatures = LEVEL_UP_SRD_FEATURES
        .filter((feature) => feature.classId === selectedClass.classId && feature.level === selectedClass.newLevel)
        .filter((feature) => shouldIncludeFeature(feature, selectedSubclassId))
        .filter((feature) => !isPickerManagedFeature(feature.name))
        .map((feature) => mapGeneratedFeature(feature));
    const customSubclassFeatures = selectedClass.subclassIsCustom
        ? selectedClass.subclassFeatures
            .filter((feature) => feature.level === selectedClass.newLevel)
            .map((feature) => ({
                key: feature.id,
                name: feature.name,
                description: feature.description,
                source: featureSourceLabel(
                    selectedClass.className,
                    selectedClass.newLevel,
                    selectedClass.subclassName,
                ),
                classId: selectedClass.classId,
                level: selectedClass.newLevel,
                subclassId: selectedClass.subclassId,
                subclassName: selectedClass.subclassName,
                kind: 'custom' as const,
                customSubclassFeature: {
                    classId: selectedClass.classId,
                    level: selectedClass.newLevel,
                },
            }))
        : [];

    return [
        ...classFeatures,
        ...customSubclassFeatures,
        ...spellSlotUnlockFeatures(selectedClass),
    ];
}

/**
 * Returns true for SRD feature names that represent individual picker-managed
 * choices (e.g. "Eldritch Invocation: Agonizing Blast", "Metamagic: Careful Spell").
 * These are excluded from the auto-added feature list because the level-up
 * picker UI handles their selection instead.
 */
export function isPickerManagedFeature(name: string): boolean {
    return name.startsWith('Eldritch Invocation: ') || name.startsWith('Metamagic: ');
}

/**
 * Returns true when the feature step should appear for the selected class.
 */
export function hasNewFeaturesStep(selectedClass: LevelUpWizardSelectedClass): boolean {
    return getLevelUpFeatures(selectedClass).length > 0 || selectedClass.subclassIsCustom;
}

/**
 * Returns true when every drafted custom feature row is complete enough to continue.
 */
export function canContinueFromNewFeatures(
    customFeatures: readonly LevelUpCustomFeatureDraft[],
): boolean {
    return customFeatures.every((feature) => (
        feature.name.trim().length > 0 && feature.description.trim().length > 0
    ));
}

/**
 * Returns true when the selected level gains no SRD subclass-specific features.
 */
export function hasNoSubclassFeatureAtLevel(selectedClass: LevelUpWizardSelectedClass): boolean {
    if (!selectedClass.subclassName || selectedClass.subclassIsCustom) {
        return false;
    }

    return getLevelUpFeatures(selectedClass).every((feature) => feature.subclassId == null);
}

/**
 * Builds persisted feature rows from the drafted custom subclass features.
 */
export function mapCustomFeatureDrafts(
    selectedClass: LevelUpWizardSelectedClass,
    customFeatures: readonly LevelUpCustomFeatureDraft[],
): LevelUpFeature[] {
    return customFeatures.map((feature) => ({
        key: feature.id,
        name: feature.name.trim(),
        description: feature.description.trim(),
        source: featureSourceLabel(
            selectedClass.className,
            selectedClass.newLevel,
            selectedClass.subclassName,
        ),
        classId: selectedClass.classId,
        level: selectedClass.newLevel,
        subclassId: selectedClass.subclassId,
        subclassName: selectedClass.subclassName,
        kind: 'custom',
        customSubclassFeature: {
            classId: selectedClass.classId,
            level: selectedClass.newLevel,
        },
    }));
}

/**
 * Returns the display name for one subclass id.
 */
function subclassDisplayName(
    subclassId: string | null | undefined,
    fallbackName: string | null | undefined,
): string | null {
    if (!subclassId) {
        return fallbackName ?? null;
    }

    return SUBCLASS_LABEL_OVERRIDES[subclassId] ?? fallbackName ?? null;
}

/**
 * Returns the one generated SRD subclass entry for a class.
 */
function findGeneratedSubclass(classId: string): GeneratedSrdSubclass | null {
    return LEVEL_UP_SRD_SUBCLASSES.find((subclass) => subclass.classId === classId) ?? null;
}

/**
 * Returns true when a generated SRD feature should be shown as a card.
 */
function shouldIncludeFeature(
    feature: GeneratedSrdFeature,
    selectedSubclassId: string | null,
): boolean {
    if (FEATURE_NAME_EXCLUSIONS.has(feature.name)) {
        return false;
    }

    if (FEATURE_NAME_SUFFIX_EXCLUSIONS.some((suffix) => feature.name.endsWith(suffix))) {
        return false;
    }

    if (feature.subclassId == null) {
        return true;
    }

    return feature.subclassId === selectedSubclassId;
}

/**
 * Converts one generated SRD feature into the UI model used by the wizard.
 */
function mapGeneratedFeature(
    feature: GeneratedSrdFeature,
): LevelUpFeature {
    const subclassName = feature.subclassId
        ? subclassDisplayName(feature.subclassId, feature.subclassName)
        : null;

    return {
        key: `${feature.classId}-${feature.level}-${feature.subclassId ?? 'base'}-${feature.name}`,
        name: feature.name,
        description: feature.description,
        source: featureSourceLabel(feature.className, feature.level, subclassName),
        classId: feature.classId,
        level: feature.level,
        subclassId: feature.subclassId,
        subclassName,
        kind: feature.subclassId ? 'subclass' : 'class',
        customSubclassFeature: null,
    };
}

/**
 * Builds any new spell-slot-level unlocks that the prototype surfaces as features.
 */
function spellSlotUnlockFeatures(selectedClass: LevelUpWizardSelectedClass): LevelUpFeature[] {
    const slotProgression = LEVEL_UP_SPELL_SLOTS_BY_CLASS[selectedClass.classId];

    if (!slotProgression) {
        return [];
    }

    const previousSlots = slotProgression[selectedClass.currentLevel as keyof typeof slotProgression] ?? [];
    const nextSlots = slotProgression[selectedClass.newLevel as keyof typeof slotProgression] ?? [];
    const features: LevelUpFeature[] = [];

    for (let slotIndex = 0; slotIndex < nextSlots.length; slotIndex += 1) {
        const previousValue = previousSlots[slotIndex] ?? 0;
        const nextValue = nextSlots[slotIndex] ?? 0;

        if (previousValue > 0 || nextValue === 0) {
            continue;
        }

        const slotLevel = slotIndex + 1;

        features.push({
            key: `${selectedClass.classId}-${selectedClass.newLevel}-slot-${slotLevel}`,
            name: `${ordinal(slotLevel)} Level Spell Slot`,
            description: `You gain access to ${ordinal(slotLevel).toLowerCase()}-level spell slots for ${selectedClass.className}.`,
            source: featureSourceLabel(selectedClass.className, selectedClass.newLevel, null),
            classId: selectedClass.classId,
            level: selectedClass.newLevel,
            subclassId: null,
            subclassName: null,
            kind: 'spell_slot',
            customSubclassFeature: null,
        });
    }

    return features;
}

/**
 * Returns the display-ready source line for one feature card.
 */
function featureSourceLabel(
    className: string,
    level: number,
    subclassName: string | null,
): string {
    if (!subclassName) {
        return `${className} ${level}`;
    }

    return `${subclassName} ${className} ${level}`;
}

/**
 * Returns the English ordinal label for a spell-slot level.
 */
function ordinal(value: number): string {
    if (value === 1) {
        return '1st';
    }

    if (value === 2) {
        return '2nd';
    }

    if (value === 3) {
        return '3rd';
    }

    return `${value}th`;
}
