import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SpellbookCard from './spells/SpellbookCard';
import SpellcastingStatsCard from './spells/SpellcastingStatsCard';
import SpellSlotsCard from './spells/SpellSlotsCard';
import SheetAddButton from './SheetAddButton';
import AddSpellSheet from './spells/AddSpellSheet';

type CharacterSpellSlot = {
    id: string;
    level: number;
    total: number;
    used: number;
};

type CharacterSpellbookEntry = {
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

type SpellsTabProps = {
    characterClass: string;
    spellcastingAbility?: string | null;
    spellSaveDC?: number | null;
    spellAttackBonus?: number | null;
    spellSlots: CharacterSpellSlot[];
    spellbook: CharacterSpellbookEntry[];
    onToggleSpellSlot?: (level: number) => Promise<void>;
    onSetSpellPrepared?: (spellId: string, prepared: boolean) => Promise<void>;
    onLearnSpell?: (spellId: string) => Promise<void>;
    onForgetSpell?: (spellId: string) => Promise<void>;
    onAddSpellSheetVisibilityChange?: (visible: boolean) => void;
};

export default function SpellsTab({
    characterClass,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    spellbook,
    onToggleSpellSlot,
    onSetSpellPrepared,
    onLearnSpell,
    onForgetSpell,
    onAddSpellSheetVisibilityChange,
}: SpellsTabProps) {
    const [addSheetVisible, setAddSheetVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        onAddSpellSheetVisibilityChange?.(addSheetVisible);
    }, [addSheetVisible, onAddSpellSheetVisibilityChange]);

    useEffect(() => {
        return () => {
            onAddSpellSheetVisibilityChange?.(false);
        };
    }, [onAddSpellSheetVisibilityChange]);

    const preparedCount = useMemo(() => {
        return spellbook.filter((entry) => entry.prepared).length;
    }, [spellbook]);

    const handleOpenSpell = useCallback((spellId: string) => {
        router.push(`/spells/${spellId}`);
    }, [router]);

    const handleAddSpell = useCallback(() => {
        setAddSheetVisible(true);
    }, []);

    const knownSpellIds = useMemo(() => {
        return spellbook.map((entry) => entry.spell.id);
    }, [spellbook]);

    const handleSpellAdded = useCallback(async (spellId: string) => {
        if (!onLearnSpell) return;
        await onLearnSpell(spellId);
    }, [onLearnSpell]);

    const handleSpellRemoved = useCallback(async (spellId: string) => {
        if (!onForgetSpell) return;
        await onForgetSpell(spellId);
    }, [onForgetSpell]);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SpellcastingStatsCard
                    spellcastingAbility={spellcastingAbility}
                    spellAttackBonus={spellAttackBonus}
                    spellSaveDC={spellSaveDC}
                    preparedCount={preparedCount}
                />

                <SpellSlotsCard
                    spellSlots={spellSlots}
                    onToggleSpellSlot={onToggleSpellSlot}
                />

                <SpellbookCard
                    spellbook={spellbook}
                    onOpenSpell={handleOpenSpell}
                    onSetPrepared={onSetSpellPrepared}
                    onRemoveSpell={onForgetSpell}
                />

                <SheetAddButton
                    label="+ Add Spell"
                    accessibilityLabel="Add spell"
                    onPress={handleAddSpell}
                />
            </ScrollView>

            <AddSpellSheet
                visible={addSheetVisible}
                onClose={() => setAddSheetVisible(false)}
                characterClass={characterClass}
                knownSpellIds={knownSpellIds}
                onSpellAdded={handleSpellAdded}
                onSpellRemoved={handleSpellRemoved}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: fantasyTokens.spacing.md,
        paddingTop: 10,
        paddingBottom: fantasyTokens.spacing.xl * 2,
        gap: 12,
    },
});
