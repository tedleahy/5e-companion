import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { FantasyFormTextInput } from '../FantasyFormTextInput';
import { fantasyTokens } from '@/theme/fantasyTheme';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

function ControlledFantasyFormTextInput({
    initialValue = '',
    onChangeText,
}: {
    initialValue?: string;
    onChangeText?: (value: string) => void;
}) {
    const [value, setValue] = useState(initialValue);
    return (
        <FantasyFormTextInput
            value={value}
            onChangeText={(next) => {
                setValue(next);
                onChangeText?.(next);
            }}
            testID="fantasy-form-controlled"
        />
    );
}

describe('FantasyFormTextInput', () => {
    it('pads multiline content so the first line is not flush with the outline', () => {
        renderWithPaper(
            <FantasyFormTextInput
                value="I am a description"
                onChangeText={jest.fn()}
                multiline
                testID="fantasy-form-multiline"
            />,
        );

        const input = screen.getByDisplayValue('I am a description');
        const flatStyle = StyleSheet.flatten(input.props.style);

        expect(flatStyle.paddingTop).toBe(fantasyTokens.spacing.md);
        expect(flatStyle.paddingBottom).toBe(fantasyTokens.spacing.md);
        expect(flatStyle.textAlignVertical).toBe('top');
    });

    it('lets callers override multiline padding via contentStyle', () => {
        renderWithPaper(
            <FantasyFormTextInput
                value="Custom"
                onChangeText={jest.fn()}
                multiline
                contentStyle={{ paddingTop: fantasyTokens.spacing.sm }}
            />,
        );

        const flatStyle = StyleSheet.flatten(screen.getByDisplayValue('Custom').props.style);
        expect(flatStyle.paddingTop).toBe(fantasyTokens.spacing.sm);
    });

    it('renders string labels above the field in night-form gold, not as Paper floating labels', () => {
        renderWithPaper(
            <FantasyFormTextInput
                label="Name"
                value="Longsword"
                onChangeText={jest.fn()}
                testID="fantasy-form-named"
            />,
        );

        const label = screen.getByText('Name');
        expect(StyleSheet.flatten(label.props.style).color).toBe(fantasyTokens.colors.gold);
        // Paper floating labels expose *-label-active / *-label-inactive testIDs.
        expect(screen.queryByTestId('fantasy-form-named-label-active')).toBeNull();
        expect(screen.getByDisplayValue('Longsword').props.accessibilityLabel).toBe('Name');
    });

    it('keeps controlled text in sync while parent state updates on each keystroke', () => {
        const onChangeText = jest.fn();
        renderWithPaper(<ControlledFantasyFormTextInput onChangeText={onChangeText} />);

        fireEvent.changeText(screen.getByTestId('fantasy-form-controlled'), 'hellohellohello');

        expect(onChangeText).toHaveBeenCalledWith('hellohellohello');
        expect(screen.getByDisplayValue('hellohellohello')).toBeTruthy();
    });

    it('syncs when the parent resets the controlled value', () => {
        function ResetHarness({ value }: { value: string }) {
            return <FantasyFormTextInput value={value} onChangeText={jest.fn()} testID="fantasy-form-reset" />;
        }

        const { rerender } = renderWithPaper(<ResetHarness value="Warden" />);
        expect(screen.getByDisplayValue('Warden')).toBeTruthy();

        rerender(
            <PaperProvider>
                <ResetHarness value="" />
            </PaperProvider>,
        );

        expect(screen.getByTestId('fantasy-form-reset').props.value).toBe('');
    });

    it('disables autocorrect by default to avoid Android Portal input duplication', () => {
        renderWithPaper(
            <FantasyFormTextInput value="Warden" onChangeText={jest.fn()} testID="fantasy-form-autocorrect" />,
        );

        expect(screen.getByTestId('fantasy-form-autocorrect').props.autoCorrect).toBe(false);
    });
});
