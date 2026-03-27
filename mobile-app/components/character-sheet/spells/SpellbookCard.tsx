import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ActionButton from '@/components/ActionButton';
import SpellList, { type SpellAccordionActionContext, type SpellListItem } from '@/components/SpellList';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CharacterSpellbookEntryFieldsFragment } from '@/types/generated_graphql_types';
import CardDivider from '../CardDivider';
import SheetCard from '../SheetCard';

type SpellbookCardProps = {
    spellcastingClassIds: string[];
    spellbook: CharacterSpellbookEntryFieldsFragment[];
    onOpenSpell?: (spellId: string) => void;
    onSetPrepared?: (spellId: string, prepared: boolean) => Promise<void>;
    onRemoveSpell?: (spellId: string) => Promise<void>;
};

/** Available spellbook filter modes. */
type SpellbookFilter = 'all' | 'prepared' | 'unprepared';

/** Spellbook filter options in display order. */
const SPELLBOOK_FILTERS: { key: SpellbookFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'prepared', label: 'Prepared' },
    { key: 'unprepared', label: 'Unprepared' },
];

/** Spellcasting classes that use a fixed known-spells list instead of daily preparation. */
const KNOWN_CASTER_CLASS_IDS = new Set(['bard', 'ranger', 'sorcerer', 'warlock']);

/**
 * Filters spellbook entries by the active filter mode.
 */
function filterSpellbook(spellbook: CharacterSpellbookEntryFieldsFragment[], filter: SpellbookFilter): CharacterSpellbookEntryFieldsFragment[] {
    if (filter === 'all') return spellbook;
    if (filter === 'prepared') return spellbook.filter((entry) => entry.prepared);
    return spellbook.filter((entry) => !entry.prepared);
}

/**
 * Counts spellbook entries for each filter bucket.
 */
function countSpellbookEntries(spellbook: CharacterSpellbookEntryFieldsFragment[]): Record<SpellbookFilter, number> {
    const preparedCount = spellbook.filter((entry) => entry.prepared).length;

    return {
        all: spellbook.length,
        prepared: preparedCount,
        unprepared: spellbook.length - preparedCount,
    };
}

/**
 * Returns whether this character sheet should hide prepared-spell UI.
 */
function usesKnownCasterSpellbook(spellcastingClassIds: string[]): boolean {
    return spellcastingClassIds.length > 0
        && spellcastingClassIds.every((classId) => KNOWN_CASTER_CLASS_IDS.has(classId));
}

function toSpellListItems(spellbook: CharacterSpellbookEntryFieldsFragment[]): SpellListItem[] {
    return spellbook.map((entry) => ({
        id: entry.spell.id,
        name: entry.spell.name,
        level: entry.spell.level,
        schoolIndex: entry.spell.schoolIndex,
        castingTime: entry.spell.castingTime,
        range: entry.spell.range,
        concentration: entry.spell.concentration,
        ritual: entry.spell.ritual,
        prepared: entry.prepared,
    }));
}

export default function SpellbookCard({
    spellcastingClassIds,
    spellbook,
    onOpenSpell,
    onSetPrepared,
    onRemoveSpell,
}: SpellbookCardProps) {
    const [activeFilter, setActiveFilter] = useState<SpellbookFilter>('all');

    const hidePreparedSpellUi = useMemo(() => usesKnownCasterSpellbook(spellcastingClassIds), [spellcastingClassIds]);
    const spellCounts = useMemo(() => countSpellbookEntries(spellbook), [spellbook]);
    const filteredSpellbook = useMemo(() => {
        if (hidePreparedSpellUi) return spellbook;
        return filterSpellbook(spellbook, activeFilter);
    }, [spellbook, activeFilter, hidePreparedSpellUi]);
    const spellListItems = useMemo(() => toSpellListItems(filteredSpellbook), [filteredSpellbook]);

    /**
     * Builds the inline accordion actions for one spell row.
     */
    function renderSpellAccordionActions(context: SpellAccordionActionContext) {
        return (
            <>
                <ActionButton
                    variant="ghost"
                    onPress={context.openSpellDetails}
                    disabled={context.isRemoving}
                    style={styles.viewButton}
                    accessibilityLabel={`View ${context.spell.name}`}
                    testID={`character-spell-view-${context.spell.id}`}
                >
                    View
                </ActionButton>

                {!hidePreparedSpellUi && (
                    <ActionButton
                        variant={context.isPrepared ? 'outlineCrimson' : 'filledCrimson'}
                        onPress={() => {
                            if (!context.togglePrepared) return;
                            context.togglePrepared();
                        }}
                        disabled={!context.togglePrepared || context.isRemoving}
                        style={styles.prepareButton}
                        accessibilityLabel={`${context.isPrepared ? 'Unprepare' : 'Prepare'} ${context.spell.name}`}
                        testID={`character-spell-prepare-${context.spell.id}`}
                    >
                        {context.isPrepared ? 'Unprepare' : 'Prepare'}
                    </ActionButton>
                )}

                <ActionButton
                    variant="ghostCrimson"
                    onPress={() => {
                        if (!context.removeSpell) return;
                        void context.removeSpell();
                    }}
                    disabled={!context.removeSpell || context.isRemoving}
                    style={styles.removeButton}
                    accessibilityLabel={`Remove ${context.spell.name}`}
                    testID={`character-spell-remove-${context.spell.id}`}
                >
                    Remove
                </ActionButton>
            </>
        );
    }

    const emptyTextMap: Record<SpellbookFilter, string> = {
        all: 'No spells learned yet.',
        prepared: 'No prepared spells.',
        unprepared: 'No unprepared spells.',
    };

    return (
        <SheetCard index={2}>
            {!hidePreparedSpellUi && (
                <>
                    <View style={styles.filterRow}>
                        {SPELLBOOK_FILTERS.map(({ key, label }) => {
                            const isActive = activeFilter === key;
                            const filterLabel = `${label} (${spellCounts[key]})`;

                            return (
                                <Pressable
                                    key={key}
                                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                                    onPress={() => setActiveFilter(key)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Show ${filterLabel} spells`}
                                    accessibilityState={{ selected: isActive }}
                                >
                                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                        {filterLabel}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <CardDivider />
                </>
            )}

            <SpellList
                spells={spellListItems}
                loading={false}
                variant="embedded"
                showPreparedState={!hidePreparedSpellUi}
                onSpellPress={onOpenSpell}
                onTogglePrepared={hidePreparedSpellUi ? undefined : onSetPrepared}
                onRemoveSpell={onRemoveSpell}
                renderAccordionActions={renderSpellAccordionActions}
                rowTestIdPrefix="character-spell"
                emptyText={emptyTextMap[hidePreparedSpellUi ? 'all' : activeFilter]}
            />
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 10,
    },
    filterPill: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'transparent',
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    filterPillActive: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    filterText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
    filterTextActive: {
        color: fantasyTokens.colors.gold,
        opacity: 1,
    },
    viewButton: {
        minWidth: 74,
    },
    prepareButton: {
        flex: 1,
    },
    removeButton: {
        minWidth: 74,
    },
});
