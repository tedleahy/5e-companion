import type { Href } from 'expo-router';

/** Display and routing metadata for one Compendium category. */
type CompendiumCategory = {
    key: string;
    icon: string;
    label: string;
    href?: Href;
};

/**
 * Categories shown on the first Compendium release.
 *
 * Traits are embedded in their owning content types rather than managed as a category.
 */
export const COMPENDIUM_CATEGORIES = [
    { key: 'classes', icon: '⚔️', label: 'Classes', href: '/(rail)/compendium/classes' },
    {
        key: 'subclasses',
        icon: '✨',
        label: 'Subclasses',
        href: '/(rail)/compendium/subclasses',
    },
    {
        key: 'spells',
        icon: '📖',
        label: 'Spells',
        href: '/(rail)/compendium/spells',
    },
    { key: 'races', icon: '🧝', label: 'Races', href: undefined },
    { key: 'subraces', icon: '🌿', label: 'Subraces', href: undefined },
    { key: 'backgrounds', icon: '🎭', label: 'Backgrounds', href: undefined },
    { key: 'feats', icon: '🏅', label: 'Feats', href: undefined },
    { key: 'languages', icon: '🗣️', label: 'Languages', href: undefined },
] as const satisfies readonly CompendiumCategory[];

/** Stable keys inferred from the Compendium category definitions. */
export type CompendiumCategoryKey = (typeof COMPENDIUM_CATEGORIES)[number]['key'];
