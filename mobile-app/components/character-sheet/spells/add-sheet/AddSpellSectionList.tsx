import { Keyboard, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { spellSchoolLabel } from '@/lib/spellPresentation';
import AddCircleButton from '../AddCircleButton';
import type { AddSpellListItem, AddSpellSection } from '../addSpell.types';

type AddSpellSectionListProps = {
    sections: AddSpellSection[];
    loading: boolean;
    errorMessage?: string;
    isKnownSpell: (spellId: string) => boolean;
    pendingSpellIds: Set<string>;
    onToggleSpellSelection: (spell: AddSpellListItem) => void;
    onOpenSpellDetail: (spell: AddSpellListItem) => void;
    onPrefetchSpellDetail?: (spellId: string) => void;
};

/**
 * Builds a concise metadata row string for one spell list item.
 */
function spellMetaLabel(spell: AddSpellListItem): string {
    const parts: string[] = [spellSchoolLabel(spell.schoolIndex), spell.castingTime];
    if (spell.range) {
        parts.push(spell.range);
    }

    return parts.join(' · ');
}

/**
 * Renders grouped add-sheet spell rows with loading and empty/error states.
 */
export default function AddSpellSectionList({
    sections,
    loading,
    errorMessage,
    isKnownSpell,
    pendingSpellIds,
    onToggleSpellSelection,
    onOpenSpellDetail,
    onPrefetchSpellDetail,
}: AddSpellSectionListProps) {
    const isEmpty = !loading && !errorMessage && sections.length === 0;

    return (
        <View style={styles.listContainer}>
            {loading && sections.length === 0 && (
                <View style={styles.loadingState}>
                    <ActivityIndicator color={fantasyTokens.colors.gold} />
                    <Text style={styles.loadingText}>Loading spells...</Text>
                </View>
            )}

            {isEmpty && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No spells match these filters.</Text>
                </View>
            )}

            {errorMessage && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Failed to load spells.</Text>
                    <Text style={styles.emptySubtext}>{errorMessage}</Text>
                </View>
            )}

            <SectionList
                sections={sections}
                keyExtractor={(spell) => spell.id}
                stickySectionHeadersEnabled
                keyboardShouldPersistTaps="handled"
                renderSectionHeader={({ section }) => (
                    <View style={styles.levelHeader}>
                        <Text style={styles.levelHeaderText}>{section.title}</Text>
                        <View style={styles.levelCountBadge}>
                            <Text style={styles.levelCountText}>{section.data.length}</Text>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => {
                    const isKnown = isKnownSpell(item.id);
                    const isPending = pendingSpellIds.has(item.id);

                    return (
                        <View style={[styles.spellRow, isKnown && styles.spellRowKnown]}>
                            <AddCircleButton
                                known={isKnown}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    onToggleSpellSelection(item);
                                }}
                            />

                            <Pressable
                                style={styles.spellTapArea}
                                onPressIn={() => {
                                    onPrefetchSpellDetail?.(item.id);
                                }}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    onOpenSpellDetail(item);
                                }}
                                disabled={isPending}
                                accessibilityRole="button"
                                accessibilityLabel={`Open details for ${item.name}`}
                            >
                                <View style={styles.spellInfo}>
                                    <Text style={styles.spellName}>{item.name}</Text>
                                    <Text numberOfLines={1} style={styles.spellMeta}>{spellMetaLabel(item)}</Text>

                                    {(item.ritual || item.concentration) && (
                                        <View style={styles.tagRow}>
                                            {item.ritual && (
                                                <View style={styles.tagPill}>
                                                    <Text style={styles.tagPillText}>Ritual</Text>
                                                </View>
                                            )}
                                            {item.concentration && (
                                                <View style={[styles.tagPill, styles.tagPillConcentration]}>
                                                    <Text style={[styles.tagPillText, styles.tagPillConcentrationText]}>Conc.</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={12}
                                    color="rgba(201,146,42,0.2)"
                                />
                            </Pressable>
                        </View>
                    );
                }}
                style={styles.sectionList}
                contentContainerStyle={styles.sectionListContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
    },
    loadingState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: fantasyTokens.spacing.md,
    },
    loadingText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.72,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
    },
    emptyState: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.md,
    },
    emptyText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 15,
    },
    emptySubtext: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        marginTop: 6,
    },
    sectionList: {
        flex: 1,
    },
    sectionListContent: {
        paddingBottom: 8,
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 6,
        backgroundColor: fantasyTokens.colors.night,
    },
    levelHeaderText: {
        color: fantasyTokens.colors.gold,
        opacity: 0.52,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 2.4,
    },
    levelCountBadge: {
        borderRadius: 999,
        backgroundColor: 'rgba(201,146,42,0.06)',
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    levelCountText: {
        color: 'rgba(201,146,42,0.42)',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
    },
    spellRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 16,
        paddingRight: 14,
        paddingVertical: 9,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.07)',
    },
    spellRowKnown: {
        opacity: 0.78,
    },
    spellTapArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 0,
    },
    spellInfo: {
        flex: 1,
        minWidth: 0,
    },
    spellName: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontWeight: '700',
    },
    spellMeta: {
        color: 'rgba(245,230,200,0.4)',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 1,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 4,
    },
    tagPill: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.1)',
        backgroundColor: 'rgba(201,146,42,0.07)',
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    tagPillConcentration: {
        borderColor: 'rgba(80,80,160,0.14)',
        backgroundColor: 'rgba(80,80,160,0.07)',
    },
    tagPillText: {
        color: 'rgba(201,146,42,0.55)',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 7,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    tagPillConcentrationText: {
        color: 'rgba(100,100,180,0.7)',
    },
});
