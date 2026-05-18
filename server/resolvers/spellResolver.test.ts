import { beforeEach, describe, expect, test } from 'bun:test';
import { spellFindUniqueMock } from './characterResolvers.testUtils';

// characterResolvers.testUtils installs the shared Prisma and auth module mocks.
const { default: spellResolver } = await import('./spellResolver');

describe('spellResolver', () => {
    beforeEach(() => {
        spellFindUniqueMock.mockClear();
    });

    test('throws UNAUTHENTICATED when userId is null', () => {
        const ctx = { userId: null };

        expect(spellResolver({}, { id: 'spell-1' }, ctx)).rejects.toThrow('UNAUTHENTICATED');
        expect(spellFindUniqueMock).not.toHaveBeenCalled();
    });

    test('calls prisma.spell.findUnique by id for authenticated users', async () => {
        const fakeSpell = {
            id: 'spell-1',
            name: 'Fireball',
            level: 3,
            schoolIndex: 'evocation',
            classIndexes: ['sorcerer', 'wizard'],
            description: ['A bright streak flashes from your pointing finger.'],
            higherLevel: ['The damage increases by 1d6 for each slot level above 3rd.'],
            range: '150 feet',
            components: ['V', 'S', 'M'],
            material: 'A tiny ball of bat guano and sulfur',
            ritual: false,
            duration: 'Instantaneous',
            concentration: false,
            castingTime: '1 action',
            sourceBook: 'PHB',
        };
        const ctx = { userId: 'user-abc' };
        spellFindUniqueMock.mockResolvedValueOnce(fakeSpell);

        const result = await spellResolver({}, { id: 'spell-1' }, ctx);

        expect(spellFindUniqueMock).toHaveBeenCalledTimes(1);
        const args = spellFindUniqueMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ id: 'spell-1' });
        expect(result).toEqual(fakeSpell);
    });
});
