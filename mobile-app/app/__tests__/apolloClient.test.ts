import { gql } from '@apollo/client';
import { describe, expect, it, jest } from '@jest/globals';
import { createApolloCache } from '../apolloClient';

const CHARACTER_SPELLBOOK_QUERY = gql`
    query CharacterSpellbookCacheTest($id: ID!) {
        character(id: $id) {
            __typename
            id
            spellbook {
                __typename
                prepared
                spell {
                    __typename
                    id
                }
            }
        }
    }
`;

describe('createApolloCache', () => {
    it('replaces character spellbook snapshots without Apollo merge warnings', () => {
        const cache = createApolloCache();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        cache.writeQuery({
            query: CHARACTER_SPELLBOOK_QUERY,
            variables: { id: 'character-1' },
            data: {
                character: {
                    __typename: 'Character',
                    id: 'character-1',
                    spellbook: [
                        {
                            __typename: 'CharacterSpell',
                            prepared: false,
                            spell: {
                                __typename: 'Spell',
                                id: 'spell-1',
                            },
                        },
                        {
                            __typename: 'CharacterSpell',
                            prepared: false,
                            spell: {
                                __typename: 'Spell',
                                id: 'spell-2',
                            },
                        },
                    ],
                },
            },
        });

        cache.writeQuery({
            query: CHARACTER_SPELLBOOK_QUERY,
            variables: { id: 'character-1' },
            data: {
                character: {
                    __typename: 'Character',
                    id: 'character-1',
                    spellbook: [
                        {
                            __typename: 'CharacterSpell',
                            prepared: false,
                            spell: {
                                __typename: 'Spell',
                                id: 'spell-1',
                            },
                        },
                    ],
                },
            },
        });

        expect(cache.readQuery({
            query: CHARACTER_SPELLBOOK_QUERY,
            variables: { id: 'character-1' },
        })).toEqual({
            character: {
                __typename: 'Character',
                id: 'character-1',
                spellbook: [
                    {
                        __typename: 'CharacterSpell',
                        prepared: false,
                        spell: {
                            __typename: 'Spell',
                            id: 'spell-1',
                        },
                    },
                ],
            },
        });
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
});
