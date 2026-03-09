import { gql } from '@apollo/client';

/**
 * Shared fields used when rendering spell lists.
 */
export const SPELL_LIST_FIELDS_FRAGMENT = gql`
    fragment SpellListFields on Spell {
        id
        name
        level
        schoolIndex
        castingTime
        range
        concentration
        ritual
    }
`;

/**
 * Shared character spellbook entry fields.
 */
export const CHARACTER_SPELLBOOK_ENTRY_FIELDS_FRAGMENT = gql`
    fragment CharacterSpellbookEntryFields on CharacterSpell {
        prepared
        spell {
            ...SpellListFields
        }
    }
    ${SPELL_LIST_FIELDS_FRAGMENT}
`;
