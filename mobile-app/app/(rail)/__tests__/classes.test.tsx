import 'react-native-gesture-handler/jestSetup';
import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import { GraphQLError } from 'graphql';
import { PaperProvider } from 'react-native-paper';
import ClassCompendium from '@/components/classes/class-compendium';
import { GET_AVAILABLE_CLASSES, GET_CLASS_DETAILS } from '@/graphql/class.operations';

function renderCompendium(mocks: ComponentProps<typeof MockedProvider>['mocks']) {
    render(
        <MockedProvider mocks={mocks}>
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

describe('Classes compendium', () => {
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

    test('shows an error state with retry and retains All classes', async () => {
        let detailCalls = 0;
        renderCompendium([
            { request: { query: GET_AVAILABLE_CLASSES }, result: { data: { availableClasses: [summary] } } },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'wizard' } },
                result: () => {
                    detailCalls += 1;
                    if (detailCalls === 1) {
                        return { errors: [new GraphQLError('Detail boom')] };
                    }
                    return { data: { classDetails: details } };
                },
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
    });
});
