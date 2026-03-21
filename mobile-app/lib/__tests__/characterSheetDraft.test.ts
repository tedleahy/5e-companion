import {
    createCharacterSheetDraft,
    mapCharacterSheetDraftToSaveInput,
} from '../character-sheet/characterSheetDraft';

const CHARACTER_SHEET_CHARACTER = {
    id: 'char-1',
    name: 'Vaelindra',
    race: 'High Elf',
    class: 'Wizard',
    subclass: 'School of Evocation',
    level: 12,
    alignment: 'Chaotic Good',
    background: 'Sage',
    proficiencyBonus: 4,
    inspiration: false,
    ac: 17,
    speed: 35,
    initiative: 3,
    spellcastingAbility: 'intelligence',
    spellSaveDC: 17,
    spellAttackBonus: 9,
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
        hitDice: {
            __typename: 'HitDice',
            total: 12,
            remaining: 12,
            die: 'd6',
        },
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
        draft.weapons.push({
            id: 'draft-weapon-123',
            name: 'Quarterstaff',
            attackBonus: '+5',
            damage: '1d6 bludgeoning',
            type: 'melee',
        });

        const input = mapCharacterSheetDraftToSaveInput(draft, 'intelligence', 4);

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
    });

    it('derives spellcasting values when mapping save input', () => {
        const draft = createCharacterSheetDraft(CHARACTER_SHEET_CHARACTER as never);

        const input = mapCharacterSheetDraftToSaveInput(draft, 'intelligence', 4);

        expect(input.spellAttackBonus).toBe(9);
        expect(input.spellSaveDC).toBe(17);
    });
});
