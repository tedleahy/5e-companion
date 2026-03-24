import { describe, expect, test } from 'bun:test';
import { ProficiencyType } from '@prisma/client';
import {
    deriveHitDicePools,
    deriveNamedClassProficiencies,
    deriveProficiencyBonus,
    deriveSavingThrowProficiencies,
    deriveSpellSlots,
    deriveSpellcastingProfiles,
    deriveStartingHp,
    deriveTotalLevel,
    recoverHitDicePools,
    validateClassAllocations,
    type CharacterClassReference,
} from './multiclassRules';

const wizardClass: CharacterClassReference = {
    id: 'class-wizard-id',
    srdIndex: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    spellcastingAbility: 'int',
    proficiencies: [
        { srdIndex: 'saving-throw-int', name: 'INT', type: ProficiencyType.SAVING_THROW },
        { srdIndex: 'saving-throw-wis', name: 'WIS', type: ProficiencyType.SAVING_THROW },
    ],
};

const fighterClass: CharacterClassReference = {
    id: 'class-fighter-id',
    srdIndex: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    spellcastingAbility: null,
    proficiencies: [
        { srdIndex: 'light-armor', name: 'Light armour', type: ProficiencyType.ARMOR },
        { srdIndex: 'medium-armor', name: 'Medium armour', type: ProficiencyType.ARMOR },
        { srdIndex: 'shields', name: 'Shields', type: ProficiencyType.ARMOR },
        { srdIndex: 'simple-weapons', name: 'Simple weapons', type: ProficiencyType.WEAPON },
        { srdIndex: 'martial-weapons', name: 'Martial weapons', type: ProficiencyType.WEAPON },
        { srdIndex: 'saving-throw-str', name: 'STR', type: ProficiencyType.SAVING_THROW },
        { srdIndex: 'saving-throw-con', name: 'CON', type: ProficiencyType.SAVING_THROW },
    ],
};

const paladinClass: CharacterClassReference = {
    id: 'class-paladin-id',
    srdIndex: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    spellcastingAbility: 'cha',
    proficiencies: [
        { srdIndex: 'light-armor', name: 'Light armour', type: ProficiencyType.ARMOR },
        { srdIndex: 'medium-armor', name: 'Medium armour', type: ProficiencyType.ARMOR },
        { srdIndex: 'heavy-armor', name: 'Heavy armour', type: ProficiencyType.ARMOR },
        { srdIndex: 'shields', name: 'Shields', type: ProficiencyType.ARMOR },
        { srdIndex: 'simple-weapons', name: 'Simple weapons', type: ProficiencyType.WEAPON },
        { srdIndex: 'martial-weapons', name: 'Martial weapons', type: ProficiencyType.WEAPON },
        { srdIndex: 'saving-throw-wis', name: 'WIS', type: ProficiencyType.SAVING_THROW },
        { srdIndex: 'saving-throw-cha', name: 'CHA', type: ProficiencyType.SAVING_THROW },
    ],
};

const warlockClass: CharacterClassReference = {
    id: 'class-warlock-id',
    srdIndex: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    spellcastingAbility: 'cha',
    proficiencies: [
        { srdIndex: 'light-armor', name: 'Light armour', type: ProficiencyType.ARMOR },
        { srdIndex: 'simple-weapons', name: 'Simple weapons', type: ProficiencyType.WEAPON },
        { srdIndex: 'saving-throw-wis', name: 'WIS', type: ProficiencyType.SAVING_THROW },
        { srdIndex: 'saving-throw-cha', name: 'CHA', type: ProficiencyType.SAVING_THROW },
    ],
};

describe('multiclassRules', () => {
    test('validates subclass unlock levels against the class row level', () => {
        const classRefs = new Map([
            ['wizard', wizardClass],
        ]);
        const subclassRefs = new Map([
            ['evocation', { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id' }],
        ]);

        expect(() => validateClassAllocations(
            [{ classId: 'wizard', subclassId: 'evocation', level: 1 }],
            classRefs,
            subclassRefs,
            'wizard',
        )).toThrow('requires wizard level 2');
    });

    test('requires subclasses once a class reaches its subclass unlock level', () => {
        const classRefs = new Map([
            ['wizard', wizardClass],
        ]);

        expect(() => validateClassAllocations(
            [{ classId: 'wizard', level: 2 }],
            classRefs,
            new Map(),
            'wizard',
        )).toThrow('Class wizard requires a subclass at level 2.');
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
            { classRow: { classId: 'warlock', subclassId: 'fiend', level: 2 }, classRef: warlockClass, subclassRef: { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id' } },
        ];

        expect(deriveSpellSlots(classes)).toEqual([
            { kind: 'STANDARD', level: 1, total: 4, used: 0 },
            { kind: 'STANDARD', level: 2, total: 2, used: 0 },
            { kind: 'PACT_MAGIC', level: 1, total: 2, used: 0 },
        ]);
    });

    test('derives spellcasting profiles per casting class', () => {
        const classes = [
            { classRow: { classId: 'wizard', subclassId: 'evocation', level: 3 }, classRef: wizardClass, subclassRef: { id: 'subclass-evocation-id', srdIndex: 'evocation', name: 'Evocation', classId: 'class-wizard-id' } },
            { classRow: { classId: 'warlock', subclassId: 'fiend', level: 2 }, classRef: warlockClass, subclassRef: { id: 'subclass-fiend-id', srdIndex: 'fiend', name: 'Fiend', classId: 'class-warlock-id' } },
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
