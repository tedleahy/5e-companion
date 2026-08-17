import { hasRecordedScript } from '@shared/compendium/languageScript';
import type { CompendiumLanguagesQuery } from '@/types/generated_graphql_types';

export { hasRecordedScript };

export type Language = CompendiumLanguagesQuery['compendiumLanguages'][number];

/** Title-cases a language type such as Standard or Exotic. */
export function displayLanguageType(type: string | null | undefined) {
    if (!type) return 'Unknown type';
    return `${type.slice(0, 1).toLocaleUpperCase()}${type.slice(1).toLocaleLowerCase()}`;
}

/** Two-letter script cartouche, or an empty-set mark when the script is unknown. */
export function languageScriptMark(script: string | null | undefined) {
    return hasRecordedScript(script) ? script.slice(0, 2) : '∅';
}

/** Hero lede for a language detail, per the browse design. */
export function speakerSummary(typicalSpeakers: readonly string[]) {
    if (typicalSpeakers.length === 0) return 'No typical speakers are listed.';
    return `Typically spoken by ${typicalSpeakers.join(' and ')}.`;
}

/** Script label used by pills, filters, and row meta. */
export function scriptLabel(script: string | null | undefined) {
    return hasRecordedScript(script) ? `${script} script` : 'Unwritten / unknown';
}
