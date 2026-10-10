import { StyleSheet, Text, View } from 'react-native';

import { colors, offsetShadow, typography } from '@/theme';

import { ContentColumn } from './content-column';
import { SearchControls, type SearchState } from './search-controls';

/** The structural plate at the top of the phone list: the title, then search and sort. */
export function Header(props: SearchState) {
    return (
        <View style={styles.plate}>
            <Text role="heading" style={[typography.titlePhone, styles.title]}>
                Characters
            </Text>
            <SearchControls {...props} onPlate style={styles.searchControls} />
        </View>
    );
}

/** The plate from tablet up, which holds only the title. Search and sort move to the toolbar. */
export function WidePlate() {
    return (
        <View style={styles.widePlate}>
            <ContentColumn>
                <Text role="heading" style={[typography.titleDesktop, styles.title]}>
                    Characters
                </Text>
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
        boxShadow: `0 ${WIDE_PLATE_SHADOW}px 0 ${colors.accent}`,
    },
    title: {
        color: colors.onStructural,
    },
    searchControls: {
        marginTop: 13,
    },
});
