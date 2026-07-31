import 'react-native-gesture-handler/jestSetup';
import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import { GraphQLError } from 'graphql';
import { PaperProvider } from 'react-native-paper';
import ClassCompendium from '@/components/classes/class-compendium';
import {
    GET_AVAILABLE_CLASSES,
    GET_CLASS_DETAILS,
} from '@/graphql/class.operations';
import { GET_COMPENDIUM_COUNTS } from '@/graphql/compendium.operations';

let mockArchiveClass: jest.Mock | null = null;

jest.mock('@apollo/client/react', () => {
    const actual = jest.requireActual('@apollo/client/react');

    return {
        ...actual,
        useMutation: (document: { definitions?: { kind: string; name?: { value: string } }[] }) => {
            const operationName = document.definitions
                ?.find((definition) => definition.kind === 'OperationDefinition')
                ?.name?.value;

            if (operationName === 'ArchiveCustomClass' && mockArchiveClass) {
                return [mockArchiveClass, { loading: false }];
            }

            return actual.useMutation(document);
        },
    };
});

/** Renders the class compendium with its Apollo and Paper providers. */
function renderCompendium(mocks: ComponentProps<typeof MockedProvider>['mocks']) {
    return render(
        <MockedProvider mocks={mocks} mockLinkDefaultOptions={{ delay: 0 }} showWarnings={false}>
            <PaperProvider><ClassCompendium /></PaperProvider>
        </MockedProvider>,
    );
}

const summary = {
    __typename: 'AvailableClass', id: 'class-wizard', value: 'wizard', srdIndex: 'wizard', name: 'Wizard',
    emoji: '📖',
    description: [], hitDie: 6, primaryAbilityIndexes: ['int'], savingThrowIndexes: ['int', 'wis'],
    spellcastingMode: 'STANDARD', spellcastingAbility: 'int', multiclassPrerequisites: [{ __typename: 'ClassMulticlassPrerequisite', abilityIndex: 'int', minimum: 13, group: 1 }], isCustom: false,
};
const details = {
    ...summary, __typename: 'ClassDetails', archived: false, sourceBook: 'SRD',
    equipment: [
        { __typename: 'ClassEquipmentDefinition', name: 'Quarterstaff', quantity: 1, choiceGroup: null, choiceCount: null },
        { __typename: 'ClassEquipmentDefinition', name: 'Component pouch', quantity: 1, choiceGroup: 1, choiceCount: 1 },
        { __typename: 'ClassEquipmentDefinition', name: 'Arcane focus', quantity: 1, choiceGroup: 1, choiceCount: 1 },
    ],
    proficiencies: [
        { __typename: 'ClassProficiency', value: 'skill-arcana', name: 'Arcana', type: 'SKILL', grant: 'STARTING', choiceGroup: null, choiceCount: null },
        { __typename: 'ClassProficiency', value: 'skill-history', name: 'History', type: 'SKILL', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
        { __typename: 'ClassProficiency', value: 'skill-insight', name: 'Insight', type: 'SKILL', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
        { __typename: 'ClassProficiency', value: 'skill-investigation', name: 'Investigation', type: 'SKILL', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
    ],
    addSpellcastingAbility: false,
    progression: [], features: [], spells: [], characterUsageCount: 0, mechanicsLocked: false, mechanicsLockedReason: null,
};

const customSummary = {
    ...summary,
    id: 'custom-warden',
    value: 'custom-warden',
    srdIndex: null,
    name: 'Warden',
    emoji: '🛡️',
    isCustom: true,
    hitDie: 10,
    primaryAbilityIndexes: ['str'],
    savingThrowIndexes: ['str', 'con'],
    spellcastingMode: 'NONE',
    spellcastingAbility: null,
    multiclassPrerequisites: [],
};

const customDetails = {
    ...details,
    ...customSummary,
    __typename: 'ClassDetails' as const,
    sourceBook: null,
    equipment: [],
    proficiencies: [],
    description: ['A custom guardian.'],
};

/** Opens the archive confirmation for the Warden fixture. */
async function openWardenArchiveDialog() {
    await waitFor(() => expect(screen.getByText('Warden')).toBeTruthy());
    fireEvent.press(screen.getByTestId('class-row-custom-warden'));
    await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
    fireEvent.press(screen.getByText('Archive'));
    await waitFor(() => expect(screen.getByText('Archive custom class?')).toBeTruthy());
}

describe('Classes compendium', () => {
    beforeEach(() => {
        mockArchiveClass = null;
    });

    test('opens full class details and hides the add action', async () => {
        renderCompendium([
            { request: { query: GET_AVAILABLE_CLASSES }, result: { data: { availableClasses: [summary] } } },
            { request: { query: GET_CLASS_DETAILS, variables: { value: 'wizard' } }, result: { data: { classDetails: details } } },
        ]);

        await waitFor(() => expect(screen.getByText('Wizard')).toBeTruthy());
        expect(screen.getByText('📖')).toBeTruthy();
        expect(screen.getByTestId('add-custom-class')).toBeTruthy();
        fireEvent.press(screen.getByTestId('class-row-wizard'));
        await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
        expect(screen.queryByTestId('add-custom-class')).toBeNull();
        expect(screen.getByText('No SRD overview text is available.')).toBeTruthy();
        expect(screen.getByText('Starting · Arcana')).toBeTruthy();
        expect(screen.getByText('Starting · Choose 2 of History, Insight, Investigation')).toBeTruthy();
        expect(screen.getByText('1× Quarterstaff')).toBeTruthy();
        expect(screen.getByText('Choose 1 of 1× Component pouch, 1× Arcane focus')).toBeTruthy();
        expect(screen.getByTestId('class-detail-all-classes')).toBeTruthy();
    });

    test('names the selected class in the back bar while details load', async () => {
        renderCompendium([
            { request: { query: GET_AVAILABLE_CLASSES }, result: { data: { availableClasses: [summary] } } },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'wizard' } },
                result: { data: { classDetails: details } },
                delay: 80,
            },
        ]);

        await waitFor(() => expect(screen.getByText('Wizard')).toBeTruthy());
        fireEvent.press(screen.getByTestId('class-row-wizard'));

        await waitFor(() => expect(screen.getByTestId('class-detail-loading')).toBeTruthy());
        expect(screen.getByText('Wizard')).toBeTruthy();

        await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
    });

    test('shows an error state with retry and retains All classes', async () => {
        renderCompendium([
            { request: { query: GET_AVAILABLE_CLASSES }, result: { data: { availableClasses: [summary] } } },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'wizard' } },
                result: { errors: [new GraphQLError('Detail boom')] },
            },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'wizard' } },
                result: { data: { classDetails: details } },
            },
        ]);

        await waitFor(() => expect(screen.getByText('Wizard')).toBeTruthy());
        fireEvent.press(screen.getByTestId('class-row-wizard'));
        await waitFor(() => expect(screen.getByTestId('class-detail-error')).toBeTruthy());
        expect(screen.getByTestId('class-detail-all-classes')).toBeTruthy();
        expect(screen.getByTestId('class-detail-retry')).toBeTruthy();

        fireEvent.press(screen.getByTestId('class-detail-retry'));
        await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
    });

    test('shows not-found when details resolve to null and retains All classes', async () => {
        renderCompendium([
            { request: { query: GET_AVAILABLE_CLASSES }, result: { data: { availableClasses: [summary] } } },
            { request: { query: GET_CLASS_DETAILS, variables: { value: 'wizard' } }, result: { data: { classDetails: null } } },
        ]);

        await waitFor(() => expect(screen.getByText('Wizard')).toBeTruthy());
        fireEvent.press(screen.getByTestId('class-row-wizard'));
        await waitFor(() => expect(screen.getByTestId('class-detail-not-found')).toBeTruthy());
        expect(screen.getByText('Class details were not found.')).toBeTruthy();
        expect(screen.getByTestId('class-detail-all-classes')).toBeTruthy();
    });

    test('opens the custom class editor sheet in place', async () => {
        renderCompendium([
            { request: { query: GET_AVAILABLE_CLASSES }, result: { data: { availableClasses: [summary] } } },
        ]);

        await waitFor(() => expect(screen.getByText('Wizard')).toBeTruthy());
        expect(screen.queryByTestId('custom-class-editor-sheet')).toBeNull();
        fireEvent.press(screen.getByTestId('add-custom-class'));
        expect(screen.getByTestId('custom-class-editor-sheet')).toBeTruthy();
        expect(screen.getByText('New custom class')).toBeTruthy();
        fireEvent.press(screen.getByLabelText('Dismiss custom class editor'));
        await waitFor(() => expect(screen.queryByTestId('custom-class-editor-sheet')).toBeNull());
    });

    test('keeps archive failures in the modal and allows retry', async () => {
        mockArchiveClass = jest.fn()
            .mockRejectedValueOnce(new Error('Archive boom'))
            .mockResolvedValueOnce({ data: { archiveCustomClass: true } });

        renderCompendium([
            {
                request: { query: GET_AVAILABLE_CLASSES },
                result: { data: { availableClasses: [customSummary] } },
                delay: 0,
            },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'custom-warden' } },
                result: { data: { classDetails: customDetails } },
                delay: 0,
            },
        ]);

        await openWardenArchiveDialog();

        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
        await waitFor(() => expect(screen.getByTestId('confirm-dialog-error')).toBeTruthy());
        expect(screen.getByText('Archive boom')).toBeTruthy();
        expect(screen.getByText('Archive custom class?')).toBeTruthy();

        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
        await waitFor(() => {
            expect(mockArchiveClass).toHaveBeenCalledTimes(2);
            expect(screen.getByTestId('add-custom-class')).toBeTruthy();
            expect(screen.queryByTestId('class-detail-loaded')).toBeNull();
        });
    });

    test('archives a custom class and requests refreshed compendium data', async () => {
        mockArchiveClass = jest.fn().mockResolvedValue({ data: { archiveCustomClass: true } });

        renderCompendium([
            {
                request: { query: GET_AVAILABLE_CLASSES },
                delay: 0,
                result: { data: { availableClasses: [customSummary] } },
            },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'custom-warden' } },
                delay: 0,
                result: { data: { classDetails: customDetails } },
            },
        ]);

        await openWardenArchiveDialog();
        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));

        await waitFor(() => {
            expect(mockArchiveClass).toHaveBeenCalledWith({
                variables: { id: 'custom-warden' },
                refetchQueries: [GET_AVAILABLE_CLASSES, GET_COMPENDIUM_COUNTS],
            });
            expect(screen.getByTestId('add-custom-class')).toBeTruthy();
            expect(screen.queryByTestId('class-detail-loaded')).toBeNull();
        });
    });

    test('blocks archive confirm/cancel while pending and submits only once', async () => {
        mockArchiveClass = jest.fn(() => new Promise(() => {}));
        const view = renderCompendium([
            {
                request: { query: GET_AVAILABLE_CLASSES },
                result: { data: { availableClasses: [customSummary] } },
                delay: 0,
            },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'custom-warden' } },
                result: { data: { classDetails: customDetails } },
                delay: 0,
            },
        ]);

        await openWardenArchiveDialog();

        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
        await waitFor(() => expect(screen.getByLabelText('Archiving...')).toBeTruthy());

        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
        fireEvent.press(screen.getByTestId('confirm-dialog-cancel'));
        fireEvent.press(screen.getByLabelText('Dismiss dialog'));
        expect(mockArchiveClass).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Archive custom class?')).toBeTruthy();
        expect(screen.getByLabelText('Archiving...')).toBeTruthy();
        expect(screen.getByTestId('confirm-dialog-confirm').props.accessibilityState).toEqual(
            expect.objectContaining({ disabled: true }),
        );
        expect(screen.getByTestId('confirm-dialog-cancel').props.accessibilityState).toEqual(
            expect.objectContaining({ disabled: true }),
        );
        view.unmount();
    });
});
