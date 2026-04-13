import {
    buildLevelUpStepList,
    defaultLevelUpClassId,
    selectedLevelUpClass,
} from '@/lib/characterLevelUp/stepAssembly';
import { buildLevelUpSpellcastingSummary } from '@/lib/characterLevelUp/spellcasting';
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
            slotKind: 'STANDARD' as never,
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
            slotKind: 'PACT_MAGIC' as never,
            __typename: 'SpellcastingProfile',
        },
    ],
    spellSlots: [
        { __typename: 'SpellSlot', id: 'slot-standard-1', kind: 'STANDARD' as never, level: 1, total: 4, used: 0 },
        { __typename: 'SpellSlot', id: 'slot-pact-1', kind: 'PACT_MAGIC' as never, level: 1, total: 2, used: 0 },
    ],
    spellbook: [],
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
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(TEST_CHARACTER, selectedClass),
        ).map((step) => step.id);

        expect(steps).toEqual([
            'choose_class',
            'hit_points',
            'new_features',
            'spellcasting_updates',
            'summary',
        ]);
    });

    it('adds multiclass proficiencies for a brand-new class selection', () => {
        const selectedClass = selectedLevelUpClass(TEST_CHARACTER, 'fighter');
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(TEST_CHARACTER, selectedClass),
        ).map((step) => step.id);

        expect(steps).toEqual([
            'choose_class',
            'hit_points',
            'new_features',
            'multiclass_proficiencies',
            'summary',
        ]);
    });

    it('adds immediate subclass and spellcasting steps for level-one subclass casters', () => {
        const selectedClass = selectedLevelUpClass(TEST_CHARACTER, 'sorcerer');
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(TEST_CHARACTER, selectedClass),
        ).map((step) => step.id);

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

    it('includes class_resources step for warlock mystic arcanum levels', () => {
        const warlockCharacter: LevelUpWizardCharacter = {
            ...TEST_CHARACTER,
            classes: [
                {
                    id: 'class-row-warlock',
                    classId: 'warlock',
                    className: 'Warlock',
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                    level: 10,
                    isStartingClass: true,
                    __typename: 'CharacterClass',
                },
            ],
            spellcastingProfiles: [
                {
                    classId: 'warlock',
                    className: 'Warlock',
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                    classLevel: 10,
                    spellcastingAbility: 'charisma',
                    spellSaveDC: 12,
                    spellAttackBonus: 4,
                    slotKind: 'PACT_MAGIC' as never,
                    __typename: 'SpellcastingProfile',
                },
            ],
            spellSlots: [
                { __typename: 'SpellSlot', id: 'slot-pact-1', kind: 'PACT_MAGIC' as never, level: 1, total: 2, used: 0 },
            ],
        };
        const selectedClass = selectedLevelUpClass(warlockCharacter, 'warlock');
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(warlockCharacter, selectedClass),
        ).map((step) => step.id);

        // Expect class_resources step due to mystic arcanum gain
        expect(steps).toContain('class_resources');
    });

    it('includes class_resources step for warlock invocation gain levels', () => {
        const warlockCharacter: LevelUpWizardCharacter = {
            ...TEST_CHARACTER,
            classes: [
                {
                    id: 'class-row-warlock',
                    classId: 'warlock',
                    className: 'Warlock',
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                    level: 4,
                    isStartingClass: true,
                    __typename: 'CharacterClass',
                },
            ],
            spellcastingProfiles: [
                {
                    classId: 'warlock',
                    className: 'Warlock',
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                    classLevel: 4,
                    spellcastingAbility: 'charisma',
                    spellSaveDC: 12,
                    spellAttackBonus: 4,
                    slotKind: 'PACT_MAGIC' as never,
                    __typename: 'SpellcastingProfile',
                },
            ],
            spellSlots: [
                { __typename: 'SpellSlot', id: 'slot-pact-1', kind: 'PACT_MAGIC' as never, level: 1, total: 2, used: 0 },
            ],
        };
        const selectedClass = selectedLevelUpClass(warlockCharacter, 'warlock');
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(warlockCharacter, selectedClass),
        ).map((step) => step.id);

        // Expect class_resources step due to invocation gain
        expect(steps).toContain('class_resources');
    });

    it('includes class_resources step for warlock swap allowed (level >=3)', () => {
        const warlockCharacter: LevelUpWizardCharacter = {
            ...TEST_CHARACTER,
            classes: [
                {
                    id: 'class-row-warlock',
                    classId: 'warlock',
                    className: 'Warlock',
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                    level: 2,
                    isStartingClass: true,
                    __typename: 'CharacterClass',
                },
            ],
            spellcastingProfiles: [
                {
                    classId: 'warlock',
                    className: 'Warlock',
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                    classLevel: 2,
                    spellcastingAbility: 'charisma',
                    spellSaveDC: 12,
                    spellAttackBonus: 4,
                    slotKind: 'PACT_MAGIC' as never,
                    __typename: 'SpellcastingProfile',
                },
            ],
            spellSlots: [
                { __typename: 'SpellSlot', id: 'slot-pact-1', kind: 'PACT_MAGIC' as never, level: 1, total: 2, used: 0 },
            ],
        };
        const selectedClass = selectedLevelUpClass(warlockCharacter, 'warlock');
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(warlockCharacter, selectedClass),
        ).map((step) => step.id);

        // Expect class_resources step due to swap allowed
        expect(steps).toContain('class_resources');
    });

    it('includes class_resources step for sorcerer metamagic gain levels', () => {
        const sorcererCharacter: LevelUpWizardCharacter = {
            ...TEST_CHARACTER,
            classes: [
                {
                    id: 'class-row-sorcerer',
                    classId: 'sorcerer',
                    className: 'Sorcerer',
                    subclassId: 'draconic',
                    subclassName: 'Draconic',
                    level: 2,
                    isStartingClass: true,
                    __typename: 'CharacterClass',
                },
            ],
            spellcastingProfiles: [
                {
                    classId: 'sorcerer',
                    className: 'Sorcerer',
                    subclassId: 'draconic',
                    subclassName: 'Draconic',
                    classLevel: 2,
                    spellcastingAbility: 'charisma',
                    spellSaveDC: 12,
                    spellAttackBonus: 4,
                    slotKind: 'STANDARD' as never,
                    __typename: 'SpellcastingProfile',
                },
            ],
            spellSlots: [
                { __typename: 'SpellSlot', id: 'slot-standard-1', kind: 'STANDARD' as never, level: 1, total: 2, used: 0 },
            ],
        };
        const selectedClass = selectedLevelUpClass(sorcererCharacter, 'sorcerer');
        const steps = buildLevelUpStepList(
            selectedClass,
            needsSubclassSelectionStep(selectedClass),
            buildLevelUpSpellcastingSummary(sorcererCharacter, selectedClass),
        ).map((step) => step.id);

        // Expect class_resources step due to metamagic gain
        expect(steps).toContain('class_resources');
    });
});
