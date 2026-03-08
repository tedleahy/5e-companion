import type { Prisma } from '@prisma/client';
import type { FragmentDefinitionNode, GraphQLResolveInfo, SelectionSetNode } from 'graphql';

/**
 * Default spell list selection used when resolver metadata is unavailable.
 *
 * Keeps the payload lean for list-style views while still covering the
 * metadata shown in the mobile spell list rows.
 */
export const DEFAULT_SPELL_LIST_SELECT: Prisma.SpellSelect = {
    id: true,
    name: true,
    level: true,
    schoolIndex: true,
    castingTime: true,
    range: true,
    concentration: true,
    ritual: true,
};

/**
 * Spell fields that are safe to expose through GraphQL `Spell` queries.
 *
 * We only include fields present on the schema's `Spell` type so the Prisma
 * query never fetches unrelated columns.
 */
const SPELL_SELECTABLE_FIELDS: ReadonlySet<keyof Prisma.SpellSelect> = new Set([
    'id',
    'name',
    'level',
    'schoolIndex',
    'classIndexes',
    'description',
    'higherLevel',
    'range',
    'components',
    'material',
    'ritual',
    'duration',
    'concentration',
    'castingTime',
    'sourceBook',
]);

/**
 * Recursively collects selected GraphQL field names from a selection set.
 */
function collectSelectedFieldNames(
    selectionSet: SelectionSetNode | undefined,
    fragments: Record<string, FragmentDefinitionNode>,
    selectedFieldNames: Set<string>,
): void {
    if (!selectionSet) return;

    for (const selection of selectionSet.selections) {
        if (selection.kind === 'Field') {
            selectedFieldNames.add(selection.name.value);
            continue;
        }

        if (selection.kind === 'InlineFragment') {
            collectSelectedFieldNames(selection.selectionSet, fragments, selectedFieldNames);
            continue;
        }

        if (selection.kind === 'FragmentSpread') {
            const fragment = fragments[selection.name.value];
            if (fragment) {
                collectSelectedFieldNames(fragment.selectionSet, fragments, selectedFieldNames);
            }
        }
    }
}

/**
 * Builds a Prisma `SpellSelect` from GraphQL resolver info.
 *
 * This allows the resolver to fetch only fields requested by the client,
 * reducing row width and transfer cost for list queries.
 */
export function buildSpellSelect(info?: GraphQLResolveInfo): Prisma.SpellSelect {
    if (!info) return DEFAULT_SPELL_LIST_SELECT;

    const selectedFieldNames = new Set<string>();
    for (const fieldNode of info.fieldNodes) {
        collectSelectedFieldNames(fieldNode.selectionSet, info.fragments, selectedFieldNames);
    }

    const select: Prisma.SpellSelect = {};
    for (const fieldName of selectedFieldNames) {
        if (SPELL_SELECTABLE_FIELDS.has(fieldName as keyof Prisma.SpellSelect)) {
            select[fieldName as keyof Prisma.SpellSelect] = true;
        }
    }

    if (Object.keys(select).length > 0) return select;
    return DEFAULT_SPELL_LIST_SELECT;
}
