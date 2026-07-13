import { StyleSheet, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';

type FantasyFormTextInputProps = Omit<TextInputProps, 'mode'> & {
    style?: StyleProp<TextStyle>;
};

/**
 * Parchment-filled outlined text input used inside dark BottomSheetShell forms.
 * Outline turns crimson when `error` is set, so callers can surface validation state.
 *
 * String `label`s render above the field (night-form gold) instead of Paper's
 * floating outline label — floated labels sit on the dark sheet chrome and are
 * hard to read, especially once the parchment fill clips them.
 *
 * Theme locks (`mode`, outline colors, `textColor`) are applied after `{...props}`
 * so callers cannot override the night-form chrome.
 *
 * Multiline fields get explicit vertical padding: react-native-paper zeroes top
 * padding on Android for outlined inputs without a floating label, which leaves
 * the first line flush with the outline.
 */
export function FantasyFormTextInput({
    label,
    style,
    contentStyle,
    error,
    multiline,
    accessibilityLabel,
    ...props
}: FantasyFormTextInputProps) {
    const externalLabel = typeof label === 'string' ? label : null;

    const input = (
        <TextInput
            {...props}
            label={externalLabel === null ? label : undefined}
            multiline={multiline}
            error={error}
            accessibilityLabel={accessibilityLabel ?? externalLabel ?? undefined}
            placeholderTextColor={fantasyTokens.colors.inkSoft}
            mode="outlined"
            style={[styles.input, style]}
            contentStyle={[multiline ? styles.multilineContent : null, contentStyle]}
            textColor={fantasyTokens.colors.inkDark}
            outlineColor={error ? fantasyTokens.colors.crimson : fantasyTokens.colors.gold}
            activeOutlineColor={fantasyTokens.colors.crimson}
        />
    );

    if (externalLabel === null) {
        return input;
    }

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{externalLabel}</Text>
            {input}
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        gap: fantasyTokens.spacing.xs,
    },
    label: {
        ...nightFormStyles.label,
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    multilineContent: {
        paddingTop: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.md,
        textAlignVertical: 'top',
    },
});
