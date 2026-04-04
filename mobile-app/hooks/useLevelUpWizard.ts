import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AbilityKey } from '@/lib/characterSheetUtils';
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
    buildLevelUpStepList,
    defaultLevelUpClassId,
    selectedLevelUpClass,
} from '@/lib/characterLevelUp/stepAssembly';
import type {
    LevelUpAsiOrFeatState,
    LevelUpHitPointsState,
    LevelUpClassSelectionMode,
    LevelUpWizardCharacter,
    LevelUpWizardSelectedClass,
    LevelUpWizardStep,
} from '@/lib/characterLevelUp/types';

/**
 * Route-local controller returned by the level-up wizard hook.
 */
export type UseLevelUpWizardResult = {
    selectedClassId: string;
    currentClass: LevelUpWizardSelectedClass;
    selectedClass: LevelUpWizardSelectedClass;
    classSelectionMode: LevelUpClassSelectionMode;
    pickerSelectedClassId: string | null;
    prerequisiteWarnings: string[];
    abilityScores: Record<AbilityKey, number>;
    hitPointsState: LevelUpHitPointsState | null;
    asiOrFeatState: LevelUpAsiOrFeatState;
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
): UseLevelUpWizardResult {
    const defaultClassId = useMemo(() => defaultLevelUpClassId(character), [character]);
    const [classSelection, setClassSelection] = useState(() => createLevelUpClassSelectionState(defaultClassId));
    const [hitPointsState, setHitPointsState] = useState<LevelUpHitPointsState | null>(null);
    const [asiOrFeatState, setAsiOrFeatState] = useState<LevelUpAsiOrFeatState>(() => createLevelUpAsiOrFeatState());
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

    const steps = useMemo(
        () => buildLevelUpStepList(character, selectedClassId),
        [character, selectedClassId],
    );
    const currentClass = useMemo(
        () => currentLevelUpClass(character, defaultClassId),
        [character, defaultClassId],
    );
    const selectedClass = useMemo(
        () => selectedLevelUpClass(character, selectedClassId),
        [character, selectedClassId],
    );
    const prerequisiteWarnings = useMemo(
        () => multiclassPrerequisiteWarnings(character, defaultClassId, classSelection.selectedClassId),
        [character, classSelection.selectedClassId, defaultClassId],
    );

    useEffect(() => {
        if (!visible) {
            return;
        }

        setClassSelection(createLevelUpClassSelectionState(defaultClassId));
        setHitPointsState(null);
        setAsiOrFeatState(createLevelUpAsiOrFeatState());
        setCurrentStepIndex(0);
    }, [defaultClassId, visible]);

    useEffect(() => {
        setHitPointsState(null);
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
    const nextButtonDisabled = currentStep.id === 'choose_class'
        ? !canContinueFromChooseClass(classSelection)
        : currentStep.id === 'hit_points'
            ? hitPointsState == null
            : currentStep.id === 'asi_or_feat'
                ? !canContinueFromAsiOrFeat(asiOrFeatState)
            : false;

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
        setCurrentStepIndex(0);
    }, [defaultClassId]);

    return {
        selectedClassId,
        currentClass,
        selectedClass,
        classSelectionMode: classSelection.mode,
        pickerSelectedClassId: classSelection.selectedClassId,
        prerequisiteWarnings,
        abilityScores,
        hitPointsState,
        asiOrFeatState,
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
        goToPreviousStep,
        goToNextStep,
        resetWizard,
    };
}
