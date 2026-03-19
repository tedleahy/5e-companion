import type { CharacterFeature, Traits } from '@/types/generated_graphql_types';

/**
 * Render-ready feature row shown in Features tab cards.
 */
export type FeatureRow = CharacterFeature;

/**
 * Character trait metadata consumed by Features tab helpers/cards.
 */
export type CharacterTraitsData = Traits;

/**
 * Proficiency/language groups rendered in the Proficiencies card.
 */
export type ProficienciesAndLanguages = {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
};
