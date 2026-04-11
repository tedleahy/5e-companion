import {
    ProficiencyLevel,
} from '@/types/generated_graphql_types';
import type {
    CharacterSheetDraft,
    CharacterSheetDraftClass,
} from '@/lib/character-sheet/characterSheetDraft';
import { createDraftEntityId } from '@/lib/character-sheet/characterSheetDraft';
import { ABILITY_KEYS, findSkillDefinitionByLabel, type AbilityKey } from '@/lib/characterSheetUtils';
import {
    applyLevelUpSpellbookChanges,
    derivePreviewSpellSlots,
    derivePreviewSpellcastingProfiles,
} from './spellcasting';
import type { LevelUpMulticlassProficiencyState } from './multiclassProficiencies';
import { getMulticlassProficiencyGains } from './multiclassProficiencies';
import { findSrdInvocation, findSrdMetamagic } from './advancedClassChoices';
import type { LevelUpInvocationState, LevelUpMetamagicState, LevelUpMysticArcanumState } from './advancedClassChoices';
import type {
    LevelUpAsiOrFeatState,
    LevelUpFeature,
    LevelUpHitPointsState,
    LevelUpSpellcastingState,
    LevelUpWizardSelectedClass,
} from './types';

/**
 * Maximum score allowed after applying this chunk's ASI / feat bonuses.
 */
const LEVEL_UP_SCORE_CAP = 20;

/**
 * Payload required to apply the currently implemented level-up results.
 */
export type ApplyLevelUpDraftInput = {
    selectedClass: LevelUpWizardSelectedClass;
    hitPointsState: LevelUpHitPointsState;
    asiOrFeatState: LevelUpAsiOrFeatState | null;
    spellcastingState: LevelUpSpellcastingState;
    multiclassProficiencyState: LevelUpMulticlassProficiencyState;
    invocationState: LevelUpInvocationState;
    metamagicState: LevelUpMetamagicState;
    mysticArcanumState: LevelUpMysticArcanumState;
    features: LevelUpFeature[];
};

/**
 * Applies the current level-up result into the local character-sheet draft.
 */
export function applyLevelUpToDraft(
    draft: CharacterSheetDraft,
    input: ApplyLevelUpDraftInput,
): CharacterSheetDraft {
    const classes = applyLevelUpClasses(draft.classes, input.selectedClass);
    const abilityScores = applyLevelUpAbilityScores(draft.abilityScores, input.asiOrFeatState);
    const hp = {
        ...draft.hp,
        current: draft.hp.current + input.hitPointsState.hpGained,
        max: draft.hp.max + input.hitPointsState.hpGained,
    };
    const spellbook = applyLevelUpSpellbookChanges(draft.spellbook, input.spellcastingState);
    const spellSlots = derivePreviewSpellSlots(classes, draft.spellSlots);
    const spellcastingProfiles = derivePreviewSpellcastingProfiles(classes, abilityScores);
    const skillProficiencies = applyLevelUpSkillProficiencies(
        draft.skillProficiencies,
        input.selectedClass,
        input.multiclassProficiencyState,
    );

    const traits = applyLevelUpProficiencies(draft.traits, input.selectedClass, input.multiclassProficiencyState);

    const advancedFeatures = buildAdvancedChoiceFeatures(
        input.selectedClass,
        input.invocationState,
        input.metamagicState,
        input.mysticArcanumState,
    );

    return {
        ...draft,
        level: draft.level + 1,
        classes,
        spellcastingProfiles,
        spellSlots,
        spellbook,
        abilityScores,
        hp,
        skillProficiencies,
        traits,
        features: applyLevelUpFeatures(draft.features, input.asiOrFeatState, [...input.features, ...advancedFeatures]),
    };
}

/**
 * Applies the one-level class gain for the chosen class.
 */
function applyLevelUpClasses(
    classes: CharacterSheetDraftClass[],
    selectedClass: LevelUpWizardSelectedClass,
): CharacterSheetDraftClass[] {
    const existingClassIndex = classes.findIndex((classRow) => classRow.classId === selectedClass.classId);

    if (existingClassIndex >= 0) {
        return classes.map((classRow, classIndex) => (
            classIndex === existingClassIndex
                ? {
                    ...classRow,
                    level: classRow.level + 1,
                    subclassId: selectedClass.subclassId,
                    subclassName: selectedClass.subclassName,
                    customSubclass: selectedClass.customSubclass ?? null,
                }
                : classRow
        ));
    }

    return [
        ...classes,
        {
            id: createDraftEntityId('class'),
            classId: selectedClass.classId,
            className: selectedClass.className,
            subclassId: selectedClass.subclassId,
            subclassName: selectedClass.subclassName,
            customSubclass: selectedClass.customSubclass ?? null,
            level: 1,
            isStartingClass: false,
        },
    ];
}

/**
 * Applies ASI or feat-driven ability-score increases into the draft.
 */
function applyLevelUpAbilityScores(
    abilityScores: CharacterSheetDraft['abilityScores'],
    asiOrFeatState: LevelUpAsiOrFeatState | null,
): CharacterSheetDraft['abilityScores'] {
    if (asiOrFeatState == null) {
        return abilityScores;
    }

    const nextScores = { ...abilityScores };

    if (asiOrFeatState.mode === 'asi') {
        for (const ability of ABILITY_KEYS) {
            nextScores[ability] = clampLevelUpScore(
                nextScores[ability] + asiOrFeatState.allocations[ability],
            );
        }

        return nextScores;
    }

    if (asiOrFeatState.feat.abilityIncrease) {
        const ability = asiOrFeatState.feat.abilityIncrease;
        nextScores[ability] = clampLevelUpScore(nextScores[ability] + 1);
    }

    return nextScores;
}

/**
 * Adds level-up-created features to the existing draft feature list.
 */
function applyLevelUpFeatures(
    existingFeatures: CharacterSheetDraft['features'],
    asiOrFeatState: LevelUpAsiOrFeatState | null,
    features: LevelUpFeature[],
): CharacterSheetDraft['features'] {
    const nextFeatures = [...existingFeatures];

    if (asiOrFeatState != null && asiOrFeatState.mode === 'feat') {
        nextFeatures.push({
            id: createDraftEntityId('feature'),
            name: asiOrFeatState.feat.name.trim(),
            source: 'Feat',
            description: featDescriptionWithAbilityIncrease(
                asiOrFeatState.feat.description,
                asiOrFeatState.feat.abilityIncrease,
            ),
            usesMax: null,
            usesRemaining: null,
            recharge: null,
            customSubclassFeature: null,
        });
    }

    for (const feature of features) {
        nextFeatures.push({
            id: createDraftEntityId('feature'),
            name: feature.name.trim(),
            source: feature.source,
            description: feature.description.trim(),
            usesMax: null,
            usesRemaining: null,
            recharge: null,
            customSubclassFeature: feature.customSubclassFeature,
        });
    }

    return nextFeatures;
}

/**
 * Appends the optional feat ability increase to the saved feature text.
 */
function featDescriptionWithAbilityIncrease(
    description: string,
    abilityIncrease: AbilityKey | null,
): string {
    const trimmedDescription = description.trim();

    if (abilityIncrease == null) {
        return trimmedDescription;
    }

    const label = abilityIncreaseLabel(abilityIncrease);

    if (trimmedDescription.length === 0) {
        return `${label} +1`;
    }

    return `${trimmedDescription}\n\n${label} +1`;
}

/**
 * Returns the UI label for one ability name.
 */
function abilityIncreaseLabel(ability: AbilityKey): string {
    return ability.charAt(0).toUpperCase() + ability.slice(1);
}

/**
 * Enforces the standard 5e level-up ability-score cap used in this chunk.
 */
function clampLevelUpScore(value: number): number {
    return Math.min(LEVEL_UP_SCORE_CAP, value);
}

/**
 * Applies multiclass proficiency gains to the traits draft when adding a new class.
 */
function applyLevelUpProficiencies(
    traits: CharacterSheetDraft['traits'],
    selectedClass: LevelUpWizardSelectedClass,
    proficiencyState: LevelUpMulticlassProficiencyState,
): CharacterSheetDraft['traits'] {
    if (selectedClass.isExistingClass) {
        return traits;
    }

    const gains = getMulticlassProficiencyGains(selectedClass.classId);

    if (!gains) {
        return traits;
    }

    const armorGains = gains.armor.filter((label) => !traits.armorProficiencies.includes(label));
    const weaponGains = gains.weapons.filter((label) => !traits.weaponProficiencies.includes(label));
    const toolGains = gains.tools.filter((label) => !traits.toolProficiencies.includes(label));

    const hasChanges = armorGains.length > 0
        || weaponGains.length > 0
        || toolGains.length > 0
        || proficiencyState.selectedSkills.length > 0;

    if (!hasChanges) {
        return traits;
    }

    return {
        ...traits,
        armorProficiencies: [...traits.armorProficiencies, ...armorGains],
        weaponProficiencies: [...traits.weaponProficiencies, ...weaponGains],
        toolProficiencies: [...traits.toolProficiencies, ...toolGains],
    };
}

/**
 * Applies newly selected multiclass skill proficiencies to the draft.
 */
function applyLevelUpSkillProficiencies(
    skillProficiencies: CharacterSheetDraft['skillProficiencies'],
    selectedClass: LevelUpWizardSelectedClass,
    proficiencyState: LevelUpMulticlassProficiencyState,
): CharacterSheetDraft['skillProficiencies'] {
    if (selectedClass.isExistingClass || proficiencyState.selectedSkills.length === 0) {
        return skillProficiencies;
    }

    let hasChanges = false;
    const nextSkillProficiencies = { ...skillProficiencies };

    for (const skillLabel of proficiencyState.selectedSkills) {
        const skillDefinition = findSkillDefinitionByLabel(skillLabel);

        if (!skillDefinition || nextSkillProficiencies[skillDefinition.key] !== ProficiencyLevel.None) {
            continue;
        }

        nextSkillProficiencies[skillDefinition.key] = ProficiencyLevel.Proficient;
        hasChanges = true;
    }

    return hasChanges ? nextSkillProficiencies : skillProficiencies;
}

/**
 * Converts advanced class choice selections (invocations, metamagic, mystic arcanum)
 * into LevelUpFeature entries that can be appended to the draft feature list.
 */
export function buildAdvancedChoiceFeatures(
    selectedClass: LevelUpWizardSelectedClass,
    invocationState: LevelUpInvocationState,
    metamagicState: LevelUpMetamagicState,
    mysticArcanumState: LevelUpMysticArcanumState,
): LevelUpFeature[] {
    const features: LevelUpFeature[] = [];
    const base = {
        source: selectedClass.className,
        classId: selectedClass.classId,
        level: selectedClass.newLevel,
        subclassId: selectedClass.subclassId,
        subclassName: selectedClass.subclassName,
        kind: 'class' as const,
        customSubclassFeature: null,
    };

    for (const invocationId of invocationState.selectedInvocations) {
        const srd = findSrdInvocation(invocationId);

        if (srd) {
            features.push({
                ...base,
                key: `invocation-${srd.id}`,
                name: `Eldritch Invocation: ${srd.name}`,
                description: srd.fullDescription,
            });
        }
    }

    if (invocationState.customInvocation && invocationState.customInvocation.name.trim().length > 0) {
        const trimmedCustomInvocationName = invocationState.customInvocation.name.trim();
        const customInvocationKey = trimmedCustomInvocationName.toLowerCase().replace(/\s+/g, '-');

        features.push({
            ...base,
            key: `invocation-custom-${customInvocationKey}`,
            name: `Eldritch Invocation: ${trimmedCustomInvocationName}`,
            description: invocationState.customInvocation.description.trim(),
        });
    }

    for (const metamagicId of metamagicState.selectedMetamagicIds) {
        const srd = findSrdMetamagic(metamagicId);

        if (srd) {
            features.push({
                ...base,
                key: `metamagic-${srd.id}`,
                name: `Metamagic: ${srd.name}`,
                description: srd.fullDescription,
            });
        }
    }

    if (metamagicState.customMetamagic && metamagicState.customMetamagic.name.trim().length > 0) {
        features.push({
            ...base,
            key: `metamagic-custom-${metamagicState.customMetamagic.name}`,
            name: `Metamagic: ${metamagicState.customMetamagic.name.trim()}`,
            description: metamagicState.customMetamagic.description.trim(),
        });
    }

    if (mysticArcanumState.selectedSpell) {
        features.push({
            ...base,
            key: `mystic-arcanum-${mysticArcanumState.selectedSpell.level}`,
            name: `Mystic Arcanum: ${mysticArcanumState.selectedSpell.name.trim()}`,
            description: `${mysticArcanumState.selectedSpell.name} — once per long rest without a spell slot.`,
        });
    }

    return features;
}
