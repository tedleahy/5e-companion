/**
 * Render-ready feature row shown in Features tab cards.
 */
export type FeatureRow = {
    id: string;
    name: string;
    source: string;
    description: string;
    usesMax?: number | null;
    usesRemaining?: number | null;
    recharge?: string | null;
};

/**
 * Character trait metadata consumed by Features tab helpers/cards.
 */
export type CharacterTraitsData = {
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
    armorProficiencies?: string[] | null;
    weaponProficiencies?: string[] | null;
    toolProficiencies?: string[] | null;
    languages?: string[] | null;
};

/**
 * Proficiency/language groups rendered in the Proficiencies card.
 */
export type ProficienciesAndLanguages = {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
};
