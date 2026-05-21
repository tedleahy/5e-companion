import { StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { BACKGROUND_OPTIONS } from '@/lib/characterCreation/options';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import OptionGrid from '@/components/wizard/OptionGrid';
import AlignmentGrid from '@/components/wizard/AlignmentGrid';
import { wizardStepStyles } from '@/components/wizard/wizardStepStyles';

export default function StepBackground() {
    const { draft, updateDraft } = useCharacterDraft();

    return (
        <KeyboardAwareScrollView
            {...keyboardAwareScrollProps}
            bottomOffset={keyboardAwareBottomOffset}
            style={wizardStepStyles.scroll}
            contentContainerStyle={wizardStepStyles.container}
        >
            <Text style={wizardStepStyles.heading}>Background &amp; alignment.</Text>
            <Text style={wizardStepStyles.sub}>Your history and your moral compass.</Text>

            {/* Background */}
            <Text style={styles.fieldLabel}>Background</Text>
            <OptionGrid
                options={BACKGROUND_OPTIONS}
                selected={draft.background}
                onSelect={(value) => updateDraft({ background: value })}
            />

            <View style={wizardStepStyles.divider} />

            {/* Alignment */}
            <AlignmentGrid
                selected={draft.alignment}
                onSelect={(value) => updateDraft({ alignment: value })}
            />

            <View style={wizardStepStyles.divider} />

            {/* Personality */}
            <Text style={wizardStepStyles.sectionLabel}>Personality</Text>

            <View style={wizardStepStyles.field}>
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

            <View style={wizardStepStyles.field}>
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

            <View style={wizardStepStyles.field}>
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

            <View style={wizardStepStyles.field}>
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
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    fieldLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        color: fantasyTokens.colors.parchment,
        minHeight: 80,
    },
    textareaSmall: {
        minHeight: 64,
    },
});
