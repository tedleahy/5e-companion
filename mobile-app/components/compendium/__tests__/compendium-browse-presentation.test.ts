import {
    countLabel,
    entryInitials,
    listOrFallback,
    matchesCompendiumSearch,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';

describe('matchesCompendiumSearch', () => {
    it('matches every row when the query is blank', () => {
        expect(matchesCompendiumSearch('', 'Elf')).toBe(true);
        expect(matchesCompendiumSearch('   ', 'Elf')).toBe(true);
    });

    it('matches case-insensitively across strings, numbers, and nested lists', () => {
        expect(matchesCompendiumSearch('ELF', 'High Elf')).toBe(true);
        expect(matchesCompendiumSearch('30', null, 30)).toBe(true);
        expect(matchesCompendiumSearch('darkvision', ['Keen Senses', ['Darkvision']])).toBe(true);
    });

    it('ignores null and undefined members rather than matching them', () => {
        expect(matchesCompendiumSearch('null', null, undefined)).toBe(false);
        expect(matchesCompendiumSearch('orc', 'Elf', null, ['Dwarf'])).toBe(false);
    });
});

describe('entryInitials', () => {
    it('takes the first letter of the first two words', () => {
        expect(entryInitials('High Elf')).toBe('HE');
        expect(entryInitials('Folk Hero of the Realm')).toBe('FH');
    });

    it('splits on hyphens as well as whitespace', () => {
        expect(entryInitials('Half-Orc')).toBe('HO');
    });

    it('falls back to the first two letters of a single word', () => {
        expect(entryInitials('Acolyte')).toBe('AC');
        expect(entryInitials('X')).toBe('X');
    });

    it('returns a dash when there is nothing to abbreviate', () => {
        expect(entryInitials('')).toBe('—');
        expect(entryInitials('   ')).toBe('—');
    });
});

describe('sourceLabel', () => {
    it('prefers a recorded source book for both SRD and custom entries', () => {
        expect(sourceLabel('SRD 5.1', false)).toBe('SRD 5.1');
        expect(sourceLabel('Home campaign', true)).toBe('Home campaign');
    });

    it('falls back to an ownership-appropriate label', () => {
        expect(sourceLabel(null, false)).toBe('SRD');
        expect(sourceLabel(undefined, true)).toBe('Personal compendium');
    });
});

describe('countLabel', () => {
    it('pluralises by count, including zero', () => {
        expect(countLabel(1, 'trait')).toBe('1 trait');
        expect(countLabel(0, 'trait')).toBe('0 traits');
        expect(countLabel(2, 'trait')).toBe('2 traits');
    });

    it('accepts an irregular plural', () => {
        expect(countLabel(2, 'subrace', 'subraces')).toBe('2 subraces');
    });
});

describe('listOrFallback', () => {
    it('joins values and falls back when empty', () => {
        expect(listOrFallback(['Insight', 'Religion'])).toBe('Insight, Religion');
        expect(listOrFallback([])).toBe('None listed');
        expect(listOrFallback([], 'No skills')).toBe('No skills');
    });
});
