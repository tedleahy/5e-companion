import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CharacterSort } from '@/api/characters';
import { SecondaryButton } from '@/components/buttons';

import { SearchField } from './search-field';

/** The search text and sort order, and how to change them. The screen owns both. */
export type SearchState = {
    search: string;
    onSearchChange: (text: string) => void;
    sort: CharacterSort;
    onSortPress: () => void;
};

type SearchControlsProps = SearchState & {
    /** Sits on the structural plate, so focus rings need the light ink. */
    onPlate?: boolean;
    style?: StyleProp<ViewStyle>;
};

/** The search field with the sort button beside it, on the phone plate or in the wide toolbar. */
export function SearchControls({
    search,
    onSearchChange,
    sort,
    onSortPress,
    onPlate = false,
    style,
}: SearchControlsProps) {
    return (
        <View style={[styles.controls, style]}>
            <SearchField value={search} onChangeText={onSearchChange} onPlate={onPlate} />
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
