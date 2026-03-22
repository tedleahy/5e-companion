import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { groupSpellSlotsByKind } from '@/lib/characterClassSummary';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { SpellSlot, SpellSlotKind } from '@/types/generated_graphql_types';
import PipTrack from '../PipTrack';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type SpellSlotsCardProps = {
    spellSlots: SpellSlot[];
    onToggleSpellSlot?: (kind: SpellSlotKind, level: number) => Promise<void>;
};

function levelLabel(level: number): string {
    const suffixMap: Record<number, string> = {
        1: 'st',
        2: 'nd',
        3: 'rd',
    };
    const suffix = suffixMap[level] ?? 'th';
    return `${level}${suffix}`;
}

export default function SpellSlotsCard({ spellSlots, onToggleSpellSlot }: SpellSlotsCardProps) {
    const spellSlotGroups = useMemo(() => groupSpellSlotsByKind(spellSlots), [spellSlots]);

    if (spellSlotGroups.length === 0) return null;

    return (
        <SheetCard index={1}>
            <SectionLabel>Spell Slots</SectionLabel>
            <View style={styles.groupStack}>
                {spellSlotGroups.map((group) => (
                    <View key={group.kind} style={styles.groupSection}>
                        {spellSlotGroups.length > 1 ? (
                            <Text style={styles.groupLabel}>{group.label}</Text>
                        ) : null}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {group.slots.map((slot) => {
                                const available = Math.max(0, slot.total - slot.used);
                                const isInteractive = Boolean(onToggleSpellSlot);

                                return (
                                    <Pressable
                                        key={`${slot.kind}-${slot.level}`}
                                        onPress={() => {
                                            if (onToggleSpellSlot) onToggleSpellSlot(slot.kind, slot.level);
                                        }}
                                    >
                                        <View style={styles.slotGroup}>
                                            <Text style={styles.levelLabel}>{levelLabel(slot.level)}</Text>
                                            <View style={styles.pipsRow}>
                                                <PipTrack
                                                    count={slot.total}
                                                    filledCount={available}
                                                    getAccessibilityLabel={() =>
                                                        slot.kind === 'PACT_MAGIC'
                                                            ? `Toggle pact magic level ${slot.level} spell slot`
                                                            : `Toggle level ${slot.level} spell slot`
                                                    }
                                                    getTestID={(index) =>
                                                        slot.kind === 'STANDARD'
                                                            ? `spell-slot-pip-${slot.level}-${index + 1}`
                                                            : `spell-slot-pip-${slot.kind.toLowerCase()}-${slot.level}-${index + 1}`
                                                    }
                                                    size={14}
                                                    gap={5}
                                                    borderWidth={1.5}
                                                    filledColor={fantasyTokens.colors.gold}
                                                    filledBorderColor={fantasyTokens.colors.gold}
                                                    emptyBorderColor={'rgba(201,146,42,0.35)'}
                                                    disabled={!isInteractive}
                                                    pipStyle={
                                                        !isInteractive ? styles.pipDisabled : undefined
                                                    }
                                                />
                                            </View>
                                            <Text style={styles.slotCount}>
                                                {available} / {slot.total}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                ))}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    groupStack: {
        gap: 6,
        paddingBottom: 12,
    },
    groupSection: {
        gap: 2,
    },
    groupLabel: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        opacity: 0.8,
        paddingHorizontal: 18,
        paddingTop: 8,
    },
    scrollContent: {
        gap: 10,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 4,
    },
    slotGroup: {
        minWidth: 86,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'rgba(0,0,0,0.04)',
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        gap: 8,
    },
    levelLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.65,
    },
    pipsRow: {
        justifyContent: 'center',
        minHeight: 14,
    },
    pipDisabled: {
        opacity: 0.6,
    },
    slotCount: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
    },
});
