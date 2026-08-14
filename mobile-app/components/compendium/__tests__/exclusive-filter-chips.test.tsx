import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import ExclusiveFilterChips, {
    ALL_FILTER_VALUE,
} from '@/components/compendium/exclusive-filter-chips';

describe('ExclusiveFilterChips', () => {
    it('prepends All and reports a single selected option', () => {
        const onChange = jest.fn();
        render(
            <PaperProvider>
                <ExclusiveFilterChips
                    options={[
                        { value: 'common', label: 'Common' },
                        { value: 'exotic', label: 'Exotic' },
                    ]}
                    selectedValue={ALL_FILTER_VALUE}
                    onSelectedValueChange={onChange}
                    accessibilityLabelPrefix="Filter languages by"
                    testID="language-filter"
                />
            </PaperProvider>,
        );

        expect(screen.getByText('All')).toBeTruthy();
        expect(screen.getByTestId('language-filter-all').props.accessibilityState).toEqual(
            expect.objectContaining({ selected: true }),
        );
        expect(screen.getByTestId('language-filter-common').props.accessibilityState).toEqual(
            expect.objectContaining({ selected: false }),
        );

        fireEvent.press(screen.getByRole('button', { name: 'Filter languages by Common' }));
        expect(onChange).toHaveBeenCalledWith('common');
    });
});
