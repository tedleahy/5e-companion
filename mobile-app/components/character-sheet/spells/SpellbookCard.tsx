import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import SpellList, { type SpellListItem } from '@/components/SpellList';
import { fantasyTokens } from '@/theme/fantasyTheme';
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

function filterSpellbook(spellbook: CharacterSpell[], schoolFilter: string): CharacterSpell[] {
    if (schoolFilter === 'all') return spellbook;

    return spellbook.filter((entry) => entry.spell.schoolIndex === schoolFilter);
}

function schoolFilters(spellbook: CharacterSpell[]): string[] {
    const schools = new Set<string>();

    for (const spell of spellbook) {
        schools.add(spell.spell.schoolIndex);
    }

    const sortedSchools = Array.from(schools).sort((leftSchool, rightSchool) => {
        return schoolLabel(leftSchool).localeCompare(schoolLabel(rightSchool));
    });

    return ['all', ...sortedSchools];
}

function filterLabel(schoolFilter: string): string {
    if (schoolFilter === 'all') return 'All';
    return schoolLabel(schoolFilter);
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
}: SpellbookCardProps) {
    const [activeSchoolFilter, setActiveSchoolFilter] = useState('all');

    const availableSchoolFilters = useMemo(() => schoolFilters(spellbook), [spellbook]);
    const filteredSpellbook = useMemo(() => {
        return filterSpellbook(spellbook, activeSchoolFilter);
    }, [spellbook, activeSchoolFilter]);
    const spellListItems = useMemo(() => toSpellListItems(filteredSpellbook), [filteredSpellbook]);

    useEffect(() => {
        if (!availableSchoolFilters.includes(activeSchoolFilter)) {
            setActiveSchoolFilter('all');
        }
    }, [activeSchoolFilter, availableSchoolFilters]);

    return (
        <SheetCard index={2}>
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
                rowTestIdPrefix="character-spell"
                emptyText="No spells match this school."
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
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
    },
    legendText: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.55,
        fontStyle: 'italic',
    },
});
