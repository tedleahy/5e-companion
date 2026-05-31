import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import TraitsTab from '../TraitsTab';
import type { CharacterTraitsData } from '../features/features.types';

type TraitTagField = 'armorProficiencies' | 'weaponProficiencies' | 'toolProficiencies' | 'languages';
type TraitTextField = 'personality' | 'ideals' | 'bonds' | 'flaws';

const EMPTY_TRAITS: CharacterTraitsData = {
    personality: '',
    ideals: '',
    bonds: '',
    flaws: '',
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    languages: [],
};

/**
 * Stateful harness mirroring the character sheet draft handlers used by the route.
 */
function EditableTraitsTabHarness() {
    const [traits, setTraits] = useState<CharacterTraitsData>(EMPTY_TRAITS);

    function addTraitTag(field: TraitTagField) {
        setTraits((currentTraits) => ({
            ...currentTraits,
            [field]: [...(currentTraits[field] ?? []), ''],
        }));
    }

    function changeTraitTag(field: TraitTagField, index: number, value: string) {
        setTraits((currentTraits) => ({
            ...currentTraits,
            [field]: (currentTraits[field] ?? []).map((entry, entryIndex) => (
                entryIndex === index ? value : entry
            )),
        }));
    }

    function removeTraitTag(field: TraitTagField, index: number) {
        setTraits((currentTraits) => ({
            ...currentTraits,
            [field]: (currentTraits[field] ?? []).filter((_, entryIndex) => entryIndex !== index),
        }));
    }

    function changeTraitText(field: TraitTextField, value: string) {
        setTraits((currentTraits) => ({
            ...currentTraits,
            [field]: value,
        }));
    }

    return (
        <TraitsTab
            background="Sage"
            traits={traits}
            editMode
            onAddTraitTag={addTraitTag}
            onChangeTraitTag={changeTraitTag}
            onRemoveTraitTag={removeTraitTag}
            onChangeTraitText={changeTraitText}
        />
    );
}

describe('TraitsTab', () => {
    it('shows a blank editable proficiency row after pressing Add', () => {
        render(<EditableTraitsTabHarness />);

        expect(screen.queryByPlaceholderText('Tag')).toBeNull();

        fireEvent.press(screen.getByLabelText('Add languages proficiency'));

        const tagInput = screen.getByPlaceholderText('Tag');
        fireEvent.changeText(tagInput, 'Infernal');

        expect(screen.getByDisplayValue('Infernal')).toBeTruthy();
    });
});
