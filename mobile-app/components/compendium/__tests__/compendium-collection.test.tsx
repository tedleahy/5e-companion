import { useLocalSearchParams } from 'expo-router';
import { act, useMemo, useState, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import { blurFocusedScreens, focusScreens } from '@/test-utils/screenFocus';

type RaceItem = {
    value: string;
    name: string;
    isCustom: boolean;
    meta: string;
};

const RACES: RaceItem[] = [
    { value: 'elf', name: 'Elf', isCustom: false, meta: 'Medium · 30 ft.' },
    { value: 'riverfolk', name: 'Riverfolk', isCustom: true, meta: 'Small · 25 ft.' },
];

type HarnessProps = {
    initialItems?: RaceItem[];
    loading?: boolean;
    errorMessage?: string | null;
    onRetry?: () => void;
    withCategoryFilter?: boolean;
    onEdit?: (item: RaceItem) => void;
    onDelete?: (item: RaceItem) => void;
    onCreate?: () => void;
    overlay?: ReactNode;
};

function Harness({
    initialItems = RACES,
    loading = false,
    errorMessage,
    onRetry,
    withCategoryFilter = false,
    onEdit,
    onDelete,
    onCreate,
    overlay,
}: HarnessProps) {
    const [searchText, setSearchText] = useState('');
    const [showSrd, setShowSrd] = useState(true);
    const [categoryFilterActive, setCategoryFilterActive] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const items = useMemo(() => initialItems.filter((item) => (
        (showSrd || item.isCustom)
        && item.name.toLocaleLowerCase().includes(searchText.trim().toLocaleLowerCase())
        && (!categoryFilterActive || item.value === 'elf')
    )), [categoryFilterActive, initialItems, searchText, showSrd]);

    return (
        <PaperProvider>
            <CompendiumCollection
                heading={{ title: 'Races', noun: 'race' }}
                filters={{
                    search: {
                        placeholder: 'Search races',
                        value: searchText,
                        onChange: setSearchText,
                    },
                    includeSrd: {
                        value: showSrd,
                        onChange: setShowSrd,
                    },
                    category: withCategoryFilter ? {
                        content: (
                            <Pressable onPress={() => setCategoryFilterActive(true)}>
                                <Text>Only elves</Text>
                            </Pressable>
                        ),
                        active: categoryFilterActive,
                        onClear: () => setCategoryFilterActive(false),
                    } : undefined,
                }}
                collection={{
                    items,
                    allItems: initialItems,
                    selectedValue,
                    onSelectedValueChange: setSelectedValue,
                    loading,
                    error: errorMessage == null ? undefined : {
                        message: errorMessage,
                        onRetry,
                    },
                }}
                empty={{
                    title: 'No races found',
                    body: 'Try a broader search.',
                }}
                row={{
                    mark: (item) => <Text>{item.name.slice(0, 1)}</Text>,
                    meta: (item) => item.meta,
                    actions: onEdit == null && onDelete == null ? undefined : (item) => (
                        item.isCustom
                            ? [
                                {
                                    icon: 'create-outline',
                                    accessibilityLabel: `Edit ${item.name}`,
                                    onPress: () => onEdit?.(item),
                                    testID: `edit-${item.value}`,
                                },
                                {
                                    icon: 'trash-outline',
                                    accessibilityLabel: `Delete ${item.name}`,
                                    onPress: () => onDelete?.(item),
                                    destructive: true,
                                    testID: `delete-${item.value}`,
                                },
                            ]
                            : []
                    ),
                }}
                renderDetail={(item) => (
                    <View>
                        <Text>{item.name} details</Text>
                    </View>
                )}
                floatingAction={onCreate == null ? undefined : {
                    accessibilityLabel: 'Add custom race',
                    onPress: onCreate,
                    testID: 'add-custom-race',
                }}
                overlay={overlay}
            />
        </PaperProvider>
    );
}

describe('CompendiumCollection', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
    });

    it('owns search, SRD visibility, result totals, and filter clearing', () => {
        render(<Harness withCategoryFilter />);

        expect(screen.getByText('2 races · A–Z')).toBeTruthy();
        fireEvent.changeText(screen.getByLabelText('Search races'), 'river');
        expect(screen.getByText('1 race · A–Z')).toBeTruthy();
        expect(screen.queryByText('Elf')).toBeNull();

        fireEvent.press(screen.getByTestId('compendium-clear-filters'));
        expect(screen.getByText('2 races · A–Z')).toBeTruthy();

        fireEvent(screen.getByRole('switch'), 'valueChange', false);
        expect(screen.getByText('1 race · A–Z')).toBeTruthy();
        expect(screen.queryByText('Elf')).toBeNull();

        fireEvent.press(screen.getByText('Only elves'));
        expect(screen.getByText('No races found')).toBeTruthy();
        fireEvent.press(screen.getByText('Reset filters'));
        expect(screen.getByText('2 races · A–Z')).toBeTruthy();
    });

    it('offers row actions only on rows the caller marks as editable', () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        render(<Harness onEdit={onEdit} onDelete={onDelete} />);

        // The SRD row returns no actions, so it stays read-only beside the custom one.
        expect(screen.queryByLabelText('Edit Elf')).toBeNull();
        expect(screen.queryByLabelText('Delete Elf')).toBeNull();

        fireEvent.press(screen.getByLabelText('Edit Riverfolk'));
        expect(onEdit).toHaveBeenCalledWith(RACES[1]);
    });

    it('keeps a row action from also opening the detail behind it', () => {
        const onDelete = jest.fn();
        render(<Harness onDelete={onDelete} />);

        fireEvent.press(screen.getByLabelText('Delete Riverfolk'));

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Riverfolk details')).toBeNull();
        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
    });

    it('hides the floating action while a detail is open and restores it on the way back', async () => {
        const onCreate = jest.fn();
        render(<Harness onCreate={onCreate} />);

        fireEvent.press(screen.getByTestId('add-custom-race'));
        expect(onCreate).toHaveBeenCalledTimes(1);

        fireEvent.press(screen.getByLabelText('Elf, SRD'));
        await waitFor(() => expect(screen.getByText('Elf details')).toBeTruthy());
        expect(screen.queryByTestId('add-custom-race')).toBeNull();

        fireEvent.press(screen.getByTestId('compendium-detail-back'));
        await waitFor(() => expect(screen.getByTestId('add-custom-race')).toBeTruthy());
    });

    it('omits the floating action entirely for browse-only categories', () => {
        render(<Harness />);

        expect(screen.queryByTestId('add-custom-race')).toBeNull();
        expect(screen.queryByTestId('compendium-floating-action')).toBeNull();
    });

    it('keeps the overlay mounted across list and detail, so sheets survive selection', async () => {
        render(<Harness overlay={<Text>Custom race form</Text>} />);

        expect(screen.getByText('Custom race form')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Elf, SRD'));
        await waitFor(() => expect(screen.getByText('Elf details')).toBeTruthy());

        expect(screen.getByText('Custom race form')).toBeTruthy();
    });

    it('renders loading, error, retry, and empty states', () => {
        const onRetry = jest.fn();
        const { rerender } = render(<Harness initialItems={[]} loading />);

        expect(screen.getByTestId('compendium-collection-loading')).toBeTruthy();

        rerender(<Harness initialItems={[]} errorMessage="The archive is unavailable." onRetry={onRetry} />);
        expect(screen.getByTestId('compendium-collection-error')).toBeTruthy();
        expect(screen.getByText('The archive is unavailable.')).toBeTruthy();
        fireEvent.press(screen.getByText('Retry'));
        expect(onRetry).toHaveBeenCalledTimes(1);

        rerender(<Harness initialItems={[]} />);
        expect(screen.getByTestId('compendium-collection-empty')).toBeTruthy();
        expect(screen.getByText('Try a broader search.')).toBeTruthy();
    });

    it('swaps between the virtualized list and in-place detail', () => {
        render(<Harness />);

        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-row-elf'));
        expect(screen.getByText('Elf details')).toBeTruthy();
        expect(screen.queryByTestId('compendium-collection-list')).toBeNull();

        fireEvent.press(screen.getByTestId('compendium-detail-back'));
        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
    });

    it('opens a matching value deep link once without trapping the detail back control', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ value: 'elf' });
        render(<Harness />);

        await waitFor(() => expect(screen.getByText('Elf details')).toBeTruthy());
        fireEvent.press(screen.getByTestId('compendium-detail-back'));

        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
        expect(screen.queryByText('Elf details')).toBeNull();
    });

    it('leaves the list visible for invalid or inaccessible deep links', () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ value: 'missing-race' });
        render(<Harness />);

        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();
        expect(screen.queryByText('missing-race details')).toBeNull();
    });

    it('resolves the open detail against unfiltered rows', () => {
        render(<Harness />);

        fireEvent.press(screen.getByTestId('compendium-row-elf'));
        expect(screen.getByText('Elf details')).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-detail-back'));

        // Riverfolk is the only row search leaves visible, but the detail is
        // resolved from `allItems`, so a hidden row can still be opened.
        fireEvent.changeText(screen.getByLabelText('Search races'), 'river');
        expect(screen.queryByTestId('compendium-row-elf')).toBeNull();
        fireEvent.press(screen.getByTestId('compendium-row-riverfolk'));
        expect(screen.getByText('Riverfolk details')).toBeTruthy();
    });

    it('reopens a deep link after the screen is navigated away from and back', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ value: 'elf' });
        render(<Harness />);

        await waitFor(() => expect(screen.getByText('Elf details')).toBeTruthy());
        fireEvent.press(screen.getByTestId('compendium-detail-back'));
        expect(screen.getByTestId('compendium-collection-list')).toBeTruthy();

        // A lateral jump pops back to this still-mounted screen rather than
        // remounting it, so the same `?value=` must resolve again on refocus.
        act(() => { blurFocusedScreens(); });
        act(() => { focusScreens(); });

        await waitFor(() => expect(screen.getByText('Elf details')).toBeTruthy());
    });

    it('waits to resolve a deep link until a failed collection retry has loaded items', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ value: 'elf' });
        const { rerender } = render(
            <Harness initialItems={[]} errorMessage="The archive is unavailable." />,
        );

        expect(screen.getByTestId('compendium-collection-error')).toBeTruthy();
        rerender(<Harness />);

        await waitFor(() => expect(screen.getByText('Elf details')).toBeTruthy());
    });
});
