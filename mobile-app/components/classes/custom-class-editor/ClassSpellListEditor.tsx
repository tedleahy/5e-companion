import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AddSpellSheet from '@/components/character-sheet/spells/AddSpellSheet';
import { spellLevelLabel } from '@/lib/spellPresentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { fieldStyles } from './fields';
import type { DraftSpell } from './types';

type ClassSpellListEditorProps = {
    spells: DraftSpell[];
    locked: boolean;
    onChangeSpells: (spells: DraftSpell[]) => void;
};

/**
 * Class spell-list section with removable selection pills and the shared add-spell sheet.
 */
export default function ClassSpellListEditor({
    spells,
    locked,
    onChangeSpells,
}: ClassSpellListEditorProps) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const knownSpellIds = useMemo(() => spells.map((spell) => spell.id), [spells]);
    // Keep the latest list for picker callbacks so rapid multi-select does not drop spells.
    const spellsRef = useRef(spells);
    useEffect(() => {
        spellsRef.current = spells;
    }, [spells]);

    return (
        <View style={styles.spellSection} testID="custom-class-spell-list">
            <Text style={fieldStyles.label}>Class spell list</Text>
            <Text style={fieldStyles.helper}>
                Spells on this list are available to characters of this class.
            </Text>

            {!locked ? (
                <Pressable
                    style={styles.addButton}
                    onPress={() => setPickerOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Add class spells"
                    testID="custom-class-add-spells"
                >
                    <Text style={styles.addLabel}>
                        {spells.length > 0 ? 'Edit class spells' : '+ Add class spells'}
                    </Text>
                </Pressable>
            ) : null}

            <Text style={styles.counter}>
                {spells.length === 0
                    ? 'No spells selected'
                    : `${spells.length} spell${spells.length === 1 ? '' : 's'} selected`}
            </Text>

            {spells.length > 0 ? (
                <View style={styles.selectionRow}>
                    {spells.map((spell) => (
                        <View key={spell.id} style={styles.selectionPill} testID={`custom-class-spell-${spell.id}`}>
                            <Text style={styles.selectionPillText}>
                                {`${spell.name} (${spellLevelLabel(spell.level)})`}
                            </Text>
                            {!locked ? (
                                <Pressable
                                    onPress={() => {
                                        const next = spellsRef.current.filter((item) => item.id !== spell.id);
                                        spellsRef.current = next;
                                        onChangeSpells(next);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove ${spell.name}`}
                                >
                                    <Text style={styles.selectionPillRemove}>×</Text>
                                </Pressable>
                            ) : null}
                        </View>
                    ))}
                </View>
            ) : null}

            {!locked ? (
                <AddSpellSheet
                    visible={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    characterClassIds={[]}
                    knownSpellIds={knownSpellIds}
                    title="Class Spell List"
                    subtitle="Choose spells that appear on this class's spell list."
                    onSpellAdded={async (spell) => {
                        if (spellsRef.current.some((item) => item.id === spell.id)) return;
                        const next = [
                            ...spellsRef.current,
                            { id: spell.id, name: spell.name, level: spell.level },
                        ];
                        spellsRef.current = next;
                        onChangeSpells(next);
                    }}
                    onSpellRemoved={async (spell) => {
                        const next = spellsRef.current.filter((item) => item.id !== spell.id);
                        spellsRef.current = next;
                        onChangeSpells(next);
                    }}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    spellSection: {
        gap: fantasyTokens.spacing.sm,
    },
    addButton: {
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.crimson,
        borderRadius: fantasyTokens.radii.sm,
    },
    addLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
    counter: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    selectionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    selectionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs,
    },
    selectionPillText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    selectionPillRemove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
});
