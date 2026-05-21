import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { RACE_OPTIONS } from '@/lib/characterCreation/options';
import OptionGrid from '@/components/wizard/OptionGrid';
import { wizardStepStyles } from '@/components/wizard/wizardStepStyles';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';

export default function StepIdentity() {
    const { draft, updateDraft } = useCharacterDraft();
    const [blurred, setBlurred] = useState(false);
    const showError = blurred && draft.name.trim() === '';

    return (
        <KeyboardAwareScrollView
            {...keyboardAwareScrollProps}
            bottomOffset={keyboardAwareBottomOffset}
            style={wizardStepStyles.scroll}
            contentContainerStyle={wizardStepStyles.container}
        >
            <Text style={wizardStepStyles.heading}>Who are you?</Text>
            <Text style={wizardStepStyles.sub}>Every legend begins with a name.</Text>

            <View style={wizardStepStyles.field}>
                <Text style={fantasyTokens.text.formLabel}>
                    Character Name
                </Text>
                <TextInput
                    style={[styles.input, showError && styles.inputError]}
                    value={draft.name}
                    onChangeText={(text) => updateDraft({ name: text })}
                    onBlur={() => setBlurred(true)}
                    placeholder="e.g. Vaelindra Stormveil"
                    placeholderTextColor="rgba(245,230,200,0.2)"
                    autoFocus
                />
                {showError && (
                    <Text style={styles.errorHint}>Your character needs a name</Text>
                )}
            </View>

            <View style={wizardStepStyles.divider} />
            <Text style={wizardStepStyles.heading}>Choose your race.</Text>
            <Text style={wizardStepStyles.sub}>Your lineage shapes who you are.</Text>

            <OptionGrid
                options={RACE_OPTIONS}
                selected={draft.race}
                onSelect={(value) => updateDraft({ race: value })}
            />
            {draft.race === '' && (
                <Text style={styles.errorHint}>Your character needs a race</Text>
            )}
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        color: fantasyTokens.colors.parchment,
    },
    inputError: {
        borderColor: fantasyTokens.colors.crimson,
    },
    errorHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        color: fantasyTokens.colors.crimson,
        marginTop: 6,
    },
});
