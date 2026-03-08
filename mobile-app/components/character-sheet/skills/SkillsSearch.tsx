import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SkillsSearchProps = {
    searchText: string;
    onChangeSearchText: (text: string) => void;
};

const SEARCH_BAR_HEIGHT = 46;

export default function SkillsSearch({ searchText, onChangeSearchText }: SkillsSearchProps) {
    return (
        <View style={styles.searchWrap}>
            <Searchbar
                style={styles.searchBar}
                inputStyle={styles.searchInput}
                iconColor={fantasyTokens.colors.ember}
                placeholderTextColor={fantasyTokens.colors.inkSoft}
                placeholder="Search skills..."
                onChangeText={onChangeSearchText}
                value={searchText}
                accessibilityLabel="Search skills"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    searchWrap: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    searchBar: {
        backgroundColor: fantasyTokens.colors.parchment,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        borderRadius: 10,
        height: SEARCH_BAR_HEIGHT,
    },
    searchInput: {
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
        fontSize: 16,
        minHeight: SEARCH_BAR_HEIGHT,
        paddingVertical: 0,
    },
});
