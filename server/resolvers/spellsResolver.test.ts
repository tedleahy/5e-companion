import { describe, expect, test, mock, beforeEach } from 'bun:test';

// ---------------------------------------------------------------------------
// Mock modules so we never hit a real database or need env vars.
//
// Bun's `mock.module()` intercepts `import` calls at the module level.
// When spellsResolver.ts does `import prisma from "../prisma/prisma"`, it
// will receive the fake object we return here instead of the real Prisma
// client.  This is conceptually similar to Jest's `jest.mock()`.
//
// We also mock the auth module because it has a top-level call to
// `createRemoteJWKSet(new URL(...))` that requires SUPABASE_URL to be set.
// Our mock re-implements just the `requireUser` function that the resolver
// actually calls.
// ---------------------------------------------------------------------------
const findManyMock = mock((_args: unknown) => Promise.resolve([] as unknown[]));

mock.module('../prisma/prisma', () => ({
    default: {
        spell: { findMany: findManyMock },
    },
}));

mock.module('../lib/auth', () => ({
    requireUser(ctx: { userId: string | null }): string {
        if (!ctx.userId) throw new Error('UNAUTHENTICATED');
        return ctx.userId;
    },
}));

// Import the resolver *after* setting up the mock so it picks up the fake.
const { default: spellsResolver } = await import('./spellsResolver');

describe('spellsResolver', () => {
    beforeEach(() => {
        findManyMock.mockClear();
    });

    test('throws UNAUTHENTICATED when userId is null', () => {
        const ctx = { userId: null };
        expect(spellsResolver({}, {}, ctx)).rejects.toThrow('UNAUTHENTICATED');
        // Prisma should never be called if auth fails
        expect(findManyMock).not.toHaveBeenCalled();
    });

    test('calls prisma.spell.findMany with built where clause', async () => {
        const ctx = { userId: 'user-abc' };
        const filter = { name: 'fire', levels: [3] };

        await spellsResolver({}, { filter }, ctx);

        expect(findManyMock).toHaveBeenCalledTimes(1);

        const callArgs = findManyMock.mock.calls[0]![0] as Record<string, unknown>;
        // The where clause should contain the filter conditions built by buildWhere
        expect(callArgs.where).toEqual({
            name: { contains: 'fire', mode: 'insensitive' },
            level: { in: [3] },
        });
        expect(callArgs.orderBy).toEqual([
            { level: 'asc' },
            { name: 'asc' },
            { id: 'asc' },
        ]);
        expect(callArgs.select).toEqual({
            id: true,
            name: true,
            level: true,
            schoolIndex: true,
            castingTime: true,
            range: true,
            concentration: true,
            ritual: true,
        });
    });

    test('passes empty where when no filter is provided', async () => {
        const ctx = { userId: 'user-abc' };

        await spellsResolver({}, {}, ctx);

        expect(findManyMock).toHaveBeenCalledTimes(1);
        const callArgs = findManyMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(callArgs.where).toEqual({});
    });

    test('applies pagination limit and offset when provided', async () => {
        const ctx = { userId: 'user-abc' };

        await spellsResolver({}, { pagination: { limit: 50, offset: 100 } }, ctx);

        const callArgs = findManyMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(callArgs.take).toBe(50);
        expect(callArgs.skip).toBe(100);
    });

    test('caps pagination limit to the maximum page size', async () => {
        const ctx = { userId: 'user-abc' };

        await spellsResolver({}, { pagination: { limit: 9999 } }, ctx);

        const callArgs = findManyMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(callArgs.take).toBe(200);
    });

    test('returns whatever prisma returns', async () => {
        const fakeSpells = [{ id: '1', name: 'Fireball' }] as unknown[];
        findManyMock.mockResolvedValueOnce(fakeSpells);

        const ctx = { userId: 'user-abc' };
        const result = await spellsResolver({}, {}, ctx);

        expect(result).toHaveLength(1);
        expect((result as unknown[])[0]).toEqual({ id: '1', name: 'Fireball' });
    });
});
