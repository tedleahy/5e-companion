import 'react-native-gesture-handler/jestSetup';
import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
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
    ...summary, __typename: 'ClassDetails', archived: false, sourceBook: 'SRD', equipment: [], proficiencies: [],
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
        expect(screen.getByTestId('add-custom-class')).toBeTruthy();
        fireEvent.press(screen.getByTestId('class-row-wizard'));
        await waitFor(() => expect(screen.getByText('Core rules')).toBeTruthy());
        expect(screen.queryByTestId('add-custom-class')).toBeNull();
        expect(screen.getByText('No SRD overview text is available.')).toBeTruthy();
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
