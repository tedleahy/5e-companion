import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AddSpellSheet from '@/components/character-sheet/spells/AddSpellSheet';
import { formatMysticArcanumSpellLabel, type LevelUpMysticArcanumState } from '@/lib/characterLevelUp/advancedClassChoices';
import { spellLevelLabel } from '@/lib/spellPresentation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { levelUpPickerStyles } from './levelUpPickerStyles';

type LevelUpMysticArcanumPickerProps = {
    spellLevel: number;
    state: LevelUpMysticArcanumState;
    onChange: (spell: { id: string; name: string; level: number } | null) => void;
};

/**
 * Picker for selecting a warlock Mystic Arcanum spell.
 * Uses the shared add-spell sheet with strict warlock and exact-level filtering.
 */
export default function LevelUpMysticArcanumPicker({
    spellLevel,
    state,
    onChange,
}: LevelUpMysticArcanumPickerProps) {
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <View style={levelUpPickerStyles.pickerSection} testID="level-up-mystic-arcanum-picker">
            <Text style={levelUpPickerStyles.pickerTitle}>Mystic Arcanum</Text>
            <Text style={levelUpPickerStyles.bodyText}>
                {`Choose a ${spellLevelLabel(spellLevel)} warlock spell as your Mystic Arcanum. You can cast it once per long rest without expending a spell slot.`}
            </Text>

            <Pressable
                onPress={() => setPickerOpen(true)}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Choose Mystic Arcanum spell"
                testID="level-up-mystic-arcanum-open-picker"
            >
                <Text style={styles.actionButtonText}>
                    {state.selectedSpell ? 'Change Mystic Arcanum Spell' : 'Choose Mystic Arcanum Spell'}
                </Text>
            </Pressable>

            {state.selectedSpell ? (
                <View style={styles.selectionRow}>
                    <View style={styles.selectionPill} testID="level-up-mystic-arcanum-selection">
                        <Text style={styles.selectionPillText}>
                            {formatMysticArcanumSpellLabel(state.selectedSpell.level, state.selectedSpell.name)}
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => onChange(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Clear Mystic Arcanum spell"
                        testID="level-up-mystic-arcanum-clear"
                    >
                        <Text style={styles.clearActionText}>Clear</Text>
                    </Pressable>
                </View>
            ) : null}

            <AddSpellSheet
                visible={pickerOpen}
                onClose={() => setPickerOpen(false)}
                characterClassIds={['warlock']}
                knownSpellIds={state.selectedSpell ? [state.selectedSpell.id] : []}
                forcedFilters={{
                    classes: ['warlock'],
                    levels: [spellLevel],
                }}
                selectionLimit={1}
                title="Choose Mystic Arcanum"
                subtitle={`Select one legal ${spellLevelLabel(spellLevel).toLowerCase()} warlock spell for this arcanum.`}
                showFilterButton={false}
                onSpellAdded={async (spell) => {
                    onChange({
                        id: spell.id,
                        name: spell.name,
                        level: spell.level,
                    });
                }}
                onSpellRemoved={async () => {
                    onChange(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        alignSelf: 'flex-start',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    actionButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    selectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    selectionPill: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchment,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: 6,
    },
    selectionPillText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    clearActionText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
    },
});
