import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';

export default function StepIdentity() {
    const { draft, updateDraft } = useCharacterDraft();
    const [blurred, setBlurred] = useState(false);
    const showError = blurred && draft.name.trim() === '';

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>Who are you?</Text>
            <Text style={styles.sub}>Every legend begins with a name.</Text>

            <View style={styles.field}>
                <Text style={styles.label}>Character Name</Text>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    heading: {
        fontFamily: 'serif',
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 26,
        marginBottom: 4,
    },
    sub: {
        fontFamily: 'serif',
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.6)',
        marginBottom: 6,
    },
    input: {
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontFamily: 'serif',
        fontSize: 16,
        color: fantasyTokens.colors.parchment,
    },
    inputError: {
        borderColor: fantasyTokens.colors.crimson,
    },
    errorHint: {
        fontFamily: 'serif',
        fontSize: 12,
        fontStyle: 'italic',
        color: fantasyTokens.colors.crimson,
        marginTop: 6,
    },
});
