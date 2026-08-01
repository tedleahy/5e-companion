import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AddSpellSheet from '@/components/character-sheet/spells/AddSpellSheet';
import { spellLevelLabel } from '@/lib/spellPresentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import { fieldStyles } from './fields';
import { canAddSpell } from './limits';
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
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Class spell list</Text>
                {spells.length > 0 ? (
                    <Text style={styles.countBadge}>{spells.length}</Text>
                ) : null}
            </View>
            <Text style={fieldStyles.helper}>
                Spells on this list are available to characters of this class.
            </Text>

            {spells.length === 0 ? (
                <View style={styles.emptyHint}>
                    <Text style={styles.emptyHintText}>
                        {locked ? 'No spells on this list.' : 'No spells selected yet.'}
                    </Text>
                </View>
            ) : (
                <View style={styles.selectionCard}>
                    <Text style={styles.counter}>
                        {`${spells.length} spell${spells.length === 1 ? '' : 's'} selected`}
                    </Text>
                    <View style={styles.selectionRow}>
                        {spells.map((spell) => (
                            <View
                                key={spell.id}
                                style={styles.selectionPill}
                                testID={`custom-class-spell-${spell.id}`}
                            >
                                <View style={styles.pillLevel}>
                                    <Text style={styles.pillLevelText}>
                                        {spell.level === 0 ? 'C' : spell.level}
                                    </Text>
                                </View>
                                <Text style={styles.selectionPillText} numberOfLines={1}>
                                    {spell.name}
                                </Text>
                                <Text style={styles.pillLevelHint}>
                                    {spellLevelLabel(spell.level)}
                                </Text>
                                {!locked ? (
                                    <Pressable
                                        onPress={() => {
                                            const next = spellsRef.current.filter(
                                                (item) => item.id !== spell.id,
                                            );
                                            spellsRef.current = next;
                                            onChangeSpells(next);
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Remove ${spell.name}`}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.selectionPillRemove}>×</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ))}
                    </View>
                </View>
            )}

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
                        if (!canAddSpell(spellsRef.current.length)) return;
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    sectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
    },
    countBadge: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: fantasyTokens.fontSizes.utility - 2,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: 3,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        color: fantasyTokens.colors.goldLight,
    },
    emptyHint: {
        paddingVertical: fantasyTokens.spacing.md,
        paddingHorizontal: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
    },
    emptyHintText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        fontStyle: 'italic',
        opacity: 0.85,
        textAlign: 'center',
    },
    selectionCard: {
        ...nightFormStyles.card,
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
    },
    addButton: {
        ...nightFormStyles.dashedAddButton,
    },
    addLabel: {
        ...nightFormStyles.dashedAddButtonText,
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
        maxWidth: '100%',
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs + 2,
    },
    pillLevel: {
        minWidth: fantasyTokens.spacing.md + fantasyTokens.spacing.xs,
        height: fantasyTokens.spacing.md + fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm - 4,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    pillLevelText: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: fantasyTokens.fontSizes.utility - 2,
        color: fantasyTokens.colors.goldLight,
        lineHeight: fantasyTokens.fontSizes.utility,
    },
    selectionPillText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
        flexShrink: 1,
    },
    pillLevelHint: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentMuted,
        fontSize: fantasyTokens.fontSizes.utility - 1,
    },
    selectionPillRemove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
});
