import { GET_CHARACTER_SHEET_DETAIL, PREPARE_SPELL, SAVE_CHARACTER_SHEET, TOGGLE_INSPIRATION, TOGGLE_SPELL_SLOT, UNPREPARE_SPELL, UPDATE_DEATH_SAVES, UPDATE_SAVING_THROW_PROFICIENCIES, UPDATE_SKILL_PROFICIENCIES } from "@/graphql/characterSheet.operations";
import { ProficiencyLevel } from "@/types/generated_graphql_types";
import { MockLink } from "@apollo/client/testing";

export const MOCK_CHARACTER = {
    __typename: 'Character',
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
            __typename: 'CharacterClass',
            id: 'character-class-1',
            classId: 'wizard',
            className: 'Wizard',
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            level: 10,
            isStartingClass: true,
        },
        {
            __typename: 'CharacterClass',
            id: 'character-class-2',
            classId: 'warlock',
            className: 'Warlock',
            subclassId: 'fiend',
            subclassName: 'Fiend',
            level: 2,
            isStartingClass: false,
        },
    ],
    spellcastingProfiles: [
        {
            __typename: 'SpellcastingProfile',
            classId: 'wizard',
            className: 'Wizard',
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            classLevel: 10,
            spellcastingAbility: 'intelligence',
            spellSaveDC: 17,
            spellAttackBonus: 9,
            slotKind: 'STANDARD',
        },
        {
            __typename: 'SpellcastingProfile',
            classId: 'warlock',
            className: 'Warlock',
            subclassId: 'fiend',
            subclassName: 'Fiend',
            classLevel: 2,
            spellcastingAbility: 'charisma',
            spellSaveDC: 12,
            spellAttackBonus: 4,
            slotKind: 'PACT_MAGIC',
        },
    ],
    conditions: [] as string[],
    features: [
        {
            __typename: 'CharacterFeature',
            id: 'feature-1',
            name: 'Arcane Recovery',
            source: 'Wizard 1',
            description: 'Recover spell slots on a long rest.',
            usesMax: 1,
            usesRemaining: 1,
            recharge: 'long',
        },
        {
            __typename: 'CharacterFeature',
            id: 'feature-2',
            name: 'Darkvision',
            source: 'High Elf',
            description: 'See in dim light and darkness within 60 feet.',
            usesMax: null,
            usesRemaining: null,
            recharge: null,
        },
        {
            __typename: 'CharacterFeature',
            id: 'feature-3',
            name: 'War Caster',
            source: 'Feat',
            description: 'Advantage on concentration checks.',
            usesMax: null,
            usesRemaining: null,
            recharge: null,
        },
    ],
    weapons: [
        {
            __typename: 'Weapon',
            id: 'attack-1',
            name: 'Dagger',
            attackBonus: '+7',
            damage: '1d4+3 piercing',
            type: 'melee',
        },
        {
            __typename: 'Weapon',
            id: 'attack-2',
            name: 'Staff of Power',
            attackBonus: '+9',
            damage: '1d6+5 bludgeoning',
            type: 'melee',
        },
        {
            __typename: 'Weapon',
            id: 'attack-3',
            name: 'Spell Attack',
            attackBonus: '+10',
            damage: 'by spell',
            type: 'spell',
        },
    ],
    inventory: [
        {
            __typename: 'InventoryItem',
            id: 'item-1',
            name: 'Staff of Power',
            quantity: 1,
            weight: 4,
            description: '+2 weapon, spell attack & DC bonus',
            equipped: true,
            magical: true,
        },
        {
            __typename: 'InventoryItem',
            id: 'item-2',
            name: 'Ring of Protection',
            quantity: 1,
            weight: null,
            description: '+1 AC and saving throws',
            equipped: true,
            magical: true,
        },
        {
            __typename: 'InventoryItem',
            id: 'item-3',
            name: 'Spellbook',
            quantity: 1,
            weight: 3,
            description: 'Contains 26 spells',
            equipped: false,
            magical: false,
        },
        {
            __typename: 'InventoryItem',
            id: 'item-4',
            name: 'Potion of Greater Healing',
            quantity: 3,
            weight: 0.5,
            description: 'Restores 4d4+4 HP',
            equipped: false,
            magical: true,
        },
    ],
    spellSlots: [
        {
            __typename: 'SpellSlot',
            id: 'slot-1',
            kind: 'STANDARD',
            level: 1,
            total: 4,
            used: 1,
        },
        {
            __typename: 'SpellSlot',
            id: 'slot-2',
            kind: 'STANDARD',
            level: 2,
            total: 3,
            used: 0,
        },
        {
            __typename: 'SpellSlot',
            id: 'slot-3',
            kind: 'STANDARD',
            level: 3,
            total: 3,
            used: 2,
        },
        {
            __typename: 'SpellSlot',
            id: 'slot-4',
            kind: 'PACT_MAGIC',
            level: 1,
            total: 2,
            used: 1,
        },
    ],
    spellbook: [
        {
            __typename: 'CharacterSpell',
            prepared: true,
            spell: {
                __typename: 'Spell',
                id: 'spell-fireball',
                name: 'Fireball',
                level: 3,
                schoolIndex: 'evocation',
                castingTime: '1 action',
                range: '150 feet',
                concentration: false,
                ritual: false,
            },
        },
        {
            __typename: 'CharacterSpell',
            prepared: true,
            spell: {
                __typename: 'Spell',
                id: 'spell-detect-magic',
                name: 'Detect Magic',
                level: 1,
                schoolIndex: 'divination',
                castingTime: '1 action',
                range: 'Self',
                concentration: true,
                ritual: true,
            },
        },
        {
            __typename: 'CharacterSpell',
            prepared: false,
            spell: {
                __typename: 'Spell',
                id: 'spell-bigbys-hand',
                name: "Bigby's Hand",
                level: 5,
                schoolIndex: 'evocation',
                castingTime: '1 action',
                range: '120 feet',
                concentration: true,
                ritual: false,
            },
        },
    ],
    stats: {
        __typename: 'CharacterStats',
        id: 'stats-1',
        abilityScores: {
            __typename: 'AbilityScores',
            strength: 8,
            dexterity: 16,
            constitution: 14,
            intelligence: 20,
            wisdom: 13,
            charisma: 11,
        },
        hp: {
            __typename: 'HP',
            current: 54,
            max: 76,
            temp: 2,
        },
        deathSaves: {
            __typename: 'DeathSaves',
            successes: 1,
            failures: 0,
        },
        hitDicePools: [
            {
                __typename: 'HitDicePool',
                id: 'hit-dice-pool-1',
                classId: 'wizard',
                className: 'Wizard',
                total: 10,
                remaining: 10,
                die: 'd6',
            },
            {
                __typename: 'HitDicePool',
                id: 'hit-dice-pool-2',
                classId: 'warlock',
                className: 'Warlock',
                total: 2,
                remaining: 2,
                die: 'd8',
            },
        ],
        traits: {
            __typename: 'Traits',
            personality: 'Always collecting obscure magical lore.',
            ideals: 'Knowledge should be preserved.',
            bonds: 'My spellbook is my life.',
            flaws: 'I underestimate danger when magic is involved.',
            armorProficiencies: [],
            weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs'],
            toolProficiencies: [],
            languages: ['Common', 'Elvish', 'Draconic'],
        },
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        skillProficiencies: {
            __typename: 'SkillProficiencies',
            acrobatics: ProficiencyLevel.None,
            animalHandling: ProficiencyLevel.None,
            arcana: ProficiencyLevel.Expert,
            athletics: ProficiencyLevel.None,
            deception: ProficiencyLevel.None,
            history: ProficiencyLevel.Expert,
            insight: ProficiencyLevel.Proficient,
            intimidation: ProficiencyLevel.None,
            investigation: ProficiencyLevel.Expert,
            medicine: ProficiencyLevel.None,
            nature: ProficiencyLevel.Proficient,
            perception: ProficiencyLevel.Proficient,
            performance: ProficiencyLevel.None,
            persuasion: ProficiencyLevel.None,
            religion: ProficiencyLevel.Proficient,
            sleightOfHand: ProficiencyLevel.None,
            stealth: ProficiencyLevel.Proficient,
            survival: ProficiencyLevel.None,
        },
        currency: {
            __typename: 'Currency',
            cp: 0,
            sp: 14,
            ep: 0,
            gp: 847,
            pp: 3,
        },
    },
};

export const SAVE_CORE_CHARACTER_MOCKS: MockLink.MockedResponse[] = [
    {
        request: {
            query: SAVE_CHARACTER_SHEET,
            variables: {
                characterId: 'char-1',
                input: {
                    ac: 17,
                    speed: 35,
                    initiative: 3,
                    conditions: [],
                    hp: {
                        current: 54,
                        max: 76,
                        temp: 2,
                    },
                    abilityScores: {
                        strength: 8,
                        dexterity: 16,
                        constitution: 14,
                        intelligence: 20,
                        wisdom: 13,
                        charisma: 11,
                    },
                    currency: {
                        cp: 0,
                        sp: 14,
                        ep: 0,
                        gp: 847,
                        pp: 3,
                    },
                    traits: {
                        personality: 'Always collecting obscure magical lore.',
                        ideals: 'Knowledge should be preserved.',
                        bonds: 'My spellbook is my life.',
                        flaws: 'I underestimate danger when magic is involved.',
                        armorProficiencies: [],
                        weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs'],
                        toolProficiencies: [],
                        languages: ['Common', 'Elvish', 'Draconic'],
                    },
                    classes: [
                        {
                            id: 'character-class-1',
                            classId: 'wizard',
                            subclassId: 'school-of-evocation',
                            customSubclass: null,
                            level: 10,
                            isStartingClass: true,
                        },
                        {
                            id: 'character-class-2',
                            classId: 'warlock',
                            subclassId: 'fiend',
                            customSubclass: null,
                            level: 2,
                            isStartingClass: false,
                        },
                    ],
                    weapons: [
                        {
                            id: 'attack-1',
                            name: 'Dagger',
                            attackBonus: '+7',
                            damage: '1d4+3 piercing',
                            type: 'melee',
                        },
                        {
                            id: 'attack-2',
                            name: 'Staff of Power',
                            attackBonus: '+9',
                            damage: '1d6+5 bludgeoning',
                            type: 'melee',
                        },
                        {
                            id: 'attack-3',
                            name: 'Spell Attack',
                            attackBonus: '+10',
                            damage: 'by spell',
                            type: 'spell',
                        },
                    ],
                    inventory: [
                        {
                            id: 'item-1',
                            name: 'Staff of Power',
                            quantity: 1,
                            weight: 4,
                            description: '+2 weapon, spell attack & DC bonus',
                            equipped: true,
                            magical: true,
                        },
                        {
                            id: 'item-2',
                            name: 'Ring of Protection',
                            quantity: 1,
                            weight: null,
                            description: '+1 AC and saving throws',
                            equipped: true,
                            magical: true,
                        },
                        {
                            id: 'item-3',
                            name: 'Spellbook',
                            quantity: 1,
                            weight: 3,
                            description: 'Contains 26 spells',
                            equipped: false,
                            magical: false,
                        },
                        {
                            id: 'item-4',
                            name: 'Potion of Greater Healing',
                            quantity: 3,
                            weight: 0.5,
                            description: 'Restores 4d4+4 HP',
                            equipped: false,
                            magical: true,
                        },
                    ],
                    features: [
                        {
                            id: 'feature-1',
                            name: 'Arcane Recovery',
                            source: 'Wizard 1',
                            description: 'Recover spell slots on a long rest.',
                            usesMax: 1,
                            usesRemaining: 1,
                            recharge: 'long',
                            customSubclassFeature: null,
                        },
                        {
                            id: 'feature-2',
                            name: 'Darkvision',
                            source: 'High Elf',
                            description: 'See in dim light and darkness within 60 feet.',
                            usesMax: null,
                            usesRemaining: null,
                            recharge: null,
                            customSubclassFeature: null,
                        },
                        {
                            id: 'feature-3',
                            name: 'War Caster',
                            source: 'Feat',
                            description: 'Advantage on concentration checks.',
                            usesMax: null,
                            usesRemaining: null,
                            recharge: null,
                            customSubclassFeature: null,
                        },
                    ],
                },
            },
        },
        result: {
            data: {
                saveCharacterSheet: MOCK_CHARACTER,
            },
        },
    },
];

/**
 * Builds a failing save mock while reusing the standard save request payload.
 */
export const SAVE_CHARACTER_SHEET_FAILURE_MOCK: MockLink.MockedResponse = {
    request: {
        ...SAVE_CORE_CHARACTER_MOCKS[0].request,
        variables: {
            ...SAVE_CORE_CHARACTER_MOCKS[0].request.variables,
        },
    },
    error: new Error('Network error'),
};

const { __typename: _skillTypeName, ...INITIAL_SKILL_INPUT } = MOCK_CHARACTER.stats.skillProficiencies;

export const CHARACTERS_MOCK: MockLink.MockedResponse = {
    request: {
        query: GET_CHARACTER_SHEET_DETAIL,
        variables: { id: 'char-1' },
    },
    result: {
        data: {
            character: MOCK_CHARACTER,
            hasCurrentUserCharacters: true,
        },
    },
};

export const EMPTY_MOCK: MockLink.MockedResponse = {
    request: {
        query: GET_CHARACTER_SHEET_DETAIL,
        variables: { id: 'char-1' },
    },
    result: {
        data: {
            character: null,
            hasCurrentUserCharacters: false,
        },
    },
};

export const ERROR_MOCK: MockLink.MockedResponse = {
    request: {
        query: GET_CHARACTER_SHEET_DETAIL,
        variables: { id: 'char-1' },
    },
    error: new Error('Network error'),
};

export const NOT_FOUND_MOCK: MockLink.MockedResponse = {
    request: {
        query: GET_CHARACTER_SHEET_DETAIL,
        variables: { id: 'char-1' },
    },
    result: {
        data: {
            character: null,
            hasCurrentUserCharacters: true,
        },
    },
};

export const TOGGLE_MOCK: MockLink.MockedResponse = {
    request: {
        query: TOGGLE_INSPIRATION,
        variables: { characterId: 'char-1' },
    },
    result: {
        data: {
            toggleInspiration: {
                __typename: 'Character',
                id: 'char-1',
                inspiration: true,
            },
        },
    },
};

export const UPDATE_DEATH_SAVES_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_DEATH_SAVES,
        variables: {
            characterId: 'char-1',
            input: { successes: 2, failures: 0 },
        },
    },
    result: {
        data: {
            updateDeathSaves: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                deathSaves: {
                    __typename: 'DeathSaves',
                    successes: 2,
                    failures: 0,
                },
            },
        },
    },
};

export const UPDATE_SKILLS_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_SKILL_PROFICIENCIES,
        variables: {
            characterId: 'char-1',
            input: {
                ...INITIAL_SKILL_INPUT,
                perception: ProficiencyLevel.Expert,
            },
        },
    },
    result: {
        data: {
            updateSkillProficiencies: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                skillProficiencies: {
                    ...MOCK_CHARACTER.stats.skillProficiencies,
                    perception: ProficiencyLevel.Expert,
                },
            },
        },
    },
};

export const UPDATE_SAVING_THROW_PROFICIENCIES_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_SAVING_THROW_PROFICIENCIES,
        variables: {
            characterId: 'char-1',
            input: {
                proficiencies: ['strength', 'intelligence', 'wisdom'],
            },
        },
    },
    result: {
        data: {
            updateSavingThrowProficiencies: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                savingThrowProficiencies: ['strength', 'intelligence', 'wisdom'],
            },
        },
    },
};

export const TOGGLE_SLOT_LEVEL_1_MOCK: MockLink.MockedResponse = {
    request: {
        query: TOGGLE_SPELL_SLOT,
        variables: {
            characterId: 'char-1',
            kind: 'STANDARD',
            level: 1,
        },
    },
    result: {
        data: {
            toggleSpellSlot: {
                __typename: 'SpellSlot',
                id: 'slot-1',
                kind: 'STANDARD',
                level: 1,
                total: 4,
                used: 2,
            },
        },
    },
};

export const UNPREPARE_FIREBALL_MOCK: MockLink.MockedResponse = {
    request: {
        query: UNPREPARE_SPELL,
        variables: {
            characterId: 'char-1',
            spellId: 'spell-fireball',
        },
    },
    result: {
        data: {
            unprepareSpell: {
                __typename: 'CharacterSpell',
                prepared: false,
                spell: {
                    __typename: 'Spell',
                    id: 'spell-fireball',
                },
            },
        },
    },
};

export const PREPARE_BIGBYS_HAND_MOCK: MockLink.MockedResponse = {
    request: {
        query: PREPARE_SPELL,
        variables: {
            characterId: 'char-1',
            spellId: 'spell-bigbys-hand',
        },
    },
    result: {
        data: {
            prepareSpell: {
                __typename: 'CharacterSpell',
                prepared: true,
                spell: {
                    __typename: 'Spell',
                    id: 'spell-bigbys-hand',
                },
            },
        },
    },
};
