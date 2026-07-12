import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
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
    test('uses a trash control for proficiency choice groups', () => {
        const onChangeChoiceGroups = jest.fn();

        renderWithPaper(
            <ProficiencyGrantEditor
                label="Starting proficiencies"
                grant="STARTING"
                fixedValues={[]}
                choiceGroups={[{ choiceGroup: 1, choiceCount: 1, values: ['skill-athletics'] }]}
                options={[{
                    value: 'skill-athletics',
                    name: 'Athletics',
                    type: 'SKILL',
                    isCustom: false,
                }]}
                locked={false}
                onChangeFixed={jest.fn()}
                onChangeChoiceGroups={onChangeChoiceGroups}
            />,
        );

        expect(screen.getByTestId('remove-proficiency-choice-group-STARTING-1')).toBeTruthy();
        expect(screen.queryByText('Remove')).toBeNull();

        fireEvent.press(screen.getByLabelText('Remove choice group 1'));

        expect(onChangeChoiceGroups).toHaveBeenCalledWith([]);
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

    test('uses a trash control for each prerequisite row', () => {
        const onChange = jest.fn();
        const value = [
            { abilityIndex: 'str', minimum: 13, group: 1 },
            { abilityIndex: 'dex', minimum: 13, group: 1 },
        ];

        renderWithPaper(
            <PrerequisiteBuilder value={value} locked={false} onChange={onChange} />,
        );

        expect(screen.getByTestId('remove-prerequisite-1-1')).toBeTruthy();
        expect(screen.getByTestId('remove-prerequisite-1-2')).toBeTruthy();
        expect(screen.queryByText('Remove')).toBeNull();

        fireEvent.press(screen.getByLabelText('Remove prerequisite 1-1'));

        expect(onChange).toHaveBeenCalledWith([value[1]]);
    });
});
