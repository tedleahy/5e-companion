import 'react-native-gesture-handler/jestSetup';
import type { ComponentProps } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useQuery } from '@apollo/client/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { PaperProvider } from 'react-native-paper';
import ClassCompendium from '@/components/classes/class-compendium';
import {
    ARCHIVE_CUSTOM_CLASS,
    CREATE_CUSTOM_CLASS,
    GET_AVAILABLE_CLASSES,
    GET_CLASS_DETAILS,
    GET_CUSTOM_CLASSES,
    GET_PROFICIENCIES,
} from '@/graphql/class.operations';
import { GET_COMPENDIUM_COUNTS } from '@/graphql/compendium.operations';
import type { CompendiumCountsQuery } from '@/types/generated_graphql_types';

/**
 * Keeps GET_COMPENDIUM_COUNTS active so mutation refetchQueries can refresh it.
 */
function CompendiumCountsProbe() {
    const { data } = useQuery<CompendiumCountsQuery>(GET_COMPENDIUM_COUNTS);
    return (
        <Text testID="probe-custom-class-count">
            {data?.compendiumCounts?.customClassCount ?? 'loading'}
        </Text>
    );
}

function renderCompendium(mocks: ComponentProps<typeof MockedProvider>['mocks']) {
    return render(
        <MockedProvider mocks={mocks} mockLinkDefaultOptions={{ delay: 0 }} showWarnings={false}>
            <PaperProvider>
                <CompendiumCountsProbe />
                <ClassCompendium />
            </PaperProvider>
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

const COUNTS_ONE_CUSTOM = {
    __typename: 'CompendiumCounts' as const,
    srdClassCount: 12,
    customClassCount: 1,
    srdSubclassCount: 0,
    customSubclassCount: 0,
    spellCount: 0,
};

const COUNTS_ZERO_CUSTOM = {
    ...COUNTS_ONE_CUSTOM,
    customClassCount: 0,
};

const COUNTS_TWO_CUSTOM = {
    ...COUNTS_ONE_CUSTOM,
    customClassCount: 2,
};

const proficiencyMocks: MockedResponse[] = [
    {
        request: { query: GET_PROFICIENCIES },
        result: {
            data: {
                proficiencies: [
                    { value: 'light-armor', name: 'Light Armor', type: 'ARMOR', isCustom: false },
                    { value: 'skill-acrobatics', name: 'Acrobatics', type: 'SKILL', isCustom: false },
                ],
            },
        },
        maxUsageCount: Number.POSITIVE_INFINITY,
    },
];

/**
 * Advances the custom-class editor from identity through review with a valid draft.
 */
function fillEditorThroughReview() {
    fireEvent.changeText(screen.getByTestId('custom-class-name'), 'Warden');
    fireEvent.changeText(screen.getByTestId('text-input-outlined'), 'A prepared caster.');
    fireEvent.press(screen.getAllByText('STR')[0]!);
    fireEvent.press(screen.getAllByText('STR')[1]!);
    fireEvent.press(screen.getAllByText('CON')[1]!);
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByText('Continue'));
}

describe('Classes compendium', () => {
    test('opens full class details and hides the add action', async () => {
        renderCompendium([
            { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY },
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
            { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY },
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
        let detailCalls = 0;
        renderCompendium([
            { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY },
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
            { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY },
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
            { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY },
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
        renderCompendium([
            { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY, delay: 0 },
            {
                request: { query: GET_AVAILABLE_CLASSES },
                result: { data: { availableClasses: [customSummary] } },
                maxUsageCount: Number.POSITIVE_INFINITY,
                delay: 0,
            },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'custom-warden' } },
                result: { data: { classDetails: customDetails } },
                maxUsageCount: Number.POSITIVE_INFINITY,
                delay: 0,
            },
            {
                request: { query: ARCHIVE_CUSTOM_CLASS, variables: { id: 'custom-warden' } },
                delay: 0,
                error: new Error('Archive boom'),
            },
            {
                request: { query: ARCHIVE_CUSTOM_CLASS, variables: { id: 'custom-warden' } },
                delay: 0,
                result: { data: { archiveCustomClass: true } },
            },
            {
                request: { query: GET_AVAILABLE_CLASSES },
                delay: 0,
                result: { data: { availableClasses: [] } },
            },
            {
                request: { query: GET_COMPENDIUM_COUNTS },
                delay: 0,
                result: { data: { compendiumCounts: COUNTS_ZERO_CUSTOM } },
            },
        ]);

        await waitFor(() => expect(screen.getByText('Warden')).toBeTruthy());
        fireEvent.press(screen.getByTestId('class-row-custom-warden'));
        await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
        fireEvent.press(screen.getByText('Archive'));
        await waitFor(() => expect(screen.getByText('Archive custom class?')).toBeTruthy());

        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
        await waitFor(() => expect(screen.getByTestId('confirm-dialog-error')).toBeTruthy());
        expect(screen.getByText('Archive boom')).toBeTruthy();
        expect(screen.getByText('Archive custom class?')).toBeTruthy();

        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
        await waitFor(() => expect(screen.queryByText('Archive custom class?')).toBeNull(), { timeout: 5_000 });
    });

    test('archives a custom class and refreshes compendium counts', async () => {
        let countsCalls = 0;

        renderCompendium([
            {
                request: { query: GET_COMPENDIUM_COUNTS },
                maxUsageCount: Number.POSITIVE_INFINITY,
                delay: 0,
                result: () => {
                    countsCalls += 1;
                    return {
                        data: {
                            compendiumCounts: countsCalls === 1 ? COUNTS_ONE_CUSTOM : COUNTS_ZERO_CUSTOM,
                        },
                    };
                },
            },
            {
                request: { query: GET_AVAILABLE_CLASSES },
                delay: 0,
                result: { data: { availableClasses: [customSummary] } },
            },
            {
                request: { query: GET_AVAILABLE_CLASSES },
                delay: 0,
                result: { data: { availableClasses: [] } },
            },
            {
                request: { query: GET_CLASS_DETAILS, variables: { value: 'custom-warden' } },
                delay: 0,
                result: { data: { classDetails: customDetails } },
            },
            {
                request: { query: ARCHIVE_CUSTOM_CLASS, variables: { id: 'custom-warden' } },
                delay: 0,
                result: { data: { archiveCustomClass: true } },
            },
        ]);

        await waitFor(() => expect(screen.getByTestId('probe-custom-class-count')).toHaveTextContent('1'));
        await waitFor(() => expect(screen.getByText('Warden')).toBeTruthy());
        fireEvent.press(screen.getByTestId('class-row-custom-warden'));
        await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
        fireEvent.press(screen.getByText('Archive'));
        await waitFor(() => expect(screen.getByText('Archive custom class?')).toBeTruthy());
        fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));

        await waitFor(() => expect(screen.queryByText('Archive custom class?')).toBeNull(), { timeout: 5_000 });
        await waitFor(() => expect(screen.getByTestId('probe-custom-class-count')).toHaveTextContent('0'));
        expect(countsCalls).toBeGreaterThan(1);
    });

    test('creates a custom class and refreshes compendium counts', async () => {
        let countsCalls = 0;
        const createdDetails = {
            ...customDetails,
            id: 'custom-new',
            value: 'custom-new',
            name: 'Warden',
            description: ['A prepared caster.'],
        };

        renderCompendium([
            {
                request: { query: GET_COMPENDIUM_COUNTS },
                maxUsageCount: Number.POSITIVE_INFINITY,
                result: () => {
                    countsCalls += 1;
                    return {
                        data: {
                            compendiumCounts: countsCalls === 1 ? COUNTS_ONE_CUSTOM : COUNTS_TWO_CUSTOM,
                        },
                    };
                },
            },
            {
                request: { query: GET_AVAILABLE_CLASSES },
                result: { data: { availableClasses: [summary] } },
                maxUsageCount: Number.POSITIVE_INFINITY,
            },
            {
                request: { query: GET_CUSTOM_CLASSES },
                result: { data: { customClasses: [{
                    __typename: 'AvailableClass',
                    id: 'custom-new',
                    value: 'custom-new',
                    srdIndex: null,
                    name: 'Warden',
                    emoji: '🛡️',
                    description: ['A prepared caster.'],
                    hitDie: 8,
                    primaryAbilityIndexes: ['str'],
                    savingThrowIndexes: ['str', 'con'],
                    spellcastingMode: 'NONE',
                    spellcastingAbility: null,
                    multiclassPrerequisites: [],
                    isCustom: true,
                }] } },
                maxUsageCount: Number.POSITIVE_INFINITY,
            },
            ...proficiencyMocks,
            {
                request: {
                    query: CREATE_CUSTOM_CLASS,
                    variables: () => true,
                },
                result: { data: { createCustomClass: createdDetails } },
            },
        ]);

        await waitFor(() => expect(screen.getByTestId('probe-custom-class-count')).toHaveTextContent('1'));
        await waitFor(() => expect(screen.getByText('Wizard')).toBeTruthy());
        fireEvent.press(screen.getByTestId('add-custom-class'));
        await waitFor(() => expect(screen.getByText('New custom class')).toBeTruthy());

        fillEditorThroughReview();
        await waitFor(() => expect(screen.getByLabelText('Save custom class')).toBeTruthy());
        fireEvent.press(screen.getByLabelText('Save custom class'));

        await waitFor(() => expect(screen.getByTestId('probe-custom-class-count')).toHaveTextContent('2'));
        expect(countsCalls).toBeGreaterThan(1);
    });

    test('blocks archive confirm/cancel while pending and submits only once', async () => {
        jest.useFakeTimers();
        try {
            const view = renderCompendium([
                { request: { query: GET_COMPENDIUM_COUNTS }, result: { data: { compendiumCounts: COUNTS_ONE_CUSTOM } }, maxUsageCount: Number.POSITIVE_INFINITY, delay: 0 },
                {
                    request: { query: GET_AVAILABLE_CLASSES },
                    result: { data: { availableClasses: [customSummary] } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                    delay: 0,
                },
                {
                    request: { query: GET_CLASS_DETAILS, variables: { value: 'custom-warden' } },
                    result: { data: { classDetails: customDetails } },
                    maxUsageCount: Number.POSITIVE_INFINITY,
                    delay: 0,
                },
                {
                    request: { query: ARCHIVE_CUSTOM_CLASS, variables: { id: 'custom-warden' } },
                    delay: 60_000,
                    result: { data: { archiveCustomClass: true } },
                },
            ]);

            await waitFor(() => expect(screen.getByText('Warden')).toBeTruthy());
            fireEvent.press(screen.getByTestId('class-row-custom-warden'));
            await waitFor(() => expect(screen.getByTestId('class-detail-loaded')).toBeTruthy());
            fireEvent.press(screen.getByText('Archive'));
            await waitFor(() => expect(screen.getByText('Archive custom class?')).toBeTruthy());

            fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
            await waitFor(() => expect(screen.getByLabelText('Archiving...')).toBeTruthy());

            fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
            fireEvent.press(screen.getByTestId('confirm-dialog-cancel'));
            fireEvent.press(screen.getByLabelText('Dismiss dialog'));
            expect(screen.getByText('Archive custom class?')).toBeTruthy();
            expect(screen.getByLabelText('Archiving...')).toBeTruthy();
            expect(screen.getByTestId('confirm-dialog-confirm').props.accessibilityState).toEqual(
                expect.objectContaining({ disabled: true }),
            );
            expect(screen.getByTestId('confirm-dialog-cancel').props.accessibilityState).toEqual(
                expect.objectContaining({ disabled: true }),
            );
            view.unmount();
        } finally {
            jest.clearAllTimers();
            jest.useRealTimers();
        }
    });
});
