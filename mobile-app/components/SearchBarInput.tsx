import { fantasyTokens } from '@/theme/fantasyTheme';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

const SEARCH_BAR_HEIGHT = 46;

type SearchBarInputProps = {
    placeholder: string;
    searchText: string;
    onChangeSearchText: (text: string) => void;
    accessibilityLabel?: string;
};

export default function SearchBarInput({
    placeholder = 'Search',
    searchText,
    onChangeSearchText,
    accessibilityLabel,
}: SearchBarInputProps) {
    return (
        <Searchbar
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={fantasyTokens.colors.ember}
            placeholderTextColor={fantasyTokens.colors.inkSoft}
            placeholder={placeholder}
            onChangeText={onChangeSearchText}
            value={searchText}
            accessibilityLabel={accessibilityLabel ?? placeholder}
        />
    );
}

const styles = StyleSheet.create({
    searchBar: {
        backgroundColor: fantasyTokens.colors.parchment,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        borderRadius: 10,
        height: SEARCH_BAR_HEIGHT,
    },
    searchInput: {
        color: fantasyTokens.colors.inkDark,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        minHeight: SEARCH_BAR_HEIGHT,
        paddingVertical: 0,
    },
});
