import { act, renderHook } from '@testing-library/react-native';
import useCharacterSheetDraft, { type CharacterSheetDetail, type UseCharacterSheetDraftReturn } from '../useCharacterSheetDraft';
import {
    BASE_CHARACTER_FIXTURE,
    SECOND_CHARACTER_FIXTURE,
    createCharacterFixture,
} from './fixtures/character';

describe('useCharacterSheetDraft', () => {
    it('clears draft when character changes to a different character', () => {
        const { result, rerender } = renderHook<
            UseCharacterSheetDraftReturn,
            { character: CharacterSheetDetail | null }
        >(
            ({ character }) => useCharacterSheetDraft(character),
            { initialProps: { character: BASE_CHARACTER_FIXTURE } }
        );

        // Start editing with character 1
        act(() => {
            result.current.startEditing();
        });

        expect(result.current.editMode).toBe(true);
        expect(result.current.draft).not.toBeNull();

        // Change character to character 2
        rerender({ character: SECOND_CHARACTER_FIXTURE });

        // Draft should be cleared
        expect(result.current.editMode).toBe(false);
        expect(result.current.draft).toBeNull();
    });

    it('clears draft when character becomes null', () => {
        const { result, rerender } = renderHook<
            UseCharacterSheetDraftReturn,
            { character: CharacterSheetDetail | null }
        >(
            ({ character }) => useCharacterSheetDraft(character),
            { initialProps: { character: BASE_CHARACTER_FIXTURE } }
        );

        act(() => {
            result.current.startEditing();
        });

        expect(result.current.editMode).toBe(true);

        rerender({ character: null });

        expect(result.current.editMode).toBe(false);
    });

    it('does not clear draft when character refetches with same id', () => {
        const { result, rerender } = renderHook<
            UseCharacterSheetDraftReturn,
            { character: CharacterSheetDetail | null }
        >(
            ({ character }) => useCharacterSheetDraft(character),
            { initialProps: { character: BASE_CHARACTER_FIXTURE } }
        );

        act(() => {
            result.current.startEditing();
        });

        expect(result.current.editMode).toBe(true);

        // Simulate refetch: same id, maybe updated fields
        const updatedCharacter = {
            ...BASE_CHARACTER_FIXTURE,
            name: 'Updated Name',
        };
        rerender({ character: updatedCharacter });

        // Draft should still exist (same id)
        expect(result.current.editMode).toBe(true);
        expect(result.current.draft).not.toBeNull();
    });
});
