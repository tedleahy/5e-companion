import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { createDraft } from '../draft';
import EquipmentEditor from '../EquipmentEditor';
import PrerequisiteBuilder from '../PrerequisiteBuilder';
import ProficiencyGrantEditor from '../ProficiencyGrantEditor';

/**
 * Wraps a custom-class editor control in the providers used by its form fields.
 */
function renderWithPaper(element: React.ReactElement) {
    return render(<PaperProvider>{element}</PaperProvider>);
}

describe('custom class editor remove controls', () => {
    test('uses × chips for proficiency grants and a choice toggle instead of trash groups', () => {
        const onChange = jest.fn();
        const draft = {
            ...createDraft(),
            proficiencies: [
                { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
            ],
        };

        renderWithPaper(
            <ProficiencyGrantEditor
                grant="STARTING"
                draft={draft}
                options={[
                    {
                        value: 'skill-athletics',
                        name: 'Athletics',
                        type: 'SKILL',
                        isCustom: false,
                    },
                    {
                        value: 'skill-acrobatics',
                        name: 'Acrobatics',
                        type: 'SKILL',
                        isCustom: false,
                    },
                ]}
                locked={false}
                onChange={onChange}
            />,
        );

        expect(screen.getByTestId('toggle-choice-STARTING-SKILL')).toBeTruthy();
        expect(screen.queryByTestId('remove-proficiency-choice-group-STARTING-1')).toBeNull();
        expect(screen.queryByText('Remove')).toBeNull();

        fireEvent.press(screen.getByLabelText('Remove Athletics'));

        expect(onChange).toHaveBeenCalled();
        const next = onChange.mock.calls[0][0] as typeof draft.proficiencies;
        expect(next.some((item) => item.value === 'skill-athletics')).toBe(false);
        expect(next.some((item) => item.value === 'skill-acrobatics')).toBe(true);
    });

    test('uses trash controls for equipment cards and rows', () => {
        const onChangeFixed = jest.fn();
        const onChangeChoiceGroups = jest.fn();

        renderWithPaper(
            <EquipmentEditor
                fixedItems={[{ key: 'fixed-1', name: 'Shield', quantity: 1 }]}
                choiceGroups={[{
                    choiceGroup: 1,
                    choiceCount: 1,
                    items: [{ key: 'option-1', name: 'Longsword', quantity: 1 }],
                }]}
                locked={false}
                onChangeFixed={onChangeFixed}
                onChangeChoiceGroups={onChangeChoiceGroups}
            />,
        );

        expect(screen.getByTestId('remove-equipment-item-fixed-1')).toBeTruthy();
        expect(screen.getByTestId('remove-equipment-choice-group-1')).toBeTruthy();
        expect(screen.getByTestId('remove-equipment-item-option-1')).toBeTruthy();
        expect(screen.queryByText('Remove')).toBeNull();

        fireEvent.press(screen.getByLabelText('Remove choice group 1'));
        expect(onChangeChoiceGroups).toHaveBeenCalledWith([]);
    });

    test('uses group trash for a single prerequisite and per-alternative trash for OR rows', () => {
        const onChange = jest.fn();
        const value = [
            { abilityIndex: 'str', minimum: 13, group: 1 },
            { abilityIndex: 'dex', minimum: 13, group: 1 },
        ];

        renderWithPaper(
            <PrerequisiteBuilder value={value} locked={false} onChange={onChange} />,
        );

        expect(screen.getByTestId('remove-prerequisite-group-1')).toBeTruthy();
        expect(screen.getByTestId('remove-prerequisite-1-2')).toBeTruthy();
        expect(screen.queryByTestId('remove-prerequisite-1-1')).toBeNull();
        expect(screen.queryByText('Remove')).toBeNull();

        fireEvent.press(screen.getByLabelText('Remove prerequisite 1-2'));
        expect(onChange).toHaveBeenCalledWith([value[0]]);

        onChange.mockClear();
        fireEvent.press(screen.getByLabelText('Remove group 1'));
        expect(onChange).toHaveBeenCalledWith([]);
    });

    test('uses a single group trash control when a prerequisite has one alternative', () => {
        const onChange = jest.fn();
        const value = [{ abilityIndex: 'str', minimum: 13, group: 1 }];

        renderWithPaper(
            <PrerequisiteBuilder value={value} locked={false} onChange={onChange} />,
        );

        expect(screen.getByTestId('remove-prerequisite-1-1')).toBeTruthy();
        fireEvent.press(screen.getByLabelText('Remove prerequisite 1-1'));
        expect(onChange).toHaveBeenCalledWith([]);
    });
});
