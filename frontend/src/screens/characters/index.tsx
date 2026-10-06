import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CharacterSort } from '@/api/characters';
import { Paper } from '@/components/paper';
import { useCharacterList } from '@/hooks/use-character-list';

import { CharacterCard } from './character-card';
import { CreateFooter } from './create-footer';
import { DraftTray } from './draft-tray';
import { Header } from './header';

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
    // The footer floats over the list, so the list pads its end by the footer's height.
    const [footerHeight, setFooterHeight] = useState(0);

    return (
        <Paper>
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ paddingBottom: footerHeight + FOOTER_GAP }}
                >
                    <Header
                        search={search}
                        onSearchChange={setSearch}
                        sort={sort}
                        onSortPress={() => setSort(sort === 'level' ? 'name' : 'level')}
                    />
                    <View style={styles.list}>
                        {data && data.drafts.length > 0 && <DraftTray drafts={data.drafts} />}
                        {data?.characters.map((character) => (
                            <CharacterCard key={character.id} character={character} />
                        ))}
                    </View>
                </ScrollView>
                <CreateFooter
                    onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
                />
            </SafeAreaView>
        </Paper>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    list: {
        gap: 14,
        paddingTop: 12,
        paddingHorizontal: 12,
    },
});
