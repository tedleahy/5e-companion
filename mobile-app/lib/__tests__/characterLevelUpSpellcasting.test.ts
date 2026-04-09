import {
    buildLevelUpSpellcastingSummary,
    canContinueFromSpellcastingUpdates,
    createLevelUpSpellcastingState,
} from '../characterLevelUp/spellcasting';

const WIZARD_SPELL = {
    __typename: 'CharacterSpell',
    prepared: false,
    spell: {
        __typename: 'Spell',
        id: 'spell-fireball',
        name: 'Fireball',
        level: 3,
        schoolIndex: 'evocation',
        classIndexes: ['wizard', 'sorcerer'],
        castingTime: '1 action',
        range: '150 feet',
        concentration: false,
        ritual: false,
    },
} as const;

const WARLOCK_SPELL = {
    __typename: 'CharacterSpell',
    prepared: false,
    spell: {
        __typename: 'Spell',
        id: 'spell-hex',
        name: 'Hex',
        level: 1,
        schoolIndex: 'enchantment',
        classIndexes: ['warlock'],
        castingTime: '1 bonus action',
        range: '90 feet',
        concentration: true,
        ritual: false,
    },
} as const;

const BASE_CHARACTER = {
    id: 'char-1',
    name: 'Vaelindra',
    level: 10,
    classes: [
        {
            __typename: 'CharacterClass',
            id: 'class-wizard',
            classId: 'wizard',
            className: 'Wizard',
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            level: 10,
            isStartingClass: true,
        },
    ],
    spellcastingProfiles: [],
    spellSlots: [],
    spellbook: [WIZARD_SPELL, WARLOCK_SPELL],
    stats: {
        abilityScores: {
            strength: 8,
            dexterity: 14,
            constitution: 14,
            intelligence: 18,
            wisdom: 16,
            charisma: 18,
        },
        hp: {
            current: 52,
            max: 52,
            temp: 0,
        },
    },
} as const;

describe('characterLevelUp spellcasting helpers', () => {
    it('summarises wizard spell learning, cantrip gains, and spell-level unlocks', () => {
        const summary = buildLevelUpSpellcastingSummary(BASE_CHARACTER as never, {
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
        });

        expect(summary.mode).toBe('wizard');
        expect(summary.hasChanges).toBe(true);
        expect(summary.learnedSpellCount).toBe(2);
        expect(summary.cantripCountGain).toBe(0);
        expect(summary.previousMaxSpellLevel).toBe(5);
        expect(summary.nextMaxSpellLevel).toBe(6);
        expect(summary.newSpellLevelUnlocked).toBe(true);
        expect(summary.eligibleSpellLevels).toEqual([1, 2, 3, 4, 5, 6]);
        expect(summary.currentKnownSpellIds).toEqual(['spell-fireball']);
        expect(summary.slotComparisons).toEqual(expect.arrayContaining([
            expect.objectContaining({
                kind: 'STANDARD',
                level: 6,
                previousTotal: 0,
                nextTotal: 1,
                changed: true,
            }),
        ]));
    });

    it('requires known casters to pick every granted spell and cantrip before continuing', () => {
        const character = {
            ...BASE_CHARACTER,
            classes: [
                {
                    ...BASE_CHARACTER.classes[0],
                    classId: 'sorcerer',
                    className: 'Sorcerer',
                    level: 3,
                    subclassId: 'draconic-bloodline',
                    subclassName: 'Draconic Bloodline',
                },
            ],
            spellbook: [
                {
                    ...WIZARD_SPELL,
                    spell: {
                        ...WIZARD_SPELL.spell,
                        id: 'spell-magic-missile',
                        name: 'Magic Missile',
                        level: 1,
                        classIndexes: ['sorcerer', 'wizard'],
                    },
                },
            ],
        } as const;
        const summary = buildLevelUpSpellcastingSummary(character as never, {
            classId: 'sorcerer',
            className: 'Sorcerer',
            currentLevel: 3,
            newLevel: 4,
            isExistingClass: true,
            subclassId: 'draconic-bloodline',
            subclassName: 'Draconic Bloodline',
            subclassDescription: null,
            subclassIsCustom: false,
            subclassFeatures: [],
            customSubclass: null,
        });

        expect(summary.mode).toBe('known');
        expect(summary.previousKnownSpells).toBe(4);
        expect(summary.nextKnownSpells).toBe(5);
        expect(summary.learnedSpellCount).toBe(1);
        expect(summary.cantripCountGain).toBe(1);

        const emptyState = createLevelUpSpellcastingState();
        expect(canContinueFromSpellcastingUpdates(summary, emptyState)).toBe(false);

        const completeState = {
            ...emptyState,
            learnedSpells: [{
                id: 'spell-scorching-ray',
                name: 'Scorching Ray',
                level: 2,
                schoolIndex: 'evocation',
                classIndexes: ['sorcerer', 'wizard'],
                range: '120 feet',
                ritual: false,
                concentration: false,
                castingTime: '1 action',
            }],
            cantripSpells: [{
                id: 'spell-light',
                name: 'Light',
                level: 0,
                schoolIndex: 'evocation',
                classIndexes: ['sorcerer', 'wizard'],
                range: 'Touch',
                ritual: false,
                concentration: false,
                castingTime: '1 action',
            }],
        };

        expect(canContinueFromSpellcastingUpdates(summary, completeState)).toBe(true);
        expect(canContinueFromSpellcastingUpdates(summary, {
            ...completeState,
            swapOutSpellId: 'spell-magic-missile',
            swapReplacementSpell: null,
        })).toBe(false);
    });

    it('tracks prepared-caster prepared limits without forcing selections', () => {
        const character = {
            ...BASE_CHARACTER,
            classes: [
                {
                    ...BASE_CHARACTER.classes[0],
                    classId: 'cleric',
                    className: 'Cleric',
                    level: 4,
                    subclassId: 'life-domain',
                    subclassName: 'Life Domain',
                },
            ],
            spellbook: [],
        } as const;
        const summary = buildLevelUpSpellcastingSummary(character as never, {
            classId: 'cleric',
            className: 'Cleric',
            currentLevel: 4,
            newLevel: 5,
            isExistingClass: true,
            subclassId: 'life-domain',
            subclassName: 'Life Domain',
            subclassDescription: null,
            subclassIsCustom: false,
            subclassFeatures: [],
            customSubclass: null,
        });

        expect(summary.mode).toBe('prepared');
        expect(summary.previousPreparedSpellLimit).toBe(7);
        expect(summary.nextPreparedSpellLimit).toBe(8);
        expect(summary.learnedSpellCount).toBe(0);
        expect(canContinueFromSpellcastingUpdates(summary, createLevelUpSpellcastingState())).toBe(true);
    });

    it('captures warlock pact-magic and known-spell progression separately from standard slots', () => {
        const character = {
            ...BASE_CHARACTER,
            classes: [
                {
                    ...BASE_CHARACTER.classes[0],
                    classId: 'warlock',
                    className: 'Warlock',
                    level: 10,
                    subclassId: 'fiend',
                    subclassName: 'Fiend',
                },
            ],
            spellbook: [WARLOCK_SPELL],
        } as const;
        const summary = buildLevelUpSpellcastingSummary(character as never, {
            classId: 'warlock',
            className: 'Warlock',
            currentLevel: 10,
            newLevel: 11,
            isExistingClass: true,
            subclassId: 'fiend',
            subclassName: 'Fiend',
            subclassDescription: null,
            subclassIsCustom: false,
            subclassFeatures: [],
            customSubclass: null,
        });

        expect(summary.mode).toBe('known');
        expect(summary.learnedSpellCount).toBe(1);
        expect(summary.cantripCountGain).toBe(0);
        expect(summary.slotComparisons).toEqual(expect.arrayContaining([
            expect.objectContaining({
                kind: 'PACT_MAGIC',
                level: 5,
                previousTotal: 2,
                nextTotal: 3,
                changed: true,
            }),
        ]));
    });

    it('compares multiclass standard slots from combined caster levels', () => {
        const character = {
            ...BASE_CHARACTER,
            level: 7,
            classes: [
                {
                    ...BASE_CHARACTER.classes[0],
                    level: 3,
                },
                {
                    __typename: 'CharacterClass',
                    id: 'class-paladin',
                    classId: 'paladin',
                    className: 'Paladin',
                    subclassId: 'oath-of-devotion',
                    subclassName: 'Oath of Devotion',
                    level: 4,
                    isStartingClass: false,
                },
            ],
        } as const;
        const summary = buildLevelUpSpellcastingSummary(character as never, {
            classId: 'wizard',
            className: 'Wizard',
            currentLevel: 3,
            newLevel: 4,
            isExistingClass: true,
            subclassId: 'school-of-evocation',
            subclassName: 'School of Evocation',
            subclassDescription: null,
            subclassIsCustom: false,
            subclassFeatures: [],
            customSubclass: null,
        });

        expect(summary.slotComparisons).toEqual(expect.arrayContaining([
            expect.objectContaining({
                kind: 'STANDARD',
                level: 3,
                previousTotal: 2,
                nextTotal: 3,
                changed: true,
            }),
        ]));
    });
});
