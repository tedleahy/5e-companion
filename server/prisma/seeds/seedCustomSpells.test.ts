import { describe, expect, test } from 'bun:test';
import { filterNewSpellsByName } from './seedCustomSpells';

describe('filterNewSpellsByName', () => {
    test('excludes spell names that already exist regardless of case or whitespace', () => {
        const spells = [
            { name: 'Fireball' },
            { name: ' Shape Water ' },
            { name: 'Gift of Alacrity' },
        ];

        expect(filterNewSpellsByName(spells, ['fireBALL', 'shape water'])).toEqual([
            { name: 'Gift of Alacrity' },
        ]);
    });

    test('keeps only the first occurrence of a new spell name', () => {
        const spells = [
            { name: 'Gift of Alacrity', version: 1 },
            { name: 'gift OF alacrity', version: 2 },
        ];

        expect(filterNewSpellsByName(spells, [])).toEqual([
            { name: 'Gift of Alacrity', version: 1 },
        ]);
    });
});
