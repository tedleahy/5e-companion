import { createCharacterSheetDraft } from '../character-sheet/characterSheetDraft';
import { applyLevelUpToDraft } from '../characterLevelUp/draftApplication';

const BASE_CHARACTER = {
    id: 'char-1',
    name: 'Vaelindra',
    race: 'High Elf',
    level: 12,
    alignment: 'Chaotic Good',
    background: 'Sage',
    proficiencyBonus: 4,
    inspiration: false,
    ac: 17,
    speed: 35,
    initiative: 3,
    classes: [
        {
            id: 'class-1',
            classId: 'wizard',
            className: 'Wizard',
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            level: 10,
            isStartingClass: true,
        },
        {
            id: 'class-2',
            classId: 'warlock',
            className: 'Warlock',
            subclassId: 'fiend',
            subclassName: 'Fiend',
            level: 2,
            isStartingClass: false,
        },
    ],
    spellcastingProfiles: [],
    conditions: [],
    features: [
        {
            id: 'feature-1',
            name: 'Arcane Recovery',
            source: 'Wizard 1',
            description: 'Recover spell slots on a long rest.',
            usesMax: 1,
            usesRemaining: 1,
            recharge: 'long',
        },
    ],
    weapons: [],
    inventory: [],
    spellSlots: [],
    spellbook: [],
    stats: {
        id: 'stats-1',
        abilityScores: {
            strength: 8,
            dexterity: 16,
            constitution: 14,
            intelligence: 19,
            wisdom: 13,
            charisma: 11,
        },
        hp: {
            current: 54,
            max: 76,
            temp: 2,
        },
        deathSaves: {
            successes: 0,
            failures: 0,
        },
        hitDicePools: [],
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        skillProficiencies: {
            acrobatics: 'none',
            animalHandling: 'none',
            arcana: 'expert',
            athletics: 'none',
            deception: 'none',
            history: 'expert',
            insight: 'proficient',
            intimidation: 'none',
            investigation: 'expert',
            medicine: 'none',
            nature: 'proficient',
            perception: 'proficient',
            performance: 'none',
            persuasion: 'none',
            religion: 'proficient',
            sleightOfHand: 'none',
            stealth: 'proficient',
            survival: 'none',
        },
        traits: {
            personality: '',
            ideals: '',
            bonds: '',
            flaws: '',
            armorProficiencies: [],
            weaponProficiencies: ['Daggers'],
            toolProficiencies: [],
            languages: ['Common', 'Elvish'],
        },
        currency: {
            cp: 0,
            sp: 0,
            ep: 0,
            gp: 0,
            pp: 0,
        },
    },
} as const;

describe('applyLevelUpToDraft', () => {
    it('applies same-class HP and ASI gains into the local draft', () => {
        const draft = createCharacterSheetDraft(BASE_CHARACTER as never);

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'wizard',
                className: 'Wizard',
                currentLevel: 10,
                newLevel: 11,
                isExistingClass: true,
                subclassId: 'school-of-evocation',
                subclassName: 'School of Evocation',
                subclassDescription: null,
                subclassIsCustom: false,
                subclassFeatures: [],
                customSubclass: null,
            },
            hitPointsState: {
                method: 'average',
                hitDieSize: 6,
                hitDieValue: 4,
                constitutionModifier: 2,
                hpGained: 6,
            },
            asiOrFeatState: {
                mode: 'asi',
                allocations: {
                    strength: 0,
                    dexterity: 0,
                    constitution: 0,
                    intelligence: 1,
                    wisdom: 1,
                    charisma: 0,
                },
                feat: {
                    name: '',
                    description: '',
                    abilityIncrease: null,
                },
            },
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            features: [
                {
                    key: 'wizard-11-slot-6',
                    name: '6th Level Spell Slot',
                    description: 'You gain access to 6th-level spell slots for Wizard.',
                    source: 'Wizard 11',
                    classId: 'wizard',
                    level: 11,
                    subclassId: null,
                    subclassName: null,
                    kind: 'spell_slot',
                    customSubclassFeature: null,
                },
            ],
        });

        expect(nextDraft.level).toBe(13);
        expect(nextDraft.hp).toEqual({
            current: 60,
            max: 82,
            temp: 2,
        });
        expect(nextDraft.abilityScores.intelligence).toBe(20);
        expect(nextDraft.abilityScores.wisdom).toBe(14);
        expect(nextDraft.classes).toEqual([
            {
                id: 'class-1',
                classId: 'wizard',
                className: 'Wizard',
                subclassId: 'school-of-evocation',
                subclassName: 'School of Evocation',
                customSubclass: null,
                level: 11,
                isStartingClass: true,
            },
            {
                id: 'class-2',
                classId: 'warlock',
                className: 'Warlock',
                subclassId: 'fiend',
                subclassName: 'Fiend',
                customSubclass: null,
                level: 2,
                isStartingClass: false,
            },
        ]);
    });

    it('adds a new feat row and multiclass class row when levelling into a new class', () => {
        const draft = createCharacterSheetDraft(BASE_CHARACTER as never);

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'fighter',
                className: 'Fighter',
                currentLevel: 0,
                newLevel: 1,
                isExistingClass: false,
                subclassId: null,
                subclassName: null,
                subclassDescription: null,
                subclassIsCustom: false,
                subclassFeatures: [],
                customSubclass: null,
            },
            hitPointsState: {
                method: 'roll',
                hitDieSize: 10,
                hitDieValue: 7,
                constitutionModifier: 2,
                hpGained: 9,
            },
            asiOrFeatState: {
                mode: 'feat',
                allocations: {
                    strength: 0,
                    dexterity: 0,
                    constitution: 0,
                    intelligence: 0,
                    wisdom: 0,
                    charisma: 0,
                },
                feat: {
                    name: 'Resilient',
                    description: 'Gain proficiency in Constitution saving throws.',
                    abilityIncrease: 'constitution',
                },
            },
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            features: [],
        });
        const addedClass = nextDraft.classes[nextDraft.classes.length - 1];
        const addedFeature = nextDraft.features[nextDraft.features.length - 1];

        expect(nextDraft.level).toBe(13);
        expect(nextDraft.hp.max).toBe(85);
        expect(nextDraft.abilityScores.constitution).toBe(15);
        expect(addedClass).toMatchObject({
            classId: 'fighter',
            className: 'Fighter',
            level: 1,
            isStartingClass: false,
        });
        expect(addedClass?.id).toMatch(/^draft-class-/);
        expect(addedFeature).toMatchObject({
            name: 'Resilient',
            source: 'Feat',
            recharge: null,
            usesMax: null,
            usesRemaining: null,
            customSubclassFeature: null,
        });
        expect(addedFeature?.description).toContain('Gain proficiency in Constitution saving throws.');
        expect(addedFeature?.description).toContain('Constitution +1');
    });
});
