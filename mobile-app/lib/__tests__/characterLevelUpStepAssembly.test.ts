import {
    buildLevelUpStepList,
    defaultLevelUpClassId,
    selectedLevelUpClass,
} from '@/lib/characterLevelUp/stepAssembly';
import { needsSubclassSelectionStep } from '@/lib/characterLevelUp/subclassFeatures';
import type { LevelUpWizardCharacter } from '@/lib/characterLevelUp/types';

/**
 * Shared character fixture for step-assembly tests.
 */
const TEST_CHARACTER: LevelUpWizardCharacter = {
    id: 'char-1',
    name: 'Vaelindra',
    level: 12,
    classes: [
        {
            id: 'class-row-wizard',
            classId: 'wizard',
            className: 'Wizard',
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            level: 10,
            isStartingClass: true,
            __typename: 'CharacterClass',
        },
        {
            id: 'class-row-warlock',
            classId: 'warlock',
            className: 'Warlock',
            subclassId: 'fiend',
            subclassName: 'Fiend',
            level: 2,
            isStartingClass: false,
            __typename: 'CharacterClass',
        },
    ],
    spellcastingProfiles: [
        {
            classId: 'wizard',
            className: 'Wizard',
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            classLevel: 10,
            spellcastingAbility: 'intelligence',
            spellSaveDC: 17,
            spellAttackBonus: 9,
            slotKind: 'STANDARD',
            __typename: 'SpellcastingProfile',
        },
        {
            classId: 'warlock',
            className: 'Warlock',
            subclassId: 'fiend',
            subclassName: 'Fiend',
            classLevel: 2,
            spellcastingAbility: 'charisma',
            spellSaveDC: 12,
            spellAttackBonus: 4,
            slotKind: 'PACT_MAGIC',
            __typename: 'SpellcastingProfile',
        },
    ],
    stats: {
        abilityScores: {
            strength: 8,
            dexterity: 16,
            constitution: 14,
            intelligence: 20,
            wisdom: 13,
            charisma: 11,
            __typename: 'AbilityScores',
        },
    },
};

describe('characterLevelUp step assembly', () => {
    it('defaults to the primary displayed class when the wizard opens', () => {
        expect(defaultLevelUpClassId(TEST_CHARACTER)).toBe('wizard');
    });

    it('derives class levels correctly for existing class progression', () => {
        expect(selectedLevelUpClass(TEST_CHARACTER, 'warlock')).toMatchObject({
            classId: 'warlock',
            className: 'Warlock',
            currentLevel: 2,
            newLevel: 3,
            isExistingClass: true,
        });
    });

    it('builds the default wizard progression for the current class', () => {
        const selectedClass = selectedLevelUpClass(TEST_CHARACTER, 'wizard');
        const steps = buildLevelUpStepList(selectedClass, needsSubclassSelectionStep(selectedClass)).map((step) => step.id);

        expect(steps).toEqual([
            'choose_class',
            'hit_points',
            'new_features',
            'spellcasting_updates',
            'class_resources',
            'summary',
        ]);
    });

    it('adds multiclass proficiencies for a brand-new class selection', () => {
        const selectedClass = selectedLevelUpClass(TEST_CHARACTER, 'fighter');
        const steps = buildLevelUpStepList(selectedClass, needsSubclassSelectionStep(selectedClass)).map((step) => step.id);

        expect(steps).toEqual([
            'choose_class',
            'hit_points',
            'new_features',
            'multiclass_proficiencies',
            'class_resources',
            'summary',
        ]);
    });

    it('adds immediate subclass and spellcasting steps for level-one subclass casters', () => {
        const selectedClass = selectedLevelUpClass(TEST_CHARACTER, 'sorcerer');
        const steps = buildLevelUpStepList(selectedClass, needsSubclassSelectionStep(selectedClass)).map((step) => step.id);

        expect(steps).toEqual([
            'choose_class',
            'hit_points',
            'subclass_selection',
            'new_features',
            'spellcasting_updates',
            'multiclass_proficiencies',
            'summary',
        ]);
    });
});
