import { canonicaliseProgressionForSubmit, createDraft, emptyProgression, serialiseDraft } from '../draft';
import type { Draft } from '../types';

/** Builds a minimal draft with a fully populated progression for canonicalisation tests. */
function draftWithProgression(spellcastingMode: string): Draft {
    const base = createDraft(null);
    return {
        ...base,
        name: 'Warden',
        emoji: '🛡️',
        description: 'A test class.',
        primaryAbilityIndexes: ['str'],
        savingThrowIndexes: ['str', 'con'],
        spellcastingMode,
        spellcastingAbility: spellcastingMode === 'NONE' ? null : 'wis',
        progression: emptyProgression(),
    };
}

describe('canonicaliseProgressionForSubmit', () => {
    test('leaves STANDARD progression untouched', () => {
        const progression = emptyProgression();
        progression[0] = { ...progression[0]!, spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0], cantripsKnown: 3 };

        const result = canonicaliseProgressionForSubmit(progression, 'STANDARD');

        expect(result[0]?.spellSlots).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(result[0]?.cantripsKnown).toBe(3);
    });

    test('strips spell fields to empty when mode is NONE without mutating the source draft', () => {
        const progression = emptyProgression();
        progression[0] = {
            ...progression[0]!,
            spellSlots: [2, 1, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 3,
            spellsKnown: 4,
            preparedSpellCount: 2,
        };

        const result = canonicaliseProgressionForSubmit(progression, 'NONE');

        expect(result[0]?.spellSlots).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(result[0]?.cantripsKnown).toBeNull();
        expect(result[0]?.spellsKnown).toBeNull();
        expect(result[0]?.preparedSpellCount).toBeNull();
        // The original draft progression (the UI's retained data) is untouched.
        expect(progression[0]?.spellSlots).toEqual([2, 1, 0, 0, 0, 0, 0, 0, 0]);
        expect(progression[0]?.cantripsKnown).toBe(3);
    });

    test('collapses mixed leftover STANDARD-mode slots into a single valid pact slot level', () => {
        const progression = emptyProgression();
        // Simulates leftover data from a prior STANDARD selection: multiple non-zero levels.
        progression[4] = { ...progression[4]!, spellSlots: [1, 2, 0, 0, 0, 0, 0, 0, 0] };

        const result = canonicaliseProgressionForSubmit(progression, 'PACT_MAGIC');

        const nonZeroLevels = result[4]!.spellSlots.filter((slot) => slot > 0);
        expect(nonZeroLevels).toHaveLength(1);
        // pactFromSpellSlots keeps the highest populated level.
        expect(result[4]?.spellSlots).toEqual([0, 2, 0, 0, 0, 0, 0, 0, 0]);
    });

    test('leaves an already-valid single-level pact slot row unchanged', () => {
        const progression = emptyProgression();
        progression[9] = { ...progression[9]!, spellSlots: [0, 0, 3, 0, 0, 0, 0, 0, 0] };

        const result = canonicaliseProgressionForSubmit(progression, 'PACT_MAGIC');

        expect(result[9]?.spellSlots).toEqual([0, 0, 3, 0, 0, 0, 0, 0, 0]);
    });
});

describe('serialiseDraft spellcasting canonicalisation', () => {
    test('sends empty spell fields for a NONE-mode draft that still retains progression data for the UI', () => {
        const draft = draftWithProgression('NONE');
        draft.progression[0] = {
            ...draft.progression[0]!,
            spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0],
            cantripsKnown: 2,
        };

        const submitted = serialiseDraft(draft);

        expect(submitted.progression[0]?.spellSlots).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(submitted.progression[0]?.cantripsKnown).toBeNull();
        // Draft itself (what the UI renders) still has the retained data.
        expect(draft.progression[0]?.spellSlots).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(draft.progression[0]?.cantripsKnown).toBe(2);
    });

    test('sends a canonical pact shape for a PACT_MAGIC-mode draft', () => {
        const draft = draftWithProgression('PACT_MAGIC');
        draft.progression[2] = { ...draft.progression[2]!, spellSlots: [1, 1, 0, 0, 0, 0, 0, 0, 0] };

        const submitted = serialiseDraft(draft);

        expect(submitted.progression[2]?.spellSlots.filter((slot) => slot > 0)).toHaveLength(1);
    });
});
