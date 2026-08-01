import { formatMulticlassPrerequisiteRules } from '@/lib/multiclassPrerequisites';

describe('formatMulticlassPrerequisiteRules', () => {
    test('returns None for an empty rule list', () => {
        expect(formatMulticlassPrerequisiteRules([])).toBe('None');
    });

    test('joins rules in the same group with or', () => {
        expect(
            formatMulticlassPrerequisiteRules([
                { abilityIndex: 'str', minimum: 13, group: 0 },
                { abilityIndex: 'dex', minimum: 13, group: 0 },
            ]),
        ).toBe('STR 13 or DEX 13');
    });

    test('joins distinct groups with and', () => {
        expect(
            formatMulticlassPrerequisiteRules([
                { abilityIndex: 'dex', minimum: 13, group: 0 },
                { abilityIndex: 'wis', minimum: 13, group: 1 },
            ]),
        ).toBe('DEX 13 and WIS 13');
    });

    test('preserves OR-within-group and AND-across-groups together', () => {
        expect(
            formatMulticlassPrerequisiteRules([
                { abilityIndex: 'str', minimum: 13, group: 0 },
                { abilityIndex: 'dex', minimum: 13, group: 0 },
                { abilityIndex: 'cha', minimum: 13, group: 1 },
            ]),
        ).toBe('STR 13 or DEX 13 and CHA 13');
    });
});
