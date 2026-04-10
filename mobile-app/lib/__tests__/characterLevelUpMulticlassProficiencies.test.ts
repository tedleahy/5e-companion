import {
    getMulticlassProficiencyGains,
    getAutomaticProficiencyLabels,
    hasAnyMulticlassProficiencies,
    canContinueFromMulticlassProficiencies,
    createLevelUpMulticlassProficiencyState,
    toggleMulticlassProficiencySkill,
} from '../characterLevelUp/multiclassProficiencies';
import type { LevelUpWizardSelectedClass } from '../characterLevelUp/types';

function makeSelectedClass(classId: string, isExistingClass: boolean): LevelUpWizardSelectedClass {
    return {
        classId,
        className: classId.charAt(0).toUpperCase() + classId.slice(1),
        currentLevel: 0,
        newLevel: 1,
        isExistingClass,
        subclassId: null,
        subclassName: null,
        subclassDescription: null,
        subclassIsCustom: false,
        subclassFeatures: [],
        customSubclass: null,
    };
}

describe('multiclass proficiency gains', () => {
    it('returns proficiency data for all SRD classes', () => {
        const knownClasses = [
            'barbarian', 'bard', 'cleric', 'druid', 'fighter',
            'monk', 'paladin', 'ranger', 'rogue', 'warlock', 'wizard',
            'sorcerer',
        ];

        for (const classId of knownClasses) {
            expect(getMulticlassProficiencyGains(classId)).not.toBeNull();
        }
    });

    it('returns null for unknown classes', () => {
        expect(getMulticlassProficiencyGains('artificer')).toBeNull();
    });

    it('returns correct proficiencies for fighter', () => {
        const gains = getMulticlassProficiencyGains('fighter')!;

        expect(gains.armor).toEqual(['Light armour', 'Medium armour', 'Shields']);
        expect(gains.weapons).toEqual(['Simple weapons', 'Martial weapons']);
        expect(gains.skillChoices).toBe(0);
    });

    it('returns correct proficiencies for bard with skill choices', () => {
        const gains = getMulticlassProficiencyGains('bard')!;

        expect(gains.armor).toEqual(['Light armour']);
        expect(gains.weapons).toEqual(['Simple weapons']);
        expect(gains.tools).toEqual(['One musical instrument of your choice']);
        expect(gains.skillChoices).toBe(1);
        expect(gains.skillOptions.length).toBe(18);
    });

    it('returns correct proficiencies for druid', () => {
        const gains = getMulticlassProficiencyGains('druid')!;

        expect(gains.armor).toEqual(['Light armour', 'Medium armour', 'Shields (non-metal)']);
        expect(gains.weapons).toEqual([
            'Clubs',
            'Daggers',
            'Darts',
            'Javelins',
            'Maces',
            'Quarterstaffs',
            'Scimitars',
            'Sickles',
            'Slings',
            'Spears',
        ]);
        expect(gains.tools).toEqual(['Herbalism kit']);
    });

    it('returns rogue tool proficiency gains', () => {
        const gains = getMulticlassProficiencyGains('rogue')!;

        expect(gains.tools).toEqual(["Thieves' tools"]);
        expect(gains.skillChoices).toBe(1);
    });

    it('returns no proficiencies for wizard', () => {
        const gains = getMulticlassProficiencyGains('wizard')!;

        expect(gains.armor).toEqual([]);
        expect(gains.weapons).toEqual([]);
        expect(gains.tools).toEqual([]);
        expect(gains.skillChoices).toBe(0);
    });

    it('hasAnyMulticlassProficiencies returns false for wizard', () => {
        expect(hasAnyMulticlassProficiencies('wizard')).toBe(false);
    });

    it('hasAnyMulticlassProficiencies returns true for fighter', () => {
        expect(hasAnyMulticlassProficiencies('fighter')).toBe(true);
    });
});

describe('getAutomaticProficiencyLabels', () => {
    it('combines armor, weapons, and tools into a flat list', () => {
        const gains = getMulticlassProficiencyGains('fighter')!;
        const labels = getAutomaticProficiencyLabels(gains);

        expect(labels).toEqual([
            'Light armour', 'Medium armour', 'Shields',
            'Simple weapons', 'Martial weapons',
        ]);
    });
});

describe('toggleMulticlassProficiencySkill', () => {
    it('adds a skill to the selection', () => {
        const state = createLevelUpMulticlassProficiencyState();
        const next = toggleMulticlassProficiencySkill(state, 'Stealth', 1);

        expect(next.selectedSkills).toEqual(['Stealth']);
    });

    it('removes an already-selected skill', () => {
        const state = { selectedSkills: ['Stealth'] };
        const next = toggleMulticlassProficiencySkill(state, 'Stealth', 1);

        expect(next.selectedSkills).toEqual([]);
    });

    it('does not exceed the max choices', () => {
        const state = { selectedSkills: ['Stealth'] };
        const next = toggleMulticlassProficiencySkill(state, 'Perception', 1);

        expect(next.selectedSkills).toEqual(['Stealth']);
    });
});

describe('canContinueFromMulticlassProficiencies', () => {
    it('returns true when no skill choices are required', () => {
        const selectedClass = makeSelectedClass('fighter', false);
        const state = createLevelUpMulticlassProficiencyState();

        expect(canContinueFromMulticlassProficiencies(selectedClass, state)).toBe(true);
    });

    it('returns false when skill choices are required but not filled', () => {
        const selectedClass = makeSelectedClass('rogue', false);
        const state = createLevelUpMulticlassProficiencyState();

        expect(canContinueFromMulticlassProficiencies(selectedClass, state)).toBe(false);
    });

    it('returns true when skill choices are filled', () => {
        const selectedClass = makeSelectedClass('rogue', false);
        const state = { selectedSkills: ['Stealth'] };

        expect(canContinueFromMulticlassProficiencies(selectedClass, state)).toBe(true);
    });
});
