import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CharacterSort, CharacterSummary } from '@/api/characters';
import { Paper } from '@/components/paper';
import { useBreakpoint, type Breakpoint } from '@/hooks/use-breakpoint';
import { useCharacterList } from '@/hooks/use-character-list';

import { CharacterCard } from './character-card';
import { CharacterRow } from './character-row';
import { CreateFooter } from './create-footer';
import { DraftTray } from './draft-tray';
import { ContentColumn } from './content-column';
import { Header, WidePlate } from './header';
import {
    EmptyCard,
    FailedNotice,
    Loading,
    MisconfiguredNotice,
    SearchResultsStatus,
    SignedOutNotice,
} from './list-messages';
import { listState, showsCreate, showsSearch, type ListState } from './list-state';
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
    const { data, error, refetch, isSearching, shownSearch, isFetching, isPlaceholderData } =
        useCharacterList(search, sort);
    // Try again shows the first-load spinner until its request settles. The query alone can't say
    // so: after a failed search it falls back to the previous search's list while it refetches.
    const [retrying, setRetrying] = useState(false);
    const breakpoint = useBreakpoint();

    const state = listState({ data, error, shownSearch, retrying });
    // The old empty card can remain while a new search debounces or loads. Announce only an
    // outcome that has settled and still matches the field, never that earlier result.
    const resultMessage =
        state.kind === 'noResults' &&
        !isFetching &&
        !isPlaceholderData &&
        search.trim() === state.search
            ? noResultsMessage(state.search)
            : null;

    const searchState: SearchState = {
        search,
        onSearchChange: setSearch,
        sort,
        onSortPress: () => setSort(sort === 'level' ? 'name' : 'level'),
        // While Try again runs, the first-load spinner already says something is loading.
        searching: isSearching && state.kind !== 'loading',
    };

    const retry = () => {
        setRetrying(true);
        void refetch().finally(() => setRetrying(false));
    };

    return (
        <Paper>
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
                {breakpoint === 'phone' ? (
                    <PhoneLayout searchState={searchState} state={state} onRetry={retry} />
                ) : (
                    <WideLayout
                        searchState={searchState}
                        state={state}
                        onRetry={retry}
                        breakpoint={breakpoint}
                    />
                )}
            </SafeAreaView>
            <SearchResultsStatus message={resultMessage} />
        </Paper>
    );
}

/** Keeps the empty-card heading and its screen-reader announcement in agreement. */
function noResultsMessage(search: string): string {
    return `No characters match “${search}”`;
}

type LayoutProps = {
    searchState: SearchState;
    state: ListState;
    onRetry: () => void;
};

/**
 * One column of cards under the plate, with Create character pinned to the bottom.
 *
 * @param props.searchState - The search and sort, shown on the plate when there's a list to search.
 * @param props.state - What the list is showing, which also decides the plate and footer.
 * @param props.onRetry - Repeats the request that failed, for the Try again button.
 */
function PhoneLayout({ searchState, state, onRetry }: LayoutProps) {
    // The footer floats over the list, so the list pads its end by the footer's height.
    const [footerHeight, setFooterHeight] = useState(0);
    const hasFooter = showsCreate(state);

    return (
        <>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={[
                    styles.grow,
                    { paddingBottom: (hasFooter ? footerHeight : 0) + FOOTER_GAP },
                ]}
            >
                <Header
                    searchState={showsSearch(state, searchState.search) ? searchState : undefined}
                />
                <View style={[styles.phoneList, styles.grow]}>
                    <ListContent
                        state={state}
                        onRetry={onRetry}
                        renderCharacters={(characters) =>
                            characters.map((character) => (
                                <CharacterCard key={character.id} character={character} />
                            ))
                        }
                    />
                </View>
            </ScrollView>
            {hasFooter && (
                <CreateFooter
                    onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
                />
            )}
        </>
    );
}

/**
 * Tablet and desktop: the title plate, then a toolbar that sticks to the top while the list
 * scrolls under it.
 *
 * @param props.searchState - The search and sort, shown in the toolbar when there's a list to
 *   search.
 * @param props.state - What the list is showing, which also decides what the toolbar holds.
 * @param props.onRetry - Repeats the request that failed, for the Try again button.
 * @param props.breakpoint - Which wide layout to use, which sets how the characters are laid out.
 */
function WideLayout({
    searchState,
    state,
    onRetry,
    breakpoint,
}: LayoutProps & { breakpoint: Exclude<Breakpoint, 'phone'> }) {
    const hasToolbar = showsCreate(state);

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.grow}
            // The toolbar is the second child.
            stickyHeaderIndices={hasToolbar ? [1] : undefined}
        >
            <WidePlate />
            {hasToolbar && (
                <Toolbar
                    searchState={showsSearch(state, searchState.search) ? searchState : undefined}
                />
            )}
            <ContentColumn
                style={[
                    styles.wideList,
                    breakpoint === 'tablet' && styles.portraitList,
                    styles.grow,
                ]}
            >
                <ListContent
                    state={state}
                    onRetry={onRetry}
                    trayStyle={breakpoint === 'tabletLandscape' && styles.fullTray}
                    renderCharacters={(characters) => wideCharacters(characters, breakpoint)}
                />
            </ContentColumn>
        </ScrollView>
    );
}

type ListContentProps = {
    state: ListState;
    onRetry: () => void;
    trayStyle?: StyleProp<ViewStyle>;
    renderCharacters: (characters: CharacterSummary[]) => ReactNode;
};

/**
 * What goes under the header and controls in each state, at any width.
 *
 * @param props.state - What to show.
 * @param props.onRetry - Repeats the request that failed, for the Try again button.
 * @param props.trayStyle - Overrides for the draft tray's spacing, which the two-column layout
 *   needs because the tray spans both columns.
 * @param props.renderCharacters - Lays out the characters, which each layout does its own way.
 */
function ListContent({ state, onRetry, trayStyle, renderCharacters }: ListContentProps) {
    switch (state.kind) {
        case 'loading':
            return <Loading />;
        case 'misconfigured':
            return <MisconfiguredNotice variable={state.variable} />;
        case 'signedOut':
            return <SignedOutNotice />;
        case 'failed':
            return <FailedNotice onRetry={onRetry} />;
        case 'empty':
            return (
                <EmptyCard
                    title="No characters yet"
                    body="Create character walks you through class, race, background, and ability scores, one step at a time."
                />
            );
        case 'draftsOnly':
            return <DraftTray drafts={state.drafts} alone style={trayStyle} />;
        case 'noResults':
            return (
                <>
                    {state.drafts.length > 0 && (
                        <DraftTray drafts={state.drafts} style={trayStyle} />
                    )}
                    <EmptyCard
                        title={noResultsMessage(state.search)}
                        // Says what search covers, so a player who searched for "dwarf" doesn't
                        // think it broke.
                        body="Search only looks at names. Check the spelling, or clear the search to see all your characters."
                    />
                </>
            );
        case 'list':
            return (
                <>
                    {state.list.drafts.length > 0 && (
                        <DraftTray drafts={state.list.drafts} style={trayStyle} />
                    )}
                    {renderCharacters(state.list.characters)}
                </>
            );
    }
}

/**
 * Rows on desktop, one column of cards on a portrait tablet, and two columns of cards on a
 * landscape one.
 *
 * @param characters - The characters to lay out, in the API's order.
 * @param breakpoint - Which wide layout to lay them out for.
 */
function wideCharacters(
    characters: CharacterSummary[],
    breakpoint: Exclude<Breakpoint, 'phone'>,
): ReactNode {
    if (breakpoint === 'desktop') {
        return characters.map((character) => (
            <CharacterRow key={character.id} character={character} />
        ));
    }

    if (breakpoint === 'tablet') {
        return characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
        ));
    }

    return pairs(characters).map((pair) => (
        <View key={pair[0].id} style={styles.pair}>
            {pair.map((character) => (
                <View key={character.id} style={styles.column}>
                    <CharacterCard character={character} style={styles.fill} />
                </View>
            ))}
            {/* Keeps a lone last card to one column's width. */}
            {pair.length === 1 && <View testID="empty-column" style={styles.column} />}
        </View>
    ));
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
    // Lets the loading spinner centre itself in the space the list will fill.
    grow: {
        flexGrow: 1,
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
