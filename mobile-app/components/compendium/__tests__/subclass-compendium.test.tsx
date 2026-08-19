import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SubclassCompendium from '@/components/compendium/subclass-compendium';
import {
    ARCHIVE_CUSTOM_SUBCLASS,
    CREATE_CUSTOM_SUBCLASS,
    GET_CUSTOM_SUBCLASSES,
    UPDATE_CUSTOM_SUBCLASS,
} from '@/graphql/customSubclass.operations';
import { GET_COMPENDIUM_COUNTS } from '@/graphql/compendium.operations';
import { GET_AVAILABLE_SUBCLASSES } from '@/graphql/characterSheet.operations';
import { GET_COMPENDIUM_SUBCLASSES } from '@/graphql/subclass.operations';
import { waitFor } from '@/test-utils/waitFor';

const mockReplace = jest.fn();
const mockUseQuery = jest.fn();
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
    usePathname: () => '/compendium/subclasses',
    useLocalSearchParams: () => ({}),
    useFocusEffect: (effect: () => undefined | (() => void)) => {
        const { useEffect } = require('react');
        useEffect(() => effect(), [effect]);
    },
}));

jest.mock('@apollo/client/react', () => ({
    useApolloClient: () => ({
        refetchQueries: mockRefetchQueries,
    }),
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: (document: { definitions?: { kind: string; name?: { value: string } }[] }) => {
        const operationName = document.definitions?.find(
            (definition) => definition.kind === 'OperationDefinition',
        )?.name?.value;

        if (operationName === 'CreateCustomSubclass') return [mockCreateCustomSubclass, { loading: false }];
        if (operationName === 'UpdateCustomSubclass') return [mockUpdateCustomSubclass, { loading: false }];
        if (operationName === 'ArchiveCustomSubclass') return [mockArchiveCustomSubclass, { loading: false }];

        return [jest.fn(), { loading: false }];
    },
}));

type SubclassRow = {
    __typename: 'CompendiumSubclass';
    id: string;
    value: string;
    srdIndex: string | null;
    name: string;
    description: string[];
    isCustom: boolean;
    sourceBook: string | null;
    classId: string;
    className: string;
    selectionLevel: number;
    characterUsageCount: number;
    canChangeClass: boolean;
    cannotChangeClassReason: string | null;
    features: {
        __typename: 'AvailableSubclassFeature';
        id: string;
        name: string;
        description: string;
        level: number;
    }[];
};

const LANTERN_FEATURES: SubclassRow['features'] = [
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

const WIZARD_CUSTOM: SubclassRow = {
    __typename: 'CompendiumSubclass',
    id: 'custom-subclass-1',
    value: 'custom-subclass-1',
    srdIndex: null,
    name: 'School of Lanterns',
    description: ['You bind floating lanterns to defensive spellwork.'],
    isCustom: true,
    sourceBook: null,
    classId: 'wizard',
    className: 'Wizard',
    selectionLevel: 2,
    characterUsageCount: 0,
    canChangeClass: true,
    cannotChangeClassReason: null,
    features: [],
};

const WIZARD_CUSTOM_WITH_FEATURES: SubclassRow = {
    ...WIZARD_CUSTOM,
    features: LANTERN_FEATURES,
};

const WIZARD_CUSTOM_IN_USE: SubclassRow = {
    ...WIZARD_CUSTOM,
    characterUsageCount: 2,
    canChangeClass: false,
    cannotChangeClassReason: 'Cannot change the parent class of a subclass used by 2 character(s).',
};

const FIGHTER_CUSTOM: SubclassRow = {
    __typename: 'CompendiumSubclass',
    id: 'custom-subclass-2',
    value: 'custom-subclass-2',
    srdIndex: null,
    name: 'Banner Knight',
    description: ['You carry a battle standard into every fray.'],
    isCustom: true,
    sourceBook: null,
    classId: 'fighter',
    className: 'Fighter',
    selectionLevel: 3,
    characterUsageCount: 0,
    canChangeClass: true,
    cannotChangeClassReason: null,
    features: [],
};

const SRD_EVOCATION: SubclassRow = {
    __typename: 'CompendiumSubclass',
    id: 'srd-subclass-evocation',
    value: 'evocation',
    srdIndex: 'evocation',
    name: 'School of Evocation',
    description: ['You focus your study on magic that creates powerful elemental effects.'],
    isCustom: false,
    sourceBook: 'SRD',
    classId: 'wizard',
    className: 'Wizard',
    selectionLevel: 2,
    characterUsageCount: 0,
    canChangeClass: false,
    cannotChangeClassReason: null,
    features: [{
        __typename: 'AvailableSubclassFeature',
        id: 'feature-sculpt-spells',
        name: 'Sculpt Spells',
        description: 'Protect allies from your evocations.',
        level: 2,
    }],
};

function operationName(document: { definitions?: { kind: string; name?: { value: string } }[] }) {
    return document.definitions?.find((definition) => definition.kind === 'OperationDefinition')?.name?.value;
}

function mockSubclassQueries({
    subclasses = [],
    loading = false,
    error = undefined,
}: {
    subclasses?: SubclassRow[];
    loading?: boolean;
    error?: Error | undefined;
} = {}) {
    mockUseQuery.mockImplementation((document: Parameters<typeof operationName>[0]) => {
        if (operationName(document) === 'CompendiumSubclasses') {
            return {
                data: error ? undefined : { compendiumSubclasses: subclasses },
                loading,
                error,
                refetch: jest.fn(),
            };
        }

        return { data: undefined, loading: false, error: undefined, refetch: jest.fn() };
    });
}

async function renderScreenAndFlush() {
    render(
        <PaperProvider>
            <SubclassCompendium />
        </PaperProvider>,
    );

    await act(async () => {
        await Promise.resolve();
    });
}

describe('SubclassCompendium browsing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubclassQueries();
        mockRefetchQueries.mockResolvedValue([]);
    });

    it('reads the browse query through the shared browse hook', async () => {
        await renderScreenAndFlush();

        expect(mockUseQuery).toHaveBeenCalledWith(
            GET_COMPENDIUM_SUBCLASSES,
            expect.objectContaining({
                fetchPolicy: 'cache-and-network',
                notifyOnNetworkStatusChange: true,
            }),
        );
        expect(screen.getByText('No matching subclasses')).toBeTruthy();
    });

    it('marks sources and offers row actions only on custom rows', async () => {
        mockSubclassQueries({ subclasses: [SRD_EVOCATION, WIZARD_CUSTOM] });

        await renderScreenAndFlush();

        expect(screen.getByLabelText('School of Evocation, SRD')).toBeTruthy();
        expect(screen.getByLabelText('School of Lanterns, Custom')).toBeTruthy();
        expect(screen.queryByTestId('edit-custom-subclass-srd-subclass-evocation')).toBeNull();
        expect(screen.queryByTestId('delete-custom-subclass-srd-subclass-evocation')).toBeNull();
        expect(screen.getByTestId('edit-custom-subclass-custom-subclass-1')).toBeTruthy();
        expect(screen.getByTestId('delete-custom-subclass-custom-subclass-1')).toBeTruthy();
    });

    it('opens a detail with ordered features and hides the add action behind it', async () => {
        mockSubclassQueries({ subclasses: [SRD_EVOCATION, WIZARD_CUSTOM_WITH_FEATURES] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('compendium-row-custom-subclass-1'));

        await waitFor(() => expect(screen.getByText('Subclass features')).toBeTruthy());
        expect(screen.queryByTestId('add-custom-subclass')).toBeNull();
        expect(screen.queryByText('School of Evocation')).toBeNull();
        // Level 2 unlocks before level 6, regardless of the order the API returns.
        const featureNames = screen
            .getAllByText(/^(Lantern Ward|Beacon Step)$/)
            .map((node) => node.props.children);
        expect(featureNames).toEqual(['Lantern Ward', 'Beacon Step']);
        expect(screen.getByText('You step between friendly lights.')).toBeTruthy();

        fireEvent.press(screen.getByTestId('compendium-detail-back'));

        await waitFor(() => expect(screen.getByTestId('add-custom-subclass')).toBeTruthy());
        expect(screen.getByText('School of Evocation')).toBeTruthy();
    });

    it('filters by class and by source, and falls back to All when a class disappears', async () => {
        mockSubclassQueries({ subclasses: [SRD_EVOCATION, WIZARD_CUSTOM, FIGHTER_CUSTOM] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('subclass-class-filter-fighter'));
        expect(screen.getByText('Banner Knight')).toBeTruthy();
        expect(screen.queryByText('School of Evocation')).toBeNull();
        expect(screen.queryByText('School of Lanterns')).toBeNull();

        fireEvent.press(screen.getByTestId('subclass-class-filter-wizard'));
        expect(screen.getByText('School of Evocation')).toBeTruthy();
        expect(screen.queryByText('Banner Knight')).toBeNull();

        // Hiding SRD rows leaves Wizard populated by the custom row, so it holds.
        fireEvent(screen.getByRole('switch'), 'valueChange', false);
        expect(screen.queryByText('School of Evocation')).toBeNull();
        expect(screen.getByText('School of Lanterns')).toBeTruthy();
    });

    it('returns an emptied class filter to All rather than stranding an empty list', async () => {
        mockSubclassQueries({ subclasses: [SRD_EVOCATION, FIGHTER_CUSTOM] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('subclass-class-filter-wizard'));
        expect(screen.queryByText('Banner Knight')).toBeNull();

        // Every Wizard row here is SRD, so the chip vanishes when SRD is hidden.
        fireEvent(screen.getByRole('switch'), 'valueChange', false);

        expect(screen.queryByTestId('subclass-class-filter-wizard')).toBeNull();
        expect(screen.getByTestId('subclass-class-filter-all').props.accessibilityState.selected).toBe(true);
        expect(screen.getByText('Banner Knight')).toBeTruthy();
    });

    it('searches across name, class, and feature names', async () => {
        mockSubclassQueries({ subclasses: [SRD_EVOCATION, WIZARD_CUSTOM_WITH_FEATURES, FIGHTER_CUSTOM] });

        await renderScreenAndFlush();

        fireEvent.changeText(screen.getByLabelText('Search subclasses'), 'beacon');

        expect(screen.getByText('School of Lanterns')).toBeTruthy();
        expect(screen.queryByText('School of Evocation')).toBeNull();
        expect(screen.queryByText('Banner Knight')).toBeNull();
    });

    it('redirects to sign-in on unauthenticated GraphQL errors', async () => {
        mockSubclassQueries({ error: new Error('UNAUTHENTICATED') });

        await renderScreenAndFlush();

        await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in'));
    });
});

describe('SubclassCompendium custom content', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubclassQueries();
        mockRefetchQueries.mockResolvedValue([]);
        mockCreateCustomSubclass.mockResolvedValue({ data: { createCustomSubclass: FIGHTER_CUSTOM } });
        mockUpdateCustomSubclass.mockResolvedValue({ data: { updateCustomSubclass: FIGHTER_CUSTOM } });
        mockArchiveCustomSubclass.mockResolvedValue({ data: { archiveCustomSubclass: true } });
    });

    it('creates a custom subclass after required fields are present', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));

        await waitFor(() => expect(screen.getByText('Create Subclass')).toBeTruthy());
        expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByTestId('custom-subclass-name-input').props.maxLength).toBe(100);
        expect(screen.getByTestId('custom-subclass-description-input').props.maxLength).toBe(10000);

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), '  Moon Warden  ');
        fireEvent.press(screen.getByTestId('custom-subclass-class-druid'));
        fireEvent.changeText(screen.getByTestId('custom-subclass-selection-level-input'), '2');
        fireEvent.changeText(screen.getByTestId('custom-subclass-description-input'), '  A circle sworn to moonlit borders.  ');

        expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(false);
        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockCreateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    input: {
                        name: 'Moon Warden',
                        classId: 'druid',
                        selectionLevel: 2,
                        description: 'A circle sworn to moonlit borders.',
                        features: [],
                    },
                },
            });
        });
        // Browse rows refresh alongside the pickers and the hub aggregate.
        expect(mockRefetchQueries).toHaveBeenCalledWith({
            include: [
                GET_COMPENDIUM_SUBCLASSES,
                GET_AVAILABLE_SUBCLASSES,
                GET_CUSTOM_SUBCLASSES,
                GET_COMPENDIUM_COUNTS,
            ],
        });
    });

    it('adds feature rows to create mutation variables', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));
        await waitFor(() => expect(screen.getByText('Create Subclass')).toBeTruthy());

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), 'Moon Warden');
        fireEvent.press(screen.getByTestId('custom-subclass-class-druid'));
        fireEvent.changeText(screen.getByTestId('custom-subclass-selection-level-input'), '2');
        fireEvent.changeText(screen.getByTestId('custom-subclass-description-input'), 'A circle sworn to moonlit borders.');
        fireEvent.press(screen.getByTestId('add-custom-subclass-feature'));

        expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(true);

        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-level-0'), '3rd');
        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-name-0'), 'Moonlit Ward');
        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-description-0'), 'You guard allies in silver light.');

        expect(screen.getByTestId('save-custom-subclass').props.accessibilityState.disabled).toBe(false);
        expect(screen.getByTestId('custom-subclass-feature-level-0').props.value).toBe('3');

        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockCreateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    input: {
                        name: 'Moon Warden',
                        classId: 'druid',
                        selectionLevel: 2,
                        description: 'A circle sworn to moonlit borders.',
                        features: [{
                            name: 'Moonlit Ward',
                            description: 'You guard allies in silver light.',
                            level: 3,
                        }],
                    },
                },
            });
        });
    });

    it('confirms before discarding an edited create form, and closes a clean one at once', async () => {
        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('add-custom-subclass'));
        await waitFor(() => expect(screen.getByText('Create Subclass')).toBeTruthy());

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), 'Moon Warden');
        fireEvent.press(screen.getByTestId('cancel-custom-subclass-form'));

        await waitFor(() => expect(screen.getByText('Discard changes?')).toBeTruthy());
        fireEvent.press(screen.getByLabelText('Keep Editing'));

        await waitFor(() => expect(screen.queryByText('Discard changes?')).toBeNull());
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('Moon Warden');

        fireEvent.changeText(screen.getByTestId('custom-subclass-name-input'), '');
        fireEvent.press(screen.getByTestId('cancel-custom-subclass-form'));

        await waitFor(() => expect(screen.queryByText('Create Subclass')).toBeNull());
        expect(screen.queryByText('Discard changes?')).toBeNull();
    });

    it('prefills edit mode and keeps the parent class editable while unused', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => expect(screen.getByText('Edit Subclass')).toBeTruthy());
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('School of Lanterns');
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(false);
    });

    it('opens edit mode from the row without opening the detail behind it', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => expect(screen.getByTestId('custom-subclass-form-sheet')).toBeTruthy());
        expect(screen.getByTestId('custom-subclass-name-input').props.value).toBe('School of Lanterns');
        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
    });

    it('locks the parent class when the server reports the subclass is in use', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM_IN_USE] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => expect(screen.getByText('Edit Subclass')).toBeTruthy());
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByText('Cannot change the parent class of a subclass used by 2 character(s).')).toBeTruthy();
    });

    it('prefills, edits, and removes feature rows in edit mode', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM_WITH_FEATURES] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        await waitFor(() => {
            expect(screen.getByTestId('custom-subclass-feature-name-0').props.value).toBe('Lantern Ward');
        });
        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);
        expect(screen.getByText('Remove saved feature definitions before changing the parent class.')).toBeTruthy();

        fireEvent.changeText(screen.getByTestId('custom-subclass-feature-description-0'), 'You raise brighter wards.');
        fireEvent.press(screen.getByTestId('remove-custom-subclass-feature-1'));

        expect(screen.queryByText('Feature 2')).toBeNull();
        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockUpdateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    id: 'custom-subclass-1',
                    input: {
                        name: 'School of Lanterns',
                        classId: 'wizard',
                        selectionLevel: 2,
                        description: 'You bind floating lanterns to defensive spellwork.',
                        features: [{
                            id: 'feature-lantern-ward',
                            name: 'Lantern Ward',
                            description: 'You raise brighter wards.',
                            level: 2,
                        }],
                    },
                },
            });
        });
    });

    it('unlocks the parent class after saved feature rows leave the draft', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM_WITH_FEATURES] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('edit-custom-subclass-custom-subclass-1'));

        expect(screen.getByTestId('custom-subclass-class-wizard').props.accessibilityState.disabled).toBe(true);

        fireEvent.press(screen.getByTestId('remove-custom-subclass-feature-1'));
        fireEvent.press(screen.getByTestId('remove-custom-subclass-feature-0'));

        expect(screen.getByTestId('custom-subclass-class-fighter').props.accessibilityState.disabled).toBe(false);

        fireEvent.press(screen.getByTestId('custom-subclass-class-fighter'));
        fireEvent.press(screen.getByTestId('save-custom-subclass'));

        await waitFor(() => {
            expect(mockUpdateCustomSubclass).toHaveBeenCalledWith({
                variables: {
                    id: 'custom-subclass-1',
                    input: {
                        name: 'School of Lanterns',
                        classId: 'fighter',
                        selectionLevel: 2,
                        description: 'You bind floating lanterns to defensive spellwork.',
                        features: [],
                    },
                },
            });
        });
    });

    it('confirms archive with usage-aware wording, then archives and refetches', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM_IN_USE] });

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('delete-custom-subclass-custom-subclass-1'));

        await waitFor(() => expect(screen.getByText('Delete custom subclass?')).toBeTruthy());
        expect(screen.getByText('"School of Lanterns" will be removed from future picks. 2 existing characters will keep their subclass name.')).toBeTruthy();

        fireEvent.press(screen.getByText('Delete'));

        await waitFor(() => {
            expect(mockArchiveCustomSubclass).toHaveBeenCalledWith({
                variables: { id: 'custom-subclass-1' },
            });
        });
        expect(mockRefetchQueries).toHaveBeenCalledWith({
            include: [
                GET_COMPENDIUM_SUBCLASSES,
                GET_AVAILABLE_SUBCLASSES,
                GET_CUSTOM_SUBCLASSES,
                GET_COMPENDIUM_COUNTS,
            ],
        });
    });

    it('surfaces a failed archive without closing the list', async () => {
        mockSubclassQueries({ subclasses: [WIZARD_CUSTOM] });
        mockArchiveCustomSubclass.mockRejectedValueOnce(new Error('Subclass is still in use.'));

        await renderScreenAndFlush();

        fireEvent.press(screen.getByTestId('delete-custom-subclass-custom-subclass-1'));
        await waitFor(() => expect(screen.getByText('Delete custom subclass?')).toBeTruthy());
        fireEvent.press(screen.getByText('Delete'));

        await waitFor(() => expect(screen.getByText('Subclass is still in use.')).toBeTruthy());
        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
    });
});

describe('subclass manager documents', () => {
    it('exports the documents consumed by the screen', () => {
        expect(GET_COMPENDIUM_SUBCLASSES).toBeTruthy();
        expect(CREATE_CUSTOM_SUBCLASS).toBeTruthy();
        expect(GET_CUSTOM_SUBCLASSES).toBeTruthy();
        expect(UPDATE_CUSTOM_SUBCLASS).toBeTruthy();
        expect(ARCHIVE_CUSTOM_SUBCLASS).toBeTruthy();
    });
});
