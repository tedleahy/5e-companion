import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { RACE_OPTIONS } from '@/lib/characterCreation/options';
import OptionGrid from '@/components/wizard/OptionGrid';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';

export default function StepIdentity() {
    const { draft, updateDraft } = useCharacterDraft();
    const [blurred, setBlurred] = useState(false);
    const showError = blurred && draft.name.trim() === '';

    return (
        <KeyboardAwareScrollView
            {...keyboardAwareScrollProps}
            bottomOffset={keyboardAwareBottomOffset}
            style={styles.scroll}
            contentContainerStyle={styles.container}
        >
            <Text style={styles.heading}>Who are you?</Text>
            <Text style={styles.sub}>Every legend begins with a name.</Text>

            <View style={styles.field}>
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

            <View style={styles.divider} />
            <Text style={styles.heading}>Choose your race.</Text>
            <Text style={styles.sub}>Your lineage shapes who you are.</Text>

            <OptionGrid
                options={RACE_OPTIONS}
                selected={draft.race}
                onSelect={(value) => updateDraft({ race: value })}
            />
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.12)',
        marginVertical: 16,
    },
    heading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.headline,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    sub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    field: {
        marginBottom: 16,
    },
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
