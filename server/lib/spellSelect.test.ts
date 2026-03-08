import { describe, expect, test } from 'bun:test';
import type { GraphQLResolveInfo } from 'graphql';
import { buildSpellSelect, DEFAULT_SPELL_LIST_SELECT } from './spellSelect';

/**
 * Builds a minimal `GraphQLResolveInfo` shape for unit tests.
 */
function createInfo(): GraphQLResolveInfo {
    return {
        fieldNodes: [{
            kind: 'Field',
            name: { kind: 'Name', value: 'spells' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [],
            },
        }],
        fragments: {},
    } as unknown as GraphQLResolveInfo;
}

describe('buildSpellSelect', () => {
    test('returns default list select when info is missing', () => {
        expect(buildSpellSelect()).toEqual(DEFAULT_SPELL_LIST_SELECT);
    });

    test('builds select from direct spell field selections', () => {
        const info = {
            fieldNodes: [{
                kind: 'Field',
                name: { kind: 'Name', value: 'spells' },
                selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                        { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                        { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                        { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    ],
                },
            }],
            fragments: {},
        } as unknown as GraphQLResolveInfo;

        expect(buildSpellSelect(info)).toEqual({
            id: true,
            name: true,
            description: true,
        });
    });

    test('includes fields selected through named fragments', () => {
        const info = {
            fieldNodes: [{
                kind: 'Field',
                name: { kind: 'Name', value: 'spells' },
                selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                        {
                            kind: 'FragmentSpread',
                            name: { kind: 'Name', value: 'SpellListFields' },
                        },
                    ],
                },
            }],
            fragments: {
                SpellListFields: {
                    kind: 'FragmentDefinition',
                    name: { kind: 'Name', value: 'SpellListFields' },
                    typeCondition: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: 'Spell' },
                    },
                    selectionSet: {
                        kind: 'SelectionSet',
                        selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                        ],
                    },
                },
            },
        } as unknown as GraphQLResolveInfo;

        expect(buildSpellSelect(info)).toEqual({
            id: true,
            level: true,
        });
    });

    test('falls back to default list select when nothing selectable is requested', () => {
        const info = createInfo();

        expect(buildSpellSelect(info)).toEqual(DEFAULT_SPELL_LIST_SELECT);
    });
});
