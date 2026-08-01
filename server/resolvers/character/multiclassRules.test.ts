import { describe, expect, test } from 'bun:test';
import {
    applyNewlyAddedMulticlassProficiencyGrants,
    deriveBackgroundSkillKeys,
    deriveCreationProficiencyChoiceRequirements,
    deriveCreationSkillRequirements,
    skillKeysFromValidatedChoices,
    deriveHitDicePools,
    deriveNamedClassProficiencies,
    deriveNewlyAddedMulticlassProficiencyChoiceRequirements,
    deriveProficiencyBonus,
    deriveSavingThrowProficiencies,
    deriveSpellSlots,
    deriveSpellcastingProfiles,
    deriveStartingHp,
    deriveStartingProficiencyChoiceRequirements,
    deriveStartingSkillRequirements,
    deriveTotalLevel,
    findNewlyAddedClassRows,
    namedProficienciesFromChoices,
    PROFICIENCY_TYPE,
    recoverHitDicePools,
    validateClassAllocations,
    validateCreationProficiencyChoices,
    validateStartingProficiencyChoices,
    validateStartingSkillProficiencies,
    type CharacterClassReference,
    type ResolvedCharacterClass,
} from './multiclassRules';

const wizardClass: CharacterClassReference = {
    id: 'class-wizard-id',
    srdIndex: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    spellcastingAbility: 'int',
    proficiencies: [
        { srdIndex: 'saving-throw-int', name: 'INT', type: PROFICIENCY_TYPE.SAVING_THROW },
        { srdIndex: 'saving-throw-wis', name: 'WIS', type: PROFICIENCY_TYPE.SAVING_THROW },
    ],
};

const fighterClass: CharacterClassReference = {
    id: 'class-fighter-id',
    srdIndex: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    spellcastingAbility: null,
    proficiencies: [
        { srdIndex: 'light-armor', name: 'Light armour', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'medium-armor', name: 'Medium armour', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'shields', name: 'Shields', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'simple-weapons', name: 'Simple weapons', type: PROFICIENCY_TYPE.WEAPON },
        { srdIndex: 'martial-weapons', name: 'Martial weapons', type: PROFICIENCY_TYPE.WEAPON },
        { srdIndex: 'saving-throw-str', name: 'STR', type: PROFICIENCY_TYPE.SAVING_THROW },
        { srdIndex: 'saving-throw-con', name: 'CON', type: PROFICIENCY_TYPE.SAVING_THROW },
    ],
};

const paladinClass: CharacterClassReference = {
    id: 'class-paladin-id',
    srdIndex: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    spellcastingAbility: 'cha',
    proficiencies: [
        { srdIndex: 'light-armor', name: 'Light armour', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'medium-armor', name: 'Medium armour', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'heavy-armor', name: 'Heavy armour', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'shields', name: 'Shields', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'simple-weapons', name: 'Simple weapons', type: PROFICIENCY_TYPE.WEAPON },
        { srdIndex: 'martial-weapons', name: 'Martial weapons', type: PROFICIENCY_TYPE.WEAPON },
        { srdIndex: 'saving-throw-wis', name: 'WIS', type: PROFICIENCY_TYPE.SAVING_THROW },
        { srdIndex: 'saving-throw-cha', name: 'CHA', type: PROFICIENCY_TYPE.SAVING_THROW },
    ],
};

const warlockClass: CharacterClassReference = {
    id: 'class-warlock-id',
    srdIndex: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    spellcastingAbility: 'cha',
    proficiencies: [
        { srdIndex: 'light-armor', name: 'Light armour', type: PROFICIENCY_TYPE.ARMOR },
        { srdIndex: 'simple-weapons', name: 'Simple weapons', type: PROFICIENCY_TYPE.WEAPON },
        { srdIndex: 'saving-throw-wis', name: 'WIS', type: PROFICIENCY_TYPE.SAVING_THROW },
        { srdIndex: 'saving-throw-cha', name: 'CHA', type: PROFICIENCY_TYPE.SAVING_THROW },
    ],
};

describe('multiclassRules', () => {
    test('validates subclass unlock levels against the class row level', () => {
        const classRefs = new Map([
            ['wizard', wizardClass],
        ]);
        const subclassRefs = new Map([
            ['evocation', { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id', selectionLevel: 2 }],
        ]);

        expect(() => validateClassAllocations(
            [{ classId: 'wizard', subclassId: 'evocation', level: 1 }],
            classRefs,
            subclassRefs,
            'wizard',
        )).toThrow('requires wizard level 2');
    });

    test('permits a class above subclass selection levels to remain without a subclass', () => {
        const classRefs = new Map([
            ['wizard', wizardClass],
        ]);

        expect(() => validateClassAllocations(
            [{ classId: 'wizard', level: 2 }],
            classRefs,
            new Map(),
            'wizard',
        )).not.toThrow();
    });

    test('validates inline custom selection levels and prevents early selection', () => {
        const classRefs = new Map([['wizard', wizardClass]]);

        expect(() => validateClassAllocations(
            [{
                classId: 'wizard',
                level: 2,
                customSubclass: { name: 'Chronurgy', description: 'Time magic.', selectionLevel: 3 },
            }],
            classRefs,
            new Map(),
            'wizard',
        )).toThrow('requires wizard level 3');

        expect(() => validateClassAllocations(
            [{
                classId: 'wizard',
                level: 2,
                customSubclass: { name: 'Chronurgy', description: 'Time magic.', selectionLevel: 21 },
            }],
            classRefs,
            new Map(),
            'wizard',
        )).toThrow('must be an integer from 1 to 20');
    });

    test('grandfathers an unchanged assignment after its custom selection level is raised', () => {
        const classRefs = new Map([['wizard', wizardClass]]);
        const subclassRefs = new Map([
            ['custom-subclass-id', {
                id: 'custom-subclass-id',
                srdIndex: null,
                name: 'School of Glass',
                classId: 'class-wizard-id',
                selectionLevel: 10,
            }],
        ]);
        const allocation = [{ classId: 'wizard', subclassId: 'custom-subclass-id', level: 5 }];

        expect(() => validateClassAllocations(
            allocation,
            classRefs,
            subclassRefs,
            'wizard',
        )).toThrow('requires wizard level 10');

        expect(() => validateClassAllocations(
            allocation,
            classRefs,
            subclassRefs,
            'wizard',
            { allowedUnderLevelSubclassIds: new Set(['custom-subclass-id']) },
        )).not.toThrow();
    });

    test('derives total level and proficiency bonus from ordered class rows', () => {
        expect(deriveTotalLevel([
            { classId: 'fighter', level: 5 },
            { classId: 'wizard', level: 4 },
        ])).toBe(9);
        expect(deriveProficiencyBonus(9)).toBe(4);
    });

    test('derives starting HP using the starting class hit die and average progression', () => {
        const classes = [
            { classRow: { classId: 'fighter', level: 2 }, classRef: fighterClass, subclassRef: null },
            { classRow: { classId: 'wizard', level: 3 }, classRef: wizardClass, subclassRef: null },
        ];

        expect(deriveStartingHp(classes, 1, {
            strength: 10,
            dexterity: 12,
            constitution: 14,
            intelligence: 16,
            wisdom: 10,
            charisma: 8,
        })).toBe(36);
    });

    test('derives saving throws and class hit-dice pools', () => {
        const classes = [
            { classRow: { classId: 'fighter', level: 2 }, classRef: fighterClass, subclassRef: null },
            { classRow: { classId: 'wizard', level: 3 }, classRef: wizardClass, subclassRef: null },
        ];

        expect(deriveSavingThrowProficiencies(fighterClass)).toEqual(['strength', 'constitution']);
        expect(deriveHitDicePools(classes)).toEqual([
            { classId: 'fighter', total: 2, remaining: 2, die: 'd10' },
            { classId: 'wizard', total: 3, remaining: 3, die: 'd6' },
        ]);
    });

    test('uses the single-class slot table for pure half casters', () => {
        const classes = [
            { classRow: { classId: 'paladin', level: 3 }, classRef: paladinClass, subclassRef: null },
        ];

        expect(deriveSpellSlots(classes)).toEqual([
            { kind: 'STANDARD', level: 1, total: 3, used: 0 },
        ]);
    });

    test('uses the single-class slot table for pure third casters', () => {
        const classes = [
            {
                classRow: { classId: 'fighter', subclassId: 'eldritch-knight', level: 4 },
                classRef: fighterClass,
                subclassRef: {
                    id: 'subclass-eldritch-knight-id',
                    srdIndex: 'eldritch-knight',
                    name: 'Eldritch Knight',
                    classId: 'class-fighter-id',
                    selectionLevel: 3,
                },
            },
        ];

        expect(deriveSpellSlots(classes)).toEqual([
            { kind: 'STANDARD', level: 1, total: 3, used: 0 },
        ]);
    });

    test('derives multiclass spell slots and separate warlock pact slots', () => {
        const classes = [
            { classRow: { classId: 'wizard', level: 3 }, classRef: wizardClass, subclassRef: null },
            { classRow: { classId: 'warlock', subclassId: 'fiend', level: 2 }, classRef: warlockClass, subclassRef: { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id', selectionLevel: 1 } },
        ];

        expect(deriveSpellSlots(classes)).toEqual([
            { kind: 'STANDARD', level: 1, total: 4, used: 0 },
            { kind: 'STANDARD', level: 2, total: 2, used: 0 },
            { kind: 'PACT_MAGIC', level: 1, total: 2, used: 0 },
        ]);
    });

    test('derives spellcasting profiles per casting class', () => {
        const classes = [
            { classRow: { classId: 'wizard', subclassId: 'evocation', level: 3 }, classRef: wizardClass, subclassRef: { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id', selectionLevel: 2 } },
            { classRow: { classId: 'warlock', subclassId: 'fiend', level: 2 }, classRef: warlockClass, subclassRef: { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id', selectionLevel: 1 } },
        ];

        expect(deriveSpellcastingProfiles(classes, {
            strength: 8,
            dexterity: 14,
            constitution: 14,
            intelligence: 18,
            wisdom: 10,
            charisma: 16,
        }, 3)).toEqual([
            {
                classId: 'wizard',
                className: 'Wizard',
                subclassId: 'evocation',
                subclassName: 'Evocation',
                classLevel: 3,
                spellcastingAbility: 'intelligence',
                spellSaveDC: 15,
                spellAttackBonus: 7,
                slotKind: 'STANDARD',
            },
            {
                classId: 'warlock',
                className: 'Warlock',
                subclassId: 'fiend',
                subclassName: 'Fiend',
                classLevel: 2,
                spellcastingAbility: 'charisma',
                spellSaveDC: 14,
                spellAttackBonus: 6,
                slotKind: 'PACT_MAGIC',
            },
        ]);
    });

    test('delays spellcasting profiles until the class gains spellcasting', () => {
        const classes = [
            { classRow: { classId: 'paladin', level: 1 }, classRef: paladinClass, subclassRef: null },
        ];

        expect(deriveSpellcastingProfiles(classes, {
            strength: 16,
            dexterity: 10,
            constitution: 14,
            intelligence: 8,
            wisdom: 12,
            charisma: 16,
        }, 2)).toEqual([]);
    });

    test('derives named multiclass proficiencies and long-rest hit-dice recovery', () => {
        const classes = [
            { classRow: { classId: 'fighter', level: 2 }, classRef: fighterClass, subclassRef: null },
            { classRow: { classId: 'warlock', level: 3 }, classRef: warlockClass, subclassRef: null },
        ];

        expect(deriveNamedClassProficiencies(classes, 0)).toEqual({
            armor: ['Light armour', 'Medium armour', 'Shields'],
            weapons: ['Martial weapons', 'Simple weapons'],
            tools: ['None'],
        });

        expect(recoverHitDicePools([
            { id: 'pool-1', classId: 'class-fighter-id', total: 2, remaining: 0 },
            { id: 'pool-2', classId: 'class-warlock-id', total: 3, remaining: 1 },
        ], ['class-fighter-id', 'class-warlock-id'], 2)).toEqual([
            { id: 'pool-1', classId: 'class-fighter-id', remaining: 2 },
            { id: 'pool-2', classId: 'class-warlock-id', remaining: 1 },
        ]);
    });
});

describe('starting skill proficiency derivation and validation', () => {
    const fighterWithFixedAndChoiceSkills: CharacterClassReference = {
        ...fighterClass,
        proficiencyRules: [
            {
                grant: 'STARTING',
                choiceGroup: null,
                choiceCount: null,
                proficiencyRef: { srdIndex: 'skill-athletics', name: 'Athletics', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'skill-intimidation', name: 'Intimidation', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'skill-perception', name: 'Perception', type: PROFICIENCY_TYPE.SKILL },
            },
            // A MULTICLASS row for the same skill must not leak into the STARTING requirements.
            {
                grant: 'MULTICLASS',
                choiceGroup: null,
                choiceCount: null,
                proficiencyRef: { srdIndex: 'skill-survival', name: 'Survival', type: PROFICIENCY_TYPE.SKILL },
            },
        ],
    };

    test('separates fixed starting skill grants from choice groups', () => {
        expect(deriveStartingSkillRequirements(fighterWithFixedAndChoiceSkills)).toEqual({
            automaticSkillKeys: ['athletics'],
            choiceGroups: [
                { choiceGroup: 1, pick: 1, optionKeys: ['intimidation', 'perception'] },
            ],
        });
    });

    test('extracts background skill grants by srdIndex', () => {
        expect(deriveBackgroundSkillKeys({
            proficiencies: [
                { srdIndex: 'skill-deception', type: PROFICIENCY_TYPE.SKILL },
                { srdIndex: 'saving-throw-int', type: PROFICIENCY_TYPE.SAVING_THROW },
                { srdIndex: null, type: PROFICIENCY_TYPE.SKILL },
            ],
        })).toEqual(['deception']);
    });

    test('accepts a submission that fills the choice group and omits fixed grants', () => {
        const requirements = deriveStartingSkillRequirements(fighterWithFixedAndChoiceSkills);

        expect(() => validateStartingSkillProficiencies(requirements, ['deception'], {
            perception: 'proficient',
        })).not.toThrow();
    });

    test('rejects a choice group filled with the wrong number of picks', () => {
        const requirements = deriveStartingSkillRequirements(fighterWithFixedAndChoiceSkills);

        expect(() => validateStartingSkillProficiencies(requirements, [], {
            perception: 'proficient',
            intimidation: 'proficient',
        })).toThrow('Choose exactly 1 skill proficiency');
    });

    test('rejects a submitted skill outside the fixed grants, background, and choice options', () => {
        const requirements = deriveStartingSkillRequirements(fighterWithFixedAndChoiceSkills);

        expect(() => validateStartingSkillProficiencies(requirements, [], {
            perception: 'proficient',
            arcana: 'proficient',
        })).toThrow('Skill proficiency "arcana" is not granted');
    });

    test('ignores submitted skills explicitly set to "none"', () => {
        const requirements = deriveStartingSkillRequirements(fighterWithFixedAndChoiceSkills);

        expect(() => validateStartingSkillProficiencies(requirements, [], {
            perception: 'proficient',
            arcana: 'none',
        })).not.toThrow();
    });

    test('does not count fixed or background skills toward choice quotas', () => {
        const requirements = deriveStartingSkillRequirements(fighterWithFixedAndChoiceSkills);

        expect(() => validateStartingSkillProficiencies(requirements, ['intimidation'], {
            athletics: 'proficient',
            intimidation: 'proficient',
        })).toThrow('Choose exactly 1 skill proficiency');

        expect(() => validateStartingSkillProficiencies(requirements, ['intimidation'], {
            athletics: 'proficient',
            intimidation: 'proficient',
            perception: 'proficient',
        })).not.toThrow();
    });
});

describe('starting non-skill proficiency choice derivation and validation', () => {
    const bardWithInstrumentChoices: CharacterClassReference = {
        id: 'class-bard-id',
        srdIndex: 'bard',
        name: 'Bard',
        hitDie: 8,
        spellcastingAbility: 'cha',
        proficiencyRules: [
            {
                grant: 'STARTING',
                choiceGroup: null,
                choiceCount: null,
                proficiencyRef: { srdIndex: 'light-armor', name: 'Light Armor', type: PROFICIENCY_TYPE.ARMOR },
            },
            {
                grant: 'STARTING',
                choiceGroup: 2,
                choiceCount: 3,
                proficiencyRef: { srdIndex: 'lute', name: 'Lute', type: PROFICIENCY_TYPE.TOOL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 2,
                choiceCount: 3,
                proficiencyRef: { srdIndex: 'flute', name: 'Flute', type: PROFICIENCY_TYPE.TOOL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 2,
                choiceCount: 3,
                proficiencyRef: { srdIndex: 'drum', name: 'Drum', type: PROFICIENCY_TYPE.TOOL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 2,
                choiceCount: 3,
                proficiencyRef: { srdIndex: 'lyre', name: 'Lyre', type: PROFICIENCY_TYPE.TOOL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 1,
                choiceCount: 3,
                proficiencyRef: { srdIndex: 'skill-arcana', name: 'Arcana', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'bagpipes', name: 'Bagpipes', type: PROFICIENCY_TYPE.TOOL },
            },
        ],
    };

    test('derives only non-skill STARTING choice groups', () => {
        expect(deriveStartingProficiencyChoiceRequirements(bardWithInstrumentChoices)).toEqual([
            {
                choiceGroup: 2,
                pick: 3,
                options: [
                    { value: 'lute', name: 'Lute', type: PROFICIENCY_TYPE.TOOL },
                    { value: 'flute', name: 'Flute', type: PROFICIENCY_TYPE.TOOL },
                    { value: 'drum', name: 'Drum', type: PROFICIENCY_TYPE.TOOL },
                    { value: 'lyre', name: 'Lyre', type: PROFICIENCY_TYPE.TOOL },
                ],
            },
        ]);
    });

    test('includes OTHER fixed grants in tool trait lists', () => {
        const rogueClass: CharacterClassReference = {
            id: 'class-rogue-id',
            srdIndex: 'rogue',
            name: 'Rogue',
            hitDie: 8,
            spellcastingAbility: null,
            proficiencyRules: [
                {
                    grant: 'STARTING',
                    choiceGroup: null,
                    choiceCount: null,
                    proficiencyRef: { srdIndex: 'thieves-tools', name: "Thieves' Tools", type: PROFICIENCY_TYPE.OTHER },
                },
            ],
        };

        expect(deriveNamedClassProficiencies([
            { classRow: { classId: 'rogue', level: 1 }, classRef: rogueClass, subclassRef: null },
        ], 0)).toEqual({
            armor: ['None'],
            weapons: ['None'],
            tools: ["Thieves' Tools"],
        });
    });

    test('accepts exact picks and maps them to trait labels', () => {
        const groups = deriveStartingProficiencyChoiceRequirements(bardWithInstrumentChoices);
        const submitted = [{ choiceGroup: 2, values: ['lute', 'flute', 'drum'] }];

        expect(() => validateStartingProficiencyChoices(groups, submitted, 'bard')).not.toThrow();
        expect(namedProficienciesFromChoices(groups, submitted, 'bard')).toEqual({
            armor: ['None'],
            weapons: ['None'],
            tools: ['Drum', 'Flute', 'Lute'],
        });
    });

    test('rejects under-filled or invalid non-skill choice submissions', () => {
        const groups = deriveStartingProficiencyChoiceRequirements(bardWithInstrumentChoices);

        expect(() => validateStartingProficiencyChoices(groups, [{ choiceGroup: 2, values: ['lute'] }], 'bard'))
            .toThrow('Choose exactly 3 proficiencies');
        expect(() => validateStartingProficiencyChoices(groups, [{ choiceGroup: 2, values: ['lute', 'flute', 'bagpipes'] }], 'bard'))
            .toThrow('is not an option');
        expect(() => validateStartingProficiencyChoices(groups, [
            { choiceGroup: 2, values: ['lute', 'flute', 'drum'] },
            { choiceGroup: 9, values: ['lyre'] },
        ], 'bard')).toThrow('Unexpected proficiency choice group');
    });

    test('uses custom proficiency database ids when srdIndex is null', () => {
        const customClass: CharacterClassReference = {
            id: 'class-custom-id',
            srdIndex: null,
            name: 'Custom Bard',
            hitDie: 8,
            spellcastingAbility: null,
            proficiencyRules: [
                {
                    grant: 'STARTING',
                    choiceGroup: 1,
                    choiceCount: 1,
                    proficiencyRef: {
                        id: 'prof-custom-lute-id',
                        srdIndex: null,
                        name: 'Custom Lute',
                        type: PROFICIENCY_TYPE.TOOL,
                    },
                },
                {
                    grant: 'STARTING',
                    choiceGroup: 1,
                    choiceCount: 1,
                    proficiencyRef: {
                        id: 'prof-custom-flute-id',
                        srdIndex: null,
                        name: 'Custom Flute',
                        type: PROFICIENCY_TYPE.TOOL,
                    },
                },
            ],
        };

        const groups = deriveStartingProficiencyChoiceRequirements(customClass, 'class-custom-id');
        expect(groups).toEqual([{
            choiceGroup: 1,
            pick: 1,
            options: [
                { value: 'prof-custom-lute-id', name: 'Custom Lute', type: PROFICIENCY_TYPE.TOOL },
                { value: 'prof-custom-flute-id', name: 'Custom Flute', type: PROFICIENCY_TYPE.TOOL },
            ],
        }]);

        expect(() => validateStartingProficiencyChoices(
            groups,
            [{ classId: 'class-custom-id', choiceGroup: 1, values: ['prof-custom-lute-id'] }],
            'class-custom-id',
        )).not.toThrow();
        expect(() => validateStartingProficiencyChoices(
            groups,
            [{ classId: 'class-custom-id', choiceGroup: 1, values: ['Custom Lute'] }],
            'class-custom-id',
        )).toThrow('is not an option');
    });
});

describe('creation multiclass skill and proficiency choice derivation', () => {
    const fighterStarting: CharacterClassReference = {
        id: 'class-fighter-id',
        srdIndex: 'fighter',
        name: 'Fighter',
        hitDie: 10,
        spellcastingAbility: null,
        proficiencyRules: [
            {
                grant: 'STARTING',
                choiceGroup: 1,
                choiceCount: 2,
                proficiencyRef: { srdIndex: 'skill-athletics', name: 'Athletics', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 1,
                choiceCount: 2,
                proficiencyRef: { srdIndex: 'skill-perception', name: 'Perception', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'STARTING',
                choiceGroup: 1,
                choiceCount: 2,
                proficiencyRef: { srdIndex: 'skill-survival', name: 'Survival', type: PROFICIENCY_TYPE.SKILL },
            },
        ],
    };

    const bardSecondary: CharacterClassReference = {
        id: 'class-bard-id',
        srdIndex: 'bard',
        name: 'Bard',
        hitDie: 8,
        spellcastingAbility: 'cha',
        proficiencyRules: [
            {
                grant: 'MULTICLASS',
                choiceGroup: null,
                choiceCount: null,
                proficiencyRef: { srdIndex: 'light-armor', name: 'Light Armor', type: PROFICIENCY_TYPE.ARMOR },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'skill-performance', name: 'Performance', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'skill-persuasion', name: 'Persuasion', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 2,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'lute', name: 'Lute', type: PROFICIENCY_TYPE.TOOL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 2,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'flute', name: 'Flute', type: PROFICIENCY_TYPE.TOOL },
            },
            // STARTING rows must not leak into secondary-class requirements.
            {
                grant: 'STARTING',
                choiceGroup: 2,
                choiceCount: 3,
                proficiencyRef: { srdIndex: 'drum', name: 'Drum', type: PROFICIENCY_TYPE.TOOL },
            },
        ],
    };

    const classes: ResolvedCharacterClass[] = [
        { classRow: { classId: 'fighter', level: 1 }, classRef: fighterStarting, subclassRef: null },
        { classRow: { classId: 'bard', level: 1 }, classRef: bardSecondary, subclassRef: null },
    ];

    test('derives starting skill groups plus secondary MULTICLASS skill groups', () => {
        expect(deriveCreationSkillRequirements(classes, 0)).toEqual({
            automaticSkillKeys: [],
            choiceGroups: [
                {
                    classId: 'fighter',
                    choiceGroup: 1,
                    pick: 2,
                    optionKeys: ['athletics', 'perception', 'survival'],
                },
                {
                    classId: 'bard',
                    choiceGroup: 1,
                    pick: 1,
                    optionKeys: ['performance', 'persuasion'],
                },
            ],
        });
    });

    test('derives starting and secondary skill + named choice groups with class identity', () => {
        const groups = deriveCreationProficiencyChoiceRequirements(classes, 0);
        expect(groups).toEqual(expect.arrayContaining([
            expect.objectContaining({
                classId: 'fighter',
                choiceGroup: 1,
                pick: 2,
            }),
            expect.objectContaining({
                classId: 'bard',
                choiceGroup: 1,
                pick: 1,
            }),
            expect.objectContaining({
                classId: 'bard',
                choiceGroup: 2,
                pick: 1,
                options: [
                    { value: 'lute', name: 'Lute', type: PROFICIENCY_TYPE.TOOL },
                    { value: 'flute', name: 'Flute', type: PROFICIENCY_TYPE.TOOL },
                ],
            }),
        ]));
    });

    test('validates class-scoped skill and named choices independently', () => {
        const groups = deriveCreationProficiencyChoiceRequirements(classes, 0);
        const submitted = [
            { classId: 'fighter', choiceGroup: 1, values: ['skill-athletics', 'skill-perception'] },
            { classId: 'bard', choiceGroup: 1, values: ['skill-performance'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
        ];

        expect(() => validateCreationProficiencyChoices(groups, submitted)).not.toThrow();
        expect(skillKeysFromValidatedChoices(groups, submitted).sort()).toEqual([
            'athletics',
            'perception',
            'performance',
        ]);
        expect(() => validateCreationProficiencyChoices(groups, [
            { classId: 'fighter', choiceGroup: 1, values: ['skill-athletics', 'skill-perception'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
        ])).toThrow('Choose exactly 1 proficiency from bard choice group 1');
        expect(namedProficienciesFromChoices(groups, submitted)).toEqual({
            armor: ['None'],
            weapons: ['None'],
            tools: ['Lute'],
        });
    });
});

describe('newly added multiclass proficiency choice validation', () => {
    const bardRef: CharacterClassReference = {
        id: 'class-bard-id',
        srdIndex: 'bard',
        name: 'Bard',
        hitDie: 8,
        spellcastingAbility: 'cha',
        proficiencyRules: [
            {
                grant: 'MULTICLASS',
                choiceGroup: null,
                choiceCount: null,
                proficiencyRef: { srdIndex: 'light-armor', name: 'Light armour', type: PROFICIENCY_TYPE.ARMOR },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'skill-stealth', name: 'Stealth', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 1,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'skill-performance', name: 'Performance', type: PROFICIENCY_TYPE.SKILL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 2,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'lute', name: 'Lute', type: PROFICIENCY_TYPE.TOOL },
            },
            {
                grant: 'MULTICLASS',
                choiceGroup: 2,
                choiceCount: 1,
                proficiencyRef: { srdIndex: 'flute', name: 'Flute', type: PROFICIENCY_TYPE.TOOL },
            },
        ],
    };

    const wizardRef: CharacterClassReference = {
        id: 'class-wizard-id',
        srdIndex: 'wizard',
        name: 'Wizard',
        hitDie: 6,
        spellcastingAbility: 'int',
        proficiencyRules: [],
    };

    const classRefs = new Map<string, CharacterClassReference>([
        ['wizard', wizardRef],
        ['class-wizard-id', wizardRef],
        ['bard', bardRef],
        ['class-bard-id', bardRef],
    ]);

    test('findNewlyAddedClassRows matches persisted classes by db id or srdIndex', () => {
        expect(findNewlyAddedClassRows(
            [{ classId: 'wizard' }, { classId: 'bard' }],
            ['class-wizard-id'],
            classRefs,
        )).toEqual([{ classId: 'bard' }]);
    });

    test('derives SKILL and named MULTICLASS groups for newly added classes', () => {
        const newlyAdded: ResolvedCharacterClass[] = [
            { classRow: { classId: 'bard', level: 1 }, classRef: bardRef, subclassRef: null },
        ];

        expect(deriveNewlyAddedMulticlassProficiencyChoiceRequirements(newlyAdded)).toEqual([
            {
                classId: 'bard',
                choiceGroup: 1,
                pick: 1,
                options: [
                    { value: 'skill-stealth', name: 'Stealth', type: PROFICIENCY_TYPE.SKILL },
                    { value: 'skill-performance', name: 'Performance', type: PROFICIENCY_TYPE.SKILL },
                ],
            },
            {
                classId: 'bard',
                choiceGroup: 2,
                pick: 1,
                options: [
                    { value: 'lute', name: 'Lute', type: PROFICIENCY_TYPE.TOOL },
                    { value: 'flute', name: 'Flute', type: PROFICIENCY_TYPE.TOOL },
                ],
            },
        ]);
    });

    test('rejects missing, duplicate, unexpected, and invalid newly added selections', () => {
        const newlyAdded: ResolvedCharacterClass[] = [
            { classRow: { classId: 'bard', level: 1 }, classRef: bardRef, subclassRef: null },
        ];
        const groups = deriveNewlyAddedMulticlassProficiencyChoiceRequirements(newlyAdded);

        expect(() => validateCreationProficiencyChoices(groups, [
            { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
        ])).toThrow('Choose exactly 1 proficiency from bard choice group 2');
        expect(() => validateCreationProficiencyChoices(groups, [
            { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
            { classId: 'bard', choiceGroup: 1, values: ['skill-performance'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
        ])).toThrow('Duplicate proficiency choice submission');
        expect(() => validateCreationProficiencyChoices(groups, [
            { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
            { classId: 'wizard', choiceGroup: 1, values: ['skill-arcana'] },
        ])).toThrow('Unexpected proficiency choice group');
        expect(() => validateCreationProficiencyChoices(groups, [
            { classId: 'bard', choiceGroup: 1, values: ['skill-athletics'] },
            { classId: 'bard', choiceGroup: 2, values: ['lute'] },
        ])).toThrow('is not an option');
        expect(() => validateCreationProficiencyChoices([], [
            { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
        ])).toThrow('Selected classes do not grant proficiency choices');
    });

    test('merges fixed grants and validated choices without downgrading existing skills', () => {
        const newlyAdded: ResolvedCharacterClass[] = [
            { classRow: { classId: 'bard', level: 1 }, classRef: bardRef, subclassRef: null },
        ];
        const groups = deriveNewlyAddedMulticlassProficiencyChoiceRequirements(newlyAdded);
        const result = applyNewlyAddedMulticlassProficiencyGrants({
            newlyAddedClasses: newlyAdded,
            choiceGroups: groups,
            submittedChoices: [
                { classId: 'bard', choiceGroup: 1, values: ['skill-stealth'] },
                { classId: 'bard', choiceGroup: 2, values: ['lute'] },
            ],
            skillProficiencies: {
                stealth: 'expert',
                performance: 'none',
                athletics: 'proficient',
            },
            traits: {
                armorProficiencies: ['Shields'],
                weaponProficiencies: ['None'],
                toolProficiencies: ["Thieves' tools"],
            },
        });

        expect(result.skillProficiencies.stealth).toBe('expert');
        expect(result.skillProficiencies.athletics).toBe('proficient');
        expect(result.traits.armorProficiencies).toEqual(['Shields', 'Light armour']);
        expect(result.traits.toolProficiencies).toEqual(["Thieves' tools", 'Lute']);
    });
});
