import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { createDraft } from '../draft';
import ProficiencyGrantEditor from '../ProficiencyGrantEditor';

const options = [
    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL', isCustom: false },
    { value: 'skill-acrobatics', name: 'Acrobatics', type: 'SKILL', isCustom: false },
    { value: 'light-armor', name: 'Light Armor', type: 'ARMOR', isCustom: false },
];

function renderEditor(
    draft = createDraft(),
    onChange = jest.fn(),
) {
    render(
        <PaperProvider>
            <ProficiencyGrantEditor
                grant="STARTING"
                draft={draft}
                options={options}
                locked={false}
                onChange={onChange}
            />
        </PaperProvider>,
    );
    return onChange;
}

describe('ProficiencyGrantEditor', () => {
    test('hides and keeps a choice pool when the toggle is turned off then on', () => {
        const draft = {
            ...createDraft(),
            proficiencies: [
                { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
            ],
        };
        const onChange = renderEditor(draft);

        expect(screen.getByText('Athletics')).toBeTruthy();
        expect(screen.getByText('Acrobatics')).toBeTruthy();

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        expect(onChange).toHaveBeenCalled();
        const cleared = onChange.mock.calls.at(-1)?.[0] as typeof draft.proficiencies;
        expect(cleared.some((item) => item.choiceGroup != null)).toBe(false);

        // Pool UI hidden, but re-enabling restores the stashed options into the draft.
        expect(screen.queryByText('Player chooses')).toBeNull();

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        const restored = onChange.mock.calls.at(-1)?.[0] as typeof draft.proficiencies;
        expect(restored.map((item) => item.value).sort()).toEqual([
            'skill-acrobatics',
            'skill-athletics',
        ]);
        expect(screen.getByText('Player chooses')).toBeTruthy();
    });

    test('keeps granted and choice lists from overlapping via the picker exclusions', () => {
        const draft = {
            ...createDraft(),
            proficiencies: [
                { value: 'light-armor', grant: 'STARTING', choiceGroup: null, choiceCount: null },
            ],
        };
        renderEditor(draft);

        // Armor auto-opens when it has grants.
        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-ARMOR'));
        fireEvent.press(screen.getByTestId('add-choice-STARTING-ARMOR'));

        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();
        // Already granted — excluded from the choice pool picker.
        expect(screen.queryByTestId('proficiency-option-light-armor')).toBeNull();
    });
});
