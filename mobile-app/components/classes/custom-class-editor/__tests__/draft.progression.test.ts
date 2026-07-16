import {
    copySpellcastingFrom,
    emptyProgression,
    hasDefaultSpellcasting,
    hasSpellSlots,
    shortSpellSlots,
    withCopyFromPreviousLevel,
    withPrefillOnLevelAdvance,
} from '../draft';

describe('progression spellcasting prefill', () => {
    test('detects default vs edited spellcasting rows', () => {
        const [level] = emptyProgression();
        expect(hasDefaultSpellcasting(level!)).toBe(true);
        expect(hasDefaultSpellcasting({ ...level!, spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0] })).toBe(false);
        expect(hasDefaultSpellcasting({ ...level!, cantripsKnown: 0 })).toBe(false);
        expect(hasDefaultSpellcasting({ ...level!, abilityScoreImprovement: true })).toBe(true);
    });

    test('summarises spell slots for the level overview', () => {
        expect(shortSpellSlots([0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe('—');
        expect(shortSpellSlots([4, 3, 3, 1, 0, 0, 0, 0, 0])).toBe('4/3/3/1');
        expect(shortSpellSlots([0, 2, 0, 0, 0, 0, 0, 0, 0])).toBe('0/2');
        expect(shortSpellSlots([0, 0, 1, 0, 3, 0, 0, 0, 0])).toBe('0/0/1/0/3');
        expect(hasSpellSlots({ ...emptyProgression()[0]!, spellSlots: [1, 0, 0, 0, 0, 0, 0, 0, 0] })).toBe(
            true,
        );
        expect(hasSpellSlots(emptyProgression()[0]!)).toBe(false);
    });

    test('copies spellcasting fields without touching ASI or level', () => {
        const [source, target] = emptyProgression();
        const copied = copySpellcastingFrom(
            {
                ...source!,
                spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0],
                cantripsKnown: 2,
                spellsKnown: 3,
                preparedSpellCount: 1,
                abilityScoreImprovement: true,
            },
            { ...target!, abilityScoreImprovement: false, level: 2 },
        );

        expect(copied.level).toBe(2);
        expect(copied.abilityScoreImprovement).toBe(false);
        expect(copied.spellSlots).toEqual([4, 3, 0, 0, 0, 0, 0, 0, 0]);
        expect(copied.cantripsKnown).toBe(2);
        expect(copied.spellsKnown).toBe(3);
        expect(copied.preparedSpellCount).toBe(1);
        expect(copied.spellSlots).not.toBe(source!.spellSlots);
    });

    test('prefills the next level only when it is still untouched', () => {
        const progression = emptyProgression();
        expect(withPrefillOnLevelAdvance(progression, 1, 2)).toBe(progression);

        progression[1] = {
            ...progression[1]!,
            spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 2,
            spellsKnown: null,
            preparedSpellCount: 1,
        };

        const prefilled = withPrefillOnLevelAdvance(progression, 2, 3);
        expect(prefilled[2]?.spellSlots).toEqual([4, 3, 0, 0, 0, 0, 0, 0, 0]);
        expect(prefilled[2]?.cantripsKnown).toBe(2);
        expect(prefilled[2]?.preparedSpellCount).toBe(1);

        const alreadyEdited = progression.map((item) =>
            item.level === 3 ? { ...item, spellSlots: [1, 0, 0, 0, 0, 0, 0, 0, 0] } : item,
        );
        expect(withPrefillOnLevelAdvance(alreadyEdited, 2, 3)[2]?.spellSlots).toEqual([
            1, 0, 0, 0, 0, 0, 0, 0, 0,
        ]);
    });

    test('force-copies from the previous level even when the target is edited', () => {
        const progression = emptyProgression();
        progression[0] = {
            ...progression[0]!,
            spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 2,
        };
        progression[1] = {
            ...progression[1]!,
            spellSlots: [1, 0, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 9,
        };

        const copied = withCopyFromPreviousLevel(progression, 2);
        expect(copied[1]?.spellSlots).toEqual([4, 3, 0, 0, 0, 0, 0, 0, 0]);
        expect(copied[1]?.cantripsKnown).toBe(2);
        expect(withCopyFromPreviousLevel(progression, 1)).toBe(progression);
    });

    test('does not prefill when moving down or skipping levels', () => {
        const progression = emptyProgression();
        progression[1] = {
            ...progression[1]!,
            spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0],
        };
        expect(withPrefillOnLevelAdvance(progression, 3, 2)).toBe(progression);
        expect(withPrefillOnLevelAdvance(progression, 2, 4)).toBe(progression);
    });
});
