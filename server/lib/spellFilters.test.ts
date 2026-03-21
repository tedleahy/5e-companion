import { describe, expect, test } from 'bun:test';
import {
    buildWhere,
    buildRangeOr,
    buildDurationOr,
    buildCastingTimeOr,
    RANGE_CATEGORY_VALUES,
    DURATION_CATEGORY_VALUES,
    CASTING_TIME_CATEGORY_VALUES,
} from './spellFilters';

// ---------------------------------------------------------------------------
// buildWhere — no filter / empty filter
// ---------------------------------------------------------------------------
describe('buildWhere', () => {
    test('returns empty object when filter is undefined', () => {
        expect(buildWhere(undefined)).toEqual({});
    });

    test('returns empty object when filter is null', () => {
        expect(buildWhere(null)).toEqual({});
    });

    test('returns empty object when filter has no active fields', () => {
        expect(buildWhere({})).toEqual({});
    });

    // -----------------------------------------------------------------------
    // Simple field filters
    // -----------------------------------------------------------------------
    test('name filter produces contains + insensitive', () => {
        const result = buildWhere({ name: 'fire' });
        expect(result.name).toEqual({ contains: 'fire', mode: 'insensitive' });
    });

    test('levels filter produces in clause', () => {
        const result = buildWhere({ levels: [0, 3] });
        expect(result.level).toEqual({ in: [0, 3] });
    });

    test('empty levels array is ignored', () => {
        const result = buildWhere({ levels: [] });
        expect(result.level).toBeUndefined();
    });

    test('classes filter produces hasSome clause', () => {
        const result = buildWhere({ classes: ['wizard', 'cleric'] });
        expect(result.classIndexes).toEqual({ hasSome: ['wizard', 'cleric'] });
    });

    test('empty classes array is ignored', () => {
        const result = buildWhere({ classes: [] });
        expect(result.classIndexes).toBeUndefined();
    });

    test('schools filter produces in clause on schoolIndex', () => {
        const result = buildWhere({ schools: ['evocation', 'abjuration'] });
        expect(result.schoolIndex).toEqual({ in: ['evocation', 'abjuration'] });
    });

    test('empty schools array is ignored', () => {
        const result = buildWhere({ schools: [] });
        expect(result.schoolIndex).toBeUndefined();
    });

    test('ritual true is passed through', () => {
        expect(buildWhere({ ritual: true }).ritual).toBe(true);
    });

    test('ritual false is passed through', () => {
        expect(buildWhere({ ritual: false }).ritual).toBe(false);
    });

    test('concentration true is passed through', () => {
        expect(buildWhere({ concentration: true }).concentration).toBe(true);
    });

    test('concentration false is passed through', () => {
        expect(buildWhere({ concentration: false }).concentration).toBe(false);
    });

    test('hasHigherLevel true produces isEmpty false', () => {
        expect(buildWhere({ hasHigherLevel: true }).higherLevel).toEqual({ isEmpty: false });
    });

    test('hasHigherLevel false produces isEmpty true', () => {
        expect(buildWhere({ hasHigherLevel: false }).higherLevel).toEqual({ isEmpty: true });
    });

    test('components filter produces hasSome clause', () => {
        const result = buildWhere({ components: ['V', 'S'] });
        expect(result.components).toEqual({ hasSome: ['V', 'S'] });
    });

    test('hasMaterial true produces not null', () => {
        expect(buildWhere({ hasMaterial: true }).material).toEqual({ not: null });
    });

    test('hasMaterial false produces null', () => {
        expect(buildWhere({ hasMaterial: false }).material).toBeNull();
    });

    // -----------------------------------------------------------------------
    // Category-based filters — single group uses OR directly
    // -----------------------------------------------------------------------
    test('single range category group sets OR on where', () => {
        const result = buildWhere({ rangeCategories: ['touch'] });
        expect(result.OR).toBeDefined();
        expect(result.AND).toBeUndefined();
    });

    test('single duration category group sets OR on where', () => {
        const result = buildWhere({ durationCategories: ['instantaneous'] });
        expect(result.OR).toBeDefined();
        expect(result.AND).toBeUndefined();
    });

    // -----------------------------------------------------------------------
    // Multiple category groups are ANDed
    // -----------------------------------------------------------------------
    test('two category groups produce AND with nested ORs', () => {
        const result = buildWhere({
            rangeCategories: ['touch'],
            durationCategories: ['instantaneous'],
        });
        expect(result.AND).toBeDefined();
        expect(Array.isArray(result.AND)).toBe(true);
        expect((result.AND as unknown[]).length).toBe(2);
        expect(result.OR).toBeUndefined();
    });

    test('three category groups produce AND with three nested ORs', () => {
        const result = buildWhere({
            rangeCategories: ['touch'],
            durationCategories: ['instantaneous'],
            castingTimeCategories: ['1_action'],
        });
        expect((result.AND as unknown[]).length).toBe(3);
    });

    // -----------------------------------------------------------------------
    // Combining simple + category filters
    // -----------------------------------------------------------------------
    test('simple and category filters coexist', () => {
        const result = buildWhere({
            name: 'fire',
            levels: [3],
            rangeCategories: ['self'],
        });
        expect(result.name).toEqual({ contains: 'fire', mode: 'insensitive' });
        expect(result.level).toEqual({ in: [3] });
        expect(result.OR).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// buildRangeOr
// ---------------------------------------------------------------------------
describe('buildRangeOr', () => {
    test('self category uses startsWith', () => {
        const result = buildRangeOr(['self']);
        expect(result).toEqual([{ range: { startsWith: 'Self' } }]);
    });

    test('touch category uses in with Touch values', () => {
        const result = buildRangeOr(['touch']);
        expect(result).toEqual([{ range: { in: RANGE_CATEGORY_VALUES.touch } }]);
    });

    test('multiple categories produce multiple conditions', () => {
        const result = buildRangeOr(['self', 'short', 'long']);
        expect(result.length).toBe(3);
        expect(result[0]).toEqual({ range: { startsWith: 'Self' } });
        expect(result[1]).toEqual({ range: { in: RANGE_CATEGORY_VALUES.short } });
        expect(result[2]).toEqual({ range: { in: RANGE_CATEGORY_VALUES.long } });
    });

    test('unknown category is safely ignored', () => {
        const result = buildRangeOr(['nonexistent']);
        expect(result).toEqual([]);
    });

    test('empty array returns empty', () => {
        expect(buildRangeOr([])).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// buildDurationOr
// ---------------------------------------------------------------------------
describe('buildDurationOr', () => {
    test('instantaneous category maps to correct values', () => {
        const result = buildDurationOr(['instantaneous']);
        expect(result).toEqual([{ duration: { in: DURATION_CATEGORY_VALUES.instantaneous } }]);
    });

    test('multiple categories produce multiple conditions', () => {
        const result = buildDurationOr(['instantaneous', 'up_to_1_hour']);
        expect(result.length).toBe(2);
    });

    test('unknown category is safely ignored', () => {
        expect(buildDurationOr(['bogus'])).toEqual([]);
    });

    test('empty array returns empty', () => {
        expect(buildDurationOr([])).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// buildCastingTimeOr
// ---------------------------------------------------------------------------
describe('buildCastingTimeOr', () => {
    test('1_reaction uses startsWith', () => {
        const result = buildCastingTimeOr(['1_reaction']);
        expect(result).toEqual([{ castingTime: { startsWith: '1 reaction' } }]);
    });

    test('1_action uses in with correct values', () => {
        const result = buildCastingTimeOr(['1_action']);
        expect(result).toEqual([{ castingTime: { in: CASTING_TIME_CATEGORY_VALUES['1_action'] } }]);
    });

    test('multiple categories produce multiple conditions', () => {
        const result = buildCastingTimeOr(['1_action', '1_reaction', '1_minute']);
        expect(result.length).toBe(3);
        expect(result[1]).toEqual({ castingTime: { startsWith: '1 reaction' } });
    });

    test('unknown category is safely ignored', () => {
        expect(buildCastingTimeOr(['nope'])).toEqual([]);
    });

    test('empty array returns empty', () => {
        expect(buildCastingTimeOr([])).toEqual([]);
    });
});
