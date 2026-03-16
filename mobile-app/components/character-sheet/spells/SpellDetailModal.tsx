import {
    Pressable,
    ScrollView,
    StyleSheet,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    View,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { spellLevelLabel, spellSchoolLabel } from '@/lib/spellPresentation';
import type { AddSpellDetail } from './addSpell.types';

type SpellDetailModalProps = {
    spell: AddSpellDetail | null;
    spellName: string;
    known: boolean;
    loading: boolean;
    errorMessage?: string;
    onRetry: () => void;
    onToggleSelection: () => void;
    onBodyScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

type DetailStat = {
    label: string;
    value: string;
};

/**
 * Produces a compact duration string for the detail stats row.
 */
function abbreviateDuration(duration?: string | null): string {
    if (!duration) return '—';

    return duration
        .replace(/^Concentration,?\s*/i, 'Conc. ')
        .replace(/minute/gi, 'min')
        .replace(/hour/gi, 'hr')
        .replace(/up to/gi, 'up to');
}

/**
 * Joins spell components and optional material text into one label.
 */
function componentsLabel(spell: AddSpellDetail): string {
    if (!spell.material) return spell.components.join(', ');
    return `${spell.components.join(', ')} (${spell.material})`;
}

/**
 * Builds the four core spell stats for the detail grid.
 */
function buildDetailStats(spell: AddSpellDetail): DetailStat[] {
    return [
        { label: 'Casting', value: spell.castingTime },
        { label: 'Range', value: spell.range ?? '—' },
        { label: 'Duration', value: abbreviateDuration(spell.duration) },
        { label: 'Comp.', value: spell.components.join(', ') },
    ];
}

/**
 * Bottom-sheet spell detail body used by Add Spell.
 */
export default function SpellDetailModal({
    spell,
    spellName,
    known,
    loading,
    errorMessage,
    onRetry,
    onToggleSelection,
    onBodyScroll,
}: SpellDetailModalProps) {
    const stats = spell ? buildDetailStats(spell) : [];
    const showLoadingState = loading && !spell;
    const showErrorState = !loading && !spell && errorMessage != null;

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View style={styles.handle} />
            </View>

            {spell && (
                <>
                    <View style={styles.header}>
                        <Text style={styles.school}>{spellSchoolLabel(spell.schoolIndex)}</Text>
                        <Text style={styles.title}>{spell.name}</Text>
                        <View style={styles.tagsRow}>
                            <View style={styles.levelChip}>
                                <Text style={styles.levelChipText}>{spellLevelLabel(spell.level)}</Text>
                            </View>
                            {spell.ritual && (
                                <View style={styles.tagChip}>
                                    <Text style={styles.tagChipText}>Ritual</Text>
                                </View>
                            )}
                            {spell.concentration && (
                                <View style={styles.tagChip}>
                                    <Text style={styles.tagChipText}>Concentration</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        {stats.map((stat, index) => (
                            <View key={stat.label} style={[styles.statCell, index < stats.length - 1 && styles.statCellDivider]}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue} numberOfLines={2}>{stat.value}</Text>
                            </View>
                        ))}
                    </View>

                    <ScrollView
                        style={styles.bodyScroll}
                        contentContainerStyle={styles.bodyContent}
                        onScroll={onBodyScroll}
                        scrollEventThrottle={16}
                    >
                        <Text style={styles.bodyHeading}>Description</Text>
                        <Text style={styles.bodyText}>{spell.description.join('\n\n')}</Text>

                        {spell.higherLevel.length > 0 && (
                            <>
                                <Text style={styles.bodyHeading}>At Higher Levels</Text>
                                <Text style={styles.bodyText}>{spell.higherLevel.join('\n\n')}</Text>
                            </>
                        )}

                        <Text style={styles.bodyHeading}>Components</Text>
                        <Text style={styles.bodyText}>{componentsLabel(spell)}</Text>
                    </ScrollView>
                </>
            )}

            {showLoadingState && (
                <>
                    <View style={styles.header}>
                        <Text style={styles.school}>SPELL DETAILS</Text>
                        <Text style={styles.title}>{spellName}</Text>
                    </View>

                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="small" color={fantasyTokens.colors.gold} />
                        <Text style={styles.loadingText}>Summoning details...</Text>
                    </View>

                    <View style={styles.skeletonBody}>
                        <View style={[styles.skeletonLine, styles.skeletonLineWide]} />
                        <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
                        <View style={[styles.skeletonLine, styles.skeletonLineNarrow]} />
                        <View style={[styles.skeletonLine, styles.skeletonLineWide]} />
                        <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
                    </View>
                </>
            )}

            {showErrorState && (
                <View style={styles.errorState}>
                    <Text style={styles.errorHeading}>Failed to summon spell details.</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            <View style={styles.bottomBar}>
                {spell && !known && (
                    <Pressable
                        onPress={onToggleSelection}
                        style={styles.addButton}
                        accessibilityLabel={`Add ${spell.name} to spell list`}
                    >
                        <Text style={styles.addButtonText}>+ Add to spell list</Text>
                    </Pressable>
                )}

                {spell && known && (
                    <Pressable
                        onPress={onToggleSelection}
                        style={[styles.addButton, styles.addedButton]}
                        accessibilityLabel={`Remove ${spell.name} from spell list`}
                    >
                        <Text style={styles.addedButtonText}>Remove from spell list</Text>
                    </Pressable>
                )}

                {showLoadingState && (
                    <View style={[styles.addButton, styles.loadingButton]} accessibilityLabel={`Loading ${spellName} details`}>
                        <Text style={styles.loadingButtonText}>Loading spell details...</Text>
                    </View>
                )}

                {showErrorState && (
                    <Pressable
                        onPress={onRetry}
                        style={styles.addButton}
                        accessibilityLabel={`Retry loading ${spellName} details`}
                    >
                        <Text style={styles.addButtonText}>Retry</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: 'rgba(201,146,42,0.2)',
        overflow: 'hidden',
    },
    topBar: {
        minHeight: 46,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xs,
    },
    handle: {
        position: 'absolute',
        top: 8,
        left: '50%',
        width: 36,
        height: 4,
        borderRadius: 2,
        marginLeft: -18,
        backgroundColor: 'rgba(201,146,42,0.2)',
    },
    header: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.1)',
    },
    school: {
        color: fantasyTokens.colors.gold,
        opacity: 0.55,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    title: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 23,
        marginTop: 4,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: fantasyTokens.spacing.sm,
    },
    levelChip: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.4)',
        backgroundColor: 'rgba(201,146,42,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    levelChipText: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tagChip: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        backgroundColor: 'rgba(201,146,42,0.06)',
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    tagChipText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.7,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.08)',
    },
    statCell: {
        flex: 1,
        minHeight: 48,
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    statCellDivider: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(201,146,42,0.08)',
    },
    statLabel: {
        color: fantasyTokens.colors.gold,
        opacity: 0.6,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1.6,
    },
    statValue: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        lineHeight: 15,
        marginTop: 3,
    },
    bodyScroll: {
        flex: 1,
    },
    bodyContent: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xl,
        gap: 8,
    },
    bodyHeading: {
        color: fantasyTokens.colors.gold,
        opacity: 0.65,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
    },
    bodyText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.82,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        lineHeight: 22,
    },
    loadingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.md,
    },
    loadingText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.72,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
    },
    skeletonBody: {
        flex: 1,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.md,
        gap: 10,
    },
    skeletonLine: {
        borderRadius: 999,
        height: 10,
        backgroundColor: 'rgba(201,146,42,0.14)',
    },
    skeletonLineWide: {
        width: '96%',
    },
    skeletonLineMedium: {
        width: '82%',
    },
    skeletonLineNarrow: {
        width: '68%',
    },
    errorState: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        gap: 8,
    },
    errorHeading: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
    },
    errorText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.74,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
    },
    bottomBar: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.1)',
        backgroundColor: fantasyTokens.colors.night,
    },
    loadingButton: {
        backgroundColor: 'rgba(201,146,42,0.16)',
    },
    loadingButtonText: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    addButton: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    addButtonText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
    },
    addedButton: {
        backgroundColor: 'rgba(139,26,26,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.5)',
    },
    addedButtonText: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
});
