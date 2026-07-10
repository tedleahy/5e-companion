import 'react-native-gesture-handler/jestSetup';
import { BackHandler } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { PaperProvider } from 'react-native-paper';
import CustomClassEditor from '../custom-class-editor';
import { GET_PROFICIENCIES } from '@/graphql/class.operations';
import type { ClassDetailsFieldsFragment } from '@/types/generated_graphql_types';

const proficiencyMocks: MockedResponse[] = [
    {
        request: { query: GET_PROFICIENCIES },
        result: {
            data: {
                proficiencies: [
                    { value: 'light-armor', name: 'Light Armor', type: 'ARMOR', isCustom: false },
                    { value: 'simple-weapons', name: 'Simple Weapons', type: 'WEAPON', isCustom: false },
                    { value: 'skill-acrobatics', name: 'Acrobatics', type: 'SKILL', isCustom: false },
                    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL', isCustom: false },
                    { value: 'saving-throw-str', name: 'Saving Throw: STR', type: 'SAVING_THROW', isCustom: false },
                ],
            },
        },
        maxUsageCount: Number.POSITIVE_INFINITY,
    },
];

function renderEditor(
    onClose = jest.fn(),
    props: { initial?: ClassDetailsFieldsFragment | null; onSaved?: () => void } = {},
) {
    render(
        <MockedProvider mocks={proficiencyMocks}>
            <PaperProvider>
                <CustomClassEditor visible onClose={onClose} {...props} />
            </PaperProvider>
        </MockedProvider>,
    );
    return onClose;
}

function fillIdentityAndContinue() {
    fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
    fireEvent.changeText(screen.getByTestId('text-input-outlined'), 'A prepared caster.');
    fireEvent.press(screen.getAllByText('STR')[0]!);
    fireEvent.press(screen.getAllByText('STR')[1]!);
    fireEvent.press(screen.getAllByText('CON')[1]!);
    fireEvent.press(screen.getByText('Continue'));
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

    test('shows structured proficiency builders instead of free-text syntax', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByText('Multiclass prerequisites')).toBeTruthy();
        });
        expect(screen.getByTestId('add-prerequisite')).toBeTruthy();
        expect(screen.getByTestId('add-fixed-STARTING')).toBeTruthy();
        expect(screen.getByTestId('add-choice-group-STARTING')).toBeTruthy();
        expect(screen.getByText('Starting proficiencies')).toBeTruthy();
        expect(screen.getByText('Multiclass proficiencies')).toBeTruthy();
        expect(screen.queryByText(/Comma-separated proficiency values/)).toBeNull();

        fireEvent.press(screen.getByTestId('add-prerequisite'));
        expect(screen.getByTestId('prerequisite-group-1')).toBeTruthy();
        expect(screen.getByText('+ Add OR alternative')).toBeTruthy();
    });

    test('allows adding the spellcasting ability modifier to prepared spells', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByText('Multiclass prerequisites')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));
        fireEvent.press(screen.getByText('WIS'));

        fireEvent.press(screen.getByTestId('custom-class-add-spellcasting-ability'));

        expect(screen.getByText('✓ Add spellcasting ability modifier to prepared spells')).toBeTruthy();
    });
});
