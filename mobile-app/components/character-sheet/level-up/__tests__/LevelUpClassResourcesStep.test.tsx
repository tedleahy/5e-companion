import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import LevelUpClassResourcesStep from '../LevelUpClassResourcesStep';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';

function makeSelectedClass(classId: string, currentLevel: number, newLevel: number): LevelUpWizardSelectedClass {
    return {
        classId,
        className: classId.charAt(0).toUpperCase() + classId.slice(1),
        currentLevel,
        newLevel,
        isExistingClass: true,
        subclassId: null,
        subclassName: null,
        subclassDescription: null,
        subclassIsCustom: false,
        subclassFeatures: [],
        customSubclass: null,
    };
}

function renderStep(classId: string, currentLevel: number, newLevel: number) {
    return render(
        <PaperProvider>
            <LevelUpClassResourcesStep
                selectedClass={makeSelectedClass(classId, currentLevel, newLevel)}
            />
        </PaperProvider>,
    );
}

describe('LevelUpClassResourcesStep', () => {
    it('shows rage change card for barbarian gaining rages at level 3', () => {
        renderStep('barbarian', 2, 3);

        expect(screen.getByTestId('level-up-resource-change-barbarian-rages')).toBeTruthy();
        expect(screen.getByText('Rages')).toBeTruthy();
        expect(screen.getByText('3')).toBeTruthy();
    });

    it('shows unchanged resources in a separate section', () => {
        renderStep('barbarian', 2, 3);

        expect(screen.getByTestId('level-up-resource-unchanged-barbarian-rage-damage')).toBeTruthy();
    });

    it('shows sneak attack change for rogue at odd levels', () => {
        renderStep('rogue', 2, 3);

        expect(screen.getByTestId('level-up-resource-change-rogue-sneak-attack')).toBeTruthy();
    });

    it('shows multiple monk resource changes', () => {
        renderStep('monk', 4, 5);

        expect(screen.getByTestId('level-up-resource-change-monk-martial-arts')).toBeTruthy();
        expect(screen.getByTestId('level-up-resource-change-monk-ki')).toBeTruthy();
    });

    it('shows warlock invocation changes at level 5', () => {
        renderStep('warlock', 4, 5);

        expect(screen.getByTestId('level-up-resource-change-warlock-invocations')).toBeTruthy();
    });

    it('shows sorcery point changes', () => {
        renderStep('sorcerer', 2, 3);

        expect(screen.getByTestId('level-up-resource-change-sorcerer-sorcery-points')).toBeTruthy();
    });
});
