import {
    StyleSheet,
    Text,
    TextInput,
    type KeyboardTypeOptions,
    type StyleProp,
    type TextStyle,
} from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Supported text alignments for inline sheet fields.
 */
type InlineFieldAlign = 'left' | 'center' | 'right';

/**
 * Props for an inline field that swaps between display text and editable input.
 */
export type InlineFieldProps = {
    value: string;
    onChangeText: (value: string) => void;
    editMode: boolean;
    testID?: string;
    style?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
    keyboardType?: KeyboardTypeOptions;
    placeholder?: string;
    align?: InlineFieldAlign;
    multiline?: boolean;
};

/**
 * Renders character-sheet text in read-only mode and a text input in edit mode.
 */
export default function InlineField({
    value,
    onChangeText,
    editMode,
    testID,
    style,
    inputStyle,
    keyboardType,
    placeholder,
    align = 'left',
    multiline = false,
}: InlineFieldProps) {
    if (!editMode) {
        const textValue = value.length > 0 ? value : (placeholder ?? '');
        return (
            <Text testID={testID} style={[style, styles[align]]}>
                {textValue}
            </Text>
        );
    }

    return (
        <TextInput
            testID={testID}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="rgba(61,43,31,0.42)"
            multiline={multiline}
            style={[
                styles.editableField,
                styles.input,
                styles[align],
                multiline && styles.multilineField,
                style,
                inputStyle,
            ]}
            inputMode={keyboardType === 'number-pad' ? 'numeric' : undefined}
            selectionColor={fantasyTokens.colors.gold}
            cursorColor={fantasyTokens.colors.gold}
        />
    );
}

/** Styles for inline display/edit field presentation. */
const styles = StyleSheet.create({
    editableField: {
        borderWidth: fantasyTokens.editableField.borderWidth,
        borderColor: fantasyTokens.editableField.borderColor,
        backgroundColor: fantasyTokens.editableField.backgroundColor,
        borderRadius: fantasyTokens.editableField.borderRadius,
        shadowColor: fantasyTokens.editableField.shadowColor,
        shadowOffset: fantasyTokens.editableField.shadowOffset,
        shadowRadius: fantasyTokens.editableField.shadowRadius,
        shadowOpacity: fantasyTokens.editableField.shadowOpacity,
        elevation: fantasyTokens.editableField.elevation,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minHeight: 30,
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
    },
    input: {
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
    },
    multilineField: {
        minHeight: 64,
        textAlignVertical: 'top',
    },
    left: {
        textAlign: 'left',
    },
    center: {
        textAlign: 'center',
    },
    right: {
        textAlign: 'right',
    },
});
