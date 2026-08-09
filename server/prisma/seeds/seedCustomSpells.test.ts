import { describe, expect, test } from 'bun:test';
import { SpellSource } from '@prisma/client';
import { partitionCustomSpells } from './seedCustomSpells';

describe('partitionCustomSpells', () => {
    test('creates spells whose names are not in the database yet', () => {
        const spells = [{ name: 'Gift of Alacrity' }, { name: 'Shape Water' }];

        expect(partitionCustomSpells(spells, [])).toEqual({
            toCreate: spells,
            toUpdate: [],
        });
    });

    test('updates spells already seeded as custom, matching name case-insensitively', () => {
        const spells = [{ name: 'Gift of Alacrity', version: 2 }];
        const existing = [{ name: 'gift OF alacrity', source: SpellSource.CUSTOM }];

        expect(partitionCustomSpells(spells, existing)).toEqual({
            toCreate: [],
            toUpdate: [{ name: 'Gift of Alacrity', version: 2 }],
        });
    });

    test('drops spells whose names are already held by an SRD spell', () => {
        const spells = [{ name: 'Fireball' }, { name: 'Gift of Alacrity' }];
        const existing = [{ name: 'fireBALL', source: SpellSource.SRD }];

        expect(partitionCustomSpells(spells, existing)).toEqual({
            toCreate: [{ name: 'Gift of Alacrity' }],
            toUpdate: [],
        });
    });

    test('keeps only the first occurrence of a name duplicated within the JSON', () => {
        const spells = [
            { name: 'Gift of Alacrity', version: 1 },
            { name: 'gift OF alacrity', version: 2 },
        ];

        expect(partitionCustomSpells(spells, [])).toEqual({
            toCreate: [{ name: 'Gift of Alacrity', version: 1 }],
            toUpdate: [],
        });
    });

    test('does not trim surrounding whitespace when comparing names', () => {
        const spells = [{ name: ' Shape Water ' }];
        const existing = [{ name: 'Shape Water', source: SpellSource.CUSTOM }];

        expect(partitionCustomSpells(spells, existing)).toEqual({
            toCreate: [{ name: ' Shape Water ' }],
            toUpdate: [],
        });
    });
});
