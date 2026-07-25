import { describe, expect, test } from 'bun:test';
import type { ManagedCustomClassInput } from '../../generated/graphql';
import {
    assertLockedFeatureMembership,
    canonicaliseMechanicsValue,
    normaliseClassInput,
    sortByCanonicalForm,
} from './customClassManager';

function validInput(): ManagedCustomClassInput {
    return {
        name: 'Warden',
        emoji: '🛡️',
        description: 'A stalwart custom class.',
        hitDie: 10,
        primaryAbilityIndexes: ['str'],
        savingThrowIndexes: ['str', 'con'],
        multiclassPrerequisites: [{ abilityIndex: 'str', minimum: 13, group: 1 }],
        proficiencies: [],
        equipment: [],
        spellcastingMode: 'NONE',
        progression: Array.from({ length: 20 }, (_, index) => ({
            level: index + 1,
            abilityScoreImprovement: [4, 8, 12, 16, 19].includes(index + 1),
            spellSlots: Array(9).fill(0),
            displayValues: [],
        })),
        features: [{ name: 'Vigilance', description: 'Remain alert.', level: 1 }],
        spellIds: [],
        addSpellcastingAbility: false,
    };
}

describe('custom class input validation', () => {
    test('normalises a complete level 1–20 definition', () => {
        const result = normaliseClassInput(validInput());
        expect(result.name).toBe('Warden');
        expect(result.emoji).toBe('🛡️');
        expect(result.levels).toHaveLength(20);
        expect(result.features[0]).toMatchObject({ name: 'Vigilance', level: 1 });
    });

    test('rejects an empty emoji', () => {
        const input = validInput();
        input.emoji = '   ';
        expect(() => normaliseClassInput(input)).toThrow('emoji');
    });

    test('rejects missing progression levels', () => {
        const input = validInput();
        input.progression = input.progression.slice(0, 19);
        expect(() => normaliseClassInput(input)).toThrow('each class level from 1 through 20');
    });

    test('rejects spell progression on a non-spellcasting class', () => {
        const input = validInput();
        input.progression[0]!.spellSlots[0] = 2;
        expect(() => normaliseClassInput(input)).toThrow('non-spellcasting class');
    });

    test('rejects a pact magic level with more than one populated spell-slot level', () => {
        const input = validInput();
        input.spellcastingMode = 'PACT_MAGIC';
        input.spellcastingAbility = 'cha';
        input.progression[0]!.spellSlots[0] = 1;
        input.progression[0]!.spellSlots[1] = 1;
        expect(() => normaliseClassInput(input)).toThrow('single spell-slot level');
    });

    test('accepts a pact magic level with a single populated spell-slot level', () => {
        const input = validInput();
        input.spellcastingMode = 'PACT_MAGIC';
        input.spellcastingAbility = 'cha';
        input.progression[0]!.spellSlots[1] = 2;
        expect(() => normaliseClassInput(input)).not.toThrow();
    });

    test('normalises the prepared-spell modifier as a class-wide caster setting', () => {
        const caster = validInput();
        caster.spellcastingMode = 'STANDARD';
        caster.spellcastingAbility = 'wis';
        caster.addSpellcastingAbility = true;
        expect(normaliseClassInput(caster).addSpellcastingAbility).toBe(true);

        const nonCaster = validInput();
        nonCaster.addSpellcastingAbility = true;
        expect(normaliseClassInput(nonCaster).addSpellcastingAbility).toBe(false);
    });
});

describe('canonical mechanics serialisation', () => {
    test('treats objects with differently ordered keys as equal', () => {
        const insertionOrder = canonicaliseMechanicsValue({ value: 'shield', grant: 'STARTING', choiceGroup: null });
        const jsonbOrder = canonicaliseMechanicsValue({ choiceGroup: null, value: 'shield', grant: 'STARTING' });
        expect(insertionOrder).toBe(jsonbOrder);
    });

    test('treats deeply nested objects with reordered keys as equal', () => {
        const left = canonicaliseMechanicsValue({
            level: 4,
            classSpecific: { rageDamage: '+2', rageCount: '3' },
        });
        const right = canonicaliseMechanicsValue({
            classSpecific: { rageCount: '3', rageDamage: '+2' },
            level: 4,
        });
        expect(left).toBe(right);
    });

    test('still distinguishes objects with genuinely different values', () => {
        const left = canonicaliseMechanicsValue({ value: 'shield', grant: 'STARTING' });
        const right = canonicaliseMechanicsValue({ value: 'shield', grant: 'MULTICLASS' });
        expect(left).not.toBe(right);
    });

    test('sorts a set-like collection into the same order regardless of input order or key order', () => {
        const rows = [
            { grant: 'STARTING', value: 'light-armor' },
            { value: 'simple-weapons', grant: 'STARTING' },
        ];
        const reversedWithReorderedKeys = [
            { grant: 'STARTING', value: 'simple-weapons' },
            { value: 'light-armor', grant: 'STARTING' },
        ];
        expect(sortByCanonicalForm(rows).map(canonicaliseMechanicsValue)).toEqual(
            sortByCanonicalForm(reversedWithReorderedKeys).map(canonicaliseMechanicsValue),
        );
    });

    test('preserves array element order (levels are not treated as set-like)', () => {
        const ordered = canonicaliseMechanicsValue([{ level: 1 }, { level: 2 }]);
        const reordered = canonicaliseMechanicsValue([{ level: 2 }, { level: 1 }]);
        expect(ordered).not.toBe(reordered);
    });
});

describe('locked custom class features', () => {
    test('rejects a newly-added feature without an existing id', () => {
        expect(() => assertLockedFeatureMembership(
            [{ id: 'existing-feature-id' }, { id: null }],
            [{ id: 'existing-feature-id' }],
        )).toThrow('Class feature membership is locked');
    });

    test('accepts the complete existing feature set', () => {
        expect(() => assertLockedFeatureMembership(
            [{ id: 'second-feature-id' }, { id: 'first-feature-id' }],
            [{ id: 'first-feature-id' }, { id: 'second-feature-id' }],
        )).not.toThrow();
    });

    test('rejects duplicate submitted feature ids', () => {
        expect(() => assertLockedFeatureMembership(
            [{ id: 'first-feature-id' }, { id: 'first-feature-id' }, { id: 'second-feature-id' }],
            [{ id: 'first-feature-id' }, { id: 'second-feature-id' }],
        )).toThrow('Class feature membership is locked');
    });
});
