import {
    areProficiencyChoicesComplete,
    didClassCompositionChange,
    proficiencyChoicesEqual,
    reconcileProficiencyChoices,
} from '../characterCreation/proficiencyChoiceDraft';
import type { ClassProficiencyChoiceGroup } from '../characterCreation/classRules';

const bardInstruments: ClassProficiencyChoiceGroup = {
    classId: 'bard',
    choiceGroup: 2,
    pick: 1,
    type: 'TOOL',
    options: [
        { value: 'lute', name: 'Lute', type: 'TOOL' },
        { value: 'flute', name: 'Flute', type: 'TOOL' },
    ],
};

const monkTools: ClassProficiencyChoiceGroup = {
    classId: 'monk',
    choiceGroup: 2,
    pick: 1,
    type: 'TOOL',
    options: [
        { value: 'alchemists-supplies', name: "Alchemist's supplies", type: 'TOOL' },
        { value: 'cooks-utensils', name: "Cook's utensils", type: 'TOOL' },
    ],
};

const fighterSkills: ClassProficiencyChoiceGroup = {
    classId: 'fighter',
    choiceGroup: 1,
    pick: 2,
    type: 'SKILL',
    options: [
        { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
        { value: 'skill-perception', name: 'Perception', type: 'SKILL' },
        { value: 'skill-survival', name: 'Survival', type: 'SKILL' },
    ],
};

const rogueSkills: ClassProficiencyChoiceGroup = {
    classId: 'rogue',
    choiceGroup: 1,
    pick: 1,
    type: 'SKILL',
    options: [
        { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
        { value: 'skill-stealth', name: 'Stealth', type: 'SKILL' },
    ],
};

describe('didClassCompositionChange', () => {
    it('detects class set and starting-class designation changes', () => {
        expect(didClassCompositionChange(
            [{ classId: 'bard', subclassId: '', level: 1 }],
            'bard',
            [{ classId: 'monk', subclassId: '', level: 1 }],
            'monk',
        )).toBe(true);

        expect(didClassCompositionChange(
            [
                { classId: 'fighter', subclassId: '', level: 1 },
                { classId: 'bard', subclassId: '', level: 1 },
            ],
            'fighter',
            [
                { classId: 'fighter', subclassId: '', level: 1 },
                { classId: 'bard', subclassId: '', level: 1 },
            ],
            'bard',
        )).toBe(true);

        expect(didClassCompositionChange(
            [{ classId: 'fighter', subclassId: 'champion', level: 3 }],
            'fighter',
            [{ classId: 'fighter', subclassId: '', level: 3 }],
            'fighter',
        )).toBe(false);
    });
});

describe('reconcileProficiencyChoices', () => {
    it('drops stale selections when the class or option membership changes', () => {
        expect(reconcileProficiencyChoices(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute'] }],
            [monkTools],
        )).toEqual([]);

        expect(reconcileProficiencyChoices(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute', 'bagpipes'] }],
            [bardInstruments],
        )).toEqual([{ classId: 'bard', choiceGroup: 2, values: ['lute'] }]);
    });

    it('prunes invalid skill values without a class composition change', () => {
        expect(reconcileProficiencyChoices(
            [{ classId: 'fighter', choiceGroup: 1, values: ['skill-athletics', 'skill-arcana'] }],
            [fighterSkills],
        )).toEqual([{ classId: 'fighter', choiceGroup: 1, values: ['skill-athletics'] }]);
    });
});

describe('areProficiencyChoicesComplete', () => {
    it('requires exact unique membership for each class-scoped group', () => {
        expect(areProficiencyChoicesComplete(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute', 'lute'] }],
            [bardInstruments],
        )).toBe(false);

        expect(areProficiencyChoicesComplete(
            [{ classId: 'bard', choiceGroup: 2, values: ['bagpipes'] }],
            [bardInstruments],
        )).toBe(false);

        expect(areProficiencyChoicesComplete(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute'] }],
            [bardInstruments],
        )).toBe(true);
    });

    it('rejects unexpected leftover selections from a previous class', () => {
        expect(areProficiencyChoicesComplete(
            [
                { classId: 'bard', choiceGroup: 2, values: ['lute'] },
                { classId: 'monk', choiceGroup: 2, values: ['alchemists-supplies'] },
            ],
            [monkTools],
        )).toBe(false);
    });

    it('does not let one overlapping skill satisfy Fighter and Rogue groups', () => {
        expect(areProficiencyChoicesComplete(
            [{ classId: 'fighter', choiceGroup: 1, values: ['skill-athletics', 'skill-perception'] }],
            [fighterSkills, rogueSkills],
        )).toBe(false);

        expect(areProficiencyChoicesComplete(
            [
                { classId: 'fighter', choiceGroup: 1, values: ['skill-athletics', 'skill-perception'] },
                { classId: 'rogue', choiceGroup: 1, values: ['skill-athletics'] },
            ],
            [fighterSkills, rogueSkills],
        )).toBe(true);
    });
});

describe('proficiencyChoicesEqual', () => {
    it('compares class-scoped selections by content', () => {
        expect(proficiencyChoicesEqual(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute'] }],
            [{ classId: 'bard', choiceGroup: 2, values: ['lute'] }],
        )).toBe(true);
        expect(proficiencyChoicesEqual(
            [{ classId: 'bard', choiceGroup: 2, values: ['lute'] }],
            [{ classId: 'bard', choiceGroup: 2, values: ['flute'] }],
        )).toBe(false);
    });
});
