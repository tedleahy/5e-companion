import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Props for the custom entry card component.
 * Used for custom invocation/metamagic entries and invocation swap inputs.
 */
type CustomEntryCardProps = {
    firstLabel: string;
    firstValue: string;
    onFirstChange: (text: string) => void;
    firstPlaceholder?: string;
    firstTestID?: string;
    secondLabel: string;
    secondValue: string;
    onSecondChange: (text: string) => void;
    secondPlaceholder?: string;
    secondTestID?: string;
    secondMultiline?: boolean;
    onRemove: () => void;
    removeLabel: string;
    removeTestID?: string;
    cardTestID?: string;
};

/**
 * Reusable card for custom entry inputs with two text fields and a remove button.
 * Used in invocation picker, metamagic picker, and invocation swap section.
 */
export default function CustomEntryCard({
    firstLabel,
    firstValue,
    onFirstChange,
    firstPlaceholder,
    firstTestID,
    secondLabel,
    secondValue,
    onSecondChange,
    secondPlaceholder,
    secondTestID,
    secondMultiline,
    onRemove,
    removeLabel,
    removeTestID,
    cardTestID,
}: CustomEntryCardProps) {
    return (
        <View style={styles.customEntryCard} testID={cardTestID}>
            <TextInput
                label={firstLabel}
                value={firstValue}
                onChangeText={onFirstChange}
                mode="outlined"
                placeholder={firstPlaceholder}
                style={styles.textInput}
                testID={firstTestID}
            />
            <TextInput
                label={secondLabel}
                value={secondValue}
                onChangeText={onSecondChange}
                mode="outlined"
                placeholder={secondPlaceholder}
                multiline={secondMultiline}
                style={styles.textInput}
                testID={secondTestID}
            />
            <Pressable
                onPress={onRemove}
                style={styles.removeCustomButton}
                testID={removeTestID}
                accessibilityLabel={removeLabel}
            >
                <Text style={styles.removeCustomButtonText}>{removeLabel}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    customEntryCard: {
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.sm,
    },
    textInput: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    removeCustomButton: {
        alignSelf: 'flex-end',
    },
    removeCustomButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
});
