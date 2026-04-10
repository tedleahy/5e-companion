import {
    createCharacterSheetDraft,
    mapCharacterSheetDraftToSaveInput,
} from '../character-sheet/characterSheetDraft';

const CHARACTER_SHEET_CHARACTER = {
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
    conditions: [],
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
    ],
    weapons: [
        {
            __typename: 'Weapon',
            id: 'weapon-1',
            name: 'Dagger',
            attackBonus: '+7',
            damage: '1d4+3 piercing',
            type: 'melee',
        },
    ],
    inventory: [
        {
            __typename: 'InventoryItem',
            id: 'item-1',
            name: 'Spellbook',
            quantity: 1,
            weight: 3,
            description: 'Contains prepared rituals.',
            equipped: false,
            magical: false,
        },
    ],
    spellSlots: [],
    spellbook: [],
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
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        skillProficiencies: {
            __typename: 'SkillProficiencies',
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
            __typename: 'Traits',
            personality: 'Always collecting obscure magical lore.',
            ideals: 'Knowledge should be preserved.',
            bonds: 'My spellbook is my life.',
            flaws: 'I underestimate danger when magic is involved.',
            armorProficiencies: [],
            weaponProficiencies: ['Daggers'],
            toolProficiencies: [],
            languages: ['Common', 'Elvish'],
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
} as const;

describe('characterSheetDraft', () => {
    it('strips GraphQL typenames from local draft rows', () => {
        const draft = createCharacterSheetDraft(CHARACTER_SHEET_CHARACTER as never);

        expect(draft.skillProficiencies.arcana).toBe('expert');
        expect(Object.prototype.hasOwnProperty.call(draft.skillProficiencies, '__typename')).toBe(false);
        expect(draft.weapons[0]).toEqual({
            id: 'weapon-1',
            name: 'Dagger',
            attackBonus: '+7',
            damage: '1d4+3 piercing',
            type: 'melee',
        });
        expect(Object.prototype.hasOwnProperty.call(draft.weapons[0], '__typename')).toBe(false);
    });

    it('maps draft-only ids to creates in the save input', () => {
        const draft = createCharacterSheetDraft(CHARACTER_SHEET_CHARACTER as never);
        draft.classes.push({
            id: 'draft-class-123',
            classId: 'fighter',
            className: 'Fighter',
            subclassId: null,
            subclassName: null,
            customSubclass: null,
            level: 1,
            isStartingClass: false,
        });
        draft.weapons.push({
            id: 'draft-weapon-123',
            name: 'Quarterstaff',
            attackBonus: '+5',
            damage: '1d6 bludgeoning',
            type: 'melee',
        });

        const input = mapCharacterSheetDraftToSaveInput(draft);

        expect(input.classes).toEqual([
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
            {
                id: undefined,
                classId: 'fighter',
                subclassId: null,
                customSubclass: null,
                level: 1,
                isStartingClass: false,
            },
        ]);
        expect(input.weapons).toEqual([
            {
                id: 'weapon-1',
                name: 'Dagger',
                attackBonus: '+7',
                damage: '1d4+3 piercing',
                type: 'melee',
            },
            {
                id: undefined,
                name: 'Quarterstaff',
                attackBonus: '+5',
                damage: '1d6 bludgeoning',
                type: 'melee',
            },
        ]);
        expect(input.features).toEqual([
            {
                id: 'feature-1',
                name: 'Arcane Recovery',
                source: 'Wizard 1',
                description: 'Recover spell slots on a long rest.',
                recharge: 'long',
                usesMax: 1,
                usesRemaining: 1,
                customSubclassFeature: null,
            },
        ]);
        expect(input.skillProficiencies).toEqual({
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
        });
    });

    it('omits derived spellcasting values when mapping save input', () => {
        const draft = createCharacterSheetDraft(CHARACTER_SHEET_CHARACTER as never);

        const input = mapCharacterSheetDraftToSaveInput(draft);

        expect(input).not.toHaveProperty('spellAttackBonus');
        expect(input).not.toHaveProperty('spellSaveDC');
    });
});
