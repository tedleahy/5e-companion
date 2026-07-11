import {
    copySpellcastingFrom,
    emptyProgression,
    hasDefaultSpellcasting,
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

    test('copies spellcasting fields without touching ASI or level', () => {
        const [source, target] = emptyProgression();
        const copied = copySpellcastingFrom(
            {
                ...source!,
                spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0],
                cantripsKnown: 2,
                spellsKnown: 3,
                preparedSpellCount: 1,
                addSpellcastingAbility: true,
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
        expect(copied.addSpellcastingAbility).toBe(true);
        expect(copied.spellSlots).not.toBe(source!.spellSlots);
    });

    test('prefills the next level only when it is still untouched', () => {
        const progression = emptyProgression();
        progression[1] = {
            ...progression[1]!,
            spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 2,
            spellsKnown: null,
            preparedSpellCount: 1,
            addSpellcastingAbility: true,
        };

        const prefilled = withPrefillOnLevelAdvance(progression, 2, 3);
        expect(prefilled[2]?.spellSlots).toEqual([4, 3, 0, 0, 0, 0, 0, 0, 0]);
        expect(prefilled[2]?.cantripsKnown).toBe(2);
        expect(prefilled[2]?.preparedSpellCount).toBe(1);
        expect(prefilled[2]?.addSpellcastingAbility).toBe(true);

        const alreadyEdited = progression.map((item) =>
            item.level === 3 ? { ...item, spellSlots: [1, 0, 0, 0, 0, 0, 0, 0, 0] } : item,
        );
        expect(withPrefillOnLevelAdvance(alreadyEdited, 2, 3)[2]?.spellSlots).toEqual([
            1, 0, 0, 0, 0, 0, 0, 0, 0,
        ]);
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
