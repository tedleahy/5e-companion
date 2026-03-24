import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Props for the Add Spell sheet header block.
 */
type AddSpellSheetHeaderProps = {
    searchQuery: string;
    onChangeSearchQuery: (value: string) => void;
    onClearSearchQuery: () => void;
    activeFilterCount: number;
    onOpenFilterPanel: () => void;
};

/**
 * Search and filter header for the Add Spell sheet.
 */
export default function AddSpellSheetHeader({
    searchQuery,
    onChangeSearchQuery,
    onClearSearchQuery,
    activeFilterCount,
    onOpenFilterPanel,
}: AddSpellSheetHeaderProps) {
    return (
        <View style={styles.headerDragZone}>
            <View style={styles.handleRow}>
                <View style={styles.handle} />
            </View>

            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.title}>Add Spell</Text>
                    <Text style={styles.subtitle}>Choose spells to add to your spellbook</Text>
                </View>
            </View>

            <View style={styles.searchFilterRow}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={14} color="rgba(245,230,200,0.35)" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={onChangeSearchQuery}
                        placeholder="Search spells..."
                        placeholderTextColor="rgba(245,230,200,0.28)"
                        style={styles.searchInput}
                        accessibilityLabel="Search spells"
                    />
                    <Pressable
                        onPress={onClearSearchQuery}
                        accessibilityRole="button"
                        accessibilityLabel="Clear spell search"
                        style={styles.clearSearchButton}
                    >
                        <Ionicons
                            name="close-circle"
                            size={16}
                            color={searchQuery.length > 0 ? 'rgba(245,230,200,0.58)' : 'rgba(245,230,200,0.2)'}
                        />
                    </Pressable>
                </View>

                <Pressable
                    onPress={onOpenFilterPanel}
                    style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                    accessibilityLabel="Open spell filters"
                >
                    <Ionicons name="filter" size={14} color="rgba(245,230,200,0.45)" />
                    <Text style={styles.filterButtonText}>Filter</Text>
                    {activeFilterCount > 0 && (
                        <View style={styles.filterCountBadge}>
                            <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerDragZone: {
        flexShrink: 0,
    },
    handleRow: {
        paddingTop: 16,
        paddingHorizontal: fantasyTokens.spacing.md,
        alignItems: 'center',
        position: 'relative',
        minHeight: 40,
        paddingBottom: 6,
    },
    handle: {
        position: 'absolute',
        top: 8,
        left: '50%',
        marginLeft: -18,
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(201,146,42,0.2)',
    },
    titleRow: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: 6,
        paddingBottom: 10,
    },
    title: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        fontWeight: '700',
    },
    subtitle: {
        color: fantasyTokens.colors.gold,
        opacity: 0.55,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        marginTop: 1,
    },
    searchFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.15)',
        borderRadius: 10,
        backgroundColor: 'rgba(245,230,200,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 2,
        minHeight: 40,
    },
    searchInput: {
        flex: 1,
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        paddingVertical: 6,
    },
    clearSearchButton: {
        marginLeft: 4,
        paddingVertical: 2,
        paddingHorizontal: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.18)',
        borderRadius: 10,
        backgroundColor: 'rgba(245,230,200,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    filterButtonActive: {
        backgroundColor: 'rgba(139,26,26,0.15)',
        borderColor: 'rgba(139,26,26,0.4)',
    },
    filterButtonText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.62,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    filterCountBadge: {
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    filterCountText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        fontWeight: '700',
    },
});
