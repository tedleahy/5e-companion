import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { Chip, Field } from '../fields';

describe('custom-class Field accessibility', () => {
    test('labels the text input and exposes validation feedback accessibly', () => {
        render(
            <PaperProvider>
                <Field
                    label="Class name"
                    value=""
                    errorMessage="Class name is required."
                    onChangeText={() => {}}
                />
            </PaperProvider>,
        );

        expect(screen.getByLabelText('Class name')).toBeTruthy();
        expect(screen.getByHintText('Class name is required.')).toBeTruthy();
        expect(screen.getByRole('alert', { name: 'Class name is required.' })).toBeTruthy();
    });
});

describe('custom-class Chip accessibility', () => {
    test('exposes checkbox role with selected and disabled state', () => {
        const onPress = jest.fn();
        const { rerender } = render(
            <PaperProvider>
                <Chip label="d8" selected disabled={false} onPress={onPress} />
            </PaperProvider>,
        );

        const selected = screen.getByRole('checkbox', { name: 'd8' });
        expect(selected.props.accessibilityState).toEqual(
            expect.objectContaining({ checked: true, disabled: false }),
        );

        fireEvent.press(selected);
        expect(onPress).toHaveBeenCalled();

        rerender(
            <PaperProvider>
                <Chip label="d8" selected={false} disabled onPress={onPress} />
            </PaperProvider>,
        );

        const disabled = screen.getByRole('checkbox', { name: 'd8' });
        expect(disabled.props.accessibilityState).toEqual(
            expect.objectContaining({ checked: false, disabled: true }),
        );
    });
});
