import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { FantasyFormTextInput } from '../FantasyFormTextInput';
import { fantasyTokens } from '@/theme/fantasyTheme';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
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
});
