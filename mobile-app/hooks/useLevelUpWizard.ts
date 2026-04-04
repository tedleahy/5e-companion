import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    buildLevelUpStepList,
    defaultLevelUpClassId,
    selectedLevelUpClass,
} from '@/lib/characterLevelUp/stepAssembly';
import type {
    LevelUpWizardCharacter,
    LevelUpWizardSelectedClass,
    LevelUpWizardStep,
} from '@/lib/characterLevelUp/types';

/**
 * Route-local controller returned by the level-up wizard hook.
 */
export type UseLevelUpWizardResult = {
    selectedClassId: string;
    selectedClass: LevelUpWizardSelectedClass;
    steps: LevelUpWizardStep[];
    currentStep: LevelUpWizardStep;
    currentStepIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    stepLabel: string;
    nextButtonLabel: string;
    selectClass: (classId: string) => void;
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
    const [selectedClassId, setSelectedClassId] = useState(defaultClassId);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const steps = useMemo(
        () => buildLevelUpStepList(character, selectedClassId),
        [character, selectedClassId],
    );
    const selectedClass = useMemo(
        () => selectedLevelUpClass(character, selectedClassId),
        [character, selectedClassId],
    );

    useEffect(() => {
        if (!visible) {
            return;
        }

        setSelectedClassId(defaultClassId);
        setCurrentStepIndex(0);
    }, [defaultClassId, visible]);

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

    const selectClass = useCallback((classId: string) => {
        setSelectedClassId(classId);
    }, []);

    const goToPreviousStep = useCallback(() => {
        setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
    }, []);

    const goToNextStep = useCallback(() => {
        setCurrentStepIndex((previousIndex) => {
            if (previousIndex >= steps.length - 1) {
                return previousIndex;
            }

            return previousIndex + 1;
        });
    }, [steps.length]);

    const resetWizard = useCallback(() => {
        setSelectedClassId(defaultClassId);
        setCurrentStepIndex(0);
    }, [defaultClassId]);

    return {
        selectedClassId,
        selectedClass,
        steps,
        currentStep,
        currentStepIndex,
        isFirstStep,
        isLastStep,
        stepLabel,
        nextButtonLabel,
        selectClass,
        goToPreviousStep,
        goToNextStep,
        resetWizard,
    };
}
