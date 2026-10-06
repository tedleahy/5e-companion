import { StyleSheet, Text, View } from 'react-native';

import type { CharacterSort } from '@/api/characters';
import { SecondaryButton } from '@/components/buttons';
import { colors, offsetShadow, typography } from '@/theme';

import { SearchField } from './search-field';

type HeaderProps = {
    search: string;
    onSearchChange: (text: string) => void;
    sort: CharacterSort;
    onSortPress: () => void;
};

/** The structural plate at the top of the list: the title, then search and sort. */
export function Header({ search, onSearchChange, sort, onSortPress }: HeaderProps) {
    return (
        <View style={styles.plate}>
            <Text role="heading" style={[typography.titlePhone, styles.title]}>
                Characters
            </Text>
            <View style={styles.searchRow}>
                <SearchField value={search} onChangeText={onSearchChange} />
                <SecondaryButton
                    label={`Sort: ${sort}`}
                    size="large"
                    onPlate
                    onPress={onSortPress}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    plate: {
        paddingTop: 20,
        paddingHorizontal: 18,
        paddingBottom: 16,
        backgroundColor: colors.structural,
        boxShadow: offsetShadow(5, 'accent'),
    },
    title: {
        color: colors.onStructural,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 13,
    },
});
