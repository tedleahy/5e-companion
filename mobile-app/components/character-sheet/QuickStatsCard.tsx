import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SheetCard from './SheetCard';
import StatPill from './StatPill';
import InlineField from './edit-mode/InlineField';

type QuickStatsCardProps = {
    proficiencyBonus: number;
    initiative: number;
    inspiration: boolean;
    spellSaveDC: number | null;
    editMode: boolean;
    onToggleInspiration: () => void;
    onChangeInitiative: (value: number) => void;
};

/**
 * Parses initiative text input into a numeric value.
 */
function parseInitiativeInput(value: string): number {
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) return 0;
    return parsedValue;
}

export default function QuickStatsCard({
    proficiencyBonus,
    initiative,
    inspiration,
    spellSaveDC,
    editMode,
    onToggleInspiration,
    onChangeInitiative,
}: QuickStatsCardProps) {
    return (
        <SheetCard index={1}>
            <View style={styles.row}>
                <StatPill key="Proficiency" label="Proficiency" value={formatSignedNumber(proficiencyBonus)} />
                <View style={[styles.initiativePill, editMode && styles.initiativePillEditable]}>
                    <InlineField
                        value={formatSignedNumber(initiative)}
                        onChangeText={(value: string) => onChangeInitiative(parseInitiativeInput(value))}
                        editMode={editMode}
                        style={styles.initiativeValue}
                        keyboardType="numbers-and-punctuation"
                        align="center"
                    />
                    <Text style={styles.initiativeLabel}>Initiative</Text>
                </View>
                <StatPill
                    label={inspiration ? 'Inspired' : 'Inspiration'}
                    value={'\u2726'}
                    onPress={onToggleInspiration}
                    accessibilityLabel="Toggle inspiration"
                    isActive={inspiration}
                />
                {spellSaveDC != null && (
                    <StatPill label="Spell DC" value={String(spellSaveDC)} />
                )}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 7,
        padding: 12,
        paddingHorizontal: 18,
        paddingBottom: 16,
    },
    initiativePill: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 7.5,
        alignItems: 'center',
        gap: 3,
    },
    initiativePillEditable: {
        paddingVertical: 8,
    },
    initiativeValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 20,
        fontWeight: '700',
        color: '#2b1c11',
    },
    initiativeLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: 'rgba(61,43,31,0.5)',
        marginTop: 3,
    },
});
