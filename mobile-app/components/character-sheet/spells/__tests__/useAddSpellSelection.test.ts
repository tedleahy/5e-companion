import { act, renderHook } from '@testing-library/react-native';
import useAddSpellSelection from '../add-sheet/useAddSpellSelection';
import type { AddSpellListItem } from '../addSpell.types';

const TEST_SPELL: AddSpellListItem = {
    id: 'spell-1',
    name: 'Magic Missile',
    level: 1,
    schoolIndex: 'evocation',
    classIndexes: ['wizard'],
    range: '120 feet',
    ritual: false,
    concentration: false,
    castingTime: '1 action',
};

describe('useAddSpellSelection', () => {
    it('ignores duplicate rapid toggles for the same spell while pending', async () => {
        let resolveRequest: (() => void) | null = null;
        const pendingRequest = new Promise<void>((resolve) => {
            resolveRequest = resolve;
        });

        const onSpellAdded = jest.fn(() => pendingRequest);
        const onSpellRemoved = jest.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() => useAddSpellSelection({
            knownSpellIds: [],
            onSpellAdded,
            onSpellRemoved,
        }));

        await act(async () => {
            const firstToggle = result.current.toggleSpellSelection(TEST_SPELL);
            const secondToggle = result.current.toggleSpellSelection(TEST_SPELL);

            resolveRequest?.();
            await Promise.all([firstToggle, secondToggle]);
        });

        expect(onSpellAdded).toHaveBeenCalledTimes(1);
        expect(onSpellAdded).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'spell-1' }),
        );
    });
});
