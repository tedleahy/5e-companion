import { splitGraphemes } from 'unicode-segmenter/grapheme';

import { apiFetch } from './client';

/** `level` puts the highest total level first. Both sorts then order by name. */
export type CharacterSort = 'level' | 'name';

/** The API's maximum trimmed name-search length, counted in Unicode code points. */
export const CHARACTER_SEARCH_MAX_LENGTH = 100;

/**
 * Trims a search and shortens it to `CHARACTER_SEARCH_MAX_LENGTH`, which a longer search would
 * fail with a 400. Whole graphemes are dropped from the end, so a flag, a joined emoji or an
 * accented letter is never cut in half.
 *
 * @param search - The search as typed, surrounding whitespace and all.
 */
export function clampCharacterSearch(search: string): string {
    const trimmed = search.trim();
    // The API counts code points, which is what Array.from splits a string into.
    if (Array.from(trimmed).length <= CHARACTER_SEARCH_MAX_LENGTH) return trimmed;

    let clamped = '';
    let codePoints = 0;
    for (const grapheme of splitGraphemes(trimmed)) {
        codePoints += Array.from(grapheme).length;
        if (codePoints > CHARACTER_SEARCH_MAX_LENGTH) break;
        clamped += grapheme;
    }

    // The cut can land just after a space, which the API would trim anyway.
    return clamped.trimEnd();
}

export type CharacterClassSummary = {
    name: string;
    level: number;
    subclass_name: string | null;
};

/** A character as the list returns it, with only what a list row shows. */
export type CharacterSummary = {
    id: string;
    name: string;
    ancestry: {
        race_name: string | null;
        subrace_name: string | null;
    };
    /** In the character's stored order. Empty for a character with no classes. */
    classes: CharacterClassSummary[];
    /** 0 when the character has no classes. */
    total_level: number;
    hit_points: {
        current: number | null;
        maximum: number | null;
        temporary: number;
    };
};

/** A new character that the player hasn't finished creating. */
export type CreationDraft = {
    id: string;
    kind: 'creation';
    name: string | null;
    completed_choices: number;
    total_choices: number;
    next_step: string;
};

/** A level-up that the player has started but not confirmed. */
export type LevelUpDraft = {
    id: string;
    kind: 'level_up';
    character_id: string;
    character_name: string;
    from_level: number;
    to_level: number;
    completed_choices: number;
    total_choices: number;
    next_step: string;
};

export type Draft = CreationDraft | LevelUpDraft;

/** The body of `GET /api/v1/characters`. */
export type CharacterList = {
    characters: CharacterSummary[];
    drafts: Draft[];
};

/** The query parameters for `GET /api/v1/characters`. */
export type CharacterListParams = {
    /** A trimmed, non-blank name search of at most 100 code points, or undefined for every character. */
    q?: string;
    sort: CharacterSort;
};

/**
 * The query key for one search and sort. Everything under `['characters']` shares a prefix.
 *
 * @param params.q - The trimmed name search, or undefined to cache the whole list.
 * @param params.sort - The character order that distinguishes this cache entry.
 */
export function characterListQueryKey({ q, sort }: CharacterListParams) {
    return ['characters', 'list', { q, sort }] as const;
}

/**
 * Fetches the character list. Throws as `apiFetch` does.
 *
 * @param params.q - The trimmed name search, or undefined to fetch every character.
 * @param params.sort - The order to request from the API.
 * @param signal - Cancels the request when its results are no longer needed.
 */
export function fetchCharacterList(
    { q, sort }: CharacterListParams,
    signal?: AbortSignal,
): Promise<CharacterList> {
    return apiFetch<CharacterList>('/api/v1/characters', { query: { q, sort }, signal });
}
