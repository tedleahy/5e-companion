import { fireEvent, render, screen } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import { PaperProvider } from 'react-native-paper';
import CustomClassEditor from '../custom-class-editor';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, replace: jest.fn() }) }));

describe('CustomClassEditor', () => {
    test('validates the identity stage locally', () => {
        render(<MockedProvider><PaperProvider><CustomClassEditor /></PaperProvider></MockedProvider>);
        fireEvent.press(screen.getByText('Continue'));
        expect(screen.getByText('Name and description are required.')).toBeTruthy();
        expect(screen.getByText('Identity')).toBeTruthy();
    });

    test('warns before discarding a dirty draft', () => {
        render(<MockedProvider><PaperProvider><CustomClassEditor /></PaperProvider></MockedProvider>);
        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
        fireEvent.press(screen.getByTestId('custom-class-cancel'));
        expect(screen.getByText('Discard custom class draft?')).toBeTruthy();
        expect(mockBack).not.toHaveBeenCalled();
    });

    test('allows adding the spellcasting ability modifier to prepared spells', () => {
        render(<MockedProvider><PaperProvider><CustomClassEditor /></PaperProvider></MockedProvider>);
        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
        fireEvent.changeText(screen.getByTestId('text-input-outlined'), 'A prepared caster.');
        fireEvent.press(screen.getAllByText('STR')[0]!);
        fireEvent.press(screen.getAllByText('STR')[1]!);
        fireEvent.press(screen.getAllByText('CON')[1]!);
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));
        fireEvent.press(screen.getByText('WIS'));

        fireEvent.press(screen.getByTestId('custom-class-add-spellcasting-ability'));

        expect(screen.getByText('✓ Add spellcasting ability modifier to prepared spells')).toBeTruthy();
    });
});
