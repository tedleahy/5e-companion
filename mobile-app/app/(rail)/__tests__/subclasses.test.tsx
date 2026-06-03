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
import { supabase } from '@/lib/supabase';

const mockReplace = jest.fn();
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockCreateCustomSubclass = jest.fn();
const mockUpdateCustomSubclass = jest.fn();
const mockArchiveCustomSubclass = jest.fn();
const mockRefetch = jest.fn();
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

const WIZARD_SUBCLASS: CustomSubclassRow = {
    __typename: 'CustomSubclass',
    id: 'custom-subclass-1',
    value: 'custom-subclass-1',
    classId: 'wizard',
    className: 'Wizard',
    name: 'School of Lanterns',
    description: ['You bind floating lanterns to defensive spellwork.'],
    characterUsageCount: 2,
    features: [],
};

const FIGHTER_SUBCLASS: CustomSubclassRow = {
    __typename: 'CustomSubclass',
    id: 'custom-subclass-2',
    value: 'custom-subclass-2',
    classId: 'fighter',
    className: 'Fighter',
    name: 'Banner Knight',
    description: ['You carry a battle standard into every fray.'],
    characterUsageCount: 0,
    features: [],
};

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
        mockUseQuery.mockReturnValue({
            data: { customSubclasses: [] },
            loading: false,
            error: undefined,
            refetch: mockRefetch,
        });
        mockRefetch.mockResolvedValue({ data: { customSubclasses: [] } });
        mockRefetchQueries.mockResolvedValue([]);
        mockCreateCustomSubclass.mockResolvedValue({ data: { createCustomSubclass: FIGHTER_SUBCLASS } });
        mockUpdateCustomSubclass.mockResolvedValue({ data: { updateCustomSubclass: FIGHTER_SUBCLASS } });
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
            expect(screen.getByText('No custom subclasses yet.')).toBeTruthy();
        });
    });

    it('renders the empty state and requests the custom subclass query', async () => {
        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('No custom subclasses yet.')).toBeTruthy();
        });
        expect(mockUseQuery).toHaveBeenCalledWith(
            GET_CUSTOM_SUBCLASSES,
            expect.objectContaining({
                fetchPolicy: 'cache-and-network',
                notifyOnNetworkStatusChange: true,
            }),
        );
    });

    it('filters subclass rows by selected class', async () => {
        mockUseQuery.mockReturnValue({
            data: { customSubclasses: [WIZARD_SUBCLASS, FIGHTER_SUBCLASS] },
            loading: false,
            error: undefined,
            refetch: mockRefetch,
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(screen.getByText('School of Lanterns')).toBeTruthy();
        });
        expect(screen.getByText('Banner Knight')).toBeTruthy();

        fireEvent.press(screen.getByTestId('subclass-filter-fighter'));

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

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), '  Moon Warden  ');
        fireEvent.press(screen.getByTestId('custom-subclass-class-druid'));
        fireEvent.changeText(screen.getByTestId('custom-subclass-description-input'), '  A circle sworn to moonlit borders.  ');

        await waitFor(() => {
            expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(false);
        });
        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockCreateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    input: {
                        name: 'Moon Warden',
                        classId: 'druid',
                        description: 'A circle sworn to moonlit borders.',
                    },
                },
            });
        });
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockRefetchQueries).toHaveBeenCalled();
    });

    it('prefills edit mode and locks parent class when the subclass is in use', async () => {
        mockUseQuery.mockReturnValue({
            data: { customSubclasses: [WIZARD_SUBCLASS] },
            loading: false,
            error: undefined,
            refetch: mockRefetch,
        });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByText('Edit Subclass')).toBeTruthy();
        });
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('School of Lanterns');
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByText('Parent class is locked while existing characters use this subclass.')).toBeTruthy();
    });

    it('confirms archive with usage-aware copy and calls the archive mutation', async () => {
        mockUseQuery.mockReturnValue({
            data: { customSubclasses: [WIZARD_SUBCLASS] },
            loading: false,
            error: undefined,
            refetch: mockRefetch,
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
        expect(mockRefetch).toHaveBeenCalled();
    });

    it('redirects to sign-in on unauthenticated GraphQL errors', async () => {
        mockUseQuery.mockReturnValue({
            data: undefined,
            loading: false,
            error: new Error('UNAUTHENTICATED'),
            refetch: mockRefetch,
        });

        await renderScreenAndFlush();

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
        });
    });
});

describe('custom subclass manager documents', () => {
    it('exports the mutation documents consumed by the screen', () => {
        expect(CREATE_CUSTOM_SUBCLASS).toBeTruthy();
        expect(UPDATE_CUSTOM_SUBCLASS).toBeTruthy();
        expect(ARCHIVE_CUSTOM_SUBCLASS).toBeTruthy();
    });
});
