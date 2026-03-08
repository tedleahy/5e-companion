import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '../theme/fantasyTheme';
import ListSkeletonRows from './ListSkeletonRows';

export type SpellListItem = {
    id: string;
    name: string;
    level?: number | null;
    schoolIndex?: string | null;
    castingTime?: string | null;
    range?: string | null;
    concentration?: boolean | null;
    ritual?: boolean | null;
    prepared?: boolean | null;
};

type SpellTag = {
    label: string;
    style: 'concentration' | 'ritual';
};

type SpellGroup = {
    level: number | null;
    title: string;
    spells: SpellListItem[];
};

type SpellListProps = {
    spells?: SpellListItem[];
    loading?: boolean;
    emptyText?: string;
    onSpellPress?: (spellId: string) => void;
    onTogglePrepared?: (spellId: string, prepared: boolean) => Promise<void> | void;
    showPreparedState?: boolean;
    variant?: 'screen' | 'embedded';
    rowTestIdPrefix?: string;
};

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function schoolLabel(schoolIndex: string): string {
    return schoolIndex
        .split('-')
        .map((chunk) => capitalize(chunk))
        .join(' ');
}

function ordinal(level: number): string {
    const suffixMap: Record<number, string> = {
        1: 'st',
        2: 'nd',
        3: 'rd',
    };
    const suffix = suffixMap[level] ?? 'th';
    return `${level}${suffix}`;
}

function levelTitle(level: number | null): string {
    if (level == null) return 'Spells';
    if (level === 0) return 'Cantrips';
    return `${ordinal(level)} Level`;
}

function normalizeLevel(level: number | null | undefined): number | null {
    if (typeof level !== 'number' || Number.isNaN(level) || level < 0) return null;
    return level;
}

function spellMeta(spell: SpellListItem): string {
    const fields: string[] = [];

    if (spell.schoolIndex) fields.push(schoolLabel(spell.schoolIndex));
    if (spell.castingTime) fields.push(spell.castingTime);
    if (spell.range) fields.push(spell.range);

    return fields.join(' · ');
}

function buildSpellTags(spell: SpellListItem): SpellTag[] {
    const tags: SpellTag[] = [];

    if (spell.concentration) {
        tags.push({
            label: 'Conc.',
            style: 'concentration',
        });
    }

    if (spell.ritual) {
        tags.push({
            label: 'Ritual',
            style: 'ritual',
        });
    }

    return tags;
}

function buildSpellGroups(spells: SpellListItem[]): SpellGroup[] {
    const groupedSpells = new Map<number | null, SpellListItem[]>();

    for (const spell of spells) {
        const level = normalizeLevel(spell.level);
        const list = groupedSpells.get(level);

        if (list) {
            list.push(spell);
            continue;
        }

        groupedSpells.set(level, [spell]);
    }

    return Array.from(groupedSpells.entries())
        .sort(([leftLevel], [rightLevel]) => {
            const leftSort = leftLevel == null ? Number.POSITIVE_INFINITY : leftLevel;
            const rightSort = rightLevel == null ? Number.POSITIVE_INFINITY : rightLevel;
            return leftSort - rightSort;
        })
        .map(([level, grouped]) => ({
            level,
            title: levelTitle(level),
            spells: grouped.sort((leftSpell, rightSpell) => {
                return leftSpell.name.localeCompare(rightSpell.name);
            }),
        }));
}

function spellLevelBadgeLabel(level: number | null): string {
    if (level == null) return '\u2022';
    if (level === 0) return 'C';
    return String(level);
}

export default function SpellList({
    spells,
    loading = false,
    emptyText = 'No spells match this search yet.',
    onSpellPress,
    onTogglePrepared,
    showPreparedState = false,
    variant = 'screen',
    rowTestIdPrefix = 'spell-list',
}: SpellListProps) {
    const router = useRouter();
    const items = spells ?? [];
    const isInitialLoading = loading && items.length === 0;
    const groups = buildSpellGroups(items);
    const isEmbedded = variant === 'embedded';

    if (isInitialLoading) {
        return <ListSkeletonRows rowCount={7} />;
    }

    function handleSpellPress(spellId: string) {
        if (onSpellPress) {
            onSpellPress(spellId);
            return;
        }

        router.push(`/spells/${spellId}`);
    }

    function handleTogglePrepared(spell: SpellListItem) {
        if (!onTogglePrepared || spell.prepared == null) return;
        void onTogglePrepared(spell.id, !spell.prepared);
    }

    function renderListBody() {
        if (groups.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
            );
        }

        return (
            <View style={styles.groups}>
                {groups.map((group) => (
                    <View key={group.title} style={styles.group}>
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupTitle}>{group.title}</Text>
                            <View style={styles.groupHeaderLine} />
                            <View style={styles.groupCountBadge}>
                                <Text style={styles.groupCountText}>{group.spells.length}</Text>
                            </View>
                        </View>

                        <View style={styles.spellEntries}>
                            {group.spells.map((spell, index) => {
                                const tags = buildSpellTags(spell);
                                const meta = spellMeta(spell);
                                const canTogglePrepared = showPreparedState && spell.prepared != null;
                                const isPrepared = spell.prepared ?? false;
                                const level = normalizeLevel(spell.level);

                                return (
                                    <Pressable
                                        key={spell.id}
                                        style={[
                                            styles.spellRow,
                                            index < group.spells.length - 1 && styles.spellRowDivider,
                                        ]}
                                        onPress={() => handleSpellPress(spell.id)}
                                        onLongPress={() => handleTogglePrepared(spell)}
                                        delayLongPress={250}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Open ${spell.name}`}
                                        testID={`${rowTestIdPrefix}-row-${spell.id}`}
                                    >
                                        <View
                                            style={[
                                                styles.levelBadge,
                                                level === 0 && styles.levelBadgeCantrip,
                                                level == null && styles.levelBadgeUnknown,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.levelBadgeText,
                                                    level === 0 && styles.levelBadgeTextCantrip,
                                                    level == null && styles.levelBadgeTextUnknown,
                                                ]}
                                            >
                                                {spellLevelBadgeLabel(level)}
                                            </Text>
                                        </View>

                                        {showPreparedState && (
                                            <Pressable
                                                style={[
                                                    styles.preparedDot,
                                                    !isPrepared && styles.preparedDotUnprepared,
                                                ]}
                                                onPress={() => handleTogglePrepared(spell)}
                                                disabled={!canTogglePrepared}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Toggle prepared for ${spell.name}`}
                                                testID={`${rowTestIdPrefix}-prepared-${spell.id}`}
                                            />
                                        )}

                                        <View style={styles.spellInfo}>
                                            <Text
                                                style={[
                                                    styles.spellName,
                                                    showPreparedState &&
                                                    !isPrepared &&
                                                    styles.spellNameUnprepared,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {spell.name}
                                            </Text>
                                            {meta.length > 0 && (
                                                <Text style={styles.spellMeta} numberOfLines={1}>
                                                    {meta}
                                                </Text>
                                            )}
                                        </View>

                                        {tags.length > 0 && (
                                            <View style={styles.tagsRow}>
                                                {tags.map((tag) => (
                                                    <View
                                                        key={tag.label}
                                                        style={[
                                                            styles.tag,
                                                            tag.style === 'concentration'
                                                                ? styles.concentrationTag
                                                                : styles.ritualTag,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.tagText,
                                                                tag.style === 'concentration'
                                                                    ? styles.concentrationTagText
                                                                    : styles.ritualTagText,
                                                            ]}
                                                        >
                                                            {tag.label}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={[styles.listWrapper, isEmbedded && styles.embeddedListWrapper]}>
            {loading && (
                <ProgressBar
                    indeterminate
                    color={fantasyTokens.colors.gold}
                    style={styles.progressBar}
                />
            )}
            {isEmbedded ? (
                renderListBody()
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {renderListBody()}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    listWrapper: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    embeddedListWrapper: {
        flex: undefined,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingBottom: fantasyTokens.spacing.lg,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(196, 164, 112, 0.2)',
    },
    groups: {
        marginBottom: 2,
    },
    group: {
        marginBottom: 2,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 4,
    },
    groupTitle: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.55,
    },
    groupHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: fantasyTokens.colors.divider,
    },
    groupCountBadge: {
        borderRadius: 8,
        backgroundColor: 'rgba(201,146,42,0.12)',
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    groupCountText: {
        fontFamily: 'serif',
        fontSize: 8,
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
    },
    spellEntries: {
        paddingHorizontal: 18,
    },
    spellRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    spellRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,90,43,0.12)',
    },
    levelBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    levelBadgeCantrip: {
        borderColor: fantasyTokens.colors.divider,
    },
    levelBadgeUnknown: {
        borderColor: fantasyTokens.colors.divider,
    },
    levelBadgeText: {
        fontFamily: 'serif',
        fontSize: 10,
        fontWeight: '600',
        color: fantasyTokens.colors.gold,
    },
    levelBadgeTextCantrip: {
        fontSize: 8,
        color: 'rgba(61,43,31,0.45)',
    },
    levelBadgeTextUnknown: {
        fontSize: 9,
        color: 'rgba(61,43,31,0.45)',
    },
    preparedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: fantasyTokens.colors.crimson,
        flexShrink: 0,
    },
    preparedDotUnprepared: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
    },
    spellInfo: {
        flex: 1,
        minWidth: 0,
    },
    spellName: {
        fontFamily: 'serif',
        fontSize: 14,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 17,
    },
    spellNameUnprepared: {
        opacity: 0.5,
    },
    spellMeta: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.55,
        fontStyle: 'italic',
        marginTop: 1,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 4,
        flexShrink: 0,
    },
    tag: {
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    tagText: {
        fontFamily: 'serif',
        fontSize: 7.5,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    concentrationTag: {
        backgroundColor: 'rgba(26,42,74,0.1)',
    },
    concentrationTagText: {
        color: fantasyTokens.colors.blueDark,
    },
    ritualTag: {
        backgroundColor: 'rgba(30,80,30,0.1)',
    },
    ritualTagText: {
        color: fantasyTokens.colors.greenDark,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.lg,
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
        fontSize: 13,
    },
});
