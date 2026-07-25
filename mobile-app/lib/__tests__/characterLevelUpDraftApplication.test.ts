import { createCharacterSheetDraft } from '../character-sheet/characterSheetDraft';
import { applyLevelUpToDraft, buildAdvancedChoiceFeatures } from '../characterLevelUp/draftApplication';
import {
    createLevelUpInvocationState,
    createLevelUpMetamagicState,
    createLevelUpMysticArcanumState,
    SRD_INVOCATIONS,
    SRD_METAMAGIC_OPTIONS,
} from '../characterLevelUp/advancedClassChoices';
import type { LevelUpWizardSelectedClass } from '../characterLevelUp/types';

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

const WARLOCK_LEVEL_UP_CLASS: LevelUpWizardSelectedClass = {
    classId: 'warlock',
    className: 'Warlock',
    currentLevel: 2,
    newLevel: 3,
    isExistingClass: true,
    subclassId: 'fiend',
    subclassName: 'Fiend',
    subclassDescription: null,
    subclassIsCustom: false,
    subclassFeatures: [],
    customSubclass: null,
};

const SORCERER_LEVEL_UP_CLASS: LevelUpWizardSelectedClass = {
    classId: 'sorcerer',
    className: 'Sorcerer',
    currentLevel: 2,
    newLevel: 3,
    isExistingClass: true,
    subclassId: 'draconic-bloodline',
    subclassName: 'Draconic Bloodline',
    subclassDescription: null,
    subclassIsCustom: false,
    subclassFeatures: [],
    customSubclass: null,
};

describe('buildAdvancedChoiceFeatures', () => {
    it('creates SRD invocation features with the full SRD description', () => {
        const invocation = SRD_INVOCATIONS.find((entry) => entry.id === 'fiendish-vigor');

        expect(invocation).toBeDefined();

        const features = buildAdvancedChoiceFeatures(
            WARLOCK_LEVEL_UP_CLASS,
            {
                ...createLevelUpInvocationState(),
                selectedInvocations: ['fiendish-vigor'],
            },
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        );

        expect(features).toEqual([
            expect.objectContaining({
                key: 'invocation-fiendish-vigor',
                name: 'Eldritch Invocation: Fiendish Vigor',
                description: invocation?.fullDescription,
                source: 'Warlock',
                classId: 'warlock',
                level: 3,
                subclassId: 'fiend',
                subclassName: 'Fiend',
                kind: 'class',
                customSubclassFeature: null,
            }),
        ]);
        expect(features[0]?.description).not.toBe(invocation?.description);
    });

    it('creates trimmed custom invocation features and excludes whitespace-only custom names', () => {
        const customInvocationFeatures = buildAdvancedChoiceFeatures(
            WARLOCK_LEVEL_UP_CLASS,
            {
                ...createLevelUpInvocationState(),
                customInvocation: {
                    name: '  Shadow Step  ',
                    description: '  Teleport through the dark between stars.  ',
                },
            },
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        );

        expect(customInvocationFeatures).toEqual([
            expect.objectContaining({
                key: 'invocation-custom-shadow-step',
                name: 'Eldritch Invocation: Shadow Step',
                description: 'Teleport through the dark between stars.',
            }),
        ]);

        const whitespaceOnlyFeatures = buildAdvancedChoiceFeatures(
            WARLOCK_LEVEL_UP_CLASS,
            {
                ...createLevelUpInvocationState(),
                customInvocation: {
                    name: '   ',
                    description: 'Ignored description',
                },
            },
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        );

        expect(whitespaceOnlyFeatures).toEqual([]);
    });

    it('creates SRD metamagic features with the full SRD description', () => {
        const metamagic = SRD_METAMAGIC_OPTIONS.find((entry) => entry.id === 'careful-spell');

        expect(metamagic).toBeDefined();

        const features = buildAdvancedChoiceFeatures(
            SORCERER_LEVEL_UP_CLASS,
            createLevelUpInvocationState(),
            {
                ...createLevelUpMetamagicState(),
                selectedMetamagicIds: ['careful-spell'],
            },
            createLevelUpMysticArcanumState(),
        );

        expect(features).toEqual([
            expect.objectContaining({
                key: 'metamagic-careful-spell',
                name: 'Metamagic: Careful Spell',
                description: metamagic?.fullDescription,
                source: 'Sorcerer',
                classId: 'sorcerer',
                level: 3,
                subclassId: 'draconic-bloodline',
                subclassName: 'Draconic Bloodline',
                kind: 'class',
                customSubclassFeature: null,
            }),
        ]);
        expect(features[0]?.description).not.toBe(metamagic?.description);
    });

    it('creates mystic arcanum features with the expected key and description', () => {
        const features = buildAdvancedChoiceFeatures(
            {
                ...WARLOCK_LEVEL_UP_CLASS,
                currentLevel: 10,
                newLevel: 11,
            },
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            {
                selectedSpell: {
                    id: 'mass-suggestion',
                    name: 'Mass Suggestion',
                    level: 6,
                },
            },
        );

        expect(features).toEqual([
            expect.objectContaining({
                key: 'mystic-arcanum-6',
                name: 'Mystic Arcanum (6th): Mass Suggestion',
                description: 'Mass Suggestion — once per long rest without a spell slot.',
                source: 'Warlock',
                classId: 'warlock',
                level: 11,
                kind: 'class',
            }),
        ]);
    });

    it('returns no advanced choice features when all advanced states are empty', () => {
        const features = buildAdvancedChoiceFeatures(
            WARLOCK_LEVEL_UP_CLASS,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        );

        expect(features).toEqual([]);
    });
});

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
            multiclassProficiencyState: {
                selections: [],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [
                {
                    key: 'wizard-11-slot-6',
                    srdIndex: null,
                    parentSrdIndex: null,
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
            multiclassProficiencyState: {
                selections: [],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [],
        });
        const addedClass = nextDraft.classes[nextDraft.classes.length - 1];
        const addedFeature = nextDraft.features[nextDraft.features.length - 1];

        expect(nextDraft.level).toBe(13);
        expect(nextDraft.hp.max).toBe(85);
        expect(nextDraft.abilityScores.constitution).toBe(15);
        expect(nextDraft.traits.armorProficiencies).toEqual(['Light armour', 'Medium armour', 'Shields']);
        expect(nextDraft.traits.weaponProficiencies).toEqual([
            'Daggers',
            'Simple weapons',
            'Martial weapons',
        ]);
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

    it('applies configured custom multiclass proficiencies into the local draft', () => {
        const draft = createCharacterSheetDraft(BASE_CHARACTER as never);

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'custom-class-id',
                className: 'Warden',
                currentLevel: 0,
                newLevel: 1,
                isExistingClass: false,
                subclassId: null,
                subclassName: null,
                subclassDescription: null,
                subclassIsCustom: false,
                subclassFeatures: [],
                customSubclass: null,
                classDefinition: {
                    proficiencies: [
                        { grant: 'MULTICLASS', type: 'ARMOR', name: 'Medium armour', choiceGroup: null },
                        { grant: 'MULTICLASS', type: 'WEAPON', name: 'Longbows', choiceGroup: null },
                        { grant: 'MULTICLASS', type: 'TOOL', name: "Smith's tools", choiceGroup: null },
                        {
                            grant: 'MULTICLASS',
                            type: 'SKILL',
                            name: 'Athletics',
                            value: 'skill-athletics',
                            choiceGroup: 1,
                            choiceCount: 1,
                        },
                    ],
                } as never,
            },
            hitPointsState: {
                method: 'average',
                hitDieSize: 8,
                hitDieValue: 5,
                constitutionModifier: 2,
                hpGained: 7,
            },
            asiOrFeatState: null,
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            multiclassProficiencyState: {
                selections: [{ choiceGroup: 1, values: ['skill-athletics'] }],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [],
        });

        expect(nextDraft.skillProficiencies.athletics).toBe('proficient');
        expect(nextDraft.traits.armorProficiencies).toEqual(['Medium armour']);
        expect(nextDraft.traits.weaponProficiencies).toEqual(['Daggers', 'Longbows']);
        expect(nextDraft.traits.toolProficiencies).toEqual(["Smith's tools"]);
    });

    it('applies selected non-skill multiclass proficiency choices into traits', () => {
        const draft = createCharacterSheetDraft(BASE_CHARACTER as never);

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'custom-class-id',
                className: 'Skald',
                currentLevel: 0,
                newLevel: 1,
                isExistingClass: false,
                subclassId: null,
                subclassName: null,
                subclassDescription: null,
                subclassIsCustom: false,
                subclassFeatures: [],
                customSubclass: null,
                classDefinition: {
                    proficiencies: [
                        { grant: 'MULTICLASS', type: 'ARMOR', name: 'Light armour', choiceGroup: null },
                        { grant: 'MULTICLASS', type: 'TOOL', name: 'Lute', value: 'lute', choiceGroup: 2, choiceCount: 1 },
                        { grant: 'MULTICLASS', type: 'TOOL', name: 'Flute', value: 'flute', choiceGroup: 2, choiceCount: 1 },
                    ],
                } as never,
            },
            hitPointsState: {
                method: 'average',
                hitDieSize: 8,
                hitDieValue: 5,
                constitutionModifier: 2,
                hpGained: 7,
            },
            asiOrFeatState: null,
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            multiclassProficiencyState: {
                selections: [{ choiceGroup: 2, values: ['lute'] }],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [],
        });

        expect(nextDraft.traits.armorProficiencies).toEqual(['Light armour']);
        expect(nextDraft.traits.toolProficiencies).toEqual(['Lute']);
    });

    it('auto-applies a fixed custom multiclass skill grant even when no choice is selected', () => {
        const draft = createCharacterSheetDraft(BASE_CHARACTER as never);

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'custom-class-id',
                className: 'Warden',
                currentLevel: 0,
                newLevel: 1,
                isExistingClass: false,
                subclassId: null,
                subclassName: null,
                subclassDescription: null,
                subclassIsCustom: false,
                subclassFeatures: [],
                customSubclass: null,
                classDefinition: {
                    proficiencies: [
                        // Fixed grant (choiceGroup == null) — must apply automatically.
                        { grant: 'MULTICLASS', type: 'SKILL', name: 'Survival', choiceGroup: null },
                    ],
                } as never,
            },
            hitPointsState: {
                method: 'average',
                hitDieSize: 8,
                hitDieValue: 5,
                constitutionModifier: 2,
                hpGained: 7,
            },
            asiOrFeatState: null,
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            multiclassProficiencyState: {
                selections: [],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [],
        });

        expect(nextDraft.skillProficiencies.survival).toBe('proficient');
    });

    it('stores pending proficiency choice provenance for saveCharacterSheet', () => {
        const draft = createCharacterSheetDraft(BASE_CHARACTER as never);

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'bard',
                className: 'Bard',
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
                method: 'average',
                hitDieSize: 8,
                hitDieValue: 5,
                constitutionModifier: 2,
                hpGained: 7,
            },
            asiOrFeatState: null,
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            multiclassProficiencyState: {
                selections: [
                    { choiceGroup: 1, values: ['skill-stealth'] },
                    { choiceGroup: 2, values: ['lute'] },
                ],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [],
        });

        expect(nextDraft.pendingProficiencyChoices).toEqual([
            { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
        ]);
        expect(nextDraft.skillProficiencies.stealth).toBe('proficient');
        expect(nextDraft.traits.toolProficiencies).toContain('Lute');
    });

    it('preserves custom-class spell slots and profiles from the resolved definition', () => {
        const draft = createCharacterSheetDraft({
            ...BASE_CHARACTER,
            classes: [{
                id: 'class-custom',
                classId: 'custom-mage-id',
                className: 'Star Mage',
                subclassId: null,
                subclassName: null,
                level: 4,
                isStartingClass: true,
            }],
            spellSlots: [{
                __typename: 'SpellSlot',
                id: 'slot-1',
                kind: 'STANDARD',
                level: 1,
                total: 4,
                used: 1,
            }],
            spellcastingProfiles: [{
                __typename: 'SpellcastingProfile',
                classId: 'custom-mage-id',
                className: 'Star Mage',
                subclassId: null,
                subclassName: null,
                classLevel: 4,
                spellcastingAbility: 'intelligence',
                spellSaveDC: 14,
                spellAttackBonus: 6,
                slotKind: 'STANDARD',
            }],
        } as never);

        const progression = Array.from({ length: 20 }, (_, index) => ({
            level: index + 1,
            abilityScoreImprovement: false,
            spellSlots: index + 1 >= 5
                ? [4, 3, 2, 0, 0, 0, 0, 0, 0]
                : index + 1 >= 3
                    ? [4, 2, 0, 0, 0, 0, 0, 0, 0]
                    : [2, 0, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 3,
            spellsKnown: null,
            preparedSpellCount: 4,
            displayValues: [],
        }));

        const nextDraft = applyLevelUpToDraft(draft, {
            selectedClass: {
                classId: 'custom-mage-id',
                className: 'Star Mage',
                currentLevel: 4,
                newLevel: 5,
                isExistingClass: true,
                subclassId: null,
                subclassName: null,
                subclassDescription: null,
                subclassIsCustom: false,
                subclassFeatures: [],
                customSubclass: null,
                classDefinition: {
                    spellcastingMode: 'STANDARD',
                    spellcastingAbility: 'int',
                    addSpellcastingAbility: true,
                    progression,
                } as never,
            },
            hitPointsState: {
                method: 'average',
                hitDieSize: 6,
                hitDieValue: 4,
                constitutionModifier: 2,
                hpGained: 6,
            },
            asiOrFeatState: null,
            spellcastingState: {
                learnedSpells: [],
                cantripSpells: [],
                swapOutSpellId: null,
                swapReplacementSpell: null,
            },
            multiclassProficiencyState: {
                selections: [],
            },
            invocationState: createLevelUpInvocationState(),
            metamagicState: createLevelUpMetamagicState(),
            mysticArcanumState: createLevelUpMysticArcanumState(),
            features: [],
        });

        expect(nextDraft.spellSlots).toEqual(expect.arrayContaining([
            expect.objectContaining({ kind: 'STANDARD', level: 1, total: 4, used: 1 }),
            expect.objectContaining({ kind: 'STANDARD', level: 2, total: 3, used: 0 }),
            expect.objectContaining({ kind: 'STANDARD', level: 3, total: 2, used: 0 }),
        ]));
        expect(nextDraft.spellcastingProfiles).toEqual([
            expect.objectContaining({
                classId: 'custom-mage-id',
                className: 'Star Mage',
                classLevel: 5,
                spellcastingAbility: 'intelligence',
                slotKind: 'STANDARD',
            }),
        ]);
    });
});
