import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CharacterList, CharacterSort, CharacterSummary } from '@/api/characters';
import { Paper } from '@/components/paper';
import { useBreakpoint, type Breakpoint } from '@/hooks/use-breakpoint';
import { useCharacterList } from '@/hooks/use-character-list';

import { CharacterCard } from './character-card';
import { CharacterRow } from './character-row';
import { CreateFooter } from './create-footer';
import { DraftTray } from './draft-tray';
import { Header, WidePlate } from './header';
import { ContentColumn } from './content-column';
import type { SearchState } from './search-controls';
import { Toolbar } from './toolbar';

/** Space between the last card and the top of the footer when the list is scrolled to the end. */
const FOOTER_GAP = 8;

/**
 * The player's characters, with any unfinished drafts above them. Search and sort are sent to the
 * API, which returns the list already in order.
 */
export function Characters() {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<CharacterSort>('level');
    const { data } = useCharacterList(search, sort);
    const breakpoint = useBreakpoint();

    const searchState: SearchState = {
        search,
        onSearchChange: setSearch,
        sort,
        onSortPress: () => setSort(sort === 'level' ? 'name' : 'level'),
    };

    return (
        <Paper>
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
                {breakpoint === 'phone' ? (
                    <PhoneLayout searchState={searchState} data={data} />
                ) : (
                    <WideLayout searchState={searchState} data={data} breakpoint={breakpoint} />
                )}
            </SafeAreaView>
        </Paper>
    );
}

type LayoutProps = {
    searchState: SearchState;
    /** Undefined until the first response. */
    data: CharacterList | undefined;
};

/** One column of cards under the plate, with Create character pinned to the bottom. */
function PhoneLayout({ searchState, data }: LayoutProps) {
    // The footer floats over the list, so the list pads its end by the footer's height.
    const [footerHeight, setFooterHeight] = useState(0);

    return (
        <>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: footerHeight + FOOTER_GAP }}
            >
                <Header {...searchState} />
                <View style={styles.phoneList}>
                    {data && data.drafts.length > 0 && <DraftTray drafts={data.drafts} />}
                    {data?.characters.map((character) => (
                        <CharacterCard key={character.id} character={character} />
                    ))}
                </View>
            </ScrollView>
            <CreateFooter onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)} />
        </>
    );
}

/**
 * Tablet and desktop: the title plate, then a toolbar that sticks to the top while the list
 * scrolls under it.
 */
function WideLayout({
    searchState,
    data,
    breakpoint,
}: LayoutProps & { breakpoint: Exclude<Breakpoint, 'phone'> }) {
    const characters = data?.characters ?? [];
    const hasDrafts = data !== undefined && data.drafts.length > 0;
    const twoColumns = breakpoint === 'tabletLandscape';

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            // The toolbar is the second child.
            stickyHeaderIndices={[1]}
        >
            <WidePlate />
            <Toolbar {...searchState} />
            <ContentColumn
                style={[styles.wideList, breakpoint === 'tablet' && styles.portraitList]}
            >
                {hasDrafts && (
                    <DraftTray drafts={data.drafts} style={twoColumns && styles.fullTray} />
                )}
                {breakpoint === 'desktop' &&
                    characters.map((character) => (
                        <CharacterRow key={character.id} character={character} />
                    ))}
                {breakpoint === 'tablet' &&
                    characters.map((character) => (
                        <CharacterCard key={character.id} character={character} />
                    ))}
                {twoColumns &&
                    pairs(characters).map((pair) => (
                        <View key={pair[0].id} style={styles.pair}>
                            {pair.map((character) => (
                                <View key={character.id} style={styles.column}>
                                    <CharacterCard character={character} style={styles.fill} />
                                </View>
                            ))}
                            {/* Keeps a lone last card to one column's width. */}
                            {pair.length === 1 && (
                                <View testID="empty-column" style={styles.column} />
                            )}
                        </View>
                    ))}
            </ContentColumn>
        </ScrollView>
    );
}

/** Splits `characters` into rows of two, in order. The last row has one if the count is odd. */
function pairs(characters: CharacterSummary[]): CharacterSummary[][] {
    const rows: CharacterSummary[][] = [];
    for (let index = 0; index < characters.length; index += 2) {
        rows.push(characters.slice(index, index + 2));
    }
    return rows;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    phoneList: {
        gap: 14,
        paddingTop: 12,
        paddingHorizontal: 12,
    },
    wideList: {
        gap: 16,
        paddingTop: 24,
        paddingBottom: 44,
    },
    portraitList: {
        paddingBottom: 28,
    },
    fullTray: {
        // Between rows, the list's gap is enough.
        marginBottom: 0,
    },
    pair: {
        flexDirection: 'row',
        gap: 16,
    },
    // Columns are plain views, and each card fills its own. A card's padding and border would
    // count towards its flex basis, so sizing the cards directly makes a lone card wider than an
    // empty column beside it.
    column: {
        flex: 1,
        minWidth: 0,
    },
    fill: {
        flex: 1,
    },
});
