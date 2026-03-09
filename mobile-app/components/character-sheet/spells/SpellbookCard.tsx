import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ActionButton from '@/components/ActionButton';
import SpellList, { type SpellAccordionActionContext, type SpellListItem } from '@/components/SpellList';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { spellSchoolLabel } from '@/lib/spellPresentation';
import CardDivider from '../CardDivider';
import SheetCard from '../SheetCard';

type CharacterSpell = {
    prepared: boolean;
    spell: {
        id: string;
        name: string;
        level: number;
        schoolIndex: string;
        castingTime: string;
        range?: string | null;
        concentration: boolean;
        ritual: boolean;
    };
};

type SpellbookCardProps = {
    spellbook: CharacterSpell[];
    onOpenSpell?: (spellId: string) => void;
    onSetPrepared?: (spellId: string, prepared: boolean) => Promise<void>;
    onRemoveSpell?: (spellId: string) => Promise<void>;
};

type PreparedFilter = 'all' | 'prepared';

function filterSpellbook(spellbook: CharacterSpell[], schoolFilter: string): CharacterSpell[] {
    if (schoolFilter === 'all') return spellbook;

    return spellbook.filter((entry) => entry.spell.schoolIndex === schoolFilter);
}

/**
 * Filters spellbook entries by quick prepared/all selection.
 */
function filterPrepared(spellbook: CharacterSpell[], preparedFilter: PreparedFilter): CharacterSpell[] {
    if (preparedFilter === 'all') return spellbook;
    return spellbook.filter((entry) => entry.prepared);
}

function schoolFilters(spellbook: CharacterSpell[]): string[] {
    const schools = new Set<string>();

    for (const spell of spellbook) {
        schools.add(spell.spell.schoolIndex);
    }

    const sortedSchools = Array.from(schools).sort((leftSchool, rightSchool) => {
        return spellSchoolLabel(leftSchool).localeCompare(spellSchoolLabel(rightSchool));
    });

    return ['all', ...sortedSchools];
}

function filterLabel(schoolFilter: string): string {
    if (schoolFilter === 'all') return 'All';
    return spellSchoolLabel(schoolFilter);
}

/**
 * Returns a user-facing label for prepared quick filters.
 */
function preparedFilterLabel(preparedFilter: PreparedFilter): string {
    if (preparedFilter === 'all') return 'All Known';
    return 'Prepared';
}

function toSpellListItems(spellbook: CharacterSpell[]): SpellListItem[] {
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
    spellbook,
    onOpenSpell,
    onSetPrepared,
    onRemoveSpell,
}: SpellbookCardProps) {
    const [activePreparedFilter, setActivePreparedFilter] = useState<PreparedFilter>('all');
    const [activeSchoolFilter, setActiveSchoolFilter] = useState('all');

    const preparedFilteredSpellbook = useMemo(() => {
        return filterPrepared(spellbook, activePreparedFilter);
    }, [spellbook, activePreparedFilter]);
    const availableSchoolFilters = useMemo(() => schoolFilters(preparedFilteredSpellbook), [preparedFilteredSpellbook]);
    const filteredSpellbook = useMemo(() => {
        return filterSpellbook(preparedFilteredSpellbook, activeSchoolFilter);
    }, [preparedFilteredSpellbook, activeSchoolFilter]);
    const spellListItems = useMemo(() => toSpellListItems(filteredSpellbook), [filteredSpellbook]);

    useEffect(() => {
        if (!availableSchoolFilters.includes(activeSchoolFilter)) {
            setActiveSchoolFilter('all');
        }
    }, [activeSchoolFilter, availableSchoolFilters]);

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

    return (
        <SheetCard index={2}>
            <View style={styles.preparedTabsRow}>
                {(['all', 'prepared'] as PreparedFilter[]).map((preparedFilter) => {
                    const isActive = activePreparedFilter === preparedFilter;

                    return (
                        <Pressable
                            key={preparedFilter}
                            style={[styles.preparedTab, isActive && styles.preparedTabActive]}
                            onPress={() => setActivePreparedFilter(preparedFilter)}
                            accessibilityRole="button"
                            accessibilityLabel={`Show ${preparedFilterLabel(preparedFilter)} spells`}
                            accessibilityState={{ selected: isActive }}
                        >
                            <Text style={[styles.preparedTabText, isActive && styles.preparedTabTextActive]}>
                                {preparedFilterLabel(preparedFilter)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {availableSchoolFilters.map((schoolFilter) => {
                    const isActive = activeSchoolFilter === schoolFilter;

                    return (
                        <Pressable
                            key={schoolFilter}
                            style={[styles.filterPill, isActive && styles.filterPillActive]}
                            onPress={() => setActiveSchoolFilter(schoolFilter)}
                            accessibilityRole="button"
                            accessibilityLabel={`Filter by ${filterLabel(schoolFilter)}`}
                            accessibilityState={{ selected: isActive }}
                        >
                            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                {filterLabel(schoolFilter)}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <CardDivider />

            <SpellList
                spells={spellListItems}
                loading={false}
                variant="embedded"
                showPreparedState
                onSpellPress={onOpenSpell}
                onTogglePrepared={onSetPrepared}
                onRemoveSpell={onRemoveSpell}
                renderAccordionActions={renderSpellAccordionActions}
                rowTestIdPrefix="character-spell"
                emptyText={activePreparedFilter === 'prepared'
                    ? 'No prepared spells match this school.'
                    : 'No spells match this school.'}
            />

            <CardDivider />

            <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                    <View style={styles.preparedDot} />
                    <Text style={styles.legendText}>Prepared</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.preparedDot, styles.preparedDotUnprepared]} />
                    <Text style={styles.legendText}>Unprepared</Text>
                </View>
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    preparedTabsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 14,
    },
    preparedTab: {
        borderRadius: 9,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    preparedTabActive: {
        borderColor: fantasyTokens.colors.crimson,
        backgroundColor: 'rgba(139,26,26,0.1)',
    },
    preparedTabText: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 1.3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
    preparedTabTextActive: {
        color: fantasyTokens.colors.crimson,
        opacity: 1,
    },
    filterRow: {
        gap: 6,
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
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
    },
    filterTextActive: {
        color: fantasyTokens.colors.gold,
        opacity: 1,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    preparedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: fantasyTokens.colors.crimson,
        flexShrink: 0,
    },
    preparedDotUnprepared: {
        opacity: 0,
    },
    legendText: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.55,
        fontStyle: 'italic',
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
