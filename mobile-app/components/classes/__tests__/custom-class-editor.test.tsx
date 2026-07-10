import 'react-native-gesture-handler/jestSetup';
import { BackHandler } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import { PaperProvider } from 'react-native-paper';
import CustomClassEditor from '../custom-class-editor';
import type { ClassDetailsFieldsFragment } from '@/types/generated_graphql_types';

function renderEditor(
    onClose = jest.fn(),
    props: { initial?: ClassDetailsFieldsFragment | null; onSaved?: () => void } = {},
) {
    render(
        <MockedProvider>
            <PaperProvider>
                <CustomClassEditor visible onClose={onClose} {...props} />
            </PaperProvider>
        </MockedProvider>,
    );
    return onClose;
}

describe('CustomClassEditor', () => {
    test('validates the identity stage locally', () => {
        renderEditor();
        fireEvent.press(screen.getByText('Continue'));
        expect(screen.getByText('Class name is required.')).toBeTruthy();
        expect(screen.getByText('Description is required.')).toBeTruthy();
        expect(screen.getByText('Choose at least one primary ability.')).toBeTruthy();
        expect(screen.getByText('Choose exactly two saving throws.')).toBeTruthy();
        expect(screen.getByText('Identity')).toBeTruthy();
    });

    test('warns before discarding a dirty draft', () => {
        const onClose = renderEditor();
        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
        fireEvent.press(screen.getByTestId('custom-class-cancel'));
        expect(screen.getByText('Discard custom class draft?')).toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    test('closes without a prompt when the draft is clean', () => {
        const onClose = renderEditor();
        fireEvent.press(screen.getByTestId('custom-class-cancel'));
        expect(screen.queryByText('Discard custom class draft?')).toBeNull();
        expect(onClose).toHaveBeenCalled();
    });

    test('confirms discard and closes the sheet', () => {
        const onClose = renderEditor();
        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
        fireEvent.press(screen.getByTestId('custom-class-cancel'));
        fireEvent.press(screen.getByLabelText('Discard'));
        expect(onClose).toHaveBeenCalled();
    });

    test('seeds edit mode from the initial class details', () => {
        renderEditor(jest.fn(), {
            initial: {
                id: 'custom-1',
                value: 'custom-1',
                srdIndex: null,
                name: 'Warden',
                description: ['A custom guardian.'],
                hitDie: 10,
                primaryAbilityIndexes: ['str'],
                savingThrowIndexes: ['str', 'con'],
                multiclassPrerequisites: [],
                proficiencies: [],
                equipment: [],
                spellcastingMode: 'NONE',
                spellcastingAbility: null,
                progression: Array.from({ length: 20 }, (_, index) => ({
                    level: index + 1,
                    abilityScoreImprovement: false,
                    spellSlots: Array(9).fill(0),
                    cantripsKnown: null,
                    spellsKnown: null,
                    preparedSpellCount: null,
                    addSpellcastingAbility: false,
                    displayValues: [],
                })),
                features: [],
                spells: [],
                isCustom: true,
                archived: false,
                sourceBook: null,
                characterUsageCount: 0,
                mechanicsLocked: false,
                mechanicsLockedReason: null,
            },
        });

        expect(screen.getByText('Edit custom class')).toBeTruthy();
        expect(screen.getByDisplayValue('Warden')).toBeTruthy();
    });

    test('handles hardware back through the sheet close path', () => {
        const onClose = renderEditor();
        const backHandler = (BackHandler.addEventListener as jest.Mock).mock.calls.at(-1)?.[1] as
            | (() => boolean)
            | undefined;
        expect(backHandler).toBeTruthy();
        expect(backHandler?.()).toBe(true);
        expect(onClose).toHaveBeenCalled();
    });

    test('allows adding the spellcasting ability modifier to prepared spells', () => {
        renderEditor();
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
