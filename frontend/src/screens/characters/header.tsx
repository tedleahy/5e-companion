import { StyleSheet, View } from 'react-native';

import { Heading } from '@/components/heading';
import { colors, dropShadow, offsetShadow, typography } from '@/theme';

import { ContentColumn } from './content-column';
import { SearchControls, type SearchState } from './search-controls';

/**
 * The structural plate at the top of the phone list: the title, then search and sort. Without
 * `searchState` it holds only the title.
 *
 * @param props.searchState - The search and sort to show. Leave it unset when there is nothing to
 *   search, such as before the first character exists.
 */
export function Header({ searchState }: { searchState?: SearchState }) {
    return (
        <View style={styles.plate}>
            <Heading level={1} style={[typography.titlePhone, styles.title]}>
                Characters
            </Heading>
            {searchState && (
                <SearchControls {...searchState} onPlate style={styles.searchControls} />
            )}
        </View>
    );
}

/** The plate from tablet up, which holds only the title. Search and sort move to the toolbar. */
export function WidePlate() {
    return (
        <View style={styles.widePlate}>
            <ContentColumn>
                <Heading level={1} style={[typography.titleDesktop, styles.title]}>
                    Characters
                </Heading>
            </ContentColumn>
        </View>
    );
}

/** Depth of the wide plate's shadow, which falls straight down rather than down and right. */
const WIDE_PLATE_SHADOW = 5;

const styles = StyleSheet.create({
    plate: {
        paddingTop: 20,
        paddingHorizontal: 18,
        paddingBottom: 16,
        backgroundColor: colors.structural,
        boxShadow: offsetShadow(5, 'accent'),
    },
    widePlate: {
        paddingTop: 26,
        paddingBottom: 24,
        // The toolbar below is opaque, so the plate keeps clear of it to leave its shadow showing.
        marginBottom: WIDE_PLATE_SHADOW,
        backgroundColor: colors.structural,
        boxShadow: dropShadow(WIDE_PLATE_SHADOW, 'accent'),
    },
    title: {
        color: colors.onStructural,
    },
    searchControls: {
        marginTop: 13,
    },
});
