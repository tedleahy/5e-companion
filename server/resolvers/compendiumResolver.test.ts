import { beforeEach, describe, expect, test } from 'bun:test';
import {
    authedCtx,
    clearAllCharacterResolverMocks,
    spellCountMock,
    subclassCountMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

const { default: compendiumCounts } = await import('./compendiumResolver');

describe('compendiumCounts', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('rejects unauthenticated requests before querying counts', () => {
        expect(compendiumCounts({}, {}, unauthedCtx)).rejects.toThrow('UNAUTHENTICATED');
        expect(subclassCountMock).not.toHaveBeenCalled();
        expect(spellCountMock).not.toHaveBeenCalled();
    });

    test('returns SRD, owned custom subclass, and spell totals', async () => {
        subclassCountMock
            .mockResolvedValueOnce(34)
            .mockResolvedValueOnce(5);
        spellCountMock.mockResolvedValueOnce(319);

        const result = await compendiumCounts({}, {}, authedCtx);

        expect(subclassCountMock.mock.calls).toEqual([
            [{ where: { ownerUserId: null } }],
            [{ where: { ownerUserId: 'user-abc', archivedAt: null } }],
        ]);
        expect(spellCountMock).toHaveBeenCalledWith();
        expect(result).toEqual({
            srdSubclassCount: 34,
            customSubclassCount: 5,
            spellCount: 319,
        });
    });
});
