import { CHARACTER_SEARCH_MAX_LENGTH, clampCharacterSearch } from './characters';

/** How the API counts a search's length. */
function codePoints(text: string): number {
    return Array.from(text).length;
}

describe('clampCharacterSearch', () => {
    it.each([
        ['an empty search', ''],
        ['a short search', 'thorn'],
        ['exactly the limit', 'a'.repeat(100)],
        ['100 emoji, each one code point but two UTF-16 units', '🐈'.repeat(100)],
    ])('leaves %s alone', (_description, search) => {
        expect(clampCharacterSearch(search)).toBe(search);
    });

    it('trims surrounding whitespace', () => {
        expect(clampCharacterSearch('  thorn \n')).toBe('thorn');
    });

    it('leaves surrounding whitespace out of the count', () => {
        const search = 'a'.repeat(CHARACTER_SEARCH_MAX_LENGTH);

        expect(clampCharacterSearch(`   ${search}   `)).toBe(search);
    });

    it('cuts a long search to the limit in code points', () => {
        expect(clampCharacterSearch('a'.repeat(150))).toBe('a'.repeat(CHARACTER_SEARCH_MAX_LENGTH));
    });

    it.each([
        ['a flag', '🇬🇧'],
        ['a joined emoji', '👩‍👩‍👧'],
        ['a letter with a combining accent', 'e\u0301'],
    ])('drops %s whole when the limit falls inside it', (_description, grapheme) => {
        const clamped = clampCharacterSearch(`${'a'.repeat(99)}${grapheme}`);

        expect(clamped).toBe('a'.repeat(99));

        expect(codePoints(clamped)).toBeLessThanOrEqual(CHARACTER_SEARCH_MAX_LENGTH);
    });

    it('keeps a grapheme that ends exactly at the limit', () => {
        const search = `${'a'.repeat(98)}🇬🇧b`;

        expect(clampCharacterSearch(search)).toBe(`${'a'.repeat(98)}🇬🇧`);
    });

    it('trims a space left at the end of the cut', () => {
        expect(clampCharacterSearch(`${'a'.repeat(99)} bcd`)).toBe('a'.repeat(99));
    });
});
