import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import PipTrack from '../PipTrack';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type SpellSlot = {
    id: string;
    level: number;
    total: number;
    used: number;
};

type DisplaySlot = {
    level: number;
    total: number;
    used: number;
};

type SpellSlotsCardProps = {
    spellSlots: SpellSlot[];
    onToggleSpellSlot?: (level: number) => Promise<void>;
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

function buildDisplaySlots(spellSlots: SpellSlot[]): DisplaySlot[] {
    return Array.from({ length: 9 }, (_, index) => {
        const level = index + 1;
        const slot = spellSlots.find((entry) => entry.level === level);

        if (!slot) {
            return { level, total: 0, used: 0 };
        }

        return {
            level: slot.level,
            total: slot.total,
            used: slot.used,
        };
    });
}

export default function SpellSlotsCard({ spellSlots, onToggleSpellSlot }: SpellSlotsCardProps) {
    const displaySlots = useMemo(() => buildDisplaySlots(spellSlots), [spellSlots]);

    return (
        <SheetCard index={1}>
            <SectionLabel>Spell Slots</SectionLabel>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {displaySlots.map((slot) => {
                    const available = Math.max(0, slot.total - slot.used);
                    const isInteractive = slot.total > 0 && Boolean(onToggleSpellSlot);

                    return (
                        <Pressable
                            key={slot.level}
                            onPress={() => {
                                if (onToggleSpellSlot) onToggleSpellSlot(slot.level);
                            }}
                        >
                            <View style={styles.slotGroup}>
                                <Text style={styles.levelLabel}>{levelLabel(slot.level)}</Text>
                                <View style={styles.pipsRow}>
                                    {slot.total === 0 ? (
                                        <Text style={styles.noSlotsText}>-</Text>
                                    ) : (
                                        <PipTrack
                                            count={slot.total}
                                            filledCount={available}
                                            getAccessibilityLabel={() =>
                                                `Toggle level ${slot.level} spell slot`
                                            }
                                            getTestID={(index) =>
                                                `spell-slot-pip-${slot.level}-${index + 1}`
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
                                    )}
                                </View>
                                <Text style={styles.slotCount}>
                                    {available} / {slot.total}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        gap: 10,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 16,
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
        fontFamily: 'serif',
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
    noSlotsText: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.inkSoft,
        fontSize: 12,
    },
    slotCount: {
        fontFamily: 'serif',
        fontSize: 10,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
    },
});
