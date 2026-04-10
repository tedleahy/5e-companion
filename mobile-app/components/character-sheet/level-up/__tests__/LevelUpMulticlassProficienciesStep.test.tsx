import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import LevelUpMulticlassProficienciesStep from '../LevelUpMulticlassProficienciesStep';
import type { LevelUpWizardSelectedClass } from '@/lib/characterLevelUp/types';
import { ProficiencyLevel, type SkillProficiencies } from '@/types/generated_graphql_types';

function makeSelectedClass(classId: string): LevelUpWizardSelectedClass {
    return {
        classId,
        className: classId.charAt(0).toUpperCase() + classId.slice(1),
        currentLevel: 0,
        newLevel: 1,
        isExistingClass: false,
        subclassId: null,
        subclassName: null,
        subclassDescription: null,
        subclassIsCustom: false,
        subclassFeatures: [],
        customSubclass: null,
    };
}

function makeSkillProficiencies(overrides: Partial<Record<keyof SkillProficiencies, ProficiencyLevel>> = {}): SkillProficiencies {
    return {
        __typename: 'SkillProficiencies',
        acrobatics: ProficiencyLevel.None,
        animalHandling: ProficiencyLevel.None,
        arcana: ProficiencyLevel.None,
        athletics: ProficiencyLevel.None,
        deception: ProficiencyLevel.None,
        history: ProficiencyLevel.None,
        insight: ProficiencyLevel.None,
        intimidation: ProficiencyLevel.None,
        investigation: ProficiencyLevel.None,
        medicine: ProficiencyLevel.None,
        nature: ProficiencyLevel.None,
        perception: ProficiencyLevel.None,
        performance: ProficiencyLevel.None,
        persuasion: ProficiencyLevel.None,
        religion: ProficiencyLevel.None,
        sleightOfHand: ProficiencyLevel.None,
        stealth: ProficiencyLevel.None,
        survival: ProficiencyLevel.None,
        ...overrides,
    };
}

function renderStep(
    classId: string,
    selectedSkills: string[] = [],
    onToggleSkill = jest.fn(),
    existingSkillProficiencies: SkillProficiencies | null = null,
) {
    return render(
        <PaperProvider>
            <LevelUpMulticlassProficienciesStep
                selectedClass={makeSelectedClass(classId)}
                proficiencyState={{ selectedSkills }}
                existingSkillProficiencies={existingSkillProficiencies}
                onToggleSkill={onToggleSkill}
            />
        </PaperProvider>,
    );
}

describe('LevelUpMulticlassProficienciesStep', () => {
    it('shows automatic proficiencies for fighter', () => {
        renderStep('fighter');

        expect(screen.getByTestId('level-up-auto-proficiencies')).toBeTruthy();
        expect(screen.getByText(/Light armour/)).toBeTruthy();
        expect(screen.getByText(/Martial weapons/)).toBeTruthy();
    });

    it('shows empty state for wizard', () => {
        renderStep('wizard');

        expect(screen.getByTestId('level-up-no-proficiencies')).toBeTruthy();
    });

    it('shows skill picker for rogue with Proficiency label', () => {
        renderStep('rogue');

        expect(screen.getByTestId('level-up-skill-picker')).toBeTruthy();
        expect(screen.getByText('Choose 1 Skill Proficiency')).toBeTruthy();
    });

    it('groups skills by ability score', () => {
        renderStep('bard');

        expect(screen.getByTestId('level-up-skill-group-strength')).toBeTruthy();
        expect(screen.getByTestId('level-up-skill-group-dexterity')).toBeTruthy();
        expect(screen.getByTestId('level-up-skill-group-charisma')).toBeTruthy();
    });

    it('calls onToggleSkill when a skill chip is pressed', () => {
        const onToggleSkill = jest.fn();
        renderStep('rogue', [], onToggleSkill);

        fireEvent.press(screen.getByTestId('level-up-skill-option-Stealth'));
        expect(onToggleSkill).toHaveBeenCalledWith('Stealth');
    });

    it('shows the correct selected count', () => {
        renderStep('rogue', ['Stealth']);

        expect(screen.getByTestId('level-up-skill-count')).toHaveTextContent('1 of 1 selected');
    });

    it('shows skill picker for bard with any skill', () => {
        renderStep('bard');

        expect(screen.getByTestId('level-up-skill-picker')).toBeTruthy();
        expect(screen.getByTestId('level-up-skill-option-Acrobatics')).toBeTruthy();
        expect(screen.getByTestId('level-up-skill-option-Survival')).toBeTruthy();
    });

    it('shows existing proficiency label on already-proficient skills', () => {
        const existing = makeSkillProficiencies({
            stealth: ProficiencyLevel.Proficient,
        });
        renderStep('rogue', [], jest.fn(), existing);

        expect(screen.getByTestId('level-up-skill-existing-Stealth')).toHaveTextContent('Proficient');
    });

    it('shows Expert label for expertise skills', () => {
        const existing = makeSkillProficiencies({
            perception: ProficiencyLevel.Expert,
        });
        renderStep('bard', [], jest.fn(), existing);

        expect(screen.getByTestId('level-up-skill-existing-Perception')).toHaveTextContent('Expert');
    });

    it('disables already-proficient skills from selection', () => {
        const existing = makeSkillProficiencies({
            stealth: ProficiencyLevel.Proficient,
        });
        renderStep('rogue', [], jest.fn(), existing);

        const stealthChip = screen.getByTestId('level-up-skill-option-Stealth');
        expect(stealthChip.props.accessibilityState.disabled).toBe(true);
    });
});
