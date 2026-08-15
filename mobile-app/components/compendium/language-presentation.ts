import type { CompendiumLanguagesQuery } from '@/types/generated_graphql_types';

export type Language = CompendiumLanguagesQuery['compendiumLanguages'][number];

export function displayLanguageType(type: string | null | undefined) {
    if (!type) return 'Unknown type';
    return `${type.slice(0, 1).toLocaleUpperCase()}${type.slice(1).toLocaleLowerCase()}`;
}

export function languageScriptMark(script: string | null | undefined) {
    return script ? script.slice(0, 2) : '∅';
}
