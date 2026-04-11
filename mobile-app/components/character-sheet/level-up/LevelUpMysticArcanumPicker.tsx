import { View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import type { LevelUpMysticArcanumState } from '@/lib/characterLevelUp/advancedClassChoices';
import { spellLevelLabel } from '@/lib/spellPresentation';
import { levelUpPickerStyles } from './levelUpPickerStyles';

type LevelUpMysticArcanumPickerProps = {
    spellLevel: number;
    state: LevelUpMysticArcanumState;
    onChange: (spell: { id: string; name: string; level: number } | null) => void;
};

/**
 * Picker for selecting a warlock Mystic Arcanum spell.
 * The user enters the spell name since this is a single high-level spell choice.
 */
export default function LevelUpMysticArcanumPicker({
    spellLevel,
    state,
    onChange,
}: LevelUpMysticArcanumPickerProps) {
    return (
        <View style={levelUpPickerStyles.pickerSection} testID="level-up-mystic-arcanum-picker">
            <Text style={levelUpPickerStyles.pickerTitle}>Mystic Arcanum</Text>
            <Text style={levelUpPickerStyles.bodyText}>
                {`Choose a ${spellLevelLabel(spellLevel)} warlock spell as your Mystic Arcanum. You can cast it once per long rest without expending a spell slot.`}
            </Text>

            <TextInput
                label={`${spellLevelLabel(spellLevel)} spell name`}
                value={state.selectedSpell?.name ?? ''}
                onChangeText={(text) => {
                    if (text.trim().length === 0) {
                        onChange(null);
                    } else {
                        onChange({ id: `arcanum-${spellLevel}-${text}`, name: text, level: spellLevel });
                    }
                }}
                mode="outlined"
                placeholder="Enter spell name"
                style={levelUpPickerStyles.textInput}
                testID="level-up-mystic-arcanum-spell-name"
            />
        </View>
    );
}
