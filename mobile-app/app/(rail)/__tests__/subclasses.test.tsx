import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import CustomSubclassesScreen from '../subclasses';
import {
    ARCHIVE_CUSTOM_SUBCLASS,
    CREATE_CUSTOM_SUBCLASS,
    GET_CUSTOM_SUBCLASSES,
    UPDATE_CUSTOM_SUBCLASS,
} from '@/graphql/customSubclass.operations';
import { GET_AVAILABLE_SUBCLASSES } from '@/graphql/subclassManager.operations';
import { supabase } from '@/lib/supabase';

const mockReplace = jest.fn();
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockCreateCustomSubclass = jest.fn();
const mockUpdateCustomSubclass = jest.fn();
const mockArchiveCustomSubclass = jest.fn();
const mockRefetchQueries = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: mockReplace,
        back: jest.fn(),
    }),
}));

jest.mock('@apollo/client/react', () => ({
    useApolloClient: () => ({
        refetchQueries: mockRefetchQueries,
    }),
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: (document: { definitions?: { kind: string; name?: { value: string } }[] }) => {
        mockUseMutation(document);
        const operationName = document.definitions?.find((definition) => definition.kind === 'OperationDefinition')?.name?.value;

        if (operationName === 'CreateCustomSubclass') {
            return [mockCreateCustomSubclass, { loading: false }];
        }

        if (operationName === 'UpdateCustomSubclass') {
            return [mockUpdateCustomSubclass, { loading: false }];
        }

        if (operationName === 'ArchiveCustomSubclass') {
            return [mockArchiveCustomSubclass, { loading: false }];
        }

        return [jest.fn(), { loading: false }];
    },
}));

jest.mock('@/components/navigation/RailScreenShell', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
}));

type AvailableSubclassRow = {
    __typename: 'AvailableSubclass';
    id: string;
    value: string;
    srdIndex: string | null;
    classId: string;
    className: string;
    name: string;
    description: string[];
    isCustom: boolean;
    features: {
        __typename: 'AvailableSubclassFeature';
        id: string;
        name: string;
        description: string;
        level: number;
    }[];
};

type CustomSubclassRow = {
    __typename: 'CustomSubclass';
    id: string;
    value: string;
    classId: string;
    className: string;
    name: string;
    description: string[];
    characterUsageCount: number;
    features: {
        __typename: 'AvailableSubclassFeature';
        id: string;
        name: string;
        description: string;
        level: number;
    }[];
};

const WIZARD_AVAILABLE_SUBCLASS: AvailableSubclassRow = {
    __typename: 'AvailableSubclass',
    id: 'custom-subclass-1',
    value: 'custom-subclass-1',
    srdIndex: null,
    classId: 'wizard',
    className: 'Wizard',
    name: 'School of Lanterns',
    description: ['You bind floating lanterns to defensive spellwork.'],
    isCustom: true,
    features: [],
};

const WIZARD_SUBCLASS_FEATURES: AvailableSubclassRow['features'] = [
    {
        __typename: 'AvailableSubclassFeature',
        id: 'feature-lantern-ward',
        name: 'Lantern Ward',
        description: 'You raise a ward of floating lights.',
        level: 2,
    },
    {
        __typename: 'AvailableSubclassFeature',
        id: 'feature-beacon-step',
        name: 'Beacon Step',
        description: 'You step between friendly lights.',
        level: 6,
    },
];

const WIZARD_AVAILABLE_SUBCLASS_WITH_FEATURES: AvailableSubclassRow = {
    ...WIZARD_AVAILABLE_SUBCLASS,
    features: WIZARD_SUBCLASS_FEATURES,
};

const WIZARD_CUSTOM_SUBCLASS_UNUSED: CustomSubclassRow = {
    __typename: 'CustomSubclass',
    id: 'custom-subclass-1',
    value: 'custom-subclass-1',
    classId: 'wizard',
    className: 'Wizard',
    name: 'School of Lanterns',
    description: ['You bind floating lanterns to defensive spellwork.'],
    characterUsageCount: 0,
    features: [],
};

const WIZARD_CUSTOM_SUBCLASS_WITH_FEATURES: CustomSubclassRow = {
    ...WIZARD_CUSTOM_SUBCLASS_UNUSED,
    features: WIZARD_SUBCLASS_FEATURES,
};

const WIZARD_CUSTOM_SUBCLASS_IN_USE: CustomSubclassRow = {
    ...WIZARD_CUSTOM_SUBCLASS_UNUSED,
    characterUsageCount: 2,
};

const FIGHTER_AVAILABLE_SUBCLASS: AvailableSubclassRow = {
    __typename: 'AvailableSubclass',
    id: 'custom-subclass-2',
    value: 'custom-subclass-2',
    srdIndex: null,
    classId: 'fighter',
    className: 'Fighter',
    name: 'Banner Knight',
    description: ['You carry a battle standard into every fray.'],
    isCustom: true,
    features: [],
};

const FIGHTER_MUTATION_SUBCLASS = {
    ...FIGHTER_AVAILABLE_SUBCLASS,
    __typename: 'CustomSubclass',
    characterUsageCount: 0,
};

const SRD_WIZARD_SUBCLASS: AvailableSubclassRow = {
    __typename: 'AvailableSubclass',
    id: 'srd-subclass-evocation',
    value: 'evocation',
    srdIndex: 'evocation',
    classId: 'wizard',
    className: 'Wizard',
    name: 'School of Evocation',
    description: ['You focus your study on magic that creates powerful elemental effects.'],
    isCustom: false,
    features: [],
};

const SRD_WIZARD_SUBCLASS_WITH_FEATURES: AvailableSubclassRow = {
    ...SRD_WIZARD_SUBCLASS,
    features: [
        {
            __typename: 'AvailableSubclassFeature',
            id: 'feature-sculpt-spells',
            name: 'Sculpt Spells',
            description: 'Protect allies from your evocations.',
            level: 2,
        },
    ],
};

function operationName(document: { definitions?: { kind: string; name?: { value: string } }[] }): string | undefined {
    return document.definitions?.find((definition) => definition.kind === 'OperationDefinition')?.name?.value;
}

function mockSubclassQueries({
    availableSubclasses = [],
    customSubclasses = [],
    loading = false,
    error = undefined,
}: {
    availableSubclasses?: AvailableSubclassRow[];
    customSubclasses?: CustomSubclassRow[];
    loading?: boolean;
    error?: Error | undefined;
} = {}) {
    mockUseQuery.mockImplementation((document: { definitions?: { kind: string; name?: { value: string } }[] }) => {
        const name = operationName(document);

        if (name === 'AvailableSubclasses') {
            return {
                data: error ? undefined : { availableSubclasses },
                loading,
                error,
            };
        }

        if (name === 'CustomSubclasses') {
            return {
                data: error ? undefined : { customSubclasses },
                loading,
                error,
            };
        }

        return {
            data: undefined,
            loading,
            error,
        };
    });
}

/**
 * Renders the screen with the Paper portal host and flushes session effects.
 */
async function renderScreenAndFlush() {
    render(
        <PaperProvider>
            <CustomSubclassesScreen />
        </PaperProvider>,
    );

    await act(async () => {
        await Promise.resolve();
    });
}

describe('CustomSubclassesScreen', () => {
    const mockGetSession = supabase.auth.getSession as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: 'token-123' } },
            error: null,
        });
        mockSubclassQueries();
        mockRefetchQueries.mockResolvedValue([]);
        mockCreateCustomSubclass.mockResolvedValue({ data: { createCustomSubclass: FIGHTER_MUTATION_SUBCLASS } });
        mockUpdateCustomSubclass.mockResolvedValue({ data: { updateCustomSubclass: FIGHTER_MUTATION_SUBCLASS } });
        mockArchiveCustomSubclass.mockResolvedValue({ data: { archiveCustomSubclass: true } });
    });

    it('shows a loading placeholder while session validation is in progress', async () => {
        let resolveSession: (value: { data: { session: { access_token: string } | null }; error: null }) => void = () => {};
        const pendingSession = new Promise<{ data: { session: { access_token: string } | null }; error: null }>((resolve) => {
            resolveSession = resolve;
        });
        mockGetSession.mockReturnValueOnce(pendingSession);

        render(
            <PaperProvider>
                <CustomSubclassesScreen />
            </PaperProvider>,
        );

        expect(screen.getByText('Checking your adventurer records...')).toBeTruthy();

        await act(async () => {
            resolveSession({ data: { session: { access_token: 'token-123' } }, error: null });
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(screen.getByText('No subclasses available.')).toBeTruthy();
        });
    });

    it('renders the empty state and requests the subclass query', async () => {
        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('No subclasses available.')).toBeTruthy();
        });
        expect(mockUseQuery).toHaveBeenCalledWith(
            GET_AVAILABLE_SUBCLASSES,
            expect.objectContaining({
                fetchPolicy: 'cache-and-network',
                notifyOnNetworkStatusChange: true,
            }),
        );
        expect(mockUseQuery).toHaveBeenCalledWith(
            GET_CUSTOM_SUBCLASSES,
            expect.objectContaining({
                fetchPolicy: 'cache-and-network',
                notifyOnNetworkStatusChange: true,
            }),
        );
    });

    it('renders SRD subclasses as read-only rows without source labels', async () => {
        mockSubclassQueries({
            availableSubclasses: [SRD_WIZARD_SUBCLASS],
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('School of Evocation')).toBeTruthy();
        });
        expect(screen.queryByText('SRD')).toBeNull();
        expect(screen.queryByText('Custom')).toBeNull();
        expect(screen.queryByTestId('edit-custom-subclass-srd-subclass-evocation')).toBeNull();
        expect(screen.queryByTestId('delete-custom-subclass-srd-subclass-evocation')).toBeNull();
    });

    it('expands a subclass row to show full details and back navigation', async () => {
        mockSubclassQueries({
            availableSubclasses: [SRD_WIZARD_SUBCLASS, WIZARD_AVAILABLE_SUBCLASS],
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('School of Evocation')).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId('custom-subclass-row-srd-subclass-evocation'));

        await waitFor(() => {
            expect(screen.getByTestId('subclass-expand-back')).toBeTruthy();
            expect(screen.queryByTestId('add-custom-subclass')).toBeNull();
        });
        expect(screen.getByTestId('custom-subclass-row-srd-subclass-evocation').props.accessibilityState?.expanded).toBe(true);
        expect(screen.getByText('School of Evocation')).toBeTruthy();

        fireEvent.press(screen.getByTestId('subclass-expand-back'));

        await waitFor(() => {
            expect(screen.getByText('School of Lanterns')).toBeTruthy();
            expect(screen.getByTestId('add-custom-subclass')).toBeTruthy();
        });
    });

    it('shows ordered feature details when a subclass row is expanded', async () => {
        mockSubclassQueries({
            availableSubclasses: [SRD_WIZARD_SUBCLASS_WITH_FEATURES],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('custom-subclass-row-srd-subclass-evocation'));

        await waitFor(() => {
            expect(screen.getByText('Features')).toBeTruthy();
        });
        expect(screen.getByText('Level 2')).toBeTruthy();
        expect(screen.getByText('Sculpt Spells')).toBeTruthy();
        expect(screen.getByText('Protect allies from your evocations.')).toBeTruthy();
    });

    it('shows only the expanded subclass until returning to the full list', async () => {
        mockSubclassQueries({
            availableSubclasses: [SRD_WIZARD_SUBCLASS, WIZARD_AVAILABLE_SUBCLASS, FIGHTER_AVAILABLE_SUBCLASS],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('custom-subclass-row-srd-subclass-evocation'));

        await waitFor(() => {
            expect(screen.getByTestId('subclass-expand-back')).toBeTruthy();
        });
        expect(screen.queryByText('School of Lanterns')).toBeNull();
        expect(screen.queryByText('Banner Knight')).toBeNull();
        expect(screen.queryByTestId('subclass-filter-fighter')).toBeNull();

        fireEvent.press(screen.getByTestId('subclass-expand-back'));

        await waitFor(() => {
            expect(screen.queryByTestId('subclass-expand-back')).toBeNull();
            expect(screen.getByTestId('subclass-filter-fighter')).toBeTruthy();
            expect(screen.getByText('School of Lanterns')).toBeTruthy();
            expect(screen.getByText('Banner Knight')).toBeTruthy();
        });
        fireEvent.press(screen.getByTestId('subclass-filter-fighter'));

        await waitFor(() => {
            expect(screen.getByText('Banner Knight')).toBeTruthy();
            expect(screen.queryByText('School of Evocation')).toBeNull();
        });
    });

    it('filters subclass rows by selected class', async () => {
        mockSubclassQueries({
            availableSubclasses: [SRD_WIZARD_SUBCLASS, WIZARD_AVAILABLE_SUBCLASS, FIGHTER_AVAILABLE_SUBCLASS],
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('School of Evocation')).toBeTruthy();
            expect(screen.getByText('School of Lanterns')).toBeTruthy();
        });
        expect(screen.getByText('Banner Knight')).toBeTruthy();

        fireEvent.press(screen.getByTestId('subclass-filter-fighter'));

        expect(screen.queryByText('School of Evocation')).toBeNull();
        expect(screen.queryByText('School of Lanterns')).toBeNull();
        expect(screen.getByText('Banner Knight')).toBeTruthy();
    });

    it('creates a custom subclass after required fields are present', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));

        await waitFor(() => {
            expect(screen.getByText('Create Subclass')).toBeTruthy();
        });
        expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByTestId('custom-subclass-name-input').props.maxLength).toBe(100);
        expect(screen.getByTestId('custom-subclass-description-input').props.maxLength).toBe(10000);
        expect(screen.getByTestId('custom-subclass-description-counter').props.children).toEqual([
            0,
            '/',
            10000,
        ]);

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), '  Moon Warden  ');
        fireEvent.press(screen.getByTestId('custom-subclass-class-druid'));
        fireEvent.changeText(screen.getByTestId('custom-subclass-description-input'), '  A circle sworn to moonlit borders.  ');

        await waitFor(() => {
            expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(false);
        });
        expect(screen.getByTestId('custom-subclass-description-counter').props.children).toEqual([
            38,
            '/',
            10000,
        ]);
        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockCreateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    input: {
                        name: 'Moon Warden',
                        classId: 'druid',
                        description: 'A circle sworn to moonlit borders.',
                        features: [],
                    },
                },
            });
        });
        expect(mockRefetchQueries).toHaveBeenCalledWith({
            include: [GET_AVAILABLE_SUBCLASSES, GET_CUSTOM_SUBCLASSES],
        });
    });

    it('adds feature rows to create mutation variables', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));

        await waitFor(() => {
            expect(screen.getByText('Create Subclass')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), 'Moon Warden');
        fireEvent.press(screen.getByTestId('custom-subclass-class-druid'));
        fireEvent.changeText(screen.getByTestId('custom-subclass-description-input'), 'A circle sworn to moonlit borders.');
        fireEvent.press(screen.getByTestId('add-custom-subclass-feature'));

        expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(true);

        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-level-0'), '3rd');
        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-name-0'), 'Moonlit Ward');
        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-description-0'), 'You guard allies in silver light.');

        await waitFor(() => {
            expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(false);
        });
        expect(screen.getByTestId('custom-subclass-feature-level-0').props.value).toBe('3');

        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockCreateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    input: {
                        name: 'Moon Warden',
                        classId: 'druid',
                        description: 'A circle sworn to moonlit borders.',
                        features: [
                            {
                                name: 'Moonlit Ward',
                                description: 'You guard allies in silver light.',
                                level: 3,
                            },
                        ],
                    },
                },
            });
        });
    });

    it('shows discard confirmation when canceling the create form with unsaved changes', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));

        await waitFor(() => {
            expect(screen.getByText('Create Subclass')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), 'Moon Warden');
        fireEvent.press(screen.getByTestId('cancel-custom-subclass-form'));

        await waitFor(() => {
            expect(screen.getByText('Discard changes?')).toBeTruthy();
        });
        expect(screen.getByText('You have unsaved changes to this subclass. Are you sure you want to discard them?')).toBeTruthy();
        expect(screen.getByLabelText('Keep Editing')).toBeTruthy();
        expect(screen.getByLabelText('Discard')).toBeTruthy();
        expect(screen.getByText('Create Subclass')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Keep Editing'));

        await waitFor(() => {
            expect(screen.queryByText('Discard changes?')).toBeNull();
        });
        expect(screen.getByText('Create Subclass')).toBeTruthy();
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('Moon Warden');
    });

    it('closes the create form immediately when canceling without changes', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));

        await waitFor(() => {
            expect(screen.getByText('Create Subclass')).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId('cancel-custom-subclass-form'));

        await waitFor(() => {
            expect(screen.queryByText('Create Subclass')).toBeNull();
        });
        expect(screen.queryByText('Discard changes?')).toBeNull();
    });

    it('prefills edit mode and keeps parent class editable when the subclass is unused', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_UNUSED],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByText('Edit Subclass')).toBeTruthy();
        });
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('School of Lanterns');
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(false);
        expect(screen.queryByText('Parent class is locked while editing an existing subclass.')).toBeNull();
    });

    it('opens edit mode from an expanded custom subclass', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_UNUSED],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('custom-subclass-row-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByTestId('subclass-expand-back')).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByTestId('custom-subclass-form-sheet')).toBeTruthy();
        });
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('School of Lanterns');
    });

    it('locks parent class when editing a subclass used by characters', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_IN_USE],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByText('Edit Subclass')).toBeTruthy();
        });
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByText('Parent class is locked while this subclass is used by existing characters.')).toBeTruthy();
    });

    it('prefills, edits, and removes feature rows in edit mode', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS_WITH_FEATURES],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_WITH_FEATURES],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByTestId('custom-subclass-feature-name-0').props.value).toBe('Lantern Ward');
        });
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByText('Remove saved feature definitions before changing the parent class.')).toBeTruthy();

        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-description-0'), 'You raise brighter wards.');
        fireEvent.press(screen.getByTestId('remove-custom-subclass-feature-1'));

        await waitFor(() => {
            expect(screen.queryByText('Feature 2')).toBeNull();
        });

        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockUpdateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    id: 'custom-subclass-1',
                    input: {
                        name: 'School of Lanterns',
                        classId: 'wizard',
                        description: 'You bind floating lanterns to defensive spellwork.',
                        features: [
                            {
                                id: 'feature-lantern-ward',
                                name: 'Lantern Ward',
                                description: 'You raise brighter wards.',
                                level: 2,
                            },
                        ],
                    },
                },
            });
        });
    });

    it('unlocks parent class after saved feature rows are removed from the draft', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS_WITH_FEATURES],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_WITH_FEATURES],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);
        });

        fireEvent.press(screen.getByTestId('remove-custom-subclass-feature-1'));
        fireEvent.press(screen.getByTestId('remove-custom-subclass-feature-0'));

        await waitFor(() => {
            expect(screen.getByTestId('custom-subclass-class-fighter').props.accessibilityState.disabled).toBe(false);
        });

        fireEvent.press(screen.getByTestId('custom-subclass-class-fighter'));
        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockUpdateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    id: 'custom-subclass-1',
                    input: {
                        name: 'School of Lanterns',
                        classId: 'fighter',
                        description: 'You bind floating lanterns to defensive spellwork.',
                        features: [],
                    },
                },
            });
        });
    });

    it('confirms archive from an expanded custom subclass', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_IN_USE],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('custom-subclass-row-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByTestId('subclass-expand-back')).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId('delete-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByText('Delete custom subclass?')).toBeTruthy();
        });
        expect(screen.getByText('"School of Lanterns" will be removed from future picks. 2 existing characters will keep their subclass name.')).toBeTruthy();
    });

    it('confirms archive, calls the archive mutation, and refetches subclass pickers', async () => {
        mockSubclassQueries({
            availableSubclasses: [WIZARD_AVAILABLE_SUBCLASS],
            customSubclasses: [WIZARD_CUSTOM_SUBCLASS_IN_USE],
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('delete-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByText('Delete custom subclass?')).toBeTruthy();
        });
        expect(screen.getByText('"School of Lanterns" will be removed from future picks. 2 existing characters will keep their subclass name.')).toBeTruthy();

        fireEvent.press(screen.getByText('Delete'));

        await waitFor(() => {
            expect(mockArchiveCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    id: 'custom-subclass-1',
                },
            });
        });
        expect(mockRefetchQueries).toHaveBeenCalledWith({
            include: [GET_AVAILABLE_SUBCLASSES, GET_CUSTOM_SUBCLASSES],
        });
    });

    it('redirects to sign-in on unauthenticated GraphQL errors', async () => {
        mockSubclassQueries({
            error: new Error('UNAUTHENTICATED'),
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
        });
    });
});

describe('subclass manager documents', () => {
    it('exports the mutation documents consumed by the screen', () => {
        expect(CREATE_CUSTOM_SUBCLASS).toBeTruthy();
        expect(GET_CUSTOM_SUBCLASSES).toBeTruthy();
        expect(UPDATE_CUSTOM_SUBCLASS).toBeTruthy();
        expect(ARCHIVE_CUSTOM_SUBCLASS).toBeTruthy();
    });
});
