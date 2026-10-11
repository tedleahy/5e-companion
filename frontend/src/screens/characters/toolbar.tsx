import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { colors } from '@/theme';

import { ContentColumn } from './content-column';
import { SearchControls, type SearchState } from './search-controls';

type ToolbarProps = {
    searchState?: SearchState;
    onCreate?: () => void;
};

/**
 * The bar under the wide plate that stays at the top while the list scrolls: search and sort on
 * the left, Create character on the right.
 *
 * @param props.searchState - The search and sort to show. Leave it unset when there is nothing to
 *   search, which leaves Create character on its own.
 * @param props.onCreate - Starts creating a character. Unset until the creation route exists.
 */
export function Toolbar({ searchState, onCreate }: ToolbarProps) {
    return (
        <View testID="toolbar" style={styles.toolbar}>
            <ContentColumn style={styles.inner}>
                {searchState && <SearchControls {...searchState} style={styles.searchControls} />}
                <PrimaryButton
                    label="Create character"
                    size="medium"
                    onPress={onCreate}
                    style={styles.create}
                />
            </ContentColumn>
        </View>
    );
}

const styles = StyleSheet.create({
    toolbar: {
        paddingTop: 14,
        paddingBottom: 18,
        backgroundColor: colors.paper,
        borderBottomWidth: 2,
        borderBottomColor: colors.structural,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    searchControls: {
        flex: 1,
        maxWidth: 520,
    },
    create: {
        marginLeft: 'auto',
    },
});
