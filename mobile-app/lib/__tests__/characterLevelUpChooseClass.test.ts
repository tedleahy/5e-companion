import {
    canContinueFromChooseClass,
    createLevelUpClassSelectionState,
    effectiveLevelUpClassId,
    enterMulticlassPicker,
    multiclassPrerequisiteWarnings,
    resetToCurrentClassSelection,
    selectMulticlassLevelUpClass,
} from '@/lib/characterLevelUp/chooseClass';
import type { LevelUpWizardCharacter } from '@/lib/characterLevelUp/types';
import { ProficiencyLevel } from '@/types/generated_graphql_types';

/**
 * Shared character fixture for choose-class tests.
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
            slotKind: 'STANDARD' as never,
            __typename: 'SpellcastingProfile',
        },
    ],
    spellSlots: [
        { __typename: 'SpellSlot', id: 'slot-standard-1', kind: 'STANDARD' as never, level: 1, total: 4, used: 0 },
    ],
    spellbook: [],
    features: [],
    stats: {
        hp: {
            __typename: 'HP',
            current: 64,
            max: 64,
            temp: 0,
        },
        abilityScores: {
            strength: 8,
            dexterity: 16,
            constitution: 14,
            intelligence: 20,
            wisdom: 13,
            charisma: 11,
            __typename: 'AbilityScores',
        },
        skillProficiencies: {
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
            __typename: 'SkillProficiencies',
        },
    },
};

describe('characterLevelUp choose-class helpers', () => {
    it('starts in the default current-class view with next enabled', () => {
        const classSelection = createLevelUpClassSelectionState('wizard');

        expect(classSelection).toEqual({
            currentClassId: 'wizard',
            mode: 'current_class',
            selectedClassId: 'wizard',
        });
        expect(effectiveLevelUpClassId(classSelection)).toBe('wizard');
        expect(canContinueFromChooseClass(classSelection)).toBe(true);
    });

    it('enters the multiclass picker with no selection and disables next', () => {
        const classSelection = enterMulticlassPicker(
            createLevelUpClassSelectionState('wizard'),
        );

        expect(classSelection).toEqual({
            currentClassId: 'wizard',
            mode: 'multiclass_picker',
            selectedClassId: null,
        });
        expect(effectiveLevelUpClassId(classSelection)).toBe('wizard');
        expect(canContinueFromChooseClass(classSelection)).toBe(false);
    });

    it('re-enables next after a multiclass selection and resets cleanly back to the current class', () => {
        const expandedSelection = enterMulticlassPicker(
            createLevelUpClassSelectionState('wizard'),
        );
        const selectedMulticlass = selectMulticlassLevelUpClass(expandedSelection, 'fighter');

        expect(selectedMulticlass).toEqual({
            currentClassId: 'wizard',
            mode: 'multiclass_picker',
            selectedClassId: 'fighter',
        });
        expect(effectiveLevelUpClassId(selectedMulticlass)).toBe('fighter');
        expect(canContinueFromChooseClass(selectedMulticlass)).toBe(true);

        expect(resetToCurrentClassSelection(selectedMulticlass)).toEqual({
            currentClassId: 'wizard',
            mode: 'current_class',
            selectedClassId: 'wizard',
        });
    });

    it('returns no warnings when the character stays in the current class', () => {
        expect(multiclassPrerequisiteWarnings(TEST_CHARACTER, 'wizard', 'wizard')).toEqual([]);
    });

    it('returns informational warnings when multiclass prerequisites are not met', () => {
        expect(multiclassPrerequisiteWarnings(TEST_CHARACTER, 'wizard', 'bard')).toEqual([
            'New class multiclass requirement not met for Bard: CHA 13. Current scores: CHA 11.',
        ]);
    });
});
