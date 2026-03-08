import type {
    CharacterTraitsData,
    FeatureRow,
    ProficienciesAndLanguages,
} from '@/components/character-sheet/features/features.types';

/**
 * Feature buckets rendered in the Features tab.
 */
type GroupedFeatures = {
    classFeatures: FeatureRow[];
    racialTraits: FeatureRow[];
    feats: FeatureRow[];
};

/**
 * Normalizes labels for token-based matching.
 */
function normalizeLabel(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Splits a value into normalized tokens for source matching.
 */
function tokens(value: string): Set<string> {
    return new Set(
        normalizeLabel(value)
            .split(' ')
            .filter((part) => part.length > 0),
    );
}

/**
 * Groups features into class, racial, and feat sections.
 */
export function groupFeatures(
    features: FeatureRow[],
    className: string,
    race: string,
): GroupedFeatures {
    const classFeatures: FeatureRow[] = [];
    const racialTraits: FeatureRow[] = [];
    const feats: FeatureRow[] = [];

    const classTokens = tokens(className);
    const raceTokens = tokens(race);

    for (const feature of features) {
        const source = normalizeLabel(feature.source);
        const sourceTokens = tokens(feature.source);

        if (source.includes('feat')) {
            feats.push(feature);
            continue;
        }

        const isRacial = Array.from(raceTokens).some((token) => sourceTokens.has(token));
        if (isRacial) {
            racialTraits.push(feature);
            continue;
        }

        const isClassFeature = Array.from(classTokens).some((token) => sourceTokens.has(token));
        if (isClassFeature) {
            classFeatures.push(feature);
            continue;
        }

        classFeatures.push(feature);
    }

    return { classFeatures, racialTraits, feats };
}

/**
 * Maps storage recharge values to UI labels.
 */
export function rechargeLabel(recharge: string | null | undefined): string | null {
    if (!recharge) return null;

    const normalizedRecharge = recharge.trim().toLowerCase();

    if (normalizedRecharge === 'short') return 'Short Rest';
    if (normalizedRecharge === 'long') return 'Long Rest';
    if (normalizedRecharge === 'dawn') return 'At Dawn';

    return recharge;
}

/**
 * Returns a clamped remaining-uses value for a feature.
 */
export function availableUses(feature: FeatureRow): number {
    if (!feature.usesMax || feature.usesMax <= 0) return 0;
    if (feature.usesRemaining === null || feature.usesRemaining === undefined) return feature.usesMax;

    return Math.max(0, Math.min(feature.usesMax, feature.usesRemaining));
}

/**
 * Returns only proficiencies/languages present in character traits metadata.
 */
export function deriveProficienciesAndLanguages(
    traits: CharacterTraitsData,
): ProficienciesAndLanguages {
    return {
        armor: normalizedValues(traits.armorProficiencies),
        weapons: normalizedValues(traits.weaponProficiencies),
        tools: normalizedValues(traits.toolProficiencies),
        languages: normalizedValues(traits.languages),
    };
}

/**
 * Trims, removes empty entries, and deduplicates a values list.
 */
function normalizedValues(values: string[] | null | undefined): string[] {
    if (!values || values.length === 0) return [];

    const cleaned = values
        .map(value => value.trim())
        .filter(value => value.length > 0);

    return [...new Set(cleaned)];
}
