import 'react-native-gesture-handler/jestSetup';
import { BackHandler } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { PaperProvider } from 'react-native-paper';
import CustomClassEditor from '../custom-class-editor';
import {
    CREATE_CUSTOM_CLASS,
    GET_AVAILABLE_CLASSES,
    GET_CUSTOM_CLASSES,
    GET_PROFICIENCIES,
    UPDATE_CUSTOM_CLASS,
} from '@/graphql/class.operations';
import { GET_COMPENDIUM_COUNTS } from '@/graphql/compendium.operations';
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

function emptyProgression() {
    return Array.from({ length: 20 }, (_, index) => ({
        level: index + 1,
        abilityScoreImprovement: false,
        spellSlots: Array(9).fill(0),
        cantripsKnown: null,
        spellsKnown: null,
        preparedSpellCount: null,
        displayValues: [],
    }));
}

function classDetailsFixture(
    overrides: Partial<ClassDetailsFieldsFragment> = {},
): ClassDetailsFieldsFragment {
    return {
        id: 'custom-1',
        value: 'custom-1',
        srdIndex: null,
        name: 'Warden',
        emoji: '🛡️',
        description: ['A custom guardian.'],
        hitDie: 10,
        primaryAbilityIndexes: ['str'],
        savingThrowIndexes: ['str', 'con'],
        multiclassPrerequisites: [],
        proficiencies: [],
        equipment: [],
        spellcastingMode: 'NONE',
        spellcastingAbility: null,
        addSpellcastingAbility: false,
        progression: emptyProgression(),
        features: [],
        spells: [],
        isCustom: true,
        archived: false,
        sourceBook: null,
        characterUsageCount: 0,
        mechanicsLocked: false,
        mechanicsLockedReason: null,
        ...overrides,
    };
}

function renderEditor(
    onClose = jest.fn(),
    props: {
        initial?: ClassDetailsFieldsFragment | null;
        onSaved?: () => void;
        mocks?: MockedResponse[];
        visible?: boolean;
    } = {},
) {
    const { mocks = proficiencyMocks, visible = true, ...editorProps } = props;
    const view = render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <CustomClassEditor visible={visible} onClose={onClose} {...editorProps} />
            </PaperProvider>
        </MockedProvider>,
    );
    return { onClose, ...view };
}

function fillIdentityAndContinue() {
    fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
    fireEvent.changeText(screen.getByTestId('text-input-outlined'), 'A prepared caster.');
    fireEvent.press(screen.getAllByText('STR')[0]!);
    fireEvent.press(screen.getAllByText('STR')[1]!);
    fireEvent.press(screen.getAllByText('CON')[1]!);
    fireEvent.press(screen.getByText('Continue'));
}

function advanceToReview() {
    fillIdentityAndContinue();
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByText('Continue'));
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
        const { onClose } = renderEditor();
        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
        fireEvent.press(screen.getByLabelText('Dismiss custom class editor'));
        expect(screen.getByText('Discard custom class draft?')).toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    test('closes without a prompt when the draft is clean', () => {
        const { onClose } = renderEditor();
        fireEvent.press(screen.getByLabelText('Dismiss custom class editor'));
        expect(screen.queryByText('Discard custom class draft?')).toBeNull();
        expect(onClose).toHaveBeenCalled();
    });

    test('confirms discard and closes the sheet', () => {
        const { onClose } = renderEditor();
        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
        fireEvent.press(screen.getByLabelText('Dismiss custom class editor'));
        fireEvent.press(screen.getByLabelText('Discard'));
        expect(onClose).toHaveBeenCalled();
    });

    test('seeds edit mode from the initial class details', () => {
        renderEditor(jest.fn(), {
            initial: classDetailsFixture(),
        });

        expect(screen.getByText('Edit custom class')).toBeTruthy();
        expect(screen.getByDisplayValue('Warden')).toBeTruthy();
        expect(screen.getByDisplayValue('🛡️')).toBeTruthy();
    });

    test('preserves unsaved edits when the parent rerenders with equivalent initial data', () => {
        const initial = classDetailsFixture();
        const { rerender, onClose } = renderEditor(jest.fn(), { initial });

        fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Night Warden');
        expect(screen.getByDisplayValue('Night Warden')).toBeTruthy();

        rerender(
            <MockedProvider mocks={proficiencyMocks}>
                <PaperProvider>
                    <CustomClassEditor
                        visible
                        onClose={onClose}
                        initial={classDetailsFixture()}
                    />
                </PaperProvider>
            </MockedProvider>,
        );

        expect(screen.getByDisplayValue('Night Warden')).toBeTruthy();
    });

    test('handles hardware back through the sheet close path', () => {
        const { onClose } = renderEditor();
        const backHandler = (BackHandler.addEventListener as jest.Mock).mock.calls.at(-1)?.[1] as
            | (() => boolean)
            | undefined;
        expect(backHandler).toBeTruthy();
        expect(backHandler?.()).toBe(true);
        expect(onClose).toHaveBeenCalled();
    });

    test('shows category proficiency builders with Starting/Multiclass tabs', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        expect(screen.getByTestId('proficiency-tab-MULTICLASS')).toBeTruthy();
        expect(screen.getByTestId('proficiency-category-STARTING-ARMOR')).toBeTruthy();
        expect(screen.getByTestId('proficiency-category-STARTING-OTHER')).toBeTruthy();
        expect(screen.getByTestId('proficiency-tab-STARTING').props.accessibilityState).toEqual({
            selected: true,
        });
        expect(screen.queryByText(/Comma-separated proficiency values/)).toBeNull();

        // Empty categories start collapsed — expand Armor to reach the add control.
        fireEvent.press(screen.getByLabelText('Armor. None'));
        expect(screen.getByTestId('add-fixed-STARTING-ARMOR')).toBeTruthy();
        expect(screen.getByTestId('toggle-choice-STARTING-ARMOR')).toBeTruthy();

        fireEvent.press(screen.getByTestId('proficiency-tab-MULTICLASS'));
        expect(screen.getByTestId('proficiency-tab-MULTICLASS').props.accessibilityState).toEqual({
            selected: true,
        });
        expect(screen.getByText('Multiclass prerequisites')).toBeTruthy();
        expect(screen.getByTestId('add-prerequisite')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-prerequisite'));
        expect(screen.getByTestId('prerequisite-group-1')).toBeTruthy();
        expect(screen.getByText('+ Add OR alternative')).toBeTruthy();
    });

    test('hardware back closes the nested proficiency picker before the outer editor sheet', async () => {
        const { onClose } = renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByLabelText('Armor. None')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Armor. None'));
        fireEvent.press(screen.getByTestId('add-fixed-STARTING-ARMOR'));
        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();

        // The picker's own listener is registered after the editor's, since it can
        // only mount once the editor sheet is already open — it must run first.
        const backHandler = (BackHandler.addEventListener as jest.Mock).mock.calls.at(-1)?.[1] as
            | (() => boolean)
            | undefined;
        expect(backHandler).toBeTruthy();
        act(() => {
            expect(backHandler?.()).toBe(true);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('proficiency-picker-sheet')).toBeNull();
        });
        // The outer editor sheet is untouched by the picker's back handling.
        expect(screen.getByTestId('custom-class-editor-sheet')).toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    test('confirms a proficiency picker selection with Done', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByLabelText('Armor. None')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Armor. None'));

        fireEvent.press(screen.getByTestId('add-fixed-STARTING-ARMOR'));
        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();
        expect(screen.queryByText('Cancel')).toBeNull();

        fireEvent.press(screen.getByTestId('proficiency-option-light-armor'));
        fireEvent.press(screen.getByTestId('proficiency-picker-confirm'));

        await waitFor(() => {
            expect(screen.queryByTestId('proficiency-picker-sheet')).toBeNull();
            expect(screen.getByText('Light Armor')).toBeTruthy();
        });
    });

    test('confirms before discarding changed proficiency selections', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByLabelText('Armor. None')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Armor. None'));

        fireEvent.press(screen.getByTestId('add-fixed-STARTING-ARMOR'));
        fireEvent.press(screen.getByTestId('proficiency-option-light-armor'));
        fireEvent.press(screen.getByLabelText('Dismiss proficiency picker'));

        await waitFor(() => {
            expect(screen.getByText('Discard proficiency changes?')).toBeTruthy();
        });
        expect(screen.getByText('Your unsaved proficiency selections will be lost.')).toBeTruthy();
        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Keep Editing'));
        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Dismiss proficiency picker'));
        await waitFor(() => {
            expect(screen.getByText('Discard proficiency changes?')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Discard'));

        await waitFor(() => {
            expect(screen.queryByTestId('proficiency-picker-sheet')).toBeNull();
            expect(screen.queryByText('Light Armor')).toBeNull();
        });
    });

    test('shows structured equipment builders instead of pipe-delimited DSL', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));

        expect(screen.getByTestId('equipment-editor')).toBeTruthy();
        expect(screen.getByTestId('add-fixed-equipment')).toBeTruthy();
        expect(screen.getByTestId('add-equipment-choice-group')).toBeTruthy();
        expect(screen.queryByText(/One per line/)).toBeNull();

        fireEvent.press(screen.getByTestId('add-fixed-equipment'));
        const nameInput = screen.getAllByTestId(/equipment-name-/)[0]!;
        expect(nameInput).toBeTruthy();
        expect(screen.getAllByTestId(/equipment-qty-/)[0]).toHaveTextContent('1');
        fireEvent.changeText(nameInput, 'Shield');
        fireEvent.press(screen.getAllByTestId(/equipment-qty-inc-/)[0]!);
        expect(screen.getAllByTestId(/equipment-qty-/)[0]).toHaveTextContent('2');

        fireEvent.press(screen.getByTestId('add-equipment-choice-group'));
        expect(screen.getByTestId('equipment-choice-group-1')).toBeTruthy();
        expect(screen.getByText('Choose')).toBeTruthy();
        expect(screen.getByText('+ Add option')).toBeTruthy();

        fireEvent.press(screen.getByText('Continue'));
        expect(
            screen.getByText('Every equipment entry needs a name and a quantity of at least 1.'),
        ).toBeTruthy();
        expect(screen.getByText('Equipment')).toBeTruthy();
    });

    test('hides spellcasting progression fields when mode is NONE', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));

        expect(screen.getByText('Spellcasting mode')).toBeTruthy();
        expect(screen.queryByTestId('spell-slots-standard')).toBeNull();
        expect(screen.queryByTestId('spell-slots-pact')).toBeNull();
        expect(screen.queryByText('Cantrips known')).toBeNull();
        expect(screen.queryByText('Spells known')).toBeNull();
        expect(screen.queryByText('Prepared base')).toBeNull();
        expect(screen.queryByTestId('custom-class-add-spellcasting-ability')).toBeNull();

        fireEvent.press(screen.getByTestId('progression-level-summary'));
        fireEvent.press(screen.getByTestId('progression-level-2'));
        expect(screen.queryByTestId('progression-copy-toast')).toBeNull();

        fireEvent.press(screen.getByText('STANDARD'));
        expect(screen.getByTestId('spell-slots-standard')).toBeTruthy();
        expect(screen.getByText('Spell slots by level')).toBeTruthy();
        expect(screen.getByText('Spells known at this level')).toBeTruthy();
        expect(screen.getByTestId('spells-known-at-level')).toBeTruthy();
        expect(screen.getByText('Cantrips known')).toBeTruthy();
        expect(screen.getByTestId('custom-class-add-spellcasting-ability')).toBeTruthy();
        expect(screen.getByTestId('progression-level-summary')).not.toHaveTextContent('slots');
        expect(screen.getAllByRole('switch')).toHaveLength(2);
    });

    test('uses pact level and count controls for PACT MAGIC', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('PACT MAGIC'));

        expect(screen.getByTestId('spell-slots-pact')).toBeTruthy();
        expect(screen.queryByTestId('spell-slots-standard')).toBeNull();
        expect(screen.getByText('Slot level')).toBeTruthy();
        expect(screen.getByText('Slot count')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Increase pact slot level'));
        expect(screen.getByTestId('pact-slot-level')).toHaveTextContent('2');
        fireEvent.press(screen.getByLabelText('Increase pact slot count'));
        expect(screen.getByTestId('pact-slot-count')).toHaveTextContent('1');
    });

    test('edits standard spell slots with per-level steppers', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));

        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('0');
        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('2');
    });

    test('prefills the next progression level from the previous level via the level map', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));

        fireEvent.press(screen.getByTestId('progression-level-summary'));
        fireEvent.press(screen.getByTestId('progression-level-2'));
        expect(screen.queryByTestId('progression-copy-toast')).toBeNull();
        fireEvent.press(screen.getByTestId('progression-level-summary'));
        fireEvent.press(screen.getByTestId('progression-level-1'));

        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 2nd spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 2nd spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 2nd spell slots'));
        fireEvent.press(screen.getByLabelText('Increase cantrips known'));
        fireEvent.press(screen.getByLabelText('Increase cantrips known'));
        fireEvent.press(screen.getByTestId('custom-class-add-spellcasting-ability'));

        fireEvent.press(screen.getByTestId('progression-level-summary'));
        fireEvent.press(screen.getByTestId('progression-level-2'));

        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('4');
        expect(screen.getByTestId('spell-slot-level-2')).toHaveTextContent('3');
        expect(screen.getByTestId('cantrips-known')).toHaveTextContent('2');
        expect(screen.getByTestId('custom-class-add-spellcasting-ability').props.accessibilityState).toEqual(
            expect.objectContaining({ checked: true }),
        );
        expect(screen.getByTestId('progression-copy-toast')).toHaveTextContent(/Copied from level 1/);
    });

    test('jumps to any level from the heatmap and can copy from the previous level', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));

        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase 1st spell slots'));
        fireEvent.press(screen.getByLabelText('Increase cantrips known'));

        fireEvent.press(screen.getByTestId('progression-level-summary'));
        expect(screen.getByText('Jump to level')).toBeTruthy();
        fireEvent.press(screen.getByTestId('progression-level-5'));

        expect(screen.getByTestId('progression-level-detail')).toHaveTextContent(/Level 5/);
        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('0');
        expect(screen.queryByTestId('progression-copy-toast')).toBeNull();

        fireEvent.press(screen.getByTestId('progression-level-summary'));
        fireEvent.press(screen.getByTestId('progression-level-map-close'));
        expect(screen.getByTestId('progression-level-summary')).toBeTruthy();

        fireEvent.press(screen.getByTestId('progression-level-summary'));
        fireEvent.press(screen.getByTestId('progression-level-2'));

        expect(screen.getByTestId('progression-level-detail')).toHaveTextContent(/Level 2/);
        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('0');
        expect(screen.queryByTestId('progression-copy-toast')).toBeNull();

        fireEvent.press(screen.getByTestId('progression-copy-previous'));
        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('2');
        expect(screen.getByTestId('cantrips-known')).toHaveTextContent('1');
        expect(screen.getByTestId('progression-copy-toast')).toHaveTextContent(/Copied from level 1/);

        fireEvent.press(screen.getByTestId('progression-copy-undo'));
        expect(screen.getByTestId('spell-slot-level-1')).toHaveTextContent('0');
        expect(screen.getByTestId('cantrips-known')).toHaveTextContent('0');
        expect(screen.queryByTestId('progression-copy-toast')).toBeNull();
    });

    test('edits cantrips, spells known, and prepared base with steppers', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));

        expect(screen.getByTestId('cantrips-known')).toHaveTextContent('0');
        expect(screen.getByTestId('spells-known')).toHaveTextContent('0');
        expect(screen.getByTestId('prepared-base')).toHaveTextContent('0');

        fireEvent.press(screen.getByLabelText('Increase cantrips known'));
        expect(screen.getByTestId('cantrips-known')).toHaveTextContent('1');
        fireEvent.press(screen.getByLabelText('Decrease cantrips known'));
        expect(screen.getByTestId('cantrips-known')).toHaveTextContent('0');

        fireEvent.press(screen.getByLabelText('Increase spells known'));
        expect(screen.getByTestId('spells-known')).toHaveTextContent('1');

        fireEvent.press(screen.getByLabelText('Increase prepared base'));
        fireEvent.press(screen.getByLabelText('Increase prepared base'));
        expect(screen.getByTestId('prepared-base')).toHaveTextContent('2');
    });

    test('allows adding the spellcasting ability modifier to prepared spells', async () => {
        renderEditor();
        fillIdentityAndContinue();

        await waitFor(() => {
            expect(screen.getByTestId('proficiency-tab-STARTING')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('Continue'));
        fireEvent.press(screen.getByText('STANDARD'));
        fireEvent.press(screen.getByText('WIS'));

        fireEvent.press(screen.getByTestId('custom-class-add-spellcasting-ability'));

        expect(screen.getByTestId('custom-class-add-spellcasting-ability').props.accessibilityState).toEqual(
            expect.objectContaining({ checked: true }),
        );
    });

    test('submits a create mutation from review and closes on success', async () => {
        const created = classDetailsFixture({ id: 'custom-new', value: 'custom-new', name: 'Warden' });
        const onSaved = jest.fn();
        const { onClose } = renderEditor(jest.fn(), {
            onSaved,
            mocks: [
                ...proficiencyMocks,
                {
                    request: { query: CREATE_CUSTOM_CLASS, variables: () => true },
                    result: { data: { createCustomClass: created } },
                },
                {
                    request: { query: GET_AVAILABLE_CLASSES },
                    result: { data: { availableClasses: [] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
                {
                    request: { query: GET_CUSTOM_CLASSES },
                    result: { data: { customClasses: [] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
                {
                    request: { query: GET_COMPENDIUM_COUNTS },
                    result: {
                        data: {
                            compendiumCounts: {
                                srdClassCount: 12,
                                customClassCount: 1,
                                srdSubclassCount: 0,
                                customSubclassCount: 0,
                                spellCount: 0,
                            },
                        },
                    },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
            ],
        });

        advanceToReview();
        await waitFor(() => expect(screen.getByLabelText('Save custom class')).toBeTruthy());
        fireEvent.press(screen.getByLabelText('Save custom class'));

        await waitFor(() => expect(onSaved).toHaveBeenCalled());
        expect(onClose).toHaveBeenCalled();
    });

    test('submits an update mutation for an existing class', async () => {
        const initial = classDetailsFixture();
        const onSaved = jest.fn();
        renderEditor(jest.fn(), {
            initial,
            onSaved,
            mocks: [
                ...proficiencyMocks,
                {
                    request: { query: UPDATE_CUSTOM_CLASS, variables: () => true },
                    result: { data: { updateCustomClass: initial } },
                },
                {
                    request: { query: GET_AVAILABLE_CLASSES },
                    result: { data: { availableClasses: [] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
                {
                    request: { query: GET_CUSTOM_CLASSES },
                    result: { data: { customClasses: [] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
            ],
        });

        fireEvent.changeText(screen.getByTestId('text-input-outlined'), 'Updated description.');
        for (let index = 0; index < 5; index += 1) {
            fireEvent.press(screen.getByText('Continue'));
        }
        await waitFor(() => expect(screen.getByLabelText('Save custom class')).toBeTruthy());
        fireEvent.press(screen.getByLabelText('Save custom class'));

        await waitFor(() => expect(onSaved).toHaveBeenCalled());
    });

    test('surfaces mutation failures without closing the editor', async () => {
        renderEditor(jest.fn(), {
            mocks: [
                ...proficiencyMocks,
                {
                    request: { query: CREATE_CUSTOM_CLASS, variables: () => true },
                    error: new Error('Name already exists.'),
                },
            ],
        });

        advanceToReview();
        await waitFor(() => expect(screen.getByLabelText('Save custom class')).toBeTruthy());
        fireEvent.press(screen.getByLabelText('Save custom class'));

        await waitFor(() => expect(screen.getByText('Name already exists.')).toBeTruthy());
        expect(screen.getByTestId('custom-class-editor-sheet')).toBeTruthy();
    });

    test('allows locked descriptive saves while keeping mechanics read-only', async () => {
        const initial = classDetailsFixture({
            mechanicsLocked: true,
            mechanicsLockedReason: 'Mechanics are locked because 1 character(s) use this class.',
            characterUsageCount: 1,
            features: [{ id: 'feat-1', name: 'Vigilance', description: 'Remain alert.', level: 1 }],
        });
        const onSaved = jest.fn();
        renderEditor(jest.fn(), {
            initial,
            onSaved,
            mocks: [
                ...proficiencyMocks,
                {
                    request: { query: UPDATE_CUSTOM_CLASS, variables: () => true },
                    result: { data: { updateCustomClass: initial } },
                },
                {
                    request: { query: GET_AVAILABLE_CLASSES },
                    result: { data: { availableClasses: [] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
                {
                    request: { query: GET_CUSTOM_CLASSES },
                    result: { data: { customClasses: [] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                },
            ],
        });

        expect(screen.getByText(/Mechanics are locked/)).toBeTruthy();
        fireEvent.changeText(screen.getByTestId('text-input-outlined'), 'Still editable flavour.');
        for (let index = 0; index < 5; index += 1) {
            fireEvent.press(screen.getByText('Continue'));
        }
        await waitFor(() => expect(screen.getByLabelText('Save custom class')).toBeTruthy());
        fireEvent.press(screen.getByLabelText('Save custom class'));

        await waitFor(() => expect(onSaved).toHaveBeenCalled());
    });
});
