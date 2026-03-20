import type { QuerySpellsArgs } from "../generated/graphql";

/**
 * Maps a range category name to the set of raw DB `range` values it covers.
 * "Self" and "Self (...)" variants are matched via startsWith in the resolver.
 */
export const RANGE_CATEGORY_VALUES: Record<string, string[]> = {
    self: [], // handled specially via startsWith
    touch: ['Touch'],
    short: ['5 feet', '10 feet', '15-foot cone', '15-foot cube', '20 feet', '30 feet'],
    medium: ['60 feet', '60ft', '90 feet', '90 ft', '100 feet', '120 feet'],
    long: ['150 feet', '300 feet', '500 feet', '1,000 feet', '1 mile', '500 miles'],
    sight: ['Sight'],
    special: ['Special', 'Unlimited'],
};

/**
 * Maps a duration category name to the set of raw DB `duration` values it covers.
 */
export const DURATION_CATEGORY_VALUES: Record<string, string[]> = {
    instantaneous: ['Instantaneous', 'Instantaneous (see below)', 'Instantaneous or 1 hour'],
    '1_round': ['1 round', 'Up to 1 round'],
    up_to_1_minute: ['1 minute', 'Up to 1 minute', 'Concentration, up to 1 minute'],
    up_to_10_minutes: ['10 minutes', 'Up to 10 minutes', 'Concentration, up to 10 minutes'],
    up_to_1_hour: ['1 hour', 'Up to 1 hour', 'Concentration, up to 1 hour', 'Instantaneous or 1 hour'],
    up_to_8_hours: ['6 hours', '8 hours', 'Up to 2 hours', 'Up to 8 hours', 'Concentration, up to 8 hours', 'Concentration, up to 6 rounds'],
    up_to_24_hours: ['24 hours', '24 Hours', 'Up to 24 hours', 'Concentration, up to 1 day'],
    days_plus: ['7 days', '10 days', '30 days'],
    until_dispelled: ['Until dispelled'],
    special: ['Special'],
};

/**
 * Maps a casting-time category name to the set of raw DB `castingTime` values it covers.
 * "1 reaction" variants are matched via startsWith in the resolver.
 */
export const CASTING_TIME_CATEGORY_VALUES: Record<string, string[]> = {
    '1_action': ['1 action', '1 Action'],
    '1_bonus_action': ['1 bonus action', '1 Bonus Action'],
    '1_reaction': [], // handled specially via startsWith
    '1_minute': ['1 minute'],
    '10_minutes': ['10 minutes'],
    '1_hour_plus': ['1 hour', '8 hours', '12 hours', '24 hours'],
};

export type WhereClause = Record<string, unknown>;

/**
 * Builds an OR clause array for range category filters.
 * Each selected category becomes one branch of the OR — e.g. selecting
 * "Self" and "Short" returns spells whose range matches either group.
 *
 * The "self" category is special-cased with `startsWith` because the DB
 * stores values like "Self", "Self (60-foot cone)", etc.
 */
export function buildRangeOr(categories: string[]): WhereClause[] {
    const conditions: WhereClause[] = [];
    for (const cat of categories) {
        if (cat === 'self') {
            conditions.push({ range: { startsWith: 'Self' } });
        } else {
            const values = RANGE_CATEGORY_VALUES[cat];
            if (values?.length) {
                conditions.push({ range: { in: values } });
            }
        }
    }
    return conditions;
}

/**
 * Builds an OR clause array for duration category filters.
 * Each category maps to a set of raw DB duration strings.
 */
export function buildDurationOr(categories: string[]): WhereClause[] {
    const conditions: WhereClause[] = [];
    for (const cat of categories) {
        const values = DURATION_CATEGORY_VALUES[cat];
        if (values?.length) {
            conditions.push({ duration: { in: values } });
        }
    }
    return conditions;
}

/**
 * Builds an OR clause array for casting-time category filters.
 * "1_reaction" is special-cased with `startsWith` because the DB stores
 * many variants like "1 reaction, which you take when…".
 */
export function buildCastingTimeOr(categories: string[]): WhereClause[] {
    const conditions: WhereClause[] = [];
    for (const cat of categories) {
        if (cat === '1_reaction') {
            conditions.push({ castingTime: { startsWith: '1 reaction' } });
        } else {
            const values = CASTING_TIME_CATEGORY_VALUES[cat];
            if (values?.length) {
                conditions.push({ castingTime: { in: values } });
            }
        }
    }
    return conditions;
}

/**
 * Converts a GraphQL `SpellFilter` input into a Prisma `where` clause.
 *
 * Simple filters (name, level, class, booleans) are applied as direct
 * field conditions. Category-based filters (range, duration, casting time)
 * each produce an OR group — if multiple category groups are active they're
 * combined with AND so a spell must match at least one option from *each*
 * active category.
 */
export function buildWhere(filter: QuerySpellsArgs['filter']): WhereClause {
    const where: WhereClause = {};

    if (!filter) return where;

    // Simple field filters
    if (filter.name) {
        where.name = { contains: filter.name, mode: 'insensitive' };
    }
    if (filter.levels && filter.levels.length > 0) {
        where.level = { in: filter.levels };
    }
    if (filter.classes && filter.classes.length > 0) {
        where.classIndexes = { hasSome: filter.classes };
    }
    if (filter.schools && filter.schools.length > 0) {
        where.schoolIndex = { in: filter.schools };
    }
    if (filter.ritual != null) {
        where.ritual = filter.ritual;
    }
    if (filter.hasHigherLevel != null) {
        where.higherLevel = filter.hasHigherLevel
            ? { isEmpty: false }
            : { isEmpty: true };
    }
    if (filter.components && filter.components.length > 0) {
        where.components = { hasSome: filter.components };
    }
    if (filter.hasMaterial != null) {
        where.material = filter.hasMaterial
            ? { not: null }
            : null;
    }
    if (filter.concentration != null) {
        where.concentration = filter.concentration;
    }

    // Category-based filters — each returns an OR group.
    // If multiple groups are active, they're ANDed together so a spell must
    // match at least one option from each active category.
    const orGroups: WhereClause[][] = [];

    if (filter.rangeCategories && filter.rangeCategories.length > 0) {
        const or = buildRangeOr(filter.rangeCategories as string[]);
        if (or.length > 0) orGroups.push(or);
    }
    if (filter.durationCategories && filter.durationCategories.length > 0) {
        const or = buildDurationOr(filter.durationCategories as string[]);
        if (or.length > 0) orGroups.push(or);
    }
    if (filter.castingTimeCategories && filter.castingTimeCategories.length > 0) {
        const or = buildCastingTimeOr(filter.castingTimeCategories as string[]);
        if (or.length > 0) orGroups.push(or);
    }

    if (orGroups.length === 1) {
        where.OR = orGroups[0];
    } else if (orGroups.length > 1) {
        where.AND = orGroups.map((group) => ({ OR: group }));
    }

    return where;
}
