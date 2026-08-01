import {
    emptySpellSlots,
    pactFromSpellSlots,
    spellSlotLevelLabel,
    spellSlotsFromPact,
    withSpellSlotAt,
} from '../spellSlots';

describe('spellSlots helpers', () => {
    test('builds an empty nine-slot row', () => {
        expect(emptySpellSlots()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    test('labels slot levels with ordinals', () => {
        expect(spellSlotLevelLabel(1)).toBe('1st');
        expect(spellSlotLevelLabel(2)).toBe('2nd');
        expect(spellSlotLevelLabel(3)).toBe('3rd');
        expect(spellSlotLevelLabel(4)).toBe('4th');
    });

    test('derives pact level and count from the highest non-zero slot', () => {
        expect(pactFromSpellSlots([0, 0, 0, 0, 0, 0, 0, 0, 0])).toEqual({ level: 1, count: 0 });
        expect(pactFromSpellSlots([0, 2, 0, 0, 0, 0, 0, 0, 0])).toEqual({ level: 2, count: 2 });
        expect(pactFromSpellSlots([4, 3, 2, 0, 0, 0, 0, 0, 0])).toEqual({ level: 3, count: 2 });
    });

    test('writes a single pact slot into a nine-slot array', () => {
        expect(spellSlotsFromPact(3, 2)).toEqual([0, 0, 2, 0, 0, 0, 0, 0, 0]);
        expect(spellSlotsFromPact(1, 0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    test('updates one standard slot level', () => {
        expect(withSpellSlotAt([4, 3, 2, 0, 0, 0, 0, 0, 0], 2, 5)).toEqual([
            4, 5, 2, 0, 0, 0, 0, 0, 0,
        ]);
    });
});
