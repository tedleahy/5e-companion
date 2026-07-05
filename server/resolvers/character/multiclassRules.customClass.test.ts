import { describe, expect, test } from 'bun:test';
import {
    HALF_CASTER_SINGLE_CLASS_SLOT_TABLE,
    deriveNamedClassProficiencies,
    deriveSavingThrowProficiencies,
    deriveSpellSlots,
    type ResolvedCharacterClass,
} from './multiclassRules';

function customClass(mode: 'NONE' | 'STANDARD' | 'PACT_MAGIC'): ResolvedCharacterClass {
    return {
        classRow: { classId: 'custom-class-id', level: 3 },
        classRef: {
            id: 'custom-class-id', srdIndex: null, name: 'Warden', hitDie: 10,
            spellcastingAbility: mode === 'NONE' ? null : 'wis', spellcastingMode: mode,
            savingThrowIndexes: ['str', 'con'],
            proficiencies: [],
            proficiencyRules: [{ grant: 'STARTING', choiceGroup: null, proficiencyRef: { srdIndex: 'medium-armor', name: 'Medium armour', type: 'ARMOR' } }],
            progression: Array.from({ length: 20 }, (_, index) => ({
                level: index + 1, spellSlots: index === 2 ? [mode === 'NONE' ? 0 : 3, mode === 'NONE' ? 0 : 2, 0, 0, 0, 0, 0, 0, 0] : Array(9).fill(0),
                abilityScoreImprovement: false, cantripsKnown: null, spellsKnown: null,
                preparedSpellCount: null, addSpellcastingAbility: false,
            })),
        },
        subclassRef: null,
    };
}

function customHalfCaster(level: number): ResolvedCharacterClass {
    const resolved = customClass('STANDARD');
    resolved.classRow.level = level;
    resolved.classRef.progression = Array.from({ length: 20 }, (_, index) => ({
        level: index + 1,
        spellSlots: [...(HALF_CASTER_SINGLE_CLASS_SLOT_TABLE[index + 1] ?? [])],
        abilityScoreImprovement: false,
        cantripsKnown: null,
        spellsKnown: null,
        preparedSpellCount: null,
        addSpellcastingAbility: false,
    }));
    return resolved;
}

describe('custom class multiclass rules', () => {
    test('uses configured saves and starting proficiencies', () => {
        const resolved = customClass('NONE');
        expect(deriveSavingThrowProficiencies(resolved.classRef)).toEqual(['strength', 'constitution']);
        expect(deriveNamedClassProficiencies([resolved], 0).armor).toEqual(['Medium armour']);
    });

    test('uses configured standard and pact slot progressions', () => {
        expect(deriveSpellSlots([customClass('STANDARD')])).toEqual([
            { kind: 'STANDARD', level: 1, total: 3, used: 0 },
            { kind: 'STANDARD', level: 2, total: 2, used: 0 },
        ]);
        expect(deriveSpellSlots([customClass('PACT_MAGIC')])).toEqual([
            { kind: 'PACT_MAGIC', level: 1, total: 3, used: 0 },
            { kind: 'PACT_MAGIC', level: 2, total: 2, used: 0 },
        ]);
    });

    test('uses configured half-caster progression when multiclassing', () => {
        const wizard: ResolvedCharacterClass = {
            classRow: { classId: 'wizard', level: 2 },
            classRef: {
                id: 'wizard-id', srdIndex: 'wizard', name: 'Wizard', hitDie: 6,
                spellcastingAbility: 'int', spellcastingMode: 'STANDARD',
            },
            subclassRef: null,
        };

        expect(deriveSpellSlots([wizard, customHalfCaster(4)])).toEqual([
            { kind: 'STANDARD', level: 1, total: 4, used: 0 },
            { kind: 'STANDARD', level: 2, total: 3, used: 0 },
        ]);
    });

    test('uses the closest standard caster contribution for an authored slot table', () => {
        const wizard: ResolvedCharacterClass = {
            classRow: { classId: 'wizard', level: 2 },
            classRef: {
                id: 'wizard-id', srdIndex: 'wizard', name: 'Wizard', hitDie: 6,
                spellcastingAbility: 'int', spellcastingMode: 'STANDARD',
            },
            subclassRef: null,
        };
        const authoredCaster = customClass('STANDARD');
        authoredCaster.classRef.progression![2]!.spellSlots = [2, 1, 0, 0, 0, 0, 0, 0, 0];

        expect(deriveSpellSlots([wizard, authoredCaster])).toEqual([
            { kind: 'STANDARD', level: 1, total: 4, used: 0 },
            { kind: 'STANDARD', level: 2, total: 2, used: 0 },
        ]);
    });

    test('merges pact slots at the same level across classes', () => {
        const first = customClass('PACT_MAGIC');
        const second = customClass('PACT_MAGIC');
        second.classRow.classId = 'second-custom-class-id';
        second.classRef.id = 'second-custom-class-id';

        expect(deriveSpellSlots([first, second])).toEqual([
            { kind: 'PACT_MAGIC', level: 1, total: 6, used: 0 },
            { kind: 'PACT_MAGIC', level: 2, total: 4, used: 0 },
        ]);
    });
});
