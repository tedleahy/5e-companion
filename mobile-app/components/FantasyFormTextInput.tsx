import { StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type FantasyFormTextInputProps = Omit<TextInputProps, 'mode'> & {
    style?: StyleProp<TextStyle>;
};

/**
 * Parchment-filled outlined text input used inside dark BottomSheetShell forms.
 * Outline turns crimson when `error` is set, so callers can surface validation state.
 *
 * Theme locks (`mode`, outline colors, `textColor`) are applied after `{...props}`
 * so callers cannot override the night-form chrome.
 */
export function FantasyFormTextInput({ style, error, ...props }: FantasyFormTextInputProps) {
    return (
        <TextInput
            {...props}
            error={error}
            placeholderTextColor={fantasyTokens.colors.inkSoft}
            mode="outlined"
            style={[styles.input, style]}
            textColor={fantasyTokens.colors.inkDark}
            outlineColor={error ? fantasyTokens.colors.crimson : fantasyTokens.colors.gold}
            activeOutlineColor={fantasyTokens.colors.crimson}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
});
