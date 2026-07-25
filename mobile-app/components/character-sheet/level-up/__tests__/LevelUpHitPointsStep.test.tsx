import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import LevelUpHitPointsStep from '../LevelUpHitPointsStep';
import type { UseLevelUpWizardResult } from '@/hooks/useLevelUpWizard';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';

const CUSTOM_SELECTED_CLASS: LevelUpWizardSelectedClass = {
    classId: 'custom-warden-id',
    className: 'Warden',
    currentLevel: 2,
    newLevel: 3,
    isExistingClass: true,
    subclassId: null,
    subclassName: null,
    subclassDescription: null,
    subclassIsCustom: false,
    subclassFeatures: [],
    customSubclass: null,
    classDefinition: {
        hitDie: 10,
    } as LevelUpWizardSelectedClass['classDefinition'],
};

/**
 * Renders the hit-points step for a custom class with a configured d10.
 */
function renderStep() {
    return render(
        <PaperProvider>
            <LevelUpHitPointsStep
                wizard={{
                    selectedClass: CUSTOM_SELECTED_CLASS,
                    hitPointsState: null,
                    rollHitPoints: jest.fn(),
                    takeAverageHitPoints: jest.fn(),
                } as unknown as UseLevelUpWizardResult}
            />
        </PaperProvider>,
    );
}

describe('LevelUpHitPointsStep', () => {
    it('presents labels, average, and accessibility text from the selected class hit die', () => {
        renderStep();

        expect(screen.getByText(/Warden's d10/)).toBeTruthy();
        expect(screen.getAllByText('d10').length).toBeGreaterThan(0);
        expect(screen.getByText('or take the average (6)')).toBeTruthy();
        expect(screen.getByLabelText('Roll d10 hit die')).toBeTruthy();
        expect(screen.getByLabelText('Take the average hit points of 6 for d10')).toBeTruthy();
    });
});
