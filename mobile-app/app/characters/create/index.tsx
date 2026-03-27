import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';

export default function StepIdentity() {
    const { draft, updateDraft } = useCharacterDraft();
    const [blurred, setBlurred] = useState(false);
    const showError = blurred && draft.name.trim() === '';

    function adjustLevel(delta: number) {
        const next = Math.max(1, Math.min(20, draft.level + delta));
        updateDraft({ level: next });
    }

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
            <Text style={fantasyTokens.text.formLabel}>Starting Level</Text>

            <View style={styles.stepper}>
                <Pressable
                    onPress={() => adjustLevel(-1)}
                    style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                >
                    <Text style={styles.stepperBtnText}>{'\u2212'}</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{draft.level}</Text>
                <Pressable
                    onPress={() => adjustLevel(1)}
                    style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                >
                    <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
            </View>
            <Text style={styles.hint}>Most campaigns start at level 1. Check with your DM.</Text>
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
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    stepperBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperBtnPressed: {
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    stepperBtnText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        color: 'rgba(201,146,42,0.5)',
    },
    stepperVal: {
        flex: 1,
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.titleLarge,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
    },
    hint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 6,
    },
});
