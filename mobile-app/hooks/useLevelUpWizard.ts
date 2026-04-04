import { useCallback, useEffect, useMemo, useState } from 'react';
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
    hitPointsState: LevelUpHitPointsState | null;
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
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const selectedClassId = effectiveLevelUpClassId(classSelection);
    const constitutionScore = character?.stats?.abilityScores.constitution ?? 10;

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
        setCurrentStepIndex(0);
    }, [defaultClassId]);

    return {
        selectedClassId,
        currentClass,
        selectedClass,
        classSelectionMode: classSelection.mode,
        pickerSelectedClassId: classSelection.selectedClassId,
        prerequisiteWarnings,
        hitPointsState,
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
        goToPreviousStep,
        goToNextStep,
        resetWizard,
    };
}
