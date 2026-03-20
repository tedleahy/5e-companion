import { gql } from '@apollo/client';
import { SPELL_LIST_FIELDS_FRAGMENT } from '@/graphql/spell.fragments';

/**
 * GraphQL query used by the Add Spell sheet list.
 */
export const SEARCH_SPELLS_FOR_SHEET = gql`
    query AddSpellSheetSpells($filter: SpellFilter, $pagination: SpellPagination) {
        spells(filter: $filter, pagination: $pagination) {
            ...SpellListFields
            classIndexes
        }
    }
    ${SPELL_LIST_FIELDS_FRAGMENT}
`;

/**
 * GraphQL query for loading one spell's full details in the add-sheet modal.
 */
export const GET_SPELL_DETAIL_FOR_SHEET = gql`
    query AddSpellSheetSpellDetail($id: ID!) {
        spell(id: $id) {
            ...SpellListFields
            classIndexes
            description
            higherLevel
            components
            material
            duration
        }
    }
    ${SPELL_LIST_FIELDS_FRAGMENT}
`;
