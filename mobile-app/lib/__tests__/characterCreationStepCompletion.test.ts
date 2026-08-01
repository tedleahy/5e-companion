import { createDefaultDraft, type CharacterDraft } from '@/store/characterDraft';
import { CREATE_CHARACTER_ROUTES } from '@/lib/characterCreation/routes';
import { isCreateCharacterStepComplete } from '@/lib/characterCreation/stepCompletion';
import type { ClassProficiencyChoiceGroup } from '@/lib/characterCreation/classRules';

/**
 * Builds a minimal character draft for step-completion tests.
 */
function createDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
    return {
        ...createDefaultDraft(),
        ...overrides,
    };
}

describe('characterCreationStepCompletion', () => {
    it('requires a valid class allocation on the class route', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 3,
                classes: [{ classId: 'wizard', subclassId: '', level: 2 }],
                startingClassId: 'wizard',
            }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 3,
                classes: [
                    { classId: 'wizard', subclassId: 'evocation', level: 2 },
                    { classId: 'fighter', subclassId: '', level: 1 },
                ],
                startingClassId: 'wizard',
            }),
        )).toBe(true);
    });

    it('blocks subclasses that have not reached their own selection level yet', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.class,
            createDraft({
                level: 1,
                classes: [{ classId: 'wizard', subclassId: 'evocation', level: 1 }],
                startingClassId: 'wizard',
            }),
            { wizard: [{ value: 'evocation', label: 'Evocation', icon: '🔥', selectionLevel: 2 }] },
        )).toBe(false);
    });

    it('blocks the skills route while requirements are still loading', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({ level: 1 }),
            undefined,
            [],
            true,
            [{
                classId: 'fighter',
                choiceGroup: 1,
                pick: 2,
                type: 'SKILL',
                options: [
                    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
                    { value: 'skill-perception', name: 'Perception', type: 'SKILL' },
                ],
            }],
        )).toBe(false);
    });

    it('blocks the skills route when requirements failed to load', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({ level: 1 }),
            undefined,
            [],
            false,
            [],
            true,
        )).toBe(false);
    });

    it('blocks Continue when a partial class-definition batch surfaces as a requirements error', () => {
        // Fighter groups alone would look complete; missing Rogue must still block.
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({
                level: 2,
                classes: [
                    { classId: 'fighter', subclassId: '', level: 1 },
                    { classId: 'rogue', subclassId: '', level: 1 },
                ],
                startingClassId: 'fighter',
                proficiencyChoices: [{
                    classId: 'fighter',
                    choiceGroup: 1,
                    values: ['skill-athletics', 'skill-perception'],
                }],
            }),
            undefined,
            [],
            false,
            [{
                classId: 'fighter',
                choiceGroup: 1,
                pick: 2,
                type: 'SKILL',
                options: [
                    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
                    { value: 'skill-perception', name: 'Perception', type: 'SKILL' },
                ],
            }],
            true,
        )).toBe(false);
    });

    it('requires class-scoped skill groups with canonical proficiency values', () => {
        const proficiencyChoiceGroups: ClassProficiencyChoiceGroup[] = [{
            classId: 'fighter',
            choiceGroup: 1,
            pick: 2,
            type: 'SKILL',
            options: [
                { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
                { value: 'skill-perception', name: 'Perception', type: 'SKILL' },
                { value: 'skill-survival', name: 'Survival', type: 'SKILL' },
            ],
        }];

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({
                level: 1,
                proficiencyChoices: [{ classId: 'fighter', choiceGroup: 1, values: ['skill-athletics'] }],
            }),
            undefined,
            [],
            false,
            proficiencyChoiceGroups,
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({
                level: 1,
                background: 'Soldier',
                proficiencyChoices: [{
                    classId: 'fighter',
                    choiceGroup: 1,
                    values: ['skill-perception', 'skill-survival'],
                }],
            }),
            undefined,
            [],
            false,
            proficiencyChoiceGroups,
        )).toBe(true);
    });

    it('requires independent Fighter and Rogue skill groups when options overlap', () => {
        const proficiencyChoiceGroups: ClassProficiencyChoiceGroup[] = [
            {
                classId: 'fighter',
                choiceGroup: 1,
                pick: 2,
                type: 'SKILL',
                options: [
                    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
                    { value: 'skill-perception', name: 'Perception', type: 'SKILL' },
                    { value: 'skill-survival', name: 'Survival', type: 'SKILL' },
                ],
            },
            {
                classId: 'rogue',
                choiceGroup: 1,
                pick: 1,
                type: 'SKILL',
                options: [
                    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL' },
                    { value: 'skill-stealth', name: 'Stealth', type: 'SKILL' },
                ],
            },
        ];

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({
                level: 2,
                proficiencyChoices: [{
                    classId: 'fighter',
                    choiceGroup: 1,
                    values: ['skill-athletics', 'skill-perception'],
                }],
            }),
            undefined,
            [],
            false,
            proficiencyChoiceGroups,
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({
                level: 2,
                proficiencyChoices: [
                    {
                        classId: 'fighter',
                        choiceGroup: 1,
                        values: ['skill-athletics', 'skill-perception'],
                    },
                    {
                        classId: 'rogue',
                        choiceGroup: 1,
                        values: ['skill-athletics'],
                    },
                ],
            }),
            undefined,
            [],
            false,
            proficiencyChoiceGroups,
        )).toBe(true);
    });

    it('completes the skills route with no configured choice groups', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.skills,
            createDraft({ level: 1 }),
        )).toBe(true);
    });

    it('requires a background on the background route', () => {
        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.background,
            createDraft({ level: 2 }),
        )).toBe(false);

        expect(isCreateCharacterStepComplete(
            CREATE_CHARACTER_ROUTES.background,
            createDraft({ background: 'Acolyte', level: 2 }),
        )).toBe(true);
    });
});
