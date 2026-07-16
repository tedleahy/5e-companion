import { describe, expect, test } from 'bun:test';
import type { ManagedCustomClassInput } from '../../generated/graphql';
import { assertLockedFeatureMembership, normaliseClassInput } from './customClassManager';

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
