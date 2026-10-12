import { ApiError } from '@/api/client';
import type { CharacterList, CharacterSummary, Draft } from '@/api/characters';

import { listState, showsCreate, showsSearch, type ListStateInput } from './list-state';

const thorn: CharacterSummary = {
    id: '1',
    name: 'Thorn Grimsby',
    ancestry: { race_name: 'Dwarf', subrace_name: 'Mountain dwarf' },
    classes: [{ name: 'Fighter', level: 8, subclass_name: 'Champion' }],
    total_level: 8,
    hit_points: { current: 68, maximum: 72, temporary: 0 },
};

const nyra: Draft = {
    id: '11',
    kind: 'creation',
    name: 'Nyra Ashfall',
    completed_choices: 2,
    total_choices: 5,
    next_step: 'choose_class',
};

const withCharacters: CharacterList = { characters: [thorn], drafts: [nyra] };
const nothing: CharacterList = { characters: [], drafts: [] };
const draftsOnly: CharacterList = { characters: [], drafts: [nyra] };

/** A loaded, unsearched list with no error, changed by `overrides`. */
function input(overrides: Partial<ListStateInput>): ListStateInput {
    return {
        data: withCharacters,
        error: null,
        shownSearch: undefined,
        retrying: false,
        ...overrides,
    };
}

describe('listState', () => {
    it('is loading before the first response', () => {
        expect(listState(input({ data: undefined }))).toEqual({ kind: 'loading' });
    });

    it('shows the list while a search loads, since the previous results stay', () => {
        expect(listState(input({ shownSearch: 'thorn' }))).toEqual({
            kind: 'list',
            list: withCharacters,
        });
    });

    it('is empty with no search, no characters and no drafts', () => {
        expect(listState(input({ data: nothing }))).toEqual({ kind: 'empty' });
    });

    it('shows drafts alone with no search and no characters', () => {
        expect(listState(input({ data: draftsOnly }))).toEqual({
            kind: 'draftsOnly',
            drafts: [nyra],
        });
    });

    it('reports no results for a search with no characters, keeping the drafts', () => {
        expect(listState(input({ data: draftsOnly, shownSearch: 'Zephyr' }))).toEqual({
            kind: 'noResults',
            search: 'Zephyr',
            drafts: [nyra],
        });
    });

    it('reports no results with no drafts either', () => {
        expect(listState(input({ data: nothing, shownSearch: 'Zephyr' }))).toEqual({
            kind: 'noResults',
            search: 'Zephyr',
            drafts: [],
        });
    });

    it('is signed out on a 401', () => {
        const error = new ApiError(401, 'unauthorized', 'Unauthorized');

        expect(listState(input({ data: undefined, error }))).toEqual({ kind: 'signedOut' });
    });

    it('has failed on any other error status', () => {
        const error = new ApiError(500, null, 'Internal server error');

        expect(listState(input({ data: undefined, error }))).toEqual({ kind: 'failed' });
    });

    it('has failed on a network error', () => {
        const error = new TypeError('Network request failed');

        expect(listState(input({ data: undefined, error }))).toEqual({ kind: 'failed' });
    });

    it('lets an error replace a list already on screen', () => {
        const error = new TypeError('Network request failed');

        expect(listState(input({ error }))).toEqual({ kind: 'failed' });
    });

    it('is loading while Try again runs, even with an earlier list to show', () => {
        expect(listState(input({ retrying: true }))).toEqual({ kind: 'loading' });
    });
});

describe('showsSearch', () => {
    it('shows search where there is a list to search, or soon will be', () => {
        expect(showsSearch({ kind: 'loading' }, '')).toBe(true);

        expect(showsSearch({ kind: 'failed' }, '')).toBe(true);

        expect(showsSearch({ kind: 'list', list: withCharacters }, '')).toBe(true);

        expect(showsSearch({ kind: 'noResults', search: 'Zephyr', drafts: [] }, '')).toBe(true);
    });

    it('keeps search while the player has typed one, even over an empty unsearched list', () => {
        expect(showsSearch({ kind: 'empty' }, 'Zephyr')).toBe(true);

        expect(showsSearch({ kind: 'draftsOnly', drafts: [nyra] }, 'Zephyr')).toBe(true);
    });

    it('counts a search of only spaces as no search', () => {
        expect(showsSearch({ kind: 'empty' }, '   ')).toBe(false);
    });

    it('hides search when signed out, whatever was typed', () => {
        expect(showsSearch({ kind: 'signedOut' }, 'Zephyr')).toBe(false);
    });

    it('hides search when there is nothing to search', () => {
        expect(showsSearch({ kind: 'empty' }, '')).toBe(false);

        expect(showsSearch({ kind: 'draftsOnly', drafts: [nyra] }, '')).toBe(false);

        expect(showsSearch({ kind: 'signedOut' }, '')).toBe(false);
    });
});

describe('showsCreate', () => {
    it('hides Create character only when signed out', () => {
        expect(showsCreate({ kind: 'signedOut' })).toBe(false);

        expect(showsCreate({ kind: 'failed' })).toBe(true);

        expect(showsCreate({ kind: 'empty' })).toBe(true);
    });
});
