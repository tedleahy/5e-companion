import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { AbilityPicker, Chip, Field, fieldStyles } from './fields';
import type { StageProps } from './types';

/**
 * Identity stage: name, description, hit die, and ability selections.
 */
export default function IdentityStage({ draft, locked, onChange }: StageProps) {
    function toggleAbility(field: 'primaryAbilityIndexes' | 'savingThrowIndexes', value: string) {
        if (locked) return;
        const values = draft[field];
        onChange({
            [field]: values.includes(value)
                ? values.filter((entry) => entry !== value)
                : [...values, value],
        });
    }

    return (
        <>
            <Field
                testID="custom-class-name"
                label="Class name"
                value={draft.name}
                editable={!locked}
                onChangeText={(name) => onChange({ name })}
            />
            <Field
                label="Description"
                value={draft.description}
                multiline
                onChangeText={(description) => onChange({ description })}
            />
            <Text style={fieldStyles.label}>Hit die</Text>
            <View style={fieldStyles.chips}>
                {[6, 8, 10, 12].map((die) => (
                    <Chip
                        key={die}
                        label={`d${die}`}
                        selected={draft.hitDie === die}
                        disabled={locked}
                        onPress={() => onChange({ hitDie: die })}
                    />
                ))}
            </View>
            <AbilityPicker
                label="Primary abilities"
                selected={draft.primaryAbilityIndexes}
                disabled={locked}
                onPress={(value) => toggleAbility('primaryAbilityIndexes', value)}
            />
            <AbilityPicker
                label="Saving throws (choose two)"
                selected={draft.savingThrowIndexes}
                disabled={locked}
                onPress={(value) => toggleAbility('savingThrowIndexes', value)}
            />
        </>
    );
}
