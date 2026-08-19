export type SearchValue = string | number | null | undefined | readonly SearchValue[];

/** Case-insensitive collection search across strings, numbers, and nested lists. */
export function matchesCompendiumSearch(query: string, ...values: SearchValue[]) {
    const needle = query.trim().toLocaleLowerCase();
    if (needle === '') return true;

    function flatten(value: SearchValue): string {
        if (Array.isArray(value)) return value.map(flatten).join(' ');
        return value == null ? '' : String(value);
    }

    return values.some((value) => flatten(value).toLocaleLowerCase().includes(needle));
}

/** Two-letter mark used when a category has no domain-specific symbol. */
export function entryInitials(name: string) {
    const words = name.trim().split(/[\s-]+/).filter(Boolean);
    if (words.length === 0) return '—';
    if (words.length === 1) return words[0]!.slice(0, 2).toLocaleUpperCase();
    return `${words[0]![0]}${words[1]![0]}`.toLocaleUpperCase();
}

export function sourceLabel(sourceBook: string | null | undefined, isCustom: boolean) {
    return sourceBook ?? (isCustom ? 'Personal compendium' : 'SRD');
}

export function countLabel(count: number, singular: string, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function listOrFallback(values: readonly string[], fallback = 'None listed') {
    return values.length > 0 ? values.join(', ') : fallback;
}

/**
 * Plural for a browse noun. Naive `+s` breaks on `subclass`, so sibilant
 * endings take `es` instead.
 */
export function pluralNoun(noun: string) {
    return /(?:s|x|z|ch|sh)$/i.test(noun) ? `${noun}es` : `${noun}s`;
}
