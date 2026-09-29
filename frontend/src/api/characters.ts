import { apiFetch } from './client';

/** `level` puts the highest total level first. Both sorts then order by name. */
export type CharacterSort = 'level' | 'name';

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
  /** A trimmed, non-blank name search, or undefined for every character. */
  q?: string;
  sort: CharacterSort;
};

/** The query key for one search and sort. Everything under `['characters']` shares a prefix. */
export function characterListQueryKey({ q, sort }: CharacterListParams) {
  return ['characters', 'list', { q, sort }] as const;
}

/** Fetches the character list. Throws as `apiFetch` does. */
export function fetchCharacterList(
  { q, sort }: CharacterListParams,
  signal?: AbortSignal,
): Promise<CharacterList> {
  return apiFetch<CharacterList>('/api/v1/characters', { query: { q, sort }, signal });
}
