import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AbilityKey } from '@/lib/characterSheetUtils';
import type { SkillProficiencies } from '@/types/generated_graphql_types';
import { createDraftEntityId } from '@/lib/character-sheet/characterSheetDraft';
import type { AvailableSubclassOption } from '@/lib/subclasses';
import {
    buildInvocationPrerequisiteContext,
    canContinueFromAdvancedResources,
    createLevelUpInvocationState,
    createLevelUpMetamagicState,
    createLevelUpMysticArcanumState,
    invocationGainCount,
    metamagicGainCount,
    setCustomInvocation,
    setCustomMetamagic,
    setInvocationSwapIn,
    setInvocationSwapOut,
    setMysticArcanumSpell,
    toggleInvocationSelection,
    toggleMetamagicSelection,
} from '@/lib/characterLevelUp/advancedClassChoices';
import {
    canContinueFromAsiOrFeat,
    createLevelUpAsiOrFeatState,
    decrementLevelUpAsiAllocation,
    incrementLevelUpAsiAllocation,
    setLevelUpAsiOrFeatMode,
    setLevelUpFeatAbilityIncrease,
    setLevelUpFeatDescription,
    setLevelUpFeatName,
} from '@/lib/characterLevelUp/asiOrFeat';
import {
    canContinueFromChooseClass,
    createLevelUpClassSelectionState,
    currentLevelUpClass,
    effectiveLevelUpClassId,
    enterMulticlassPicker,
    multiclassPrerequisiteWarnings,
    resetToCurrentClassSelection,
    selectMulticlassLevelUpClass,
} from '@/lib/characterLevelUp/chooseClass';
import { createLevelUpHitPointsState } from '@/lib/characterLevelUp/hitPoints';
import {
    canContinueFromMulticlassProficiencies,
    createLevelUpMulticlassProficiencyState,
    toggleMulticlassProficiencySkill,
    getMulticlassProficiencyGains,
} from '@/lib/characterLevelUp/multiclassProficiencies';
import type { LevelUpMulticlassProficiencyState } from '@/lib/characterLevelUp/multiclassProficiencies';
import {
    addLevelUpSpellSelection,
    buildLevelUpSpellcastingSummary,
    canContinueFromSpellcastingUpdates,
    createLevelUpSpellcastingState,
    removeLevelUpSpellSelection,
    setLevelUpSwapOutSpell,
    setLevelUpSwapReplacementSpell,
} from '@/lib/characterLevelUp/spellcasting';
import {
    buildLevelUpStepList,
    defaultLevelUpClassId,
    selectedLevelUpClass,
} from '@/lib/characterLevelUp/stepAssembly';
import {
    canContinueFromNewFeatures,
    canContinueFromSubclassSelection,
    createLevelUpSubclassSelectionState,
    getLevelUpFeatures,
    needsSubclassSelectionStep,
    selectLevelUpExistingSubclass,
    selectLevelUpCustomSubclass,
    setLevelUpCustomSubclassDescription,
    setLevelUpCustomSubclassName,
} from '@/lib/characterLevelUp/subclassFeatures';
import type {
    InvocationPrerequisiteContext,
    LevelUpAsiOrFeatState,
    LevelUpCustomFeatureDraft,
    LevelUpFeature,
    LevelUpHitPointsState,
    LevelUpClassSelectionMode,
    LevelUpInvocationState,
    LevelUpMetamagicState,
    LevelUpMysticArcanumState,
    LevelUpSpellSelection,
    LevelUpSpellcastingState,
    LevelUpSpellcastingSummary,
    LevelUpSubclassSelectionState,
    LevelUpWizardCharacter,
    LevelUpWizardSelectedClass,
    LevelUpWizardStep,
} from '@/lib/characterLevelUp/types';

/**
 * Route-local controller returned by the level-up wizard hook.
 */
export type UseLevelUpWizardResult = {
    currentCharacterLevel: number;
    selectedClassId: string;
    currentClass: LevelUpWizardSelectedClass;
    selectedClass: LevelUpWizardSelectedClass;
    classSelectionMode: LevelUpClassSelectionMode;
    pickerSelectedClassId: string | null;
    prerequisiteWarnings: string[];
    abilityScores: Record<AbilityKey, number>;
    currentHitPoints: { current: number; max: number; temp: number };
    hitPointsState: LevelUpHitPointsState | null;
    asiOrFeatState: LevelUpAsiOrFeatState;
    subclassSelectionState: LevelUpSubclassSelectionState;
    spellcastingState: LevelUpSpellcastingState;
    spellcastingSummary: LevelUpSpellcastingSummary;
    multiclassProficiencyState: LevelUpMulticlassProficiencyState;
    existingSkillProficiencies: SkillProficiencies | null;
    invocationPrerequisiteContext: InvocationPrerequisiteContext | null;
    invocationState: LevelUpInvocationState;
    metamagicState: LevelUpMetamagicState;
    mysticArcanumState: LevelUpMysticArcanumState;
    newFeatures: LevelUpFeature[];
    customFeatures: LevelUpCustomFeatureDraft[];
    steps: LevelUpWizardStep[];
    currentStep: LevelUpWizardStep;
    currentStepIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    stepLabel: string;
    nextButtonLabel: string;
    nextButtonDisabled: boolean;
    selectClass: (classId: string) => void;
    enterClassPicker: () => void;
    returnToCurrentClass: () => void;
    rollHitPoints: () => void;
    takeAverageHitPoints: () => void;
    selectAsiOrFeatMode: (mode: 'asi' | 'feat') => void;
    incrementAsiAbility: (ability: AbilityKey) => void;
    decrementAsiAbility: (ability: AbilityKey) => void;
    changeFeatName: (value: string) => void;
    changeFeatDescription: (value: string) => void;
    changeFeatAbilityIncrease: (value: AbilityKey | null) => void;
    selectExistingSubclass: (subclass: AvailableSubclassOption) => void;
    selectCustomSubclass: () => void;
    changeCustomSubclassName: (value: string) => void;
    changeCustomSubclassDescription: (value: string) => void;
    addCustomFeature: () => void;
    changeCustomFeature: (featureId: string, changes: Partial<LevelUpCustomFeatureDraft>) => void;
    removeCustomFeature: (featureId: string) => void;
    addLearnedSpell: (spell: LevelUpSpellSelection) => void;
    removeLearnedSpell: (spellId: string) => void;
    addCantripSpell: (spell: LevelUpSpellSelection) => void;
    removeCantripSpell: (spellId: string) => void;
    setSwapOutSpellId: (spellId: string | null) => void;
    setSwapReplacementSpell: (spell: LevelUpSpellSelection | null) => void;
    toggleMulticlassSkill: (skill: string) => void;
    toggleInvocation: (invocationId: string) => void;
    changeCustomInvocation: (custom: { name: string; description: string } | null) => void;
    changeInvocationSwapOut: (invocationId: string | null) => void;
    changeInvocationSwapIn: (invocation: { id: string; name: string; isCustom: boolean } | null) => void;
    toggleMetamagic: (metamagicId: string) => void;
    changeCustomMetamagic: (custom: { name: string; description: string } | null) => void;
    changeMysticArcanumSpell: (spell: { id: string; name: string; level: number } | null) => void;
    goToPreviousStep: () => void;
    goToNextStep: () => void;
    resetWizard: () => void;
};

/**
 * Owns local level-up wizard state for one character-sheet route instance.
 */
export default function useLevelUpWizard(
    character: LevelUpWizardCharacter | null | undefined,
    visible: boolean,
    availableSubclasses: readonly AvailableSubclassOption[] = [],
): UseLevelUpWizardResult {
    const defaultClassId = useMemo(() => defaultLevelUpClassId(character), [character]);
    const [classSelection, setClassSelection] = useState(() => createLevelUpClassSelectionState(defaultClassId));
    const [hitPointsState, setHitPointsState] = useState<LevelUpHitPointsState | null>(null);
    const [asiOrFeatState, setAsiOrFeatState] = useState<LevelUpAsiOrFeatState>(() => createLevelUpAsiOrFeatState());
    const [subclassSelectionState, setSubclassSelectionState] = useState<LevelUpSubclassSelectionState>(() => createLevelUpSubclassSelectionState());
    const [spellcastingState, setSpellcastingState] = useState<LevelUpSpellcastingState>(() => createLevelUpSpellcastingState());
    const [multiclassProficiencyState, setMulticlassProficiencyState] = useState<LevelUpMulticlassProficiencyState>(() => createLevelUpMulticlassProficiencyState());
    const [invocationState, setInvocationState] = useState<LevelUpInvocationState>(() => createLevelUpInvocationState());
    const [metamagicState, setMetamagicState] = useState<LevelUpMetamagicState>(() => createLevelUpMetamagicState());
    const [mysticArcanumState, setMysticArcanumState] = useState<LevelUpMysticArcanumState>(() => createLevelUpMysticArcanumState());
    const [customFeatures, setCustomFeatures] = useState<LevelUpCustomFeatureDraft[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const selectedClassId = effectiveLevelUpClassId(classSelection);
    const abilityScores = useMemo<Record<AbilityKey, number>>(
        () => ({
            strength: character?.stats?.abilityScores.strength ?? 10,
            dexterity: character?.stats?.abilityScores.dexterity ?? 10,
            constitution: character?.stats?.abilityScores.constitution ?? 10,
            intelligence: character?.stats?.abilityScores.intelligence ?? 10,
            wisdom: character?.stats?.abilityScores.wisdom ?? 10,
            charisma: character?.stats?.abilityScores.charisma ?? 10,
        }),
        [character],
    );
    const constitutionScore = abilityScores.constitution;
    const currentCharacterLevel = character?.level ?? 0;
    const currentHitPoints = useMemo(
        () => ({
            current: character?.stats?.hp.current ?? 0,
            max: character?.stats?.hp.max ?? 0,
            temp: character?.stats?.hp.temp ?? 0,
        }),
        [character],
    );

    const currentClass = useMemo(
        () => currentLevelUpClass(character, defaultClassId),
        [character, defaultClassId],
    );
    const baseSelectedClass = useMemo(
        () => selectedLevelUpClass(character, selectedClassId, createLevelUpSubclassSelectionState(), availableSubclasses),
        [availableSubclasses, character, selectedClassId],
    );
    const selectedClass = useMemo(
        () => selectedLevelUpClass(character, selectedClassId, subclassSelectionState, availableSubclasses),
        [availableSubclasses, character, selectedClassId, subclassSelectionState],
    );
    const shouldIncludeSubclassSelection = useMemo(
        () => needsSubclassSelectionStep(baseSelectedClass),
        [baseSelectedClass],
    );
    const spellcastingSummary = useMemo(
        () => buildLevelUpSpellcastingSummary(character, selectedClass),
        [character, selectedClass],
    );
    const steps = useMemo(
        () => buildLevelUpStepList(selectedClass, shouldIncludeSubclassSelection, spellcastingSummary),
        [selectedClass, shouldIncludeSubclassSelection, spellcastingSummary],
    );
    const newFeatures = useMemo(
        () => getLevelUpFeatures(selectedClass),
        [selectedClass],
    );
    const prerequisiteWarnings = useMemo(
        () => multiclassPrerequisiteWarnings(character, defaultClassId, classSelection.selectedClassId),
        [character, classSelection.selectedClassId, defaultClassId],
    );
    const invocationPrerequisiteContext = useMemo(() => {
        if (!character || selectedClass.classId !== 'warlock') return null;

        return buildInvocationPrerequisiteContext(
            selectedClass.newLevel,
            character.spellbook,
            character.features,
        );
    }, [character, selectedClass.classId, selectedClass.newLevel]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        setClassSelection(createLevelUpClassSelectionState(defaultClassId));
        setHitPointsState(null);
        setAsiOrFeatState(createLevelUpAsiOrFeatState());
        setSubclassSelectionState(createLevelUpSubclassSelectionState());
        setSpellcastingState(createLevelUpSpellcastingState());
        setMulticlassProficiencyState(createLevelUpMulticlassProficiencyState());
        setInvocationState(createLevelUpInvocationState());
        setMetamagicState(createLevelUpMetamagicState());
        setMysticArcanumState(createLevelUpMysticArcanumState());
        setCustomFeatures([]);
        setCurrentStepIndex(0);
    }, [defaultClassId, visible]);

    useEffect(() => {
        setHitPointsState(null);
        setSubclassSelectionState(createLevelUpSubclassSelectionState());
        setSpellcastingState(createLevelUpSpellcastingState());
        setMulticlassProficiencyState(createLevelUpMulticlassProficiencyState());
        setInvocationState(createLevelUpInvocationState());
        setMetamagicState(createLevelUpMetamagicState());
        setMysticArcanumState(createLevelUpMysticArcanumState());
        setCustomFeatures([]);
    }, [selectedClassId]);

    useEffect(() => {
        setCurrentStepIndex((previousIndex) => {
            const maximumIndex = Math.max(steps.length - 1, 0);
            return Math.min(previousIndex, maximumIndex);
        });
    }, [steps]);

    const currentStep = steps[currentStepIndex] ?? steps[0];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    const stepNumber = currentStepIndex + 1;
    const stepLabel = `Step ${stepNumber} of ${steps.length} - ${currentStep.title}`;
    const nextButtonLabel = isLastStep ? 'Confirm Level Up' : 'Next';

    /**
     * Returns whether the wizard should prevent advancing from the given step.
     */
    function isNextButtonDisabled(stepId: LevelUpWizardStep['id']): boolean {
        switch (stepId) {
            case 'choose_class':
                return !canContinueFromChooseClass(classSelection);
            case 'hit_points':
                return hitPointsState == null;
            case 'asi_or_feat':
                return !canContinueFromAsiOrFeat(asiOrFeatState);
            case 'subclass_selection':
                return !canContinueFromSubclassSelection(subclassSelectionState);
            case 'new_features':
                return !canContinueFromNewFeatures(customFeatures);
            case 'spellcasting_updates':
                return !canContinueFromSpellcastingUpdates(spellcastingSummary, spellcastingState);
            case 'multiclass_proficiencies':
                return !canContinueFromMulticlassProficiencies(selectedClass, multiclassProficiencyState);
            case 'class_resources':
                return !canContinueFromAdvancedResources(
                    selectedClass.classId,
                    selectedClass.newLevel,
                    selectedClass.currentLevel,
                    invocationState,
                    metamagicState,
                    mysticArcanumState,
                );
            default:
                return false;
        }
    }

    const nextButtonDisabled = isNextButtonDisabled(currentStep.id);

    const selectClass = useCallback((classId: string) => {
        setClassSelection((previousState) => selectMulticlassLevelUpClass(previousState, classId));
    }, []);

    const enterClassPicker = useCallback(() => {
        setClassSelection((previousState) => enterMulticlassPicker(previousState));
    }, []);

    const returnToCurrentClass = useCallback(() => {
        setClassSelection((previousState) => resetToCurrentClassSelection(previousState));
    }, []);

    const rollHitPoints = useCallback(() => {
        setHitPointsState(createLevelUpHitPointsState(selectedClassId, constitutionScore, 'roll'));
    }, [constitutionScore, selectedClassId]);

    const takeAverageHitPoints = useCallback(() => {
        setHitPointsState(createLevelUpHitPointsState(selectedClassId, constitutionScore, 'average'));
    }, [constitutionScore, selectedClassId]);

    const selectAsiOrFeatMode = useCallback((mode: 'asi' | 'feat') => {
        setAsiOrFeatState((previousState) => setLevelUpAsiOrFeatMode(previousState, mode));
    }, []);

    const incrementAsiAbility = useCallback((ability: AbilityKey) => {
        setAsiOrFeatState((previousState) => incrementLevelUpAsiAllocation(
            previousState,
            ability,
            abilityScores[ability],
        ));
    }, [abilityScores]);

    const decrementAsiAbility = useCallback((ability: AbilityKey) => {
        setAsiOrFeatState((previousState) => decrementLevelUpAsiAllocation(previousState, ability));
    }, []);

    const changeFeatName = useCallback((value: string) => {
        setAsiOrFeatState((previousState) => setLevelUpFeatName(previousState, value));
    }, []);

    const changeFeatDescription = useCallback((value: string) => {
        setAsiOrFeatState((previousState) => setLevelUpFeatDescription(previousState, value));
    }, []);

    const changeFeatAbilityIncrease = useCallback((value: AbilityKey | null) => {
        setAsiOrFeatState((previousState) => setLevelUpFeatAbilityIncrease(previousState, value));
    }, []);

    const selectExistingSubclass = useCallback((subclass: AvailableSubclassOption) => {
        setSubclassSelectionState((previousState) => selectLevelUpExistingSubclass(previousState, subclass));
    }, []);

    const selectCustomSubclass = useCallback(() => {
        setSubclassSelectionState((previousState) => selectLevelUpCustomSubclass(previousState));
    }, []);

    const changeCustomSubclassName = useCallback((value: string) => {
        setSubclassSelectionState((previousState) => setLevelUpCustomSubclassName(previousState, value));
    }, []);

    const changeCustomSubclassDescription = useCallback((value: string) => {
        setSubclassSelectionState((previousState) => setLevelUpCustomSubclassDescription(previousState, value));
    }, []);

    const addCustomFeature = useCallback(() => {
        setCustomFeatures((previousState) => [
            ...previousState,
            {
                id: createDraftEntityId('level-up-feature'),
                name: '',
                description: '',
            },
        ]);
    }, []);

    const changeCustomFeature = useCallback((featureId: string, changes: Partial<LevelUpCustomFeatureDraft>) => {
        setCustomFeatures((previousState) => previousState.map((feature) => (
            feature.id === featureId ? { ...feature, ...changes } : feature
        )));
    }, []);

    const removeCustomFeature = useCallback((featureId: string) => {
        setCustomFeatures((previousState) => previousState.filter((feature) => feature.id !== featureId));
    }, []);

    const addLearnedSpell = useCallback((spell: LevelUpSpellSelection) => {
        setSpellcastingState((previousState) => addLevelUpSpellSelection(
            previousState,
            'learnedSpells',
            spell,
            spellcastingSummary.learnedSpellCount,
        ));
    }, [spellcastingSummary.learnedSpellCount]);

    const removeLearnedSpell = useCallback((spellId: string) => {
        setSpellcastingState((previousState) => removeLevelUpSpellSelection(previousState, 'learnedSpells', spellId));
    }, []);

    const addCantripSpell = useCallback((spell: LevelUpSpellSelection) => {
        setSpellcastingState((previousState) => addLevelUpSpellSelection(
            previousState,
            'cantripSpells',
            spell,
            spellcastingSummary.cantripCountGain,
        ));
    }, [spellcastingSummary.cantripCountGain]);

    const removeCantripSpell = useCallback((spellId: string) => {
        setSpellcastingState((previousState) => removeLevelUpSpellSelection(previousState, 'cantripSpells', spellId));
    }, []);

    const setSwapOutSpellId = useCallback((spellId: string | null) => {
        setSpellcastingState((previousState) => setLevelUpSwapOutSpell(previousState, spellId));
    }, []);

    const setSwapReplacementSpell = useCallback((spell: LevelUpSpellSelection | null) => {
        setSpellcastingState((previousState) => setLevelUpSwapReplacementSpell(previousState, spell));
    }, []);

    const toggleMulticlassSkill = useCallback((skill: string) => {
        const gains = getMulticlassProficiencyGains(selectedClassId);
        const maxChoices = gains?.skillChoices ?? 0;

        setMulticlassProficiencyState((previousState) => toggleMulticlassProficiencySkill(previousState, skill, maxChoices));
    }, [selectedClassId]);

    const toggleInvocation = useCallback((invocationId: string) => {
        const gain = invocationGainCount(selectedClass.currentLevel, selectedClass.newLevel);

        setInvocationState((previousState) => toggleInvocationSelection(previousState, invocationId, gain));
    }, [selectedClass.currentLevel, selectedClass.newLevel]);

    const changeCustomInvocation = useCallback((custom: { name: string; description: string } | null) => {
        setInvocationState((previousState) => setCustomInvocation(previousState, custom));
    }, []);

    const changeInvocationSwapOut = useCallback((invocationId: string | null) => {
        setInvocationState((previousState) => setInvocationSwapOut(previousState, invocationId));
    }, []);

    const changeInvocationSwapIn = useCallback((invocation: { id: string; name: string; isCustom: boolean } | null) => {
        setInvocationState((previousState) => setInvocationSwapIn(previousState, invocation));
    }, []);

    const toggleMetamagic = useCallback((metamagicId: string) => {
        const gain = metamagicGainCount(selectedClass.newLevel);

        setMetamagicState((previousState) => toggleMetamagicSelection(previousState, metamagicId, gain));
    }, [selectedClass.newLevel]);

    const changeCustomMetamagic = useCallback((custom: { name: string; description: string } | null) => {
        setMetamagicState((previousState) => setCustomMetamagic(previousState, custom));
    }, []);

    const changeMysticArcanumSpell = useCallback((spell: { id: string; name: string; level: number } | null) => {
        setMysticArcanumState((previousState) => setMysticArcanumSpell(previousState, spell));
    }, []);

    const goToPreviousStep = useCallback(() => {
        setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
    }, []);

    const goToNextStep = useCallback(() => {
        if (nextButtonDisabled) {
            return;
        }

        setCurrentStepIndex((previousIndex) => {
            if (previousIndex >= steps.length - 1) {
                return previousIndex;
            }

            return previousIndex + 1;
        });
    }, [nextButtonDisabled, steps.length]);

    const resetWizard = useCallback(() => {
        setClassSelection(createLevelUpClassSelectionState(defaultClassId));
        setHitPointsState(null);
        setAsiOrFeatState(createLevelUpAsiOrFeatState());
        setSubclassSelectionState(createLevelUpSubclassSelectionState());
        setSpellcastingState(createLevelUpSpellcastingState());
        setMulticlassProficiencyState(createLevelUpMulticlassProficiencyState());
        setInvocationState(createLevelUpInvocationState());
        setMetamagicState(createLevelUpMetamagicState());
        setMysticArcanumState(createLevelUpMysticArcanumState());
        setCustomFeatures([]);
        setCurrentStepIndex(0);
    }, [defaultClassId]);

    return {
        currentCharacterLevel,
        selectedClassId,
        currentClass,
        selectedClass,
        classSelectionMode: classSelection.mode,
        pickerSelectedClassId: classSelection.selectedClassId,
        prerequisiteWarnings,
        abilityScores,
        currentHitPoints,
        hitPointsState,
        asiOrFeatState,
        subclassSelectionState,
        spellcastingState,
        spellcastingSummary,
        multiclassProficiencyState,
        existingSkillProficiencies: character?.stats?.skillProficiencies ?? null,
        invocationPrerequisiteContext,
        invocationState,
        metamagicState,
        mysticArcanumState,
        newFeatures,
        customFeatures,
        steps,
        currentStep,
        currentStepIndex,
        isFirstStep,
        isLastStep,
        stepLabel,
        nextButtonLabel,
        nextButtonDisabled,
        selectClass,
        enterClassPicker,
        returnToCurrentClass,
        rollHitPoints,
        takeAverageHitPoints,
        selectAsiOrFeatMode,
        incrementAsiAbility,
        decrementAsiAbility,
        changeFeatName,
        changeFeatDescription,
        changeFeatAbilityIncrease,
        selectExistingSubclass,
        selectCustomSubclass,
        changeCustomSubclassName,
        changeCustomSubclassDescription,
        addCustomFeature,
        changeCustomFeature,
        removeCustomFeature,
        addLearnedSpell,
        removeLearnedSpell,
        addCantripSpell,
        removeCantripSpell,
        setSwapOutSpellId,
        setSwapReplacementSpell,
        toggleMulticlassSkill,
        toggleInvocation,
        changeCustomInvocation,
        changeInvocationSwapOut,
        changeInvocationSwapIn,
        toggleMetamagic,
        changeCustomMetamagic,
        changeMysticArcanumSpell,
        goToPreviousStep,
        goToNextStep,
        resetWizard,
    };
}
