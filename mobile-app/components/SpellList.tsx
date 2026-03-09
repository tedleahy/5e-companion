import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import SpellRow, { SPELL_ROW_REMOVE_DURATION_MS } from '@/components/spell-list/SpellRow';
import { fantasyTokens } from '@/theme/fantasyTheme';
import ListSkeletonRows from './ListSkeletonRows';
import { spellLevelSectionTitle, spellSchoolLabel } from '@/lib/spellPresentation';
import type {
    SpellAccordionActionContext,
    SpellListItem,
} from './spell-list/spellList.types';

/**
 * Re-export spell-list row item shape for consumers.
 */
export type { SpellAccordionActionContext, SpellListItem };

/**
 * Tag metadata displayed beside a spell row.
 */
type SpellTag = {
    label: string;
    style: 'concentration' | 'ritual';
};

/**
 * Grouped list section for one spell level.
 */
type SpellGroup = {
    level: number | null;
    title: string;
    data: SpellListItem[];
};

/**
 * Props for the reusable spell-list component.
 */
type SpellListProps = {
    spells?: SpellListItem[];
    loading?: boolean;
    emptyText?: string;
    onSpellPress?: (spellId: string) => void;
    onTogglePrepared?: (spellId: string, prepared: boolean) => Promise<void> | void;
    onRemoveSpell?: (spellId: string) => Promise<void> | void;
    onEndReached?: () => void;
    showPreparedState?: boolean;
    variant?: 'screen' | 'embedded';
    rowTestIdPrefix?: string;
    renderAccordionActions?: (context: SpellAccordionActionContext) => ReactNode;
};

/**
 * Delay before starting row-collapse animation after an accordion closes.
 */
const REMOVE_CLOSE_DELAY_MS = 100;

/**
 * Utility delay for sequenced row animations.
 */
function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/**
 * Adds one spell id to an id list when missing.
 */
function addId(ids: string[], spellId: string): string[] {
    if (ids.includes(spellId)) return ids;
    return [...ids, spellId];
}

/**
 * Removes one spell id from an id list.
 */
function removeId(ids: string[], spellId: string): string[] {
    return ids.filter((id) => id !== spellId);
}

/**
 * Normalises invalid level values to null.
 */
function normalizeLevel(level: number | null | undefined): number | null {
    if (typeof level !== 'number' || Number.isNaN(level) || level < 0) return null;
    return level;
}

/**
 * Builds compact meta text for one spell row.
 */
function spellMeta(spell: SpellListItem): string {
    const fields: string[] = [];

    if (spell.schoolIndex) fields.push(spellSchoolLabel(spell.schoolIndex));
    if (spell.castingTime) fields.push(spell.castingTime);
    if (spell.range) fields.push(spell.range);

    return fields.join(' · ');
}

/**
 * Builds secondary tags for ritual and concentration flags.
 */
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

/**
 * Groups flat spells by level and alphabetises rows.
 */
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
            title: spellLevelSectionTitle(level),
            data: grouped.sort((leftSpell, rightSpell) => leftSpell.name.localeCompare(rightSpell.name)),
        }));
}

/**
 * Renders a grouped list of spells for screen and embedded contexts.
 */
export default function SpellList({
    spells,
    loading = false,
    emptyText = 'No spells match this search yet.',
    onSpellPress,
    onTogglePrepared,
    onRemoveSpell,
    onEndReached,
    showPreparedState = false,
    variant = 'screen',
    rowTestIdPrefix = 'spell-list',
    renderAccordionActions,
}: SpellListProps) {
    const router = useRouter();
    const items = useMemo(() => spells ?? [], [spells]);
    const [openSpellIdByGroup, setOpenSpellIdByGroup] = useState<Record<string, string | null>>({});
    const [pendingRemovalSpellIds, setPendingRemovalSpellIds] = useState<string[]>([]);
    const [collapsingSpellIds, setCollapsingSpellIds] = useState<string[]>([]);
    const [hiddenSpellIds, setHiddenSpellIds] = useState<string[]>([]);
    const isInitialLoading = loading && items.length === 0;
    const isEmbedded = variant === 'embedded';
    const hasAccordionActions = typeof renderAccordionActions === 'function';

    const hiddenSpellIdSet = useMemo(() => new Set(hiddenSpellIds), [hiddenSpellIds]);
    const pendingRemovalSpellIdSet = useMemo(() => new Set(pendingRemovalSpellIds), [pendingRemovalSpellIds]);
    const collapsingSpellIdSet = useMemo(() => new Set(collapsingSpellIds), [collapsingSpellIds]);

    const visibleItems = useMemo(() => {
        if (hiddenSpellIds.length === 0) return items;
        return items.filter((spell) => !hiddenSpellIdSet.has(spell.id));
    }, [hiddenSpellIdSet, hiddenSpellIds.length, items]);

    const groups = useMemo(() => buildSpellGroups(visibleItems), [visibleItems]);
    const itemIdFingerprint = useMemo(() => items.map((spell) => spell.id).join('|'), [items]);

    useEffect(() => {
        const sourceIds = new Set(items.map((spell) => spell.id));

        setHiddenSpellIds((currentIds) => {
            const nextIds = currentIds.filter((spellId) => sourceIds.has(spellId));
            if (nextIds.length === currentIds.length) return currentIds;
            return nextIds;
        });
        setCollapsingSpellIds((currentIds) => {
            const nextIds = currentIds.filter((spellId) => sourceIds.has(spellId));
            if (nextIds.length === currentIds.length) return currentIds;
            return nextIds;
        });
        setPendingRemovalSpellIds((currentIds) => {
            const nextIds = currentIds.filter((spellId) => sourceIds.has(spellId));
            if (nextIds.length === currentIds.length) return currentIds;
            return nextIds;
        });
        setOpenSpellIdByGroup((currentState) => {
            let hasChanges = false;
            const nextState: Record<string, string | null> = {};

            for (const [groupTitle, openSpellId] of Object.entries(currentState)) {
                if (!openSpellId || sourceIds.has(openSpellId)) {
                    nextState[groupTitle] = openSpellId;
                    continue;
                }

                hasChanges = true;
                nextState[groupTitle] = null;
            }

            if (!hasChanges) return currentState;
            return nextState;
        });
    }, [itemIdFingerprint, items]);

    if (isInitialLoading) {
        return <ListSkeletonRows rowCount={7} />;
    }

    /**
     * Opens one spell detail route.
     */
    function openSpell(spellId: string) {
        if (onSpellPress) {
            onSpellPress(spellId);
            return;
        }

        router.push(`/spells/${spellId}`);
    }

    /**
     * Toggles prepared state when the callback and data are available.
     */
    function togglePrepared(spell: SpellListItem) {
        if (!onTogglePrepared || spell.prepared == null) return;
        void onTogglePrepared(spell.id, !spell.prepared);
    }

    /**
     * Opens or closes one accordion row within a specific level section.
     */
    function toggleOpenSpell(groupTitle: string, spellId: string) {
        setOpenSpellIdByGroup((currentState) => ({
            ...currentState,
            [groupTitle]: currentState[groupTitle] === spellId ? null : spellId,
        }));
    }

    /**
     * Closes the currently open accordion row within one level section.
     */
    function closeOpenSpell(groupTitle: string) {
        setOpenSpellIdByGroup((currentState) => {
            if (!currentState[groupTitle]) return currentState;
            return {
                ...currentState,
                [groupTitle]: null,
            };
        });
    }

    /**
     * Optimistically removes one spell row with close-then-collapse animation.
     */
    async function removeSpellOptimistically(spellId: string, groupTitle: string): Promise<void> {
        if (!onRemoveSpell || pendingRemovalSpellIdSet.has(spellId)) return;

        setPendingRemovalSpellIds((currentIds) => addId(currentIds, spellId));
        closeOpenSpell(groupTitle);

        await delay(REMOVE_CLOSE_DELAY_MS);
        setCollapsingSpellIds((currentIds) => addId(currentIds, spellId));

        await delay(SPELL_ROW_REMOVE_DURATION_MS);
        setHiddenSpellIds((currentIds) => addId(currentIds, spellId));

        try {
            await onRemoveSpell(spellId);
        } catch (error) {
            console.error('Failed to remove spell', { spellId, error });
            setHiddenSpellIds((currentIds) => removeId(currentIds, spellId));
        } finally {
            setCollapsingSpellIds((currentIds) => removeId(currentIds, spellId));
            setPendingRemovalSpellIds((currentIds) => removeId(currentIds, spellId));
        }
    }

    /**
     * Renders one section header row for grouped spells.
     */
    function renderGroupHeader(group: SpellGroup) {
        return (
            <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.groupHeaderLine} />
                <View style={styles.groupCountBadge}>
                    <Text style={styles.groupCountText}>{group.data.length}</Text>
                </View>
            </View>
        );
    }

    /**
     * Renders one spell row in the grouped list.
     */
    function renderSpellRow(spell: SpellListItem, index: number, group: SpellGroup) {
        const tags = buildSpellTags(spell);
        const meta = spellMeta(spell);
        const isPrepared = spell.prepared ?? false;
        const isRemovalPending = pendingRemovalSpellIdSet.has(spell.id);
        const isRemoving = collapsingSpellIdSet.has(spell.id);
        const isOpen = hasAccordionActions && openSpellIdByGroup[group.title] === spell.id;

        const actionContext: SpellAccordionActionContext = {
            spell,
            isPrepared,
            isRemoving: isRemovalPending || isRemoving,
            openSpellDetails: () => openSpell(spell.id),
            closeAccordion: () => closeOpenSpell(group.title),
            togglePrepared: onTogglePrepared && spell.prepared != null && !isRemovalPending && !isRemoving
                ? () => togglePrepared(spell)
                : undefined,
            removeSpell: onRemoveSpell && !isRemovalPending && !isRemoving
                ? () => removeSpellOptimistically(spell.id, group.title)
                : undefined,
        };

        return (
            <View key={spell.id} style={styles.spellRowContainer}>
                <SpellRow
                    spell={spell}
                    spellMeta={meta}
                    tags={tags}
                    showPreparedState={showPreparedState}
                    isOpen={isOpen}
                    hasAccordionActions={hasAccordionActions}
                    isPrepared={isPrepared}
                    isRemoving={isRemoving}
                    showBottomDivider={index < group.data.length - 1}
                    onPressRow={hasAccordionActions ? () => toggleOpenSpell(group.title, spell.id) : () => openSpell(spell.id)}
                    onTogglePrepared={onTogglePrepared && spell.prepared != null && !hasAccordionActions
                        ? () => togglePrepared(spell)
                        : undefined}
                    accordionActions={
                        hasAccordionActions
                            ? renderAccordionActions?.(actionContext)
                            : undefined
                    }
                    rowTestIdPrefix={rowTestIdPrefix}
                />
            </View>
        );
    }

    /**
     * Renders empty-state copy when no rows match.
     */
    function renderEmptyState() {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
        );
    }

    /**
     * Renders the non-virtualised embedded list body.
     */
    function renderEmbeddedListBody() {
        if (groups.length === 0) return renderEmptyState();

        return (
            <View style={styles.groups}>
                {groups.map((group) => (
                    <View key={group.title} style={styles.group}>
                        {renderGroupHeader(group)}
                        {group.data.map((spell, index) => renderSpellRow(spell, index, group))}
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
                renderEmbeddedListBody()
            ) : (
                <SectionList
                    sections={groups}
                    keyExtractor={(spell) => spell.id}
                    renderSectionHeader={({ section }) => renderGroupHeader(section)}
                    renderItem={({ item, index, section }) => renderSpellRow(item, index, section)}
                    ListEmptyComponent={renderEmptyState}
                    stickySectionHeadersEnabled={false}
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={18}
                    maxToRenderPerBatch={24}
                    windowSize={8}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.35}
                />
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
        backgroundColor: 'transparent',
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
        paddingTop: 10,
        paddingBottom: 4,
        paddingHorizontal: 10,
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
    spellRowContainer: {
        paddingHorizontal: 10,
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
