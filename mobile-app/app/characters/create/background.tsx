import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { BACKGROUND_OPTIONS } from '@/lib/dndHelpers';
import OptionGrid from '@/components/wizard/OptionGrid';
import AlignmentGrid from '@/components/wizard/AlignmentGrid';

export default function StepBackground() {
    const { draft, updateDraft } = useCharacterDraft();

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.heading}>Background &amp; alignment.</Text>
            <Text style={styles.sub}>Your history and your moral compass.</Text>

            {/* Background */}
            <Text style={styles.fieldLabel}>Background</Text>
            <OptionGrid
                options={BACKGROUND_OPTIONS}
                selected={draft.background}
                onSelect={(value) => updateDraft({ background: value })}
            />

            <View style={styles.divider} />

            {/* Alignment */}
            <AlignmentGrid
                selected={draft.alignment}
                onSelect={(value) => updateDraft({ alignment: value })}
            />

            <View style={styles.divider} />

            {/* Personality */}
            <Text style={styles.sectionLabel}>Personality</Text>

            <View style={styles.field}>
                <Text style={styles.fieldLabel}>Personality Traits</Text>
                <TextInput
                    style={styles.textarea}
                    value={draft.personalityTraits}
                    onChangeText={(text) => updateDraft({ personalityTraits: text })}
                    placeholder="How does your character act and speak?"
                    placeholderTextColor="rgba(245,230,200,0.2)"
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.fieldLabel}>Ideals</Text>
                <TextInput
                    style={[styles.textarea, styles.textareaSmall]}
                    value={draft.ideals}
                    onChangeText={(text) => updateDraft({ ideals: text })}
                    placeholder="What principles drive your character?"
                    placeholderTextColor="rgba(245,230,200,0.2)"
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.fieldLabel}>Bonds</Text>
                <TextInput
                    style={[styles.textarea, styles.textareaSmall]}
                    value={draft.bonds}
                    onChangeText={(text) => updateDraft({ bonds: text })}
                    placeholder="What ties your character to the world?"
                    placeholderTextColor="rgba(245,230,200,0.2)"
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.fieldLabel}>Flaws</Text>
                <TextInput
                    style={[styles.textarea, styles.textareaSmall]}
                    value={draft.flaws}
                    onChangeText={(text) => updateDraft({ flaws: text })}
                    placeholder="What weakness might be your downfall?"
                    placeholderTextColor="rgba(245,230,200,0.2)"
                    multiline
                    textAlignVertical="top"
                />
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
        paddingBottom: 40,
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
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.12)',
        marginVertical: 16,
    },
    sectionLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.75,
        marginBottom: 8,
    },
    field: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.6)',
        marginBottom: 6,
    },
    textarea: {
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontFamily: 'serif',
        fontSize: 15,
        color: fantasyTokens.colors.parchment,
        minHeight: 80,
        lineHeight: 22,
    },
    textareaSmall: {
        minHeight: 64,
    },
});
