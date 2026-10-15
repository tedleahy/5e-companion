import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CharacterSort } from '@/api/characters';
import { SecondaryButton } from '@/components/buttons';

import { SearchField } from './search-field';

/** The search text and sort order, and how to change them. The screen owns both. */
export type SearchState = {
    search: string;
    onSearchChange: (text: string) => void;
    /** Sends the search without waiting for typing to pause, for the keyboard's Search key. */
    onSearchSubmit: () => void;
    /** Empties the search and sends it straight away, for the field's clear button. */
    onSearchClear: () => void;
    sort: CharacterSort;
    onSortPress: () => void;
    searching?: boolean;
};

type SearchControlsProps = SearchState & {
    onPlate?: boolean;
    style?: StyleProp<ViewStyle>;
};

/**
 * The search field with the sort button beside it, on the phone plate or in the wide toolbar.
 *
 * @param props.search - The search text, as typed.
 * @param props.onSearchChange - Called with the new text on every keystroke.
 * @param props.onSearchSubmit - Called when the keyboard's Search key is pressed.
 * @param props.onSearchClear - Called when the field's clear button is pressed.
 * @param props.sort - The current order, which the sort button names.
 * @param props.onSortPress - Called when the sort button is tapped, to switch to the other order.
 * @param props.searching - Whether a search is loading, which turns a spinner in the field.
 * @param props.onPlate - Whether the controls sit on the structural plate, where focus rings need
 *   the light ink to show.
 * @param props.style - Layout for the row, such as its margin within the plate or toolbar.
 */
export function SearchControls({
    search,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    sort,
    onSortPress,
    searching = false,
    onPlate = false,
    style,
}: SearchControlsProps) {
    return (
        <View style={[styles.controls, style]}>
            <SearchField
                value={search}
                onChangeText={onSearchChange}
                onSubmit={onSearchSubmit}
                onClear={onSearchClear}
                onPlate={onPlate}
                searching={searching}
            />
            <SecondaryButton
                label={`Sort: ${sort}`}
                size="large"
                onPlate={onPlate}
                onPress={onSortPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    controls: {
        flexDirection: 'row',
        gap: 8,
    },
});
