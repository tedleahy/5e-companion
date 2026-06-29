import { StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type FantasyFormTextInputProps = Omit<TextInputProps, 'mode'> & {
    style?: StyleProp<TextStyle>;
};

export function FantasyFormTextInput({ style, ...props }: FantasyFormTextInputProps) {
    return (
        <TextInput
            {...props}
            placeholderTextColor={fantasyTokens.colors.inkSoft}
            mode="outlined"
            style={[styles.input, style]}
            textColor={fantasyTokens.colors.inkDark}
            outlineColor={fantasyTokens.colors.gold}
            activeOutlineColor={fantasyTokens.colors.crimson}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
});
