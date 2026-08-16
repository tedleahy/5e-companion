import type { CompendiumLanguagesQuery } from '@/types/generated_graphql_types';

export type Language = CompendiumLanguagesQuery['compendiumLanguages'][number];

/** Title-cases a language type such as Standard or Exotic. */
export function displayLanguageType(type: string | null | undefined) {
    if (!type) return 'Unknown type';
    return `${type.slice(0, 1).toLocaleUpperCase()}${type.slice(1).toLocaleLowerCase()}`;
}

/** True when a language has a named script rather than missing metadata. */
export function hasRecordedScript(script: string | null | undefined): script is string {
    return script != null && script.trim() !== '';
}

/** Two-letter script cartouche, or an empty-set mark when the script is unknown. */
export function languageScriptMark(script: string | null | undefined) {
    return hasRecordedScript(script) ? script.slice(0, 2) : '∅';
}
